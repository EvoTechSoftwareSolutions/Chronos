const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/', ordersController.getOrders);
router.put('/:id', ordersController.updateOrderStatus);

module.exports = router;
