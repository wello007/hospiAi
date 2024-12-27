const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authentification utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Authentification échouée
 */
router.post('/login', (req, res) => {
  logger.info(`Body reçu: ${JSON.stringify(req.body)}`);
  const { username, password } = req.body;

  logger.info(`Tentative de connexion pour l'utilisateur: ${username}`);
  logger.info(`Variables d'environnement: ADMIN_USERNAME=${process.env.ADMIN_USERNAME}, ADMIN_PASSWORD=${process.env.ADMIN_PASSWORD}`);

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Connexion réussie pour l'utilisateur: ${username}`);

    res.json({
      status: 'success',
      token: token
    });
  } else {
    const errorDetails = {
      providedUsername: username,
      expectedUsername: process.env.ADMIN_USERNAME,
      usernameMatch: username === process.env.ADMIN_USERNAME,
      passwordMatch: password === process.env.ADMIN_PASSWORD
    };
    
    logger.warn(`Échec de connexion - détails: ${JSON.stringify(errorDetails)}`);

    res.status(401).json({
      status: 'error',
      message: 'Identifiants invalides',
      debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
});

module.exports = router; 