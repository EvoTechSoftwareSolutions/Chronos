const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { validateSettings } = require('../middleware/validate');

router.get('/', settingsController.getSettings);
router.put('/', validateSettings, settingsController.updateSettings);

module.exports = router;
