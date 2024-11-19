const express = require('express');
const router = express.Router();
const routesController = require('../controllers/controller_DB')


router.get('/SHIPPING_DB/DELIVERIES', routesController.DELIVERIES_GET );
router.post('/SHIPPING_DB/SELECTED_DELIVERY', routesController.SELECTED_DELIVERY_POST );
router.post('/SHIPPING_DB/CONFIRM_LABEL', routesController.CONFIRM_LABEL_POST );
router.post('/SHIPPING_DB/SAVE_IMAGE', routesController.SAVE_IMAGE_POST );
router.get('/SHIPPING_DB/CLOSED_SHIPMENTS', routesController.CLOSED_SHIPMENTS_GET );
router.post('/SHIPPING_DB/SCANNED_LABELS', routesController.SCANNED_LABELS_POST );
router.post('/SHIPPING_DB/IMAGE', routesController.SHIPPING_IMAGE_POST );
router.post('/SHIPPING_DB/DELETE_DELIVERY', routesController.DELETE_DELIVERY_POST );
router.post('/SHIPPING_DB/CHECK_DOCK', routesController.CHECK_DOCK_POST );
router.get('/SHIPPING_DB/DOCKS', routesController.DOCKS_GET );
router.post('/SHIPPING_DB/DOCK_NUMBER', routesController.DOCK_NUMBER_POST );

module.exports = router;