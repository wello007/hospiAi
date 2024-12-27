const { 
  EUROSCORE_II_FACTORS, 
  GRACE_FACTORS,
  TIMI_FACTORS,
  CHA2DS2_VASC_FACTORS,
  SEPSIS_FACTORS,
  GASTRO_FACTORS
} = require('../constants/riskFactors');
const logger = require('../utils/logger');

class ScoreCalculator {
  // Méthodes de calcul des scores cardiaques
  calculateEuroScoreII(params) {
    try {
      let score = 0;
      let reliability = 100;
      const missingParameters = [];

      // Vérification des paramètres requis
      const requiredParams = ['age', 'gender', 'creatinine', 'lvef', 'nyha', 'urgency'];
      requiredParams.forEach(param => {
        if (params[param] === undefined) {
          missingParameters.push(param);
          reliability -= (100 / requiredParams.length);
        }
      });

      // Calcul du score
      if (params.age) score += EUROSCORE_II_FACTORS.age[params.age > 60 ? 'more60' : 'less60'];
      if (params.gender) score += EUROSCORE_II_FACTORS.gender[params.gender];
      if (params.creatinine) score += EUROSCORE_II_FACTORS.creatinine[params.creatinine > 2 ? 'more2' : 'less2'];
      if (params.lvef) score += EUROSCORE_II_FACTORS.lvef[params.lvef < 30 ? 'less30' : 'more30'];

      return {
        score,
        reliability,
        scoreName: 'EuroSCORE II',
        interpretation: this.interpretEuroScore(score),
        missingParameters,
        riskLevel: this.getEuroScoreRiskLevel(score),
        insights: this.generateEuroScoreInsights(params, score)
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul de l'EuroSCORE II: ${error.message}`);
      throw error;
    }
  }

  calculateGRACE(params) {
    try {
      let score = 0;
      let reliability = 100;

      if (params.age) score += GRACE_FACTORS.age[params.age];
      if (params.heartRate) score += GRACE_FACTORS.heartRate[params.heartRate];
      if (params.systolicBP) score += GRACE_FACTORS.systolicBP[params.systolicBP];

      const riskLevel = this.getGRACERiskLevel(score);

      return {
        score,
        reliability,
        scoreName: 'GRACE',
        riskLevel,
        interpretation: this.interpretGRACE(score),
        insights: [{
          type: 'clinical',
          category: 'Risque',
          message: this.interpretGRACE(score),
          recommendations: this.getGRACERecommendations(score)
        }]
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score GRACE: ${error.message}`);
      throw error;
    }
  }

  calculateTIMI(params, type) {
    try {
      // Vérification plus stricte des paramètres vides
      if (!params || Object.keys(params).length === 0 || !Object.values(params).some(value => value)) {
        return {
          score: 0,
          reliability: 100,
          scoreName: `TIMI ${type}`,
          interpretation: this.interpretTIMIScore(0, type),
          riskLevel: this.getTIMIRiskLevel(0, type),
          insights: [{
            type: 'clinical',
            category: 'Risque',
            message: this.interpretTIMIScore(0, type),
            recommendations: this.getTIMIRecommendations(0, type)
          }]
        };
      }

      let score = 0;

      if (type === 'STEMI') {
        // Vérification stricte de chaque paramètre pour STEMI
        if (params.age && typeof params.age === 'number') {
          if (params.age >= 75) score += 3;
          else if (params.age >= 65) score += 2;
        }
        
        if (params.diabetes === true || 
            params.hypertension === true || 
            params.angina === true) score += 1;
        
        if (params.systolicBP && typeof params.systolicBP === 'number' && params.systolicBP < 100) score += 3;
        if (params.heartRate && typeof params.heartRate === 'number' && params.heartRate > 100) score += 2;
        if (params.killipClass && typeof params.killipClass === 'number' && params.killipClass > 1) score += 2;
        if (params.weight && typeof params.weight === 'number' && params.weight < 67) score += 1;
        if (params.anterior === true || params.lbbb === true) score += 1;
        if (params.timeToTreatment && typeof params.timeToTreatment === 'number' && params.timeToTreatment > 4) score += 1;
      } else {
        // NSTEMI
        if (params.age && typeof params.age === 'number' && params.age >= 65) score += 1;
        if (params.riskFactors && typeof params.riskFactors === 'number' && params.riskFactors >= 3) score += 1;
        if (params.knownCAD === true) score += 1;
        if (params.recentAspirin === true) score += 1;
        if (params.severeAngina === true) score += 1;
        if (params.elevatedMarkers === true) score += 1;
        if (params.stDeviation === true) score += 1;
      }

      const interpretation = this.interpretTIMIScore(score, type);
      const riskLevel = this.getTIMIRiskLevel(score, type);

      return {
        score,
        reliability: 100,
        scoreName: `TIMI ${type}`,
        interpretation,
        riskLevel,
        insights: [{
          type: 'clinical',
          category: 'Risque',
          message: interpretation,
          recommendations: this.getTIMIRecommendations(score, type)
        }]
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score TIMI: ${error.message}`);
      throw error;
    }
  }

  calculateCHA2DS2VASc(params) {
    try {
      let score = 0;

      if (params.age >= 75) score += 2;
      else if (params.age >= 65) score += 1;
      if (params.gender === 'F') score += 1;
      if (params.congestiveHeartFailure) score += 1;
      if (params.hypertension) score += 1;
      if (params.stroke) score += 2;
      if (params.vascularDisease) score += 1;
      if (params.diabetes) score += 1;

      const riskLevel = this.getCHA2DS2VAScRiskLevel(score);
      const annualStrokeRisk = this.calculateAnnualStrokeRisk(score);
      const recommendation = this.getCHA2DS2VAScRecommendation(score);

      return {
        score,
        reliability: 100,
        scoreName: 'CHA2DS2-VASc',
        riskLevel,
        annualStrokeRisk,
        recommendation,
        insights: [{
          type: 'clinical',
          category: 'Anticoagulation',
          message: `Risque ${riskLevel.toLowerCase()} - ${recommendation}`,
          recommendations: this.getCHA2DS2VAScDetailedRecommendations(score)
        }]
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score CHA2DS2-VASc: ${error.message}`);
      throw error;
    }
  }

  // Méthodes utilitaires
  getGRACERiskLevel(score) {
    if (score < 109) return { level: 'Faible', description: 'Risque de mortalité <1%' };
    if (score < 140) return { level: 'Intermédiaire', description: 'Risque de mortalité 1-3%' };
    return { level: 'Élevé', description: 'Risque de mortalité >3%' };
  }

  getTIMIRiskLevel(score, type) {
    const levels = {
      STEMI: {
        0: { level: 'Faible', mortality: '2%' },
        3: { level: 'Intermédiaire', mortality: '5%' },
        5: { level: 'Élevé', mortality: '12%' }
      },
      NSTEMI: {
        0: { level: 'Faible', events14d: '5%' },
        4: { level: 'Intermédiaire', events14d: '12%' },
        6: { level: 'Élevé', events14d: '20%' }
      }
    };

    const thresholds = type === 'STEMI' ? [0, 3, 5] : [0, 4, 6];
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (score >= thresholds[i]) return levels[type][thresholds[i]];
    }
    return levels[type][0];
  }

  getCHA2DS2VAScRiskLevel(score) {
    if (score === 0) return 'Très faible';
    if (score === 1) return 'Faible';
    if (score === 2) return 'Modéré';
    return 'Élevé';
  }

  calculateAnnualStrokeRisk(score) {
    const riskTable = {
      0: 0.0, 1: 1.3, 2: 2.2, 3: 3.2,
      4: 4.0, 5: 6.7, 6: 9.8, 7: 9.6,
      8: 6.7, 9: 15.2
    };
    return riskTable[Math.min(score, 9)];
  }

  interpretTIMIScore(score, type) {
    if (type === 'STEMI') {
      if (score <= 2) return 'Risque faible (mortalité ~2%)';
      if (score <= 4) return 'Risque intermédiaire (mortalité ~5%)';
      return 'Risque élevé (mortalité ~12%)';
    } else {
      if (score <= 2) return 'Risque faible (événements à 14j: ~5%)';
      if (score <= 4) return 'Risque intermédiaire (événements à 14j: ~12%)';
      return 'Risque élevé (événements à 14j: ~20%)';
    }
  }

  // Méthodes pour les scores gastro
  validateGastroParams(params, requiredParams) {
    const missing = requiredParams.filter(param => !params[param]);
    if (missing.length > 0) {
      throw new Error(`Paramètres manquants: ${missing.join(', ')}`);
    }
    return true;
  }

  calculateChildPugh(params) {
    try {
      let score = 0;
      let reliability = 100;
      const insights = [];

      // Calcul complet du score
      if (params.ascites === 'none') score += 1;
      else if (params.ascites === 'mild') score += 2;
      else if (params.ascites === 'severe') score += 3;

      if (params.bilirubin < 2) score += 1;
      else if (params.bilirubin <= 3) score += 2;
      else score += 3;

      if (params.albumin > 3.5) score += 1;
      else if (params.albumin >= 2.8) score += 2;
      else score += 3;

      if (params.prothrombin < 4) score += 1;
      else if (params.prothrombin <= 6) score += 2;
      else score += 3;

      if (params.encephalopathy === 'none') score += 1;
      else if (params.encephalopathy === 'mild') score += 2;
      else if (params.encephalopathy === 'severe') score += 3;

      // Classification
      let classification = score <= 6 ? 'A' : score <= 9 ? 'B' : 'C';

      insights.push({
        type: 'clinical',
        category: 'Pronostic',
        message: `Cirrhose Child-Pugh ${classification}`
      });

      return {
        score,
        classification,
        reliability,
        scoreName: 'Child-Pugh',
        insights
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score Child-Pugh: ${error.message}`);
      throw error;
    }
  }

  calculateMELD(params) {
    try {
      const score = Math.round(
        10 * (0.957 * Math.log(params.creatinine) +
        0.378 * Math.log(params.bilirubin) +
        1.12 * Math.log(params.inr) + 0.643)
      );

      return {
        score,
        reliability: 100,
        scoreName: 'MELD',
        insights: [{
          type: 'clinical',
          category: 'Pronostic',
          message: this.interpretMELD(score)
        }]
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score MELD: ${error.message}`);
      throw error;
    }
  }

  calculateBlatchford(params) {
    try {
      let score = 0;
      
      // Calcul du score selon les paramètres
      if (params.bloodUrea > 10) score += 6;
      if (params.hemoglobin < 10) score += 6;
      if (params.systolicBP < 90) score += 3;
      if (params.pulse >= 100) score += 1;

      return {
        score,
        reliability: 100,
        scoreName: 'Blatchford',
        insights: [{
          type: 'clinical',
          message: this.interpretBlatchford(score)
        }]
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score de Blatchford: ${error.message}`);
      throw error;
    }
  }

  calculateRockall(params) {
    try {
      let score = 0;
      
      // Calcul complet du score
      if (params.age >= 80) score += 2;
      else if (params.age >= 60) score += 1;
      
      if (params.shock === 'hypotension') score += 2;
      else if (params.shock === 'tachycardia') score += 1;

      if (params.comorbidity === 'metastatic') score += 3;
      else if (params.comorbidity === 'cardiac' || params.comorbidity === 'renal' || params.comorbidity === 'hepatic') score += 2;

      if (params.diagnosis === 'cancer') score += 2;
      else if (params.diagnosis === 'pepticUlcer') score += 1;

      if (params.stigmata === 'activeBleed') score += 2;
      else if (params.stigmata === 'visibleVessel' || params.stigmata === 'adherentClot') score += 1;

      return {
        score,
        reliability: 100,
        scoreName: 'Rockall',
        interpretation: this.interpretRockall(score),
        insights: [{
          type: 'clinical',
          message: this.interpretRockall(score)
        }]
      };
    } catch (error) {
      logger.error(`Erreur dans le calcul du score de Rockall: ${error.message}`);
      throw error;
    }
  }

  interpretRockall(score) {
    if (score <= 2) return 'Risque très faible de récidive hémorragique et de mortalité';
    if (score <= 4) return 'Risque modéré - Surveillance recommandée';
    return 'Risque élevé - Prise en charge intensive nécessaire';
  }

  interpretMELD(score) {
    if (score < 10) return 'Risque faible';
    if (score < 20) return 'Risque modéré';
    return 'Risque élevé';
  }

  interpretBlatchford(score) {
    if (score <= 2) return 'Risque très faible';
    if (score <= 5) return 'Risque faible';
    if (score <= 8) return 'Risque modéré';
    return 'Risque élevé';
  }

  // Méthodes d'interprétation manquantes
  interpretEuroScore(score) {
    if (score < 2) return 'Risque faible';
    if (score < 5) return 'Risque modéré';
    return 'Risque élevé';
  }

  getEuroScoreRiskLevel(score) {
    if (score < 2) return 1;
    if (score < 5) return 3;
    return 5;
  }

  generateEuroScoreInsights(params, score) {
    const insights = [{
      type: 'alert',
      category: 'Risque global',
      message: `Risque opératoire ${this.interpretEuroScore(score)}`,
      implications: this.getEuroScoreImplications(score),
      recommendations: this.getEuroScoreRecommendations(score)
    }];

    return insights;
  }

  getEuroScoreImplications(score) {
    if (score < 2) return ['Mortalité prédite <2%'];
    if (score < 5) return ['Mortalité prédite 2-5%'];
    return ['Mortalité prédite >5%'];
  }

  getEuroScoreRecommendations(score) {
    if (score < 2) return ['Chirurgie possible sans délai'];
    if (score < 5) return ['Optimisation préopératoire recommandée'];
    return ['Discussion en réunion médico-chirurgicale'];
  }

  interpretGRACE(score) {
    if (score < 109) return 'Risque faible de mortalité (<1%)';
    if (score < 140) return 'Risque intermédiaire de mortalité (1-3%)';
    return 'Risque élevé de mortalité (>3%)';
  }

  getGRACERecommendations(score) {
    if (score >= 140) return ['Coronarographie urgente', 'Surveillance USI'];
    if (score >= 109) return ['Coronarographie dans les 24h'];
    return ['Stratégie non invasive possible'];
  }

  getTIMIRecommendations(score, type) {
    if (type === 'STEMI') {
      if (score >= 5) return ['Angioplastie primaire urgente', 'Monitoring continu'];
      return ['Stratégie de reperfusion selon protocole'];
    } else {
      if (score >= 4) return ['Stratégie invasive précoce (<24h)'];
      return ['Stratégie conservatrice possible'];
    }
  }

  getCHA2DS2VAScRecommendation(score) {
    if (score === 0) return 'Pas d\'anticoagulation recommandée';
    if (score === 1) return 'Anticoagulation à discuter';
    return 'Anticoagulation recommandée';
  }

  getCHA2DS2VAScDetailedRecommendations(score) {
    if (score >= 2) {
      return [
        'Anticoagulation par AVK (INR 2-3) ou AOD',
        'Surveillance régulière de l\'anticoagulation',
        'Évaluation du risque hémorragique'
      ];
    }
    return ['Réévaluation périodique du risque'];
  }
}

module.exports = new ScoreCalculator(); 