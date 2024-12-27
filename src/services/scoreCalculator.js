const { EUROSCORE_II_FACTORS, GRACE_FACTORS, REQUIRED_PARAMETERS, TIMI_FACTORS, CHA2DS2_VASC_FACTORS, SEPSIS_FACTORS } = require('../constants/riskFactors');
const logger = require('../utils/logger');

class ScoreCalculator {
  calculateEuroScoreII(params) {
    let logit = 0;
    let reliability = 100;
    const missingParams = [];

    try {
      // Vérification des paramètres requis
      REQUIRED_PARAMETERS.forEach(param => {
        // Vérifie si le paramètre existe et n'est pas null/undefined/vide
        if (!params[param] && params[param] !== 0) {
          missingParams.push(param);
          reliability -= (100 / REQUIRED_PARAMETERS.length);
        }
      });

      // Calcul de l'âge
      if (params.age) {
        const ageEffect = EUROSCORE_II_FACTORS.age.coefficient * 
          EUROSCORE_II_FACTORS.age.transform(params.age);
        logit += ageEffect;
      }

      // Genre (toujours requis)
      if (params.gender === 'F') {
        logit += EUROSCORE_II_FACTORS.gender.female;
      }

      // Fonction ventriculaire gauche (LVEF)
      if (params.lvef !== undefined && params.lvef !== null) {
        const lvefValue = parseInt(params.lvef);
        if (lvefValue > 50) {
          logit += EUROSCORE_II_FACTORS.lvef.good;
        } else if (lvefValue > 30) {
          logit += EUROSCORE_II_FACTORS.lvef.moderate;
        } else if (lvefValue > 20) {
          logit += EUROSCORE_II_FACTORS.lvef.poor;
        } else {
          logit += EUROSCORE_II_FACTORS.lvef.verypoor;
        }
      }

      // Classification NYHA
      if (params.nyha) {
        switch(params.nyha) {
          case 1:
            logit += EUROSCORE_II_FACTORS.nyha.class1;
            break;
          case 2:
            logit += EUROSCORE_II_FACTORS.nyha.class2;
            break;
          case 3:
            logit += EUROSCORE_II_FACTORS.nyha.class3;
            break;
          case 4:
            logit += EUROSCORE_II_FACTORS.nyha.class4;
            break;
        }
      }

      // Créatinine
      if (params.creatinine) {
        logit += EUROSCORE_II_FACTORS.creatinine.coefficient * 
          EUROSCORE_II_FACTORS.creatinine.transform(params.creatinine);
      }

      // Diabète
      if (params.diabetes) {
        logit += EUROSCORE_II_FACTORS.diabetes;
      }

      // Hypertension pulmonaire
      if (params.pulmonaryPressure) {
        const pap = params.pulmonaryPressure;
        if (pap > 55) {
          logit += EUROSCORE_II_FACTORS.pulmonaryHypertension.severe;
        } else if (pap > 31) {
          logit += EUROSCORE_II_FACTORS.pulmonaryHypertension.moderate;
        }
      }

      // Urgence
      if (params.urgency) {
        logit += EUROSCORE_II_FACTORS.urgency[params.urgency] || 0;
      }

      // Calcul du score final
      const score = (100 / (1 + Math.exp(-logit)));

      // Préparation de la réponse
      const result = {
        score: parseFloat(score.toFixed(2)),
        reliability: parseFloat(reliability.toFixed(2)),
        scoreName: 'EuroSCORE II',
        interpretation: this.interpretScore(score),
        missingParameters: missingParams,
        riskLevel: this.getRiskLevel(score),
        insights: this.generateAIInsights(params, score, 'euroscore2')
      };

      logger.info(`Score calculé: ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      logger.error(`Erreur dans le calcul du score: ${error.message}`);
      throw new Error('Erreur dans le calcul du score');
    }
  }

  interpretScore(score) {
    if (score < 1) {
      return "Risque très faible";
    } else if (score < 2) {
      return "Risque faible";
    } else if (score < 5) {
      return "Risque modéré";
    } else if (score < 10) {
      return "Risque élevé";
    } else {
      return "Risque très élevé";
    }
  }

  getRiskLevel(score) {
    if (score < 1) return 1;
    if (score < 2) return 2;
    if (score < 5) return 3;
    if (score < 10) return 4;
    return 5;
  }

  calculateGRACE(params) {
    let score = 0;
    let reliability = 100;
    const missingParams = [];
    const requiredGraceParams = ['age', 'heartRate', 'systolicBP', 'creatinine', 'killipClass'];

    try {
      // Vérification des paramètres requis
      requiredGraceParams.forEach(param => {
        if (!params[param]) {
          missingParams.push(param);
          reliability -= (100 / requiredGraceParams.length);
        }
      });

      // Calcul du score GRACE
      if (params.age) score += this.getAgeScore(params.age);
      if (params.heartRate) score += this.getHeartRateScore(params.heartRate);
      if (params.systolicBP) score += this.getSystolicBPScore(params.systolicBP);
      if (params.creatinine) score += this.getCreatinineScore(params.creatinine);
      if (params.killipClass) score += GRACE_FACTORS.killipClass[params.killipClass];
      if (params.cardiacArrest) score += GRACE_FACTORS.cardiacArrest;
      if (params.elevatedCardiacMarkers) score += GRACE_FACTORS.elevatedCardiacMarkers;
      if (params.stSegmentDeviation) score += GRACE_FACTORS.stSegmentDeviation;

      // Analyse IA des facteurs de risque
      const aiInsights = this.generateAIInsights(params, score, 'grace');

      const result = {
        score: score,
        reliability: parseFloat(reliability.toFixed(2)),
        scoreName: 'GRACE',
        riskLevel: this.getGRACERiskLevel(score),
        mortality6Month: this.calculate6MonthMortality(score),
        missingParameters: missingParams,
        insights: aiInsights
      };

      logger.info(`Score GRACE calculé: ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      logger.error(`Erreur dans le calcul du score GRACE: ${error.message}`);
      throw new Error('Erreur dans le calcul du score GRACE');
    }
  }

  getAgeScore(age) {
    if (age < 30) return GRACE_FACTORS.age['<30'];
    if (age < 40) return GRACE_FACTORS.age['30-39'];
    if (age < 50) return GRACE_FACTORS.age['40-49'];
    if (age < 60) return GRACE_FACTORS.age['50-59'];
    if (age < 70) return GRACE_FACTORS.age['60-69'];
    if (age < 80) return GRACE_FACTORS.age['70-79'];
    if (age < 90) return GRACE_FACTORS.age['80-89'];
    return GRACE_FACTORS.age['≥90'];
  }

  getHeartRateScore(hr) {
    if (hr < 50) return GRACE_FACTORS.heartRate['<50'];
    if (hr < 70) return GRACE_FACTORS.heartRate['50-69'];
    if (hr < 90) return GRACE_FACTORS.heartRate['70-89'];
    if (hr < 110) return GRACE_FACTORS.heartRate['90-109'];
    if (hr < 150) return GRACE_FACTORS.heartRate['110-149'];
    if (hr < 200) return GRACE_FACTORS.heartRate['150-199'];
    return GRACE_FACTORS.heartRate['≥200'];
  }

  getSystolicBPScore(sbp) {
    if (sbp < 80) return GRACE_FACTORS.systolicBP['<80'];
    if (sbp < 100) return GRACE_FACTORS.systolicBP['80-99'];
    if (sbp < 120) return GRACE_FACTORS.systolicBP['100-119'];
    if (sbp < 140) return GRACE_FACTORS.systolicBP['120-139'];
    if (sbp < 160) return GRACE_FACTORS.systolicBP['140-159'];
    if (sbp < 200) return GRACE_FACTORS.systolicBP['160-199'];
    return GRACE_FACTORS.systolicBP['≥200'];
  }

  getCreatinineScore(creatinine) {
    if (creatinine < 0.4) return GRACE_FACTORS.creatinine['0-0.39'];
    if (creatinine < 0.8) return GRACE_FACTORS.creatinine['0.4-0.79'];
    if (creatinine < 1.2) return GRACE_FACTORS.creatinine['0.8-1.19'];
    if (creatinine < 1.6) return GRACE_FACTORS.creatinine['1.2-1.59'];
    if (creatinine < 2.0) return GRACE_FACTORS.creatinine['1.6-1.99'];
    if (creatinine < 4.0) return GRACE_FACTORS.creatinine['2-3.99'];
    return GRACE_FACTORS.creatinine['≥4'];
  }

  getGRACERiskLevel(score) {
    if (score <= 108) return { level: 'Faible', description: 'Risque de mortalité <1%' };
    if (score <= 140) return { level: 'Intermédiaire', description: 'Risque de mortalité 1-3%' };
    return { level: 'Élevé', description: 'Risque de mortalité >3%' };
  }

  calculate6MonthMortality(score) {
    // Formule basée sur les données du registre GRACE
    const probability = 1 / (1 + Math.exp(-(score - 200)/100));
    return parseFloat((probability * 100).toFixed(1));
  }

  generateAIInsights(params, score, scoreType) {
    const insights = [];
    
    switch (scoreType) {
      case 'euroscore2':
        return this.generateEuroscoreInsights(params, score);
      case 'grace':
        return this.generateGraceInsights(params, score);
      case 'timi':
        return this.generateTIMIInsights(params, score, params.type);
      case 'cha2ds2vasc':
        return this.generateCHA2DS2VAScInsights(params, score);
      default:
        return insights;
    }
  }

  generateEuroscoreInsights(params, score) {
    const insights = [];

    // Analyse de la fonction cardiaque
    if (params.lvef < 30) {
      insights.push({
        type: 'critical',
        category: 'Fonction cardiaque',
        message: 'Dysfonction ventriculaire gauche sévère',
        implications: [
          'Risque accru de défaillance cardiaque post-opératoire',
          'Nécessité potentielle de support inotrope',
          'Considérer une optimisation préopératoire'
        ],
        recommendations: [
          'Évaluation par échographie cardiaque complète',
          'Optimisation du traitement médical (IEC/ARA2, bêtabloquants)',
          'Discussion collégiale pour timing chirurgical optimal'
        ],
        evidence: 'ESC Guidelines 2022 sur l\'insuffisance cardiaque'
      });
    }

    // Analyse de la fonction rénale
    if (params.creatinine > 200) {
      insights.push({
        type: 'warning',
        category: 'Fonction rénale',
        message: 'Insuffisance rénale significative',
        implications: [
          'Risque accru de complications post-opératoires',
          'Impact sur la pharmacocinétique des médicaments',
          'Risque d\'aggravation post-opératoire'
        ],
        recommendations: [
          'Consultation néphrologique préopératoire',
          'Adaptation des doses médicamenteuses',
          'Surveillance étroite de la volémie péri-opératoire',
          'Protection rénale peropératoire'
        ],
        evidence: 'KDIGO Clinical Practice Guidelines'
      });
    }

    // Analyse multifactorielle
    if (score > 10) {
      insights.push({
        type: 'alert',
        category: 'Risque global',
        message: 'Risque opératoire très élevé',
        implications: [
          'Mortalité prédite >10%',
          'Risque élevé de complications majeures',
          'Durée de séjour prolongée probable'
        ],
        recommendations: [
          'Discussion en réunion médico-chirurgicale',
          'Envisager des alternatives thérapeutiques',
          'Optimisation préopératoire intensive',
          'Information détaillée du patient et des proches'
        ],
        evidence: 'EuroSCORE II Validation Studies'
      });
    }

    return insights;
  }

  generateGraceInsights(params, score) {
    const insights = [];

    // Analyse hémodynamique
    if (params.systolicBP < 100 && params.heartRate > 100) {
      insights.push({
        type: 'critical',
        category: 'État hémodynamique',
        message: 'Instabilité hémodynamique significative',
        implications: [
          'Possible état de choc cardiogénique débutant',
          'Risque de défaillance multi-organique',
          'Pronostic péjoratif à court terme'
        ],
        recommendations: [
          'Monitorage hémodynamique invasif',
          'Support inotrope/vasopresseur à considérer',
          'Échocardiographie urgente',
          'Coronarographie en urgence à discuter'
        ],
        evidence: 'ESC Guidelines 2020 pour SCA'
      });
    }

    // Analyse rénale et cardiaque combinée
    if (params.killipClass > 2 && params.creatinine > 150) {
      insights.push({
        type: 'warning',
        category: 'Syndrome cardio-rénal',
        message: 'Dysfonction cardio-rénale significative',
        implications: [
          'Risque accru de mortalité à 6 mois',
          'Complexité de la prise en charge thérapeutique',
          'Risque d\'aggravation mutuelle des dysfonctions'
        ],
        recommendations: [
          'Monitoring étroit de la fonction rénale',
          'Adaptation prudente des traitements diurétiques',
          'Éviter les néphrotoxiques',
          'Optimisation de la perfusion rénale'
        ],
        evidence: 'Consensus sur le syndrome cardio-rénal, ESC/ERA'
      });
    }

    return insights;
  }

  generateTIMIInsights(params, score, type) {
    const insights = [];

    if (type === 'STEMI') {
      // Analyse du délai de prise en charge
      if (params.timeTo6h) {
        insights.push({
          type: 'critical',
          category: 'Timing de reperfusion',
          message: 'Délai critique pour la reperfusion',
          implications: [
            'Impact majeur sur la taille de l\'infarctus',
            'Influence sur le pronostic à long terme',
            'Risque accru de complications mécaniques'
          ],
          recommendations: [
            'Activation immédiate de la salle de cathétérisme',
            'Considérer la thrombolyse si délai d\'angioplastie >120 min',
            'Double anti-agrégation plaquettaire urgente'
          ],
          evidence: 'Guidelines ESC 2017 STEMI, Concept de "Time is Muscle"'
        });
      }
    } else {
      // NSTEMI
      if (score >= 5) {
        insights.push({
          type: 'warning',
          category: 'Stratification du risque',
          message: 'Risque ischémique très élevé',
          implications: [
            'Risque élevé d\'événements à 14 jours',
            'Bénéfice prouvé d\'une stratégie invasive précoce',
            'Nécessité d\'une surveillance rapprochée'
          ],
          recommendations: [
            'Coronarographie dans les 24h',
            'Traitement anti-thrombotique optimal',
            'Monitoring continu',
            'Prévention des complications hémorragiques'
          ],
          evidence: 'TIMACS Trial, Guidelines ESC 2020 NSTEMI'
        });
      }
    }

    return insights;
  }

  generateCHA2DS2VAScInsights(params, score) {
    const insights = [];

    // Analyse du risque thromboembolique
    if (score >= 2) {
      insights.push({
        type: 'warning',
        category: 'Risque thromboembolique',
        message: 'Risque significatif d\'AVC',
        implications: [
          `Risque annuel d'AVC: ${this.calculateAnnualStrokeRisk(score)}%`,
          'Impact majeur sur la morbi-mortalité',
          'Nécessité d\'une prévention efficace'
        ],
        recommendations: [
          'Anticoagulation au long cours indiquée',
          'Choix entre AVK et AOD selon le profil patient',
          'Éducation thérapeutique importante',
          'Surveillance régulière de l\'observance'
        ],
        evidence: 'Guidelines ESC 2020 FA'
      });
    }

    // Analyse des facteurs de risque modifiables
    const modifiableRisks = [];
    if (params.hypertension) modifiableRisks.push('HTA');
    if (params.diabetes) modifiableRisks.push('Diabète');
    if (params.congestiveHeartFailure) modifiableRisks.push('Insuffisance cardiaque');

    if (modifiableRisks.length > 0) {
      insights.push({
        type: 'management',
        category: 'Facteurs de risque modifiables',
        message: 'Présence de facteurs de risque contrôlables',
        implications: [
          'Impact sur le risque thromboembolique',
          'Possibilité d\'amélioration du pronostic',
          'Nécessité d\'une prise en charge globale'
        ],
        recommendations: modifiableRisks.map(risk => {
          switch(risk) {
            case 'HTA':
              return 'Optimisation du traitement anti-hypertenseur, cible <130/80 mmHg';
            case 'Diabète':
              return 'Contrôle glycémique strict, HbA1c <7%';
            case 'Insuffisance cardiaque':
              return 'Optimisation du traitement de l\'insuffisance cardiaque selon les guidelines';
            default:
              return '';
          }
        }),
        evidence: 'Recommandations ESC/ESH 2018, ADA 2022'
      });
    }

    return insights;
  }

  calculateTIMI(params, type = 'STEMI') {
    let score = 0;
    let reliability = 100;
    const missingParams = [];

    try {
      if (type === 'STEMI') {
        // Calcul TIMI STEMI
        if (params.age >= 75) score += TIMI_FACTORS.age75;
        if (params.diabetes) score += TIMI_FACTORS.diabetes;
        if (params.hypertension) score += TIMI_FACTORS.hypertension;
        if (params.systolicBP < 100) score += TIMI_FACTORS.systolicBP;
        if (params.heartRate > 100) score += TIMI_FACTORS.heartRate;
        if (params.killipClass > 1) score += TIMI_FACTORS.killipClass24;
        if (params.weight < 67) score += TIMI_FACTORS.weight65;
        if (params.anteriorSTEMI) score += TIMI_FACTORS.anteriorSTEMI;
        if (params.timeTo6h) score += TIMI_FACTORS.timeTo6h;

      } else {
        // Calcul TIMI NSTEMI/UA
        if (params.age >= 65) score += TIMI_FACTORS.age65;
        if (params.riskFactorsCount >= 3) score += TIMI_FACTORS.threeRiskFactors;
        if (params.knownCAD) score += TIMI_FACTORS.knownCAD;
        if (!params.aspirinLast7Days) score += TIMI_FACTORS.aspirinLast7Days;
        if (params.severeAngina) score += TIMI_FACTORS.severeAngina;
        if (params.stDeviation) score += TIMI_FACTORS.stDeviation;
        if (params.elevatedMarkers) score += TIMI_FACTORS.elevatedMarkers;
      }

      const result = {
        score: score,
        reliability: reliability,
        scoreName: `TIMI ${type}`,
        riskLevel: this.getTIMIRiskLevel(score, type),
        interpretation: this.interpretTIMIScore(score, type),
        insights: this.generateTIMIInsights(params, score, type)
      };

      logger.info(`Score TIMI calculé: ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      logger.error(`Erreur dans le calcul du score TIMI: ${error.message}`);
      throw new Error('Erreur dans le calcul du score TIMI');
    }
  }

  interpretTIMIScore(score, type) {
    if (type === 'STEMI') {
      if (score <= 2) return 'Risque faible (mortalité ~2%)';
      if (score <= 4) return 'Risque intermédiaire (mortalité ~5%)';
      return 'Risque élevé (mortalité ~12%)';
    } else {
      if (score <= 2) return 'Risque faible (événements à 14j: ~3%)';
      if (score <= 4) return 'Risque intermédiaire (événements à 14j: 5-13%)';
      return 'Risque élevé (événements à 14j: ~20%)';
    }
  }

  calculateAnnualStrokeRisk(score) {
    const riskTable = {
      0: 0.0,
      1: 1.3,
      2: 2.2,
      3: 3.2,
      4: 4.0,
      5: 6.7,
      6: 9.8,
      7: 9.6,
      8: 6.7,
      9: 15.2
    };
    return riskTable[score] !== undefined ? riskTable[score] : 15.2;
  }

  calculateCHA2DS2VASc(params) {
    let score = 0;
    let reliability = 100;
    const missingParams = [];

    try {
      if (params.congestiveHeartFailure) score += CHA2DS2_VASC_FACTORS.congestiveHeartFailure;
      if (params.hypertension) score += CHA2DS2_VASC_FACTORS.hypertension;
      if (params.age >= 75) {
        score += CHA2DS2_VASC_FACTORS.age75;
      } else if (params.age >= 65) {
        score += CHA2DS2_VASC_FACTORS.age6574;
      }
      if (params.diabetes) score += CHA2DS2_VASC_FACTORS.diabetes;
      if (params.stroke) score += CHA2DS2_VASC_FACTORS.stroke;
      if (params.vascularDisease) score += CHA2DS2_VASC_FACTORS.vascularDisease;
      if (params.gender === 'F') score += CHA2DS2_VASC_FACTORS.female;

      const result = {
        score: score,
        reliability: reliability,
        scoreName: 'CHA2DS2-VASc',
        riskLevel: this.getCHA2DS2VAScRiskLevel(score),
        annualStrokeRisk: this.calculateAnnualStrokeRisk(score),
        recommendation: this.getAnticoagulationRecommendation(score, params.gender),
        insights: this.generateCHA2DS2VAScInsights(params, score)
      }; 

      logger.info(`Score CHA2DS2-VASc calculé: ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      logger.error(`Erreur dans le calcul du score CHA2DS2-VASc: ${error.message}`);
      throw new Error('Erreur dans le calcul du score CHA2DS2-VASc');
    }
  }

  getTIMIRiskLevel(score, type) {
    if (type === 'STEMI') {
      if (score <= 2) return { level: 'Faible', mortality: '2%' };
      if (score <= 4) return { level: 'Intermédiaire', mortality: '5%' };
      return { level: 'Élevé', mortality: '12%' };
    } else {
      if (score <= 2) return { level: 'Faible', events14d: '3%' };
      if (score <= 4) return { level: 'Intermédiaire', events14d: '5-13%' };
      return { level: 'Élevé', events14d: '20%' };
    }
  }

  getCHA2DS2VAScRiskLevel(score) {
    if (score === 0) return 'Très faible';
    if (score === 1) return 'Faible';
    if (score === 2) return 'Modéré';
    return 'Élevé';
  }

  getAnticoagulationRecommendation(score, gender) {
    if (score === 0) return 'Pas d\'anticoagulation recommandée';
    if (score === 1 && gender === 'M') return 'Anticoagulation à considérer';
    return 'Anticoagulation recommandée';
  }

  generateTIMIInsights(params, score, type) {
    const insights = [];
    
    if (type === 'STEMI') {
      if (params.systolicBP < 100 && params.heartRate > 100) {
        insights.push({
          type: 'critical',
          message: 'État de choc possible - Intervention immédiate recommandée',
          priority: 'urgent'
        });
      }
    } else {
      if (score >= 5) {
        insights.push({
          type: 'treatment',
          message: 'Stratégie invasive précoce recommandée (<24h)',
          evidence: 'Guidelines ESC'
        });
      }
    }

    return insights;
  }

  generateCHA2DS2VAScInsights(params, score) {
    const insights = [];

    if (score >= 2) {
      insights.push({
        type: 'treatment',
        message: 'Anticoagulation fortement recommandée',
        options: [
          'AVK avec INR cible 2-3',
          'AOD aux doses recommandées'
        ]
      });
    }

    if (params.age >= 75) {
      insights.push({
        type: 'monitoring',
        message: 'Surveillance accrue du risque hémorragique recommandée',
        recommendation: 'Évaluation régulière du score HAS-BLED'
      });
    }

    return insights;
  }

  calculateSepsis(params) {
    try {
      let qsofaScore = 0;
      let sofaScore = 0;
      let reliability = 100;
      const missingParams = [];
      const insights = [];

      // Calcul qSOFA
      if (params.mentalStatus && params.mentalStatus < 15) {
        qsofaScore += SEPSIS_FACTORS.qsofa.alteredMentalStatus;
      }
      if (params.respiratoryRate && params.respiratoryRate >= 22) {
        qsofaScore += SEPSIS_FACTORS.qsofa.respiratoryRate;
      }
      if (params.systolicBP && params.systolicBP <= 100) {
        qsofaScore += SEPSIS_FACTORS.qsofa.systolicBP;
      }

      // Calcul SOFA
      if (params.pao2fio2) {
        if (params.pao2fio2 < 100) sofaScore += 4;
        else if (params.pao2fio2 < 200) sofaScore += 3;
        else if (params.pao2fio2 < 300) sofaScore += 2;
        else if (params.pao2fio2 < 400) sofaScore += 1;
      }

      // ... calculs similaires pour autres organes ...

      // Analyse IA des patterns
      const aiInsights = this.generateSepsisInsights(params, qsofaScore, sofaScore);
      insights.push(...aiInsights);

      const result = {
        qsofaScore,
        sofaScore,
        riskScore,
        reliability,
        scoreName: 'Sepsis Score',
        riskLevel: this.getSepsisRiskLevel(qsofaScore, sofaScore),
        interpretation: this.interpretSepsisScore(qsofaScore, sofaScore),
        insights,
        recommendations: this.getSepsisRecommendations(qsofaScore, sofaScore, params)
      };

      logger.info(`Score Sepsis calculé: ${JSON.stringify(result)}`);
      return result;

    } catch (error) {
      logger.error(`Erreur dans le calcul du score Sepsis: ${error.message}`);
      throw new Error('Erreur dans le calcul du score Sepsis');
    }
  }

  calculateSepsisRisk(qsofaScore, sofaScore, params) {
    let risk = 0;
    
    // Base risk from scores
    risk += (qsofaScore / 3) * 0.4;  // qSOFA contributes 40%
    risk += (sofaScore / 24) * 0.6;  // SOFA contributes 60%

    // Additional risk factors
    if (params.age > SEPSIS_FACTORS.riskFactors.age.threshold) {
      risk += SEPSIS_FACTORS.riskFactors.age.coefficient * 
        (params.age - SEPSIS_FACTORS.riskFactors.age.threshold) / 100;
    }
    
    if (params.immunosuppression) risk += 0.2;
    if (params.recentSurgery) risk += 0.1;
    if (params.chronicDisease) risk += 0.1;

    // Normalize to 0-1 range
    return Math.min(Math.max(risk, 0), 1);
  }

  interpretSepsisScore(qsofaScore, sofaScore) {
    if (sofaScore >= 2 || qsofaScore >= 2) {
      return 'Sepsis probable nécessitant une prise en charge urgente';
    } else if (sofaScore === 1 || qsofaScore === 1) {
      return 'Risque modéré de sepsis - Surveillance rapprochée recommandée';
    }
    return 'Faible probabilité de sepsis - Réévaluation régulière recommandée';
  }

  generateSepsisInsights(params, qsofaScore, sofaScore) {
    const insights = [];

    // Détection précoce
    if (qsofaScore >= 2) {
      insights.push({
        type: 'critical',
        category: 'Détection précoce',
        message: 'Risque élevé de sepsis - Intervention urgente requise',
        implications: [
          'Risque accru de mortalité',
          'Nécessité d\'une prise en charge rapide',
          'Surveillance étroite recommandée'
        ],
        recommendations: [
          'Hémocultures avant antibiothérapie',
          'Antibiothérapie large spectre dans l\'heure',
          'Remplissage vasculaire si hypotension'
        ],
        evidence: 'Surviving Sepsis Campaign Guidelines'
      });
    }

    // Analyse des tendances
    if (params.lactate > 2) {
      insights.push({
        type: 'warning',
        category: 'Métabolique',
        message: 'Hyperlactatémie significative',
        implications: [
          'Possible hypoperfusion tissulaire',
          'Risque de défaillance d\'organe'
        ],
        recommendations: [
          'Optimisation hémodynamique',
          'Surveillance rapprochée du lactate',
          'Réévaluation de la perfusion tissulaire'
        ]
      });
    }

    // Analyse multiparamétrique
    if (params.systolicBP <= 90 && params.heartRate >= 100) {
      insights.push({
        type: 'alert',
        category: 'Hémodynamique',
        message: 'État de choc possible',
        implications: [
          'Risque de défaillance circulatoire',
          'Perfusion tissulaire compromise'
        ],
        recommendations: [
          'Expansion volémique immédiate',
          'Considérer les vasopresseurs',
          'Monitoring hémodynamique invasif'
        ]
      });
    }

    return insights;
  }

  getSepsisRiskLevel(qsofaScore, sofaScore) {
    if (sofaScore >= 2 || qsofaScore >= 2) {
      return {
        level: 'Élevé',
        probability: 'Sepsis probable'
      };
    }
    if (sofaScore === 1 || qsofaScore === 1) {
      return {
        level: 'Modéré',
        probability: 'Surveillance rapprochée nécessaire'
      };
    }
    return {
      level: 'Faible',
      probability: 'Sepsis peu probable'
    };
  }

  getSepsisRecommendations(qsofaScore, sofaScore, params) {
    const recommendations = [];
    
    if (qsofaScore >= 2 || sofaScore >= 2) {
      recommendations.push({
        timing: 'Immédiat',
        actions: [
          'Hémocultures avant antibiothérapie',
          'Antibiothérapie large spectre dans l\'heure',
          'Mesure du lactate artériel',
          'Remplissage vasculaire si hypotension ou lactate > 4 mmol/L'
        ],
        monitoring: [
          'Surveillance horaire des paramètres vitaux',
          'Surveillance de la diurèse',
          'Réévaluation clinique toutes les 30 minutes jusqu\'à stabilisation'
        ]
      });
    }

    return recommendations;
  }
}

module.exports = new ScoreCalculator(); 