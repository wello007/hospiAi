const ScoreHistory = require('../models/scoreHistory');

class StatsService {
  async getUnitStatistics(unit, period = '24h') {
    const stats = {
      totalScores: 0,
      criticalScores: 0,
      averageScores: {},
      trends: {},
      mostUsedScores: [],
      alertsGenerated: 0
    };

    const query = {
      unit,
      createdAt: { $gte: this.getPeriodDate(period) }
    };

    const scores = await ScoreHistory.find(query);
    
    stats.totalScores = scores.length;
    stats.criticalScores = scores.filter(s => this.isCriticalScore(s)).length;
    stats.averageScores = this.calculateAverages(scores);
    stats.trends = this.analyzeTrends(scores);
    stats.mostUsedScores = this.getMostUsedScores(scores);

    return stats;
  }

  async getPatientProgression(patientId, scoreType) {
    const scores = await ScoreHistory.find({ patientId, scoreType })
      .sort({ createdAt: 1 });

    return {
      progression: this.calculateProgression(scores),
      predictions: this.predictTrend(scores),
      recommendations: this.getProgressionRecommendations(scores)
    };
  }

  isCriticalScore(score) {
    const thresholds = {
      'childpugh': 10,
      'meld': 20,
      'blatchford': 12,
      'rockall': 7
    };
    return score.score >= thresholds[score.scoreType];
  }

  calculateProgression(scores) {
    if (scores.length < 2) return null;

    const firstScore = scores[0].score;
    const lastScore = scores[scores.length - 1].score;
    const evolution = ((lastScore - firstScore) / firstScore) * 100;

    return {
      startScore: firstScore,
      currentScore: lastScore,
      evolutionPercent: Math.round(evolution),
      trend: evolution > 0 ? 'deterioration' : 'amelioration',
      timeFrame: this.calculateTimeFrame(scores[0].createdAt, scores[scores.length - 1].createdAt)
    };
  }

  predictTrend(scores) {
    // Implémentation d'un algorithme de prédiction simple
    if (scores.length < 3) return null;

    const recentScores = scores.slice(-3);
    const trend = recentScores.map(s => s.score);
    const slope = (trend[2] - trend[0]) / 2;

    return {
      nextPredictedScore: Math.round(trend[2] + slope),
      confidence: this.calculateConfidence(trend),
      timeframe: '24h'
    };
  }
}

module.exports = new StatsService(); 