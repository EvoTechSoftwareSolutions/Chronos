const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { validateOrderStatus } = require('../middleware/validate');

router.get('/', ordersController.getOrders);
router.put('/:id', validateOrderStatus, ordersController.updateOrderStatus);
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
