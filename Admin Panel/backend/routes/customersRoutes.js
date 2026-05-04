const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const { validateCustomer } = require('../middleware/validate');

router.get('/', customersController.getCustomers);
router.post('/', validateCustomer, customersController.addCustomer);
router.put('/:id', validateCustomer, customersController.updateCustomer);
router.delete('/:id', customersController.deleteCustomer);

module.exports = router;
