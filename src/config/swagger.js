const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API de Scores Médicaux',
    version: '1.0.0',
    description: `API complète pour le calcul de scores médicaux en cardiologie et gastroentérologie.
    
    Cette API professionnelle permet de calculer différents scores pronostiques et diagnostiques utilisés en pratique clinique.
    Chaque score est accompagné d'insights cliniques détaillés et de recommandations basées sur les dernières guidelines.
    
    ### Fonctionnalités principales
    - Calcul précis des scores
    - Validation rigoureuse des données
    - Insights cliniques personnalisés
    - Recommandations basées sur les guidelines
    - Documentation exhaustive
    
    ### Support
    Pour toute question technique ou médicale, contactez notre équipe support.`,
    contact: {
      name: 'Support API Médicale',
      email: 'wdib@yahoo.com',
      url: 'https://api-medicale.com/support'
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
      description: `Scores de risque cardiovasculaire incluant :
      - EuroSCORE II (risque chirurgical)
      - Score GRACE (syndromes coronariens aigus)
      - Score TIMI (STEMI/NSTEMI)
      - CHA2DS2-VASc (risque thromboembolique)`
    },
    {
      name: 'Scores Gastroentérologiques',
      description: `Scores hépatiques et digestifs incluant :
      - Score Child-Pugh (cirrhose)
      - Score MELD (insuffisance hépatique)
      - Score de Glasgow-Blatchford (hémorragie digestive)
      - Score de Rockall (pronostic post-endoscopique)`
    },
    {
      name: 'Score Sepsis',
      description: 'Évaluation et détection précoce du sepsis'
    },
    {
      name: 'Authentification',
      description: 'Gestion des tokens JWT et sécurité'
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
      // Schémas de requête pour chaque type de score
      CardiacScoreRequest: {
        type: 'object',
        required: ['scoreType', 'params'],
        properties: {
          scoreType: {
            type: 'string',
            enum: ['euroscore2', 'grace', 'timi', 'cha2ds2vasc'],
            description: 'Type de score cardiaque à calculer'
          },
          params: {
            oneOf: [
              { $ref: '#/components/schemas/EuroScoreParams' },
              { $ref: '#/components/schemas/GraceParams' },
              { $ref: '#/components/schemas/TimiParams' },
              { $ref: '#/components/schemas/CHA2DS2VAScParams' }
            ]
          }
        }
      },
      GastroScoreRequest: {
        type: 'object',
        required: ['scoreType', 'params'],
        properties: {
          scoreType: {
            type: 'string',
            enum: ['childpugh', 'meld', 'blatchford', 'rockall'],
            description: 'Type de score gastroentérologique à calculer'
          },
          params: {
            oneOf: [
              { $ref: '#/components/schemas/ChildPughParams' },
              { $ref: '#/components/schemas/MELDParams' },
              { $ref: '#/components/schemas/BlatchfordParams' },
              { $ref: '#/components/schemas/RockallParams' }
            ]
          }
        }
      },
      SepsisScoreRequest: {
        type: 'object',
        required: ['scoreType', 'params'],
        properties: {
          scoreType: {
            type: 'string',
            enum: ['sepsis'],
            description: 'Calcul du score Sepsis'
          },
          params: {
            $ref: '#/components/schemas/SepsisParams'
          }
        }
      },

      // Paramètres des scores cardiaques
      EuroScoreParams: {
        type: 'object',
        required: ['age', 'gender', 'creatinine', 'lvef', 'nyha', 'urgency'],
        properties: {
          age: {
            type: 'number',
            minimum: 18,
            maximum: 120,
            description: 'Âge du patient'
          },
          gender: {
            type: 'string',
            enum: ['M', 'F'],
            description: 'Sexe du patient'
          },
          creatinine: {
            type: 'number',
            minimum: 0,
            maximum: 1000,
            description: 'Créatinine sérique (µmol/L)'
          },
          lvef: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Fraction d\'éjection ventriculaire gauche (%)'
          },
          nyha: {
            type: 'number',
            enum: [1, 2, 3, 4],
            description: 'Classe NYHA'
          },
          urgency: {
            type: 'string',
            enum: ['elective', 'urgent', 'emergency', 'salvage'],
            description: 'Degré d\'urgence de l\'intervention'
          }
        }
      },

      // Paramètres du score GRACE
      GraceParams: {
        type: 'object',
        required: ['age', 'heartRate', 'systolicBP', 'creatinine', 'cardiacArrest', 'stSegmentDeviation', 'elevatedCardiacEnzymes', 'killipClass'],
        properties: {
          age: {
            type: 'number',
            minimum: 18,
            maximum: 120,
            description: 'Âge du patient'
          },
          heartRate: {
            type: 'number',
            minimum: 0,
            maximum: 300,
            description: 'Fréquence cardiaque (bpm)'
          },
          systolicBP: {
            type: 'number',
            minimum: 0,
            maximum: 300,
            description: 'Pression artérielle systolique (mmHg)'
          },
          creatinine: {
            type: 'number',
            minimum: 0,
            maximum: 1500,
            description: 'Créatinine sérique (µmol/L)'
          },
          cardiacArrest: {
            type: 'boolean',
            description: 'Arrêt cardiaque à l\'admission'
          },
          stSegmentDeviation: {
            type: 'boolean',
            description: 'Déviation du segment ST'
          },
          elevatedCardiacEnzymes: {
            type: 'boolean',
            description: 'Élévation des enzymes cardiaques'
          },
          killipClass: {
            type: 'number',
            enum: [1, 2, 3, 4],
            description: 'Classe de Killip'
          }
        }
      },

      // Paramètres du score TIMI
      TimiParams: {
        type: 'object',
        required: ['age', 'type', 'diabetesHypertensionAngina', 'systolicBP', 'heartRate', 'killipClass', 'weight', 'anteriorSTElevation', 'timeToTreatment'],
        properties: {
          age: {
            type: 'number',
            minimum: 18,
            maximum: 120,
            description: 'Âge du patient'
          },
          type: {
            type: 'string',
            enum: ['STEMI', 'NSTEMI'],
            description: 'Type d\'infarctus'
          },
          diabetesHypertensionAngina: {
            type: 'boolean',
            description: 'Présence de diabète, HTA ou angor'
          },
          systolicBP: {
            type: 'number',
            minimum: 0,
            maximum: 300,
            description: 'Pression artérielle systolique (mmHg)'
          },
          heartRate: {
            type: 'number',
            minimum: 0,
            maximum: 300,
            description: 'Fréquence cardiaque (bpm)'
          },
          killipClass: {
            type: 'number',
            enum: [1, 2, 3, 4],
            description: 'Classe de Killip'
          },
          weight: {
            type: 'number',
            minimum: 0,
            maximum: 300,
            description: 'Poids (kg)'
          },
          anteriorSTElevation: {
            type: 'boolean',
            description: 'Élévation ST antérieure ou BBG'
          },
          timeToTreatment: {
            type: 'number',
            minimum: 0,
            maximum: 24,
            description: 'Délai jusqu\'au traitement (heures)'
          }
        }
      },

      // Paramètres du score CHA2DS2-VASc
      CHA2DS2VAScParams: {
        type: 'object',
        required: ['age', 'gender', 'congestiveHeartFailure', 'hypertension', 'diabetes', 'stroke', 'vascularDisease'],
        properties: {
          age: {
            type: 'number',
            minimum: 18,
            maximum: 120,
            description: 'Âge du patient'
          },
          gender: {
            type: 'string',
            enum: ['M', 'F'],
            description: 'Sexe du patient'
          },
          congestiveHeartFailure: {
            type: 'boolean',
            description: 'Insuffisance cardiaque congestive'
          },
          hypertension: {
            type: 'boolean',
            description: 'Hypertension artérielle'
          },
          diabetes: {
            type: 'boolean',
            description: 'Diabète'
          },
          stroke: {
            type: 'boolean',
            description: 'Antécédent d\'AVC/AIT'
          },
          vascularDisease: {
            type: 'boolean',
            description: 'Maladie vasculaire'
          }
        }
      },

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
      },

      // Paramètres du score Sepsis
      SepsisParams: {
        type: 'object',
        required: [
          'mentalStatus',
          'respiratoryRate',
          'systolicBP',
          'pao2fio2',
          'platelets',
          'bilirubin',
          'meanArterialPressure',
          'glasgowComaScale',
          'creatinine',
          'urineOutput',
          'lactate',
          'heartRate',
          'temperature'
        ],
        properties: {
          mentalStatus: {
            type: 'number',
            minimum: 3,
            maximum: 15,
            description: 'Score de Glasgow'
          },
          respiratoryRate: {
            type: 'number',
            minimum: 0,
            maximum: 60,
            description: 'Fréquence respiratoire (par minute)'
          },
          // ... autres propriétés du score Sepsis ...
        }
      },

      // Paramètres du score Rockall
      RockallParams: {
        type: 'object',
        required: ['age', 'shock', 'comorbidity', 'diagnosis', 'stigmata'],
        properties: {
          age: {
            type: 'string',
            enum: ['less60', '60-79', 'more80'],
            description: 'Tranche d\'âge du patient'
          },
          shock: {
            type: 'string',
            enum: ['none', 'tachycardia', 'hypotension'],
            description: 'État de choc'
          },
          comorbidity: {
            type: 'string',
            enum: ['none', 'cardiac', 'renal', 'hepatic', 'metastatic'],
            description: 'Comorbidités majeures'
          },
          diagnosis: {
            type: 'string',
            enum: ['malloryWeiss', 'noneFound', 'pepticUlcer', 'cancer'],
            description: 'Diagnostic endoscopique'
          },
          stigmata: {
            type: 'string',
            enum: ['none', 'blood', 'adherentClot', 'visibleVessel', 'activeBleed'],
            description: 'Stigmates de saignement'
          }
        }
      },

      AIResponse: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['ai-generated', 'fallback', 'error']
          },
          rawGPTResponse: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time'
              },
              content: {
                type: 'string'
              }
            }
          },
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['clinical', 'warning']
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
      },

      ScoreResponse: {
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
              },
              responseSource: {
                type: 'string',
                enum: ['openai', 'local'],
                description: 'Source des recommandations (IA ou locale)'
              },
              responseTime: {
                type: 'number',
                description: 'Temps de réponse en millisecondes'
              },
              fallbackReason: {
                type: 'string',
                description: 'Raison du fallback vers la réponse locale (si applicable)'
              },
              aiResponse: {
                type: 'object',
                description: 'Informations sur la réponse AI',
                properties: {
                  enabled: {
                    type: 'boolean',
                    description: 'Indique si l\'IA est activée pour ce score'
                  },
                  source: {
                    type: 'string',
                    enum: ['openai', 'local'],
                    description: 'Source des recommandations'
                  },
                  status: {
                    type: 'string',
                    enum: ['success', 'fallback'],
                    description: 'Statut de la réponse AI'
                  },
                  fallbackReason: {
                    type: 'string',
                    description: 'Raison du fallback si applicable'
                  },
                  raw: {
                    type: 'object',
                    description: 'Réponse brute de l\'IA si disponible',
                    properties: {
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      },
                      content: {
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
                    },
                    responseSource: {
                      type: 'string',
                      enum: ['openai', 'local'],
                      description: 'Source des recommandations (IA ou locale)'
                    },
                    responseTime: {
                      type: 'number',
                      description: 'Temps de réponse en millisecondes'
                    },
                    fallbackReason: {
                      type: 'string',
                      description: 'Raison du fallback vers la réponse locale (si applicable)'
                    },
                    aiResponse: {
                      type: 'object',
                      description: 'Informations sur la réponse AI',
                      properties: {
                        enabled: {
                          type: 'boolean',
                          description: 'Indique si l\'IA est activée pour ce score'
                        },
                        source: {
                          type: 'string',
                          enum: ['openai', 'local'],
                          description: 'Source des recommandations'
                        },
                        status: {
                          type: 'string',
                          enum: ['success', 'fallback'],
                          description: 'Statut de la réponse AI'
                        },
                        fallbackReason: {
                          type: 'string',
                          description: 'Raison du fallback si applicable'
                        },
                        raw: {
                          type: 'object',
                          description: 'Réponse brute de l\'IA si disponible',
                          properties: {
                            timestamp: {
                              type: 'string',
                              format: 'date-time'
                            },
                            content: {
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
        tags: ['Scores Cardiaques', 'Scores Gastroentérologiques', 'Score Sepsis'],
        summary: 'Calcule un score médical',
        description: `Endpoint principal pour le calcul des scores médicaux.
        Retourne le score calculé avec interprétation clinique et recommandations.`,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/CardiacScoreRequest' },
                  { $ref: '#/components/schemas/GastroScoreRequest' },
                  { $ref: '#/components/schemas/SepsisScoreRequest' }
                ]
              }
            }
          }
        },
        responses: {
          200: { $ref: '#/components/responses/ScoreResponse' },
          400: {
            description: 'Erreur de validation des paramètres',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'error' },
                    message: { type: 'string', example: 'Paramètres invalides' },
                    details: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          },
          401: {
            description: 'Non authentifié',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'error' },
                    message: { type: 'string', example: 'Token invalide ou expiré' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentification'],
        summary: 'Authentification utilisateur',
        description: 'Génère un token JWT pour l\'accès à l\'API',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'admin' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentification réussie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Authentification échouée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'error' },
                    message: { type: 'string', example: 'Identifiants invalides' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec; 