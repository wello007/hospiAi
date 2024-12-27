require('dotenv').config();

// Vérification des variables d'environnement requises
const requiredEnvVars = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logger.error(`Variable d'environnement manquante: ${varName}`);
    process.exit(1);
  }
});

const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const scoreRoutes = require('./routes/scoreRoutes');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const checkAuth = require('./middleware/checkAuth');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes d'authentification (non protégées)
app.use('/auth', authRoutes);

// Middleware d'authentification pour toutes les routes /api
app.use('/api', checkAuth);

// Routes
app.use('/api/scores', scoreRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue',
    error: err.message
  });
});

app.listen(port, () => {
  logger.info(`Serveur démarré sur le port ${port}`);
});

module.exports = app; // Pour les tests 