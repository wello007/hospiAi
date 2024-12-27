const express = require('express');
const router = express.Router();
const scoreRoutes = require('./scoreRoutes');
const alertRoutes = require('./alertRoutes');
const statsRoutes = require('./statsRoutes');
const auth = require('../middleware/auth');

router.use('/scores', auth, scoreRoutes);
router.use('/alerts', auth, alertRoutes);
router.use('/stats', auth, statsRoutes);

module.exports = router; 