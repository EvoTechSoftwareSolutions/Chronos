const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Token verification endpoint — used by the frontend on app load to validate stored JWT
router.get('/verify-token', requireAuth, (req, res) => {
  res.status(200).json({ valid: true, admin: req.auth });
});

module.exports = router;
