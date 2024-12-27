const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Scores Médicaux',
    version: '1.0.0',
    description: `API pour le calcul de scores médicaux en cardiologie et gastroentérologie.
    
    Cette API permet de calculer différents scores pronostiques et diagnostiques utilisés en pratique clinique.
    Chaque score est accompagné d'insights cliniques et de recommandations basées sur les guidelines actuelles.`,
    contact: {
      name: 'Support API',
      email: 'support@api-medicale.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Serveur de développement'
    }
  ],
  tags: [
    {
      name: 'Scores Cardiaques',
      description: 'Scores de risque cardiovasculaire'
    },
    {
      name: 'Scores Gastroentérologiques',
      description: 'Scores hépatiques et digestifs'
    },
    {
      name: 'Authentification',
      description: 'Endpoints d\'authentification'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Schémas des paramètres pour chaque score
      ChildPughParams: {
        type: 'object',
        required: ['ascites', 'bilirubin', 'albumin', 'prothrombin', 'encephalopathy'],
        properties: {
          ascites: {
            type: 'string',
            enum: ['none', 'mild', 'severe'],
            description: 'Présence et sévérité de l\'ascite'
          },
          bilirubin: {
            type: 'number',
            description: 'Bilirubine totale en mg/dL',
            minimum: 0,
            maximum: 100
          },
          albumin: {
            type: 'number',
            description: 'Albumine sérique en g/dL',
            minimum: 0,
            maximum: 10
          },
          prothrombin: {
            type: 'number',
            description: 'Temps de prothrombine en secondes',
            minimum: 0,
            maximum: 100
          },
          encephalopathy: {
            type: 'string',
            enum: ['none', 'mild', 'severe'],
            description: 'Degré d\'encéphalopathie hépatique'
          }
        }
      },
      MELDParams: {
        type: 'object',
        required: ['bilirubin', 'inr', 'creatinine'],
        properties: {
          bilirubin: {
            type: 'number',
            description: 'Bilirubine totale en mg/dL',
            minimum: 0,
            maximum: 100
          },
          inr: {
            type: 'number',
            description: 'International Normalized Ratio',
            minimum: 0,
            maximum: 20
          },
          creatinine: {
            type: 'number',
            description: 'Créatinine sérique en mg/dL',
            minimum: 0,
            maximum: 15
          }
        }
      },
      BlatchfordParams: {
        type: 'object',
        required: ['bloodUrea', 'hemoglobin', 'gender', 'systolicBP'],
        properties: {
          bloodUrea: {
            type: 'number',
            description: 'Urée sanguine en mmol/L',
            minimum: 0,
            maximum: 50
          },
          hemoglobin: {
            type: 'number',
            description: 'Hémoglobine en g/dL',
            minimum: 0,
            maximum: 25
          },
          gender: {
            type: 'string',
            enum: ['M', 'F'],
            description: 'Sexe du patient'
          },
          systolicBP: {
            type: 'number',
            description: 'Pression artérielle systolique en mmHg',
            minimum: 0,
            maximum: 300
          },
          pulse: {
            type: 'number',
            description: 'Fréquence cardiaque en bpm'
          },
          melena: {
            type: 'boolean',
            description: 'Présence de méléna'
          },
          syncope: {
            type: 'boolean',
            description: 'Présence de syncope'
          },
          hepaticDisease: {
            type: 'boolean',
            description: 'Présence de maladie hépatique'
          },
          cardiacFailure: {
            type: 'boolean',
            description: 'Présence d\'insuffisance cardiaque'
          }
        }
      }
    },
    responses: {
      ScoreResponse: {
        description: 'Réponse du calcul de score',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['success', 'error']
                },
                data: {
                  type: 'object',
                  properties: {
                    score: {
                      type: 'number',
                      description: 'Valeur numérique du score'
                    },
                    reliability: {
                      type: 'number',
                      description: 'Fiabilité du calcul en pourcentage'
                    },
                    scoreName: {
                      type: 'string',
                      description: 'Nom du score calculé'
                    },
                    interpretation: {
                      type: 'string',
                      description: 'Interprétation clinique du score'
                    },
                    insights: {
                      type: 'array',
                      description: 'Analyses et recommandations cliniques',
                      items: {
                        type: 'object',
                        properties: {
                          type: {
                            type: 'string',
                            enum: ['warning', 'critical', 'info']
                          },
                          category: {
                            type: 'string'
                          },
                          message: {
                            type: 'string'
                          },
                          implications: {
                            type: 'array',
                            items: {
                              type: 'string'
                            }
                          },
                          recommendations: {
                            type: 'array',
                            items: {
                              type: 'string'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
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