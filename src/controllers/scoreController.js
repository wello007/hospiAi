const ScoreCalculator = require('../services/scoreCalculator');
const scoreValidator = require('../validators/scoreValidator');
const logger = require('../utils/logger');

class ScoreController {
  async calculateScore(req, res) {
    try {
      const { scoreType } = req.body;

      // Validation du schéma selon le type de score
      const validationSchema = scoreValidator[scoreType];
      if (!validationSchema) {
        return res.status(400).json({
          status: 'error',
          message: 'Type de score non supporté'
        });
      }

      // Validation directe de req.body
      const { error, value } = validationSchema.validate(req.body, {
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      let result;
      const startTime = Date.now();

      try {
        // Calcul du score selon le type
        switch (scoreType) {
          case 'euroscore2':
            result = await ScoreCalculator.calculateEuroScoreII(value.params);
            break;
          case 'grace':
            result = await ScoreCalculator.calculateGRACE(value.params);
            break;
          case 'timi':
            result = await ScoreCalculator.calculateTIMI(value.params, value.type);
            break;
          case 'cha2ds2vasc':
            result = await ScoreCalculator.calculateCHA2DS2VASc(value.params);
            break;
          case 'sepsis':
            result = await ScoreCalculator.calculateSepsis(value.params);
            break;
          case 'childpugh':
            result = await ScoreCalculator.calculateChildPugh(value.params);
            break;
          case 'meld':
            result = await ScoreCalculator.calculateMELD(value.params);
            break;
          case 'blatchford':
            result = await ScoreCalculator.calculateBlatchford(value.params);
            break;
          case 'rockall':
            result = await ScoreCalculator.calculateRockall(value.params);
            break;
          default:
            return res.status(400).json({
              status: 'error',
              message: 'Type de score non supporté'
            });
        }

        // S'assurer que result est défini et contient toutes les données
        if (!result) {
          throw new Error('Résultat du calcul non disponible');
        }

        // Ajout du temps de réponse si non présent
        if (!result.responseTime) {
          result.responseTime = Date.now() - startTime;
        }

        // Log du résultat complet avant envoi
        logger.info(`Envoi de la réponse: ${JSON.stringify(result)}`);

        // Envoi de la réponse complète
        return res.json({
          status: 'success',
          data: result  // Envoi de l'objet result complet
        });

      } catch (error) {
        logger.error(`Erreur lors du calcul: ${error.message}`);
        return res.status(500).json({
          status: 'error',
          message: 'Erreur lors du calcul',
          error: error.message
        });
      }
    } catch (validationError) {
      return res.status(400).json({
        status: 'error',
        message: validationError.message
      });
    }
  }
}

module.exports = new ScoreController(); 