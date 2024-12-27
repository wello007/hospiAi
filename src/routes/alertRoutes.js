const express = require('express');
const router = express.Router();
const AlertController = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.post('/configure', auth, AlertController.configureAlerts);
router.get('/status', auth, AlertController.getAlertStatus);

module.exports = router; 