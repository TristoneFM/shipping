const Functions = require('../functions/functions_DB');
const fs = require('fs');
const controller = {};


controller.DELIVERIES_GET = async (req, res) => {

    try {
        const result = await Functions.DELIVERIES();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

controller.SELECTED_DELIVERY_POST = async (req, res) => {
   const { selectedDelivery } = req.body;
   
    try {
        const result = await Functions.SELECTED_DELIVERY(selectedDelivery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

controller.CONFIRM_LABEL_POST = async (req, res) => {
    const { selectedDelivery, firstScan, secondScan } = req.body;
    
     try {
         const result = await Functions.CONFIRM_LABEL(selectedDelivery, firstScan, secondScan);
         res.status(200).json(result);
     } catch (error) {
         res.status(500).json(error);
     }
 }

    controller.SAVE_IMAGE_POST = async (req, res) => {
        const {boxNumber, image, deliveryId, employee } = req.body;
        
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
        
        try {
            const filePath = `./uploads/${deliveryId}.jpg`;
            fs.writeFileSync(filePath, base64Data, 'base64');

            const result = await Functions.CLOSE_DELIVERY(deliveryId, boxNumber, employee);

            res.status(200).json({ message: 'Image saved successfully' });
          } catch (error) {
            console.error('Error saving image:', error);
            res.status(500).json({ message: 'Failed to save image' });
          }
    }

    controller.CLOSED_SHIPMENTS_GET = async (req, res) => {
        try {
            const result = await Functions.CLOSED_SHIPMENTS();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    controller.SCANNED_LABELS_POST = async (req, res) => {
        const { selectedShipment } = req.body;
        
        try {
            const result = await Functions.SCANNED_LABELS(selectedShipment);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    }


    controller.SHIPPING_IMAGE_POST = async (req, res) => {
        const { deliveryId } = req.body;
        
        try {
            const filePath = `./uploads/${deliveryId}.jpg`;
            const image = fs.readFileSync(filePath);
            res.status(200).send(image);
          } catch (error) {
            console.error('Error getting image:', error);
            res.status(500).json({ message: 'Failed to get image' });
          }
    }

    controller.DELETE_DELIVERY_POST = async (req, res) => {
        const { deliveryId } = req.body;
        
        try {
            const result = await Functions.DELETE_DELIVERY(deliveryId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    controller.CHECK_DOCK_POST = async (req, res) => {
        const { selectedDelivery, dockNumber } = req.body;
        
        try {
            const result = await Functions.CHECK_DOCK(selectedDelivery);
            
            if(result.dock_number === dockNumber) {
                res.status(200).json({ message: 'Dock number matches' });
            } else {
                res.status(200).json({ error: 'Dock number does not match' });
            }

        } catch (error) {
            
            res.status(500).json(error);
        }
    }


    controller.DOCKS_GET = async (req, res) => {

        try {
            const result = await Functions.DOCKS();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    };

    controller.DOCK_NUMBER_POST = async (req, res) => {
        const { dockNumber } = req.body;
        
        try {
            const result = await Functions.DOCK_NUMBER(dockNumber);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    }
module.exports = controller;