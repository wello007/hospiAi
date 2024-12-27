const logger = require('../utils/logger');

class TrendAnalyzer {
  analyzeTrends(historicalScores) {
    try {
      const trends = {
        evolution: this.calculateEvolution(historicalScores),
        riskFactors: this.identifyRiskFactors(historicalScores),
        recommendations: this.generateRecommendations(historicalScores)
      };

      return trends;
    } catch (error) {
      logger.error(`Erreur dans l'analyse des tendances: ${error.message}`);
      throw error;
    }
  }

  calculateEvolution(scores) {
    const evolution = {
      trend: 'stable',
      percentage: 0,
      details: []
    };

    // Analyse sur les 3 derniers scores
    const recentScores = scores.slice(-3);
    if (recentScores.length >= 2) {
      const lastScore = recentScores[recentScores.length - 1].score;
      const previousScore = recentScores[0].score;
      const difference = ((lastScore - previousScore) / previousScore) * 100;

      evolution.percentage = Math.round(difference);
      evolution.trend = difference > 5 ? 'deterioration' : 
                       difference < -5 ? 'amelioration' : 'stable';
    }

    return evolution;
  }

  identifyRiskFactors(scores) {
    const riskFactors = [];
    const lastScore = scores[scores.length - 1];

    // Analyse spécifique selon le type de score
    switch (lastScore.scoreName) {
      case 'Child-Pugh':
        if (lastScore.score > 9) {
          riskFactors.push({
            factor: 'Cirrhose décompensée',
            impact: 'critique',
            action: 'Évaluation pour transplantation'
          });
        }
        break;

      case 'MELD':
        if (lastScore.score > 15) {
          riskFactors.push({
            factor: 'Insuffisance hépatique sévère',
            impact: 'majeur',
            action: 'Discussion RCP hépatologie'
          });
        }
        break;

      case 'Blatchford':
        if (lastScore.score > 12) {
          riskFactors.push({
            factor: 'Hémorragie à haut risque',
            impact: 'urgent',
            action: 'Endoscopie immédiate'
          });
        }
        break;
    }

    return riskFactors;
  }

  generateRecommendations(scores) {
    const lastScore = scores[scores.length - 1];
    const trend = this.calculateEvolution(scores).trend;

    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    if (trend === 'deterioration') {
      recommendations.immediate.push({
        action: 'Réévaluation clinique urgente',
        priority: 'haute',
        timing: '< 24h'
      });
    }

    // Recommandations spécifiques selon le score
    switch (lastScore.scoreName) {
      case 'Child-Pugh':
        this.addChildPughRecommendations(recommendations, lastScore.score);
        break;
      case 'MELD':
        this.addMELDRecommendations(recommendations, lastScore.score);
        break;
      case 'Blatchford':
        this.addBlatchfordRecommendations(recommendations, lastScore.score);
        break;
    }

    return recommendations;
  }

  addChildPughRecommendations(recommendations, score) {
    if (score > 9) {
      recommendations.immediate.push({
        action: 'Consultation hépatologie',
        priority: 'haute',
        timing: '< 7 jours'
      });
      recommendations.shortTerm.push({
        action: 'Bilan pré-transplantation',
        priority: 'moyenne',
        timing: '< 1 mois'
      });
    }
  }

  addMELDRecommendations(recommendations, score) {
    if (score > 15) {
      recommendations.immediate.push({
        action: 'Optimisation thérapeutique',
        priority: 'haute',
        timing: '< 48h'
      });
    }
  }

  addBlatchfordRecommendations(recommendations, score) {
    if (score > 12) {
      recommendations.immediate.push({
        action: 'Réanimation',
        priority: 'urgente',
        timing: 'immédiat'
      });
    }
  }
}

module.exports = new TrendAnalyzer(); 