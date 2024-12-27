const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Scores Cardiaques',
    version: '1.0.0',
    description: 'API pour le calcul de différents scores de risque en cardiologie'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      SepsisParams: {
        type: 'object',
        properties: {
          mentalStatus: {
            type: 'number',
            description: 'Score de Glasgow (3-15)',
            minimum: 3,
            maximum: 15
          },
          respiratoryRate: {
            type: 'number',
            description: 'Fréquence respiratoire (respirations/min)',
            minimum: 0,
            maximum: 60
          },
          // ... autres paramètres avec leurs descriptions ...
        }
      }
    }
  },
  security: [{
    bearerAuth: []
  }],
  paths: {
    '/api/scores/calculate': {
      post: {
        tags: ['Scores'],
        summary: 'Calcule un score cardiaque',
        description: 'Calcule un score cardiaque selon les paramètres fournis',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['scoreType', 'params'],
                properties: {
                  scoreType: {
                    type: 'string',
                    enum: ['euroscore2', 'grace', 'timi', 'cha2ds2vasc', 'sepsis', 'childpugh', 'meld', 'blatchford', 'rockall'],
                    description: 'Type de score à calculer'
                  },
                  type: {
                    type: 'string',
                    enum: ['STEMI', 'NSTEMI'],
                    description: 'Pour le score TIMI uniquement'
                  },
                  params: {
                    type: 'object'
                  }
                }
              },
              examples: {
                euroscore2: {
                  summary: 'Exemple EuroSCORE II',
                  value: {
                    scoreType: 'euroscore2',
                    params: {
                      age: 65,
                      gender: 'M',
                      creatinine: 150,
                      lvef: 55,
                      nyha: 2,
                      urgency: 'elective',
                      diabetes: true,
                      pulmonaryPressure: 40,
                      weightOfIntervention: 'single'
                    }
                  }
                },
                grace: {
                  summary: 'Exemple GRACE',
                  value: {
                    scoreType: 'grace',
                    params: {
                      age: 65,
                      heartRate: 80,
                      systolicBP: 130,
                      creatinine: 1.2,
                      killipClass: 1,
                      cardiacArrest: false,
                      elevatedCardiacMarkers: true,
                      stSegmentDeviation: true
                    }
                  }
                },
                timiSTEMI: {
                  summary: 'Exemple TIMI STEMI',
                  value: {
                    scoreType: 'timi',
                    type: 'STEMI',
                    params: {
                      age: 76,
                      diabetes: true,
                      hypertension: true,
                      systolicBP: 95,
                      heartRate: 110,
                      killipClass: 2,
                      weight: 65,
                      anteriorSTEMI: true,
                      timeTo6h: true
                    }
                  }
                },
                timiNSTEMI: {
                  summary: 'Exemple TIMI NSTEMI',
                  value: {
                    scoreType: 'timi',
                    type: 'NSTEMI',
                    params: {
                      age: 66,
                      diabetes: true,
                      hypertension: true,
                      systolicBP: 140,
                      heartRate: 85,
                      killipClass: 1,
                      riskFactorsCount: 3,
                      knownCAD: true,
                      aspirinLast7Days: true,
                      severeAngina: true,
                      stDeviation: true,
                      elevatedMarkers: true
                    }
                  }
                },
                cha2ds2vasc: {
                  summary: 'Exemple CHA2DS2-VASc',
                  value: {
                    scoreType: 'cha2ds2vasc',
                    params: {
                      age: 76,
                      gender: 'F',
                      congestiveHeartFailure: true,
                      hypertension: true,
                      diabetes: true,
                      stroke: false,
                      vascularDisease: true
                    }
                  }
                },
                sepsis: {
                  summary: 'Exemple Sepsis',
                  value: {
                    scoreType: 'sepsis',
                    params: {
                      mentalStatus: 14,
                      respiratoryRate: 24,
                      systolicBP: 85,
                      pao2fio2: 250,
                      platelets: 90,
                      bilirubin: 2.5,
                      meanArterialPressure: 65,
                      glasgowComaScale: 14,
                      creatinine: 1.8,
                      urineOutput: 400,
                      lactate: 3.2,
                      heartRate: 115,
                      temperature: 38.5,
                      age: 72,
                      immunosuppression: false,
                      recentSurgery: true,
                      chronicDisease: true
                    }
                  }
                },
                childPugh: {
                  summary: 'Exemple Child-Pugh',
                  value: {
                    scoreType: 'childpugh',
                    params: {
                      ascites: 'mild',
                      bilirubin: 2.5,
                      albumin: 3.2,
                      prothrombin: 5,
                      encephalopathy: 'none'
                    }
                  }
                },
                meld: {
                  summary: 'Exemple MELD',
                  value: {
                    scoreType: 'meld',
                    params: {
                      bilirubin: 2.5,
                      inr: 1.5,
                      creatinine: 1.2
                    }
                  }
                },
                rockall: {
                  summary: 'Exemple Rockall',
                  value: {
                    scoreType: 'rockall',
                    params: {
                      age: 75,
                      shock: 'tachycardia',
                      comorbidity: 'cardiac',
                      diagnosis: 'pepticUlcer',
                      stigmata: 'adherentClot'
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Score calculé avec succès',
            content: {
              'application/json': {
                examples: {
                  euroscore2Response: {
                    summary: 'Réponse EuroSCORE II',
                    value: {
                      score: 3.14,
                      reliability: 100,
                      scoreName: 'EuroSCORE II',
                      interpretation: 'Risque modéré',
                      missingParameters: [],
                      riskLevel: 3,
                      insights: [
                        {
                          type: 'warning',
                          category: 'Risque opératoire',
                          message: 'Risque modéré',
                          implications: [
                            'Mortalité prédite entre 2 et 5%'
                          ],
                          recommendations: [
                            'Optimisation préopératoire recommandée',
                            'Discussion en réunion médico-chirurgicale'
                          ]
                        }
                      ]
                    }
                  },
                  graceResponse: {
                    summary: 'Réponse GRACE',
                    value: {
                      score: 140,
                      reliability: 100,
                      scoreName: 'GRACE',
                      riskLevel: {
                        level: 'Intermédiaire',
                        description: 'Risque de mortalité 1-3%'
                      },
                      mortality6Month: 15.5,
                      insights: [
                        {
                          type: 'clinical',
                          message: 'Risque intermédiaire nécessitant une surveillance rapprochée'
                        }
                      ]
                    }
                  },
                  sepsisResponse: {
                    summary: 'Réponse Sepsis',
                    value: {
                      status: 'success',
                      data: {
                        qsofaScore: 2,
                        sofaScore: 7,
                        riskScore: 0.65,
                        reliability: 100,
                        scoreName: 'Sepsis Score',
                        riskLevel: {
                          level: 'Élevé',
                          probability: 'Sepsis probable'
                        },
                        interpretation: 'Sepsis probable nécessitant une prise en charge urgente',
                        insights: [
                          {
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
                          },
                          {
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
                          }
                        ],
                        recommendations: [
                          {
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
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Paramètres invalides'
          },
          401: {
            description: 'Non authentifié'
          },
          500: {
            description: 'Erreur serveur'
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec; 