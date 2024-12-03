const Functions_DB = {}

const dbShip = require('../connections/db/connection_SHIPPING');

Functions_DB.insertDelivery = async (deliveries) => {
    try {
        const result = await dbShip(`
            INSERT INTO embarque_delivery (delivery_embarque, delivery_delivery, delivery_master, delivery_single)
            VALUES ?
        `, [deliveries]);
        return result;
    }
    catch (error) {
        throw error;
    }
}

Functions_DB.DELIVERIES = async () => {
    try {
        const result = await dbShip(`
            SELECT * FROM shipping_captured WHERE shipping_status = 'Active'
        `);

        return result;
    }
    catch (error) {
        throw error;
    }
}

Functions_DB.SELECTED_DELIVERY = async (selectedDelivery) => {

    try {
        // First query: Get the shipping_captured record by ID
        const result = await dbShip(`
            SELECT * FROM shipping_captured WHERE id = '${selectedDelivery}'
        `);
    
        // Second query: Get all matching records from shipping_delivery using selectedDelivery as shipping_id
        const deliveryResult = await dbShip(`
            SELECT 
                shipping_id, 
                shipping_master, 
                MAX(shipping_captured) AS shipping_captured, 
                id
            FROM shipping_delivery
            WHERE shipping_id = '${selectedDelivery}'
            GROUP BY shipping_id, shipping_master;
        `);

        return { captured: result, delivery: deliveryResult }; // Return both results
    } catch (error) {
        console.error('Error executing queries:', error);
        throw error;
    }
    
}


Functions_DB.CONFIRM_LABEL = async (selectedDelivery, firstScan, secondScan) => {
    try {


        // Perform the update operation
        const result = await dbShip(`
            UPDATE shipping_delivery 
            SET shipping_captured = 'true' 
            WHERE shipping_master = '${firstScan}' 
            AND shipping_single = '${secondScan}';
        `);

        // Call SELECTED_DELIVERY to get both captured and delivery data
        const deliveryData = await Functions_DB.SELECTED_DELIVERY(selectedDelivery);

        if (!deliveryData) {
            throw new Error('No delivery data found.');
        }
        
        // Combine both update result and delivery data to return
        return {
            updateResult: result,
            deliveryData, // Include the SELECTED_DELIVERY data here
        };
    } catch (error) {
        console.error('Error in CONFIRM_LABEL:', error);
        throw error;
    }
};


Functions_DB.CLOSE_DELIVERY = async (deliveryId, boxNumber, employee) => {

    try {
        const result = await dbShip(`
            UPDATE shipping_captured 
            SET shipping_status = 'Closed',
            shipping_container = '${boxNumber}',
            shipping_captured_date = NOW(),
            shipping_employee = '${employee}'
            WHERE id = '${deliveryId}';
        `);

        const result2 = await dbShip(`
            DELETE FROM shipping_delivery WHERE shipping_id = '${deliveryId}' AND shipping_captured IS NULL;
        `);

        return {result, result2};
    } catch (error) {
        console.error('Error closing delivery:', error);
        throw error;
    }
}

Functions_DB.CLOSED_SHIPMENTS = async () => {
    try {
        const result = await dbShip(`
            SELECT * FROM shipping_captured WHERE shipping_status = 'Closed' ORDER BY shipping_captured_date DESC
        `);

        return result;
    } catch (error) {
        console.error('Error fetching closed shipments:', error);
        throw error;
    }
}

Functions_DB.SCANNED_LABELS = async (selectedShipment) => {
    try {
        const result = await dbShip(`
            SELECT * FROM shipping_delivery WHERE shipping_id = '${selectedShipment}' AND shipping_captured = 'true'
        `);

        return result;
    } catch (error) {
        console.error('Error fetching scanned labels:', error);
        throw error;
    }
}   


Functions_DB.GET_DELIVERY = async (delivery) => {
    try {
        const result = await dbShip(`
            SELECT * FROM shipping_delivery WHERE shipping_delivery = '${delivery}'
        `);

        return result;
    } catch (error) {
        console.error('Error fetching delivery:', error);
        throw error;
    }
}

Functions_DB.INSERT_DELIVERY = async (deliveries) => {
    try {
        const result = await dbShip(`
            INSERT INTO shipping_delivery (shipping_id, shipping_delivery, shipping_master, shipping_single)
            VALUES ?
        `, [deliveries]);
        return result;
    }
    catch (error) {
        throw error;
    }
}

Functions_DB.INSERT_SHIPMENT = async (delivery, shipment, employee, dock, date, location) => {
    try {
        const result = await dbShip(`
            INSERT INTO shipping_captured (shipping_name, shipping_delivery, shipping_admin, shipping_dock, shipping_date, shipping_status, shipping_location)
            VALUES ('${shipment}', '${delivery}', '${employee}', '${dock}', '${date}', 'Active', '${location}')
        `);

        return result;
    }
    catch (error) {
        throw error;
    }
}

Functions_DB.GET_DELIVERYNAME = async (shipment) => {
    try {
        const result = await dbShip(`
            SELECT * FROM shipping_captured WHERE shipping_name = '${shipment}'
        `);

        return result
    }
    catch (error) {
        throw error;
    }
}

Functions_DB.DELETE_DELIVERY = async (deliveryId) => {
    try {
        const result = await dbShip(`
            DELETE FROM shipping_captured WHERE id = '${deliveryId}';
        `);

        const result2 = await dbShip(`
            DELETE FROM shipping_delivery WHERE shipping_id = '${deliveryId}';
        `);

        return {result, result2};
    } catch (error) {
        console.error('Error deleting delivery:', error);
        throw error;
    }
}

Functions_DB.CHECK_DOCK = async (selectedDelivery) => {
    try {
        const [dockResult] = await dbShip(`
            SELECT dock_number 
            FROM shipping_dock 
            WHERE id = (
                SELECT shipping_dock 
                FROM shipping_captured 
                WHERE id = '${selectedDelivery}'
            )
        `);
          
        return dockResult;
    } catch (error) {

        console.error('Error retrieving dock number:', error);
        throw error;
    }
};

Functions_DB.DOCKS= async () => {
    try {
        const result = await dbShip(`
            SELECT * FROM shipping_dock
        `);

        return result;
    }
    catch (error) {
        throw error;
    }
}

Functions_DB.getAllDocks = async () => {
    try {
        const result = await dbShip(`SELECT id FROM SHIPPING_DOCK`);
        return result;
    } catch (error) {
        throw error;
    }
};


Functions_DB.updateDockNumber = async (dockId, dockNumber) => {
    try {
        const result = await dbShip(`
            UPDATE SHIPPING_DOCK SET dock_number = ? WHERE id = ?
        `, [dockNumber, dockId]);
        return result;
    } catch (error) {
        throw error;
    }
};

Functions_DB.DOCK_NUMBER = async (dockNumber) => {
    try {
        const [dockCode] = await dbShip(`
            SELECT * FROM shipping_dock WHERE id = ?
        `, [dockNumber]);
        return dockCode;
    } catch (error) {
        throw error;
    }
}
module.exports = Functions_DB;