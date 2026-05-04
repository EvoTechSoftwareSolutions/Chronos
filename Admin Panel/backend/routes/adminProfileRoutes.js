const express = require('express');
const router = express.Router();
const adminProfileController = require('../controllers/adminProfileController');
const { validateAdminProfile, validateSecurityUpdate } = require('../middleware/validate');

router.get('/', adminProfileController.getProfile);
router.put('/', validateAdminProfile, adminProfileController.updateProfile);
router.post('/security', validateSecurityUpdate, adminProfileController.updateSecurity);

module.exports = router;
