const express = require('express');
const router = express.Router();
const routesController = require('../controllers/controller_RFC')


router.post('/SHIPPING_RFC/DELIVERY', routesController.DELIVERY_POST );
router.post('/SHIPPING_RFC/ZEMPMAST', routesController.ZEMPMAST_POST );

module.exports = router;