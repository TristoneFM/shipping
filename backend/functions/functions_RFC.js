const Functions = {};

const createSapRfcPool = require('../connections/sap/connection_SAP');
const FunctionsDB = require('../functions/functions_DB');

Functions.DELIVERY_POST = async (delivery, shipment, employee, dock, date, chrysler) => {
    
    let managed_client;
    try {
        managed_client = await createSapRfcPool.acquire();
        
        const deliveries = delivery.split(',').map(d => d.trim());  // Split the delivery string into an array

        let totalQuantityHUITEM = 0;
        let allConsolidatedResults = [];
        let array_of_arrays = [];

        let capturedDeliveries = [];
        for (let singleDelivery of deliveries) {
            let deliveryCaptured = await FunctionsDB.GET_DELIVERY(singleDelivery);
            if (deliveryCaptured.length !== 0) {
            capturedDeliveries.push(singleDelivery);
            }
        }
        if (capturedDeliveries.length !== 0) {
            return { "result": "N/A", error: `Deliverie(s) previously captured: ${capturedDeliveries.join(", ")}` };
        }

        let isShipmentInserted = false;
        for (let singleDelivery of deliveries) {
            

            const deliveryResult = await managed_client.call('BAPI_DELIVERY_GETLIST', {
                IS_DLV_DATA_CONTROL: {
                    BYPASSING_BUFFER: "X",
                    HEAD_STATUS: "X",
                    HEAD_PARTNER: "X",
                    ITEM: "X",
                    ITEM_STATUS: "X",
                    DOC_FLOW: "X",
                    FT_DATA: "X",
                    HU_DATA: "X",
                    SERNO: "X",
                },
                IT_VBELN: [
                    {
                        SIGN: 'I',
                        OPTION: 'EQ',
                        DELIV_NUMB_LOW: String(singleDelivery).padStart(10, '0'),
                        DELIV_NUMB_HIGH: String(singleDelivery).padStart(10, '0'),

                    }
                ],
            });

                  
            if (deliveryResult.ET_HU_HEADER.length === 0) {
                return { "result": "N/A", error: `Verify delivery: ${singleDelivery}` };
            }


            const deliveryNumber = String(singleDelivery).padStart(10, '0');
            let location = ''
            if(chrysler) {

                const result = await managed_client.call('RFC_READ_TABLE', {
                    QUERY_TABLE: 'LIKP',
                    DELIMITER: '|',
                    FIELDS: [
                        { FIELDNAME: 'VBELN' },  // Delivery Number
                        { FIELDNAME: 'ABLAD' }   // Unloading Point
                    ],
                    OPTIONS: [
                        {
                            TEXT: `VBELN = '${deliveryNumber}'`,
                        },
                    ],
                });

                // Parse the result
                const likpData = result.DATA.map((row) => {
                    const [vbeln, ablad] = row.WA.split('|');
                    return { deliveryNumber: vbeln, unloadingPoint: ablad };
                });


                // Query VBPA table to fetch VBELN and KNREF
                const result2 = await managed_client.call('RFC_READ_TABLE', {
                    QUERY_TABLE: 'VBPA', // Table where KNREF exists
                    DELIMITER: '|',
                    FIELDS: [
                        { FIELDNAME: 'VBELN' },  // Delivery Number
                        { FIELDNAME: 'KNREF' },  // Customer Reference Number
                        { FIELDNAME: 'PARVW' },  // Partner Function (optional for context)
                    ],
                    OPTIONS: [
                        {
                            TEXT: `VBELN = '${deliveryNumber}' AND PARVW = 'WE'`,
                        },
                    ],
                });

                // Parse the result2
                const vbpaData = result2.DATA.map((row) => {
                    const [vbeln, knref, parvw] = row.WA.split('|');
                    return { deliveryNumber: vbeln, customerRef: knref, partnerFunction: parvw };
                });



                location = `${vbpaData[0].customerRef.trim()}${likpData[0].unloadingPoint.trim()}`;

            }

            
            let deliveryHUList = deliveryResult.ET_HU_HEADER.map(hu => hu.EXIDV);
            const result_hus_history = await managed_client.call('BAPI_HU_GETLIST', {
                NOTEXT: '',
                ONLYKEYS: '',
                HUNUMBERS: deliveryHUList
            });

            function createConsolidatedObject(input) {
                const pallets = input.HUHEADER.filter(item => item.HIGHER_LEVEL_HU === "");
                const lowerLevelHUs = input.HUHEADER.filter(item => item.HIGHER_LEVEL_HU !== "");
                totalQuantityHUITEM += input.HUITEM.reduce((acc, item) => acc + Number(item.PACK_QTY), 0);
                const consolidatedData = pallets.map(pallet => {
                    const lowerLevelHU = lowerLevelHUs.filter(item => item.HIGHER_LEVEL_HU === pallet.HU_ID);
                    const updatedLowerLevelHU = lowerLevelHU.map(item => {
                        const matchingHUITEM = input.HUITEM.find(huitem => huitem.HU_EXID === item.HU_EXID);
                        return {
                            ...item,
                            Z_HUITEM: matchingHUITEM
                        };
                    });
                    return {
                        ...pallet,
                        Z_LOWER_LEVEL_HU: updatedLowerLevelHU
                    };
                });

                return {
                    consolidatedData
                };
            }

            const consolidatedResult = createConsolidatedObject(result_hus_history);
            allConsolidatedResults.push(consolidatedResult);

            
            if (!isShipmentInserted) { // Insert shipment only for the first delivery
                let deliveryName = await FunctionsDB.GET_DELIVERYNAME(shipment);
                if (deliveryName.length !== 0) {
                    return { "result": "N/A", error: `Shipment already exists` };
                }
        
                const insertShipment = await FunctionsDB.INSERT_SHIPMENT(delivery, shipment, employee, dock, date, location);
        
                if (insertShipment.affectedRows === 0) {
                    return { "result": "N/A", error: `Error Inserting Shipment` };
                }
        
                shipmentId = insertShipment.insertId; // Store shipment ID for reuse
                isShipmentInserted = true; // Set the flag to true after inserting shipment
            }



            for (let i = 0; i < consolidatedResult.consolidatedData.length; i++) {
                const pallet = consolidatedResult.consolidatedData;
                for (let j = 0; j < pallet[i].Z_LOWER_LEVEL_HU.length; j++) {
                    const lowerLevelHU = pallet[i].Z_LOWER_LEVEL_HU;
                    let master = `${parseInt(pallet[i].HU_EXID)}`;
                    let single = `${parseInt(lowerLevelHU[j].HU_EXID)}`;
                    array_of_arrays.push([shipmentId, singleDelivery, master, single]);
                }

                if (pallet[i].Z_LOWER_LEVEL_HU.length === 0) {
                    let master = `${parseInt(pallet[i].HU_EXID)}`;
                    array_of_arrays.push([shipmentId, singleDelivery, master, master]);
                }
            }
        }


        let insertDelivery = await FunctionsDB.INSERT_DELIVERY(array_of_arrays);
        if (insertDelivery.affectedRows === 0) {
            return { "result": "N/A", error: `Error inserting delivery` };
        }

        return { "result": allConsolidatedResults, "error": "N/A" };

    } catch (err) {
        await createSapRfcPool.destroy(managed_client);
        console.log(err);
        
        throw err;
    } finally {
        setTimeout(() => {
            if (managed_client.alive) {
                createSapRfcPool.release(managed_client);
            }
        }, 500);
    }
};

Functions.ZEMPMAST_POST = async (employeeId) => {
    let managed_client;
    try {
        managed_client = await createSapRfcPool.acquire();
        const result_zempmast = await managed_client.call('RFC_READ_TABLE', {
            QUERY_TABLE: 'ZEMPMAST',
            DELIMITER: ',',
            OPTIONS: [{ TEXT: `WERKS EQ '5210' AND EMPID EQ '${employeeId}'` }],
            FIELDS: ['WERKS', 'EMPID', 'FNAME', 'LNAME'],
        });

        return result_zempmast;
    } catch (err) {
        await createSapRfcPool.destroy(managed_client);
        throw err;
    } finally {
        setTimeout(() => {
            if (managed_client.alive) {
                createSapRfcPool.release(managed_client);
            }
        }, 500);
    }
};

module.exports = Functions;