const ScoreCalculator = require('../services/scoreCalculator');
const scoreValidator = require('../validators/scoreValidator');
const logger = require('../utils/logger');
const TrendAnalyzer = require('../services/trendAnalyzer');
const ScoreHistory = require('../models/scoreHistory');

class ScoreController {
  calculateScore(req, res) {
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

      // Calcul du score selon le type
      let result;
      switch (scoreType) {
        case 'euroscore2':
          result = ScoreCalculator.calculateEuroScoreII(value.params);
          break;
        case 'grace':
          result = ScoreCalculator.calculateGRACE(value.params);
          break;
        case 'timi':
          result = ScoreCalculator.calculateTIMI(value.params, value.type);
          break;
        case 'cha2ds2vasc':
          result = ScoreCalculator.calculateCHA2DS2VASc(value.params);
          break;
        case 'sepsis':
          result = ScoreCalculator.calculateSepsis(value.params);
          break;
        case 'childpugh':
          result = ScoreCalculator.calculateChildPugh(value.params);
          break;
        case 'meld':
          result = ScoreCalculator.calculateMELD(value.params);
          break;
        case 'blatchford':
          result = ScoreCalculator.calculateBlatchford(value.params);
          break;
        case 'rockall':
          result = ScoreCalculator.calculateRockall(value.params);
          break;
        default:
          return res.status(400).json({
            status: 'error',
            message: 'Type de score non supporté'
          });
      }

      const historicalScores = await ScoreHistory.find({ 
        patientId: req.body.patientId,
        scoreType: scoreType 
      }).sort({ createdAt: -1 }).limit(5);

      if (historicalScores.length > 0) {
        const trends = TrendAnalyzer.analyzeTrends(historicalScores);
        result.trends = trends;
      }

      return res.json({
        status: 'success',
        data: result
      });

    } catch (error) {
      logger.error(`Erreur lors du calcul du score: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors du calcul du score',
        error: error.message
      });
    }
  }

  calculateMultipleScores(req, res) {
    try {
      const { scores } = req.body;
      const results = {};
      
      for (const scoreRequest of scores) {
        const result = this.calculateScore(scoreRequest);
        results[scoreRequest.scoreType] = result;
      }

      const crossInsights = ScoreCalculator.generateCrossScoreInsights(results);
      
      return res.json({
        status: 'success',
        data: {
          scores: results,
          crossInsights
        }
      });
    } catch (error) {
      logger.error(`Erreur lors du calcul multiple: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new ScoreController(); 