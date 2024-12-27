const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/scores/calculate:
 *   post:
 *     summary: Calcule un score cardiaque
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scoreType
 *               - params
 *             properties:
 *               scoreType:
 *                 type: string
 *                 enum: [euroscore2, grace, timi, cha2ds2vasc]
 *               type:
 *                 type: string
 *                 enum: [STEMI, NSTEMI]
 *               params:
 *                 type: object
 */
router.post(
  '/calculate',
  authMiddleware,
  scoreController.calculateScore.bind(scoreController)
);

module.exports = router; 