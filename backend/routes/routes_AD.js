const express = require('express');
const router = express.Router();
const routesController = require('../controllers/controller_AD')


router.post('/SHIPPING_AD/AUTHENTICATE', routesController.AUTHENTICATE);
router.post('/SHIPPING_AD/USERSFORGROUP', routesController.USERSFORGROUP);
router.post('/SHIPPING_AD/USERINFO', routesController.USERINFO);

module.exports = router;