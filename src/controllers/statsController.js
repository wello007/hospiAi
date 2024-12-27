const StatsService = require('../services/statsService');
const logger = require('../utils/logger');

class StatsController {
  async getUnitStats(req, res) {
    try {
      const { unit, period } = req.query;
      const stats = await StatsService.getUnitStatistics(unit, period);
      
      return res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getPatientProgression(req, res) {
    try {
      const { patientId, scoreType } = req.params;
      const progression = await StatsService.getPatientProgression(patientId, scoreType);
      
      return res.json({
        status: 'success',
        data: progression
      });
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la progression: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new StatsController(); 