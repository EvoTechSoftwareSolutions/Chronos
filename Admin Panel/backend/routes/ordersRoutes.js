const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { validateOrderStatus } = require('../middleware/validate');

router.get('/', ordersController.getOrders);
router.put('/:id', validateOrderStatus, ordersController.updateOrderStatus);

module.exports = router;
