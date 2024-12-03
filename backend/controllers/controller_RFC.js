const Functions = require('../functions/functions_RFC');
const FunctionsDB = require('../functions/functions_DB');

const controller = {};


controller.DELIVERY_POST = async (req, res) => {


    const date = new Date().toISOString().split('T')[0];

    try {
        const {delivery, shipment, employee, dock, chrysler} = req.body;

        const checkDuplicate = await FunctionsDB.GET_DELIVERYNAME(shipment);
        
        if(checkDuplicate.length !== 0) {
            return res.status(200).json({error: 'Shipment name already exists'});
        }
  
        const result = await Functions.DELIVERY_POST(delivery, shipment, employee, dock, date, chrysler);

        res.status(200).json(result);

    } catch (error) {
        console.log(error);
        
        res.status(500).json(error);
    }
};


controller.ZEMPMAST_POST = async (req, res) => {
    try {
        const {employeeId} = req.body;
        const result = await Functions.ZEMPMAST_POST(employeeId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = controller;