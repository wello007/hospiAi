const ScoreCalculator = require('../services/scoreCalculator');

describe('ScoreCalculator', () => {
  describe('calculateEuroScoreII', () => {
    test('devrait calculer correctement le score avec tous les paramètres', () => {
      const params = {
        age: 65,
        gender: 'M',
        creatinine: 150,
        lvef: 55,
        nyha: 2,
        urgency: 'elective',
        diabetes: true,
        pulmonaryPressure: 40,
        weightOfIntervention: 'single'
      };

      const result = ScoreCalculator.calculateEuroScoreII(params);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('reliability');
      expect(result.reliability).toBe(100);
      expect(result.scoreName).toBe('EuroSCORE II');
      expect(result.interpretation).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.missingParameters).toHaveLength(0);
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
    });

    test('devrait réduire la fiabilité si des paramètres sont manquants', () => {
      const params = {
        age: 65,
        gender: 'M'
      };

      const result = ScoreCalculator.calculateEuroScoreII(params);

      expect(result.reliability).toBeLessThan(100);
      expect(result.missingParameters).toContain('creatinine');
      expect(result.missingParameters).toContain('lvef');
      expect(result.missingParameters).toContain('nyha');
      expect(result.missingParameters).toContain('urgency');
    });

    test('devrait gérer correctement les valeurs zéro', () => {
      const params = {
        age: 65,
        gender: 'M',
        creatinine: 0,
        lvef: 0,
        nyha: 1,
        urgency: 'elective'
      };

      const result = ScoreCalculator.calculateEuroScoreII(params);
      expect(result.reliability).toBe(100);
      expect(result.missingParameters).toHaveLength(0);
    });

    test('devrait inclure les informations AI dans la réponse', async () => {
      const params = {
        age: 70,
        gender: 'M',
        creatinine: 120,
        lvef: 25,
        nyha: 3,
        urgency: 'urgent'
      };

      const result = await ScoreCalculator.calculateEuroScoreII(params);
      
      expect(result.aiResponse).toBeDefined();
      expect(result.aiResponse.enabled).toBe(true);
      expect(['openai', 'local']).toContain(result.aiResponse.source);
      expect(['success', 'fallback']).toContain(result.aiResponse.status);
      
      if (result.aiResponse.status === 'fallback') {
        expect(result.aiResponse.fallbackReason).toBeDefined();
      }
      
      if (result.aiResponse.status === 'success') {
        expect(result.aiResponse.raw).toBeDefined();
        expect(result.aiResponse.raw.timestamp).toBeDefined();
        expect(result.aiResponse.raw.content).toBeDefined();
      }
    });
  });

  describe('calculateGRACE', () => {
    test('devrait calculer correctement le score GRACE avec tous les paramètres', () => {
      const params = {
        age: 65,
        heartRate: 80,
        systolicBP: 130,
        creatinine: 1.2,
        killipClass: 1,
        cardiacArrest: false,
        elevatedCardiacMarkers: true,
        stSegmentDeviation: true
      };

      const result = ScoreCalculator.calculateGRACE(params);

      expect(result).toHaveProperty('score');
      expect(result.reliability).toBe(100);
      expect(result.scoreName).toBe('GRACE');
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
    });
  });

  describe('calculateTIMI', () => {
    test('devrait calculer correctement le score TIMI STEMI', () => {
      const params = {
        age: 76,
        diabetes: true,
        hypertension: true,
        systolicBP: 95,
        heartRate: 110,
        killipClass: 2,
        weight: 65,
        anteriorSTEMI: true,
        timeTo6h: true
      };

      const result = ScoreCalculator.calculateTIMI(params, 'STEMI');

      expect(result).toHaveProperty('score');
      expect(result.scoreName).toBe('TIMI STEMI');
      expect(result.interpretation).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.reliability).toBe(100);
    });

    test('devrait gérer les cas limites pour TIMI STEMI', () => {
      const params = {
        age: 74,  // Juste en dessous du seuil
        diabetes: false,
        hypertension: false,
        systolicBP: 100,  // Seuil exact
        heartRate: 100,   // Seuil exact
        killipClass: 1,
        weight: 67,       // Seuil exact
        anteriorSTEMI: false,
        timeTo6h: false
      };

      const result = ScoreCalculator.calculateTIMI(params, 'STEMI');
      expect(result.score).toBe(0);  // Devrait avoir un score de 0
    });

    test('devrait calculer correctement le score TIMI NSTEMI avec tous les facteurs de risque', () => {
      const params = {
        age: 66,
        diabetes: true,
        hypertension: true,
        systolicBP: 140,
        heartRate: 85,
        killipClass: 1,
        riskFactorsCount: 3,
        knownCAD: true,
        aspirinLast7Days: false,  // Notez le false ici
        severeAngina: true,
        stDeviation: true,
        elevatedMarkers: true
      };

      const result = ScoreCalculator.calculateTIMI(params, 'NSTEMI');
      expect(result.score).toBeGreaterThan(0);
      expect(result.interpretation).toContain('Risque');
    });
  });

  describe('calculateCHA2DS2VASc', () => {
    test('devrait calculer correctement le score CHA2DS2-VASc', () => {
      const params = {
        age: 76,
        gender: 'F',
        congestiveHeartFailure: true,
        hypertension: true,
        diabetes: true,
        stroke: false,
        vascularDisease: true
      };

      const result = ScoreCalculator.calculateCHA2DS2VASc(params);

      expect(result).toHaveProperty('score');
      expect(result.scoreName).toBe('CHA2DS2-VASc');
      expect(result.riskLevel).toBeDefined();
      expect(result.annualStrokeRisk).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.insights).toBeDefined();
    });
  });

  describe('Méthodes utilitaires', () => {
    test('getGRACERiskLevel devrait retourner le bon niveau de risque', () => {
      expect(ScoreCalculator.getGRACERiskLevel(100).level).toBe('Faible');
      expect(ScoreCalculator.getGRACERiskLevel(130).level).toBe('Intermédiaire');
      expect(ScoreCalculator.getGRACERiskLevel(150).level).toBe('Élevé');
    });

    test('getTIMIRiskLevel devrait retourner le bon niveau de risque', () => {
      expect(ScoreCalculator.getTIMIRiskLevel(2, 'STEMI').level).toBe('Faible');
      expect(ScoreCalculator.getTIMIRiskLevel(4, 'STEMI').level).toBe('Intermédiaire');
      expect(ScoreCalculator.getTIMIRiskLevel(6, 'STEMI').level).toBe('Élevé');
    });

    test('getCHA2DS2VAScRiskLevel devrait retourner le bon niveau de risque', () => {
      expect(ScoreCalculator.getCHA2DS2VAScRiskLevel(0)).toBe('Très faible');
      expect(ScoreCalculator.getCHA2DS2VAScRiskLevel(1)).toBe('Faible');
      expect(ScoreCalculator.getCHA2DS2VAScRiskLevel(2)).toBe('Modéré');
      expect(ScoreCalculator.getCHA2DS2VAScRiskLevel(3)).toBe('Élevé');
    });

    test('calculateAnnualStrokeRisk devrait gérer tous les cas', () => {
      expect(ScoreCalculator.calculateAnnualStrokeRisk(0)).toBe(0.0);
      expect(ScoreCalculator.calculateAnnualStrokeRisk(1)).toBe(1.3);
      expect(ScoreCalculator.calculateAnnualStrokeRisk(9)).toBe(15.2);
      expect(ScoreCalculator.calculateAnnualStrokeRisk(10)).toBe(15.2);  // Cas hors limites
    });

    test('interpretTIMIScore devrait retourner les bonnes interprétations', () => {
      expect(ScoreCalculator.interpretTIMIScore(2, 'STEMI')).toContain('Risque faible');
      expect(ScoreCalculator.interpretTIMIScore(4, 'STEMI')).toContain('Risque intermédiaire');
      expect(ScoreCalculator.interpretTIMIScore(5, 'STEMI')).toContain('Risque élevé');
      
      expect(ScoreCalculator.interpretTIMIScore(2, 'NSTEMI')).toContain('Risque faible');
      expect(ScoreCalculator.interpretTIMIScore(4, 'NSTEMI')).toContain('Risque intermédiaire');
      expect(ScoreCalculator.interpretTIMIScore(5, 'NSTEMI')).toContain('Risque élevé');
    });
  });

  describe('Scores Gastroentérologiques', () => {
    describe('calculateChildPugh', () => {
      test('devrait calculer correctement le score Child-Pugh classe A', () => {
        const params = {
          ascites: 'none',
          bilirubin: 1.5,
          albumin: 3.8,
          prothrombin: 3,
          encephalopathy: 'none'
        };

        const result = ScoreCalculator.calculateChildPugh(params);
        expect(result.score).toBeLessThanOrEqual(6);
        expect(result.classification).toBe('A');
      });

      test('devrait calculer correctement le score Child-Pugh classe C', () => {
        const params = {
          ascites: 'severe',
          bilirubin: 4.0,
          albumin: 2.5,
          prothrombin: 7,
          encephalopathy: 'severe'
        };

        const result = ScoreCalculator.calculateChildPugh(params);
        expect(result.score).toBeGreaterThan(9);
        expect(result.classification).toBe('C');
      });
    });

    describe('calculateMELD', () => {
      test('devrait calculer correctement le score MELD', () => {
        const params = {
          bilirubin: 2.5,
          inr: 1.5,
          creatinine: 1.2
        };

        const result = ScoreCalculator.calculateMELD(params);
        expect(result.score).toBeDefined();
        expect(result.interpretation).toBeDefined();
        expect(result.insights).toHaveLength(1);
      });
    });

    describe('calculateBlatchford', () => {
      test('devrait calculer correctement le score de Blatchford', () => {
        const params = {
          bloodUrea: 7.5,
          hemoglobin: 11.5,
          gender: 'M',
          systolicBP: 95,
          pulse: 105,
          melena: true,
          syncope: false,
          hepaticDisease: true,
          cardiacFailure: false
        };

        const result = ScoreCalculator.calculateBlatchford(params);
        expect(result.score).toBeDefined();
        expect(result.interpretation).toBeDefined();
        expect(result.insights).toBeDefined();
      });
    });
  });

  describe('OpenAI Integration', () => {
    test('devrait gérer le timeout correctement', async () => {
      const params = {
        ascites: 'none',
        bilirubin: 1.5,
        albumin: 3.8,
        prothrombin: 3,
        encephalopathy: 'none'
      };

      // Mock OpenAI timeout
      jest.setTimeout(11000);
      const result = await ScoreCalculator.calculateChildPugh(params);
      
      expect(result.aiStatus).toBeDefined();
      if (result.aiStatus === 'fallback') {
        expect(result.insights[0].type).toBe('warning');
      }
    });

    test('devrait inclure la réponse brute de ChatGPT', async () => {
      const params = {
        ascites: 'none',
        bilirubin: 1.5,
        albumin: 3.8,
        prothrombin: 3,
        encephalopathy: 'none'
      };

      const result = await ScoreCalculator.calculateChildPugh(params);
      
      if (result.aiStatus === 'success') {
        expect(result.insights[0].rawGPTResponse).toBeDefined();
        expect(result.insights[0].rawGPTResponse.timestamp).toBeDefined();
      }
    });

    test('devrait indiquer la source de la réponse', async () => {
      const params = {
        ascites: 'none',
        bilirubin: 1.5,
        albumin: 3.8,
        prothrombin: 3,
        encephalopathy: 'none'
      };

      const result = await ScoreCalculator.calculateChildPugh(params);
      
      expect(result.responseSource).toBeDefined();
      expect(['openai', 'local']).toContain(result.responseSource);
      expect(result.responseTime).toBeDefined();
      
      if (result.responseSource === 'local') {
        expect(result.fallbackReason).toBeDefined();
      }
    });
  });
}); 