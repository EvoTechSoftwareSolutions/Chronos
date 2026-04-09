const express = require('express');
const router = express.Router();
const adminProfileController = require('../controllers/adminProfileController');

router.get('/', adminProfileController.getProfile);
router.put('/', adminProfileController.updateProfile);
router.post('/security', adminProfileController.updateSecurity);

module.exports = router;
