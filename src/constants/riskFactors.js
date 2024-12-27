const EUROSCORE_II_FACTORS = {
  // Facteurs démographiques
  age: {
    coefficient: 0.0285181,
    transform: (age) => Math.pow((age/90), 2)  // Transformation non-linéaire de l'âge
  },
  gender: {
    female: 0.2196434
  },

  // Facteurs cardiaques
  lvef: { // Left Ventricular Ejection Fraction
    good: 0,           // >50%
    moderate: 0.3150652, // 31-50%
    poor: 0.8084096,   // 21-30%
    verypoor: 0.9346919 // ≤20%
  },
  
  // Classification NYHA
  nyha: {
    class1: 0,
    class2: 0.1070545,
    class3: 0.2958358,
    class4: 0.5597929
  },

  // Facteurs rénaux
  creatinine: {
    coefficient: 0.0024571,
    transform: (creat) => Math.min(creat, 350)
  },
  
  // Comorbidités
  diabetes: 0.3542749,
  pulmonaryHypertension: {
    moderate: 0.1788899, // 31-55 mmHg
    severe: 0.3491475    // >55 mmHg
  },
  
  // Facteurs opératoires
  urgency: {
    elective: 0,
    urgent: 0.3174673,
    emergency: 0.7039121,
    salvage: 1.362947
  },
  
  // Type de chirurgie
  weightOfIntervention: {
    single: 0,
    double: 0.5521478,
    triple: 0.9724533
  }
};

const GRACE_FACTORS = {
  age: {
    '<30': 0,
    '30-39': 8,
    '40-49': 25,
    '50-59': 41,
    '60-69': 58,
    '70-79': 75,
    '80-89': 91,
    '≥90': 100
  },
  heartRate: {
    '<50': 0,
    '50-69': 3,
    '70-89': 9,
    '90-109': 15,
    '110-149': 24,
    '150-199': 38,
    '≥200': 46
  },
  systolicBP: {
    '<80': 58,
    '80-99': 53,
    '100-119': 43,
    '120-139': 34,
    '140-159': 24,
    '160-199': 10,
    '≥200': 0
  },
  creatinine: {
    '0-0.39': 1,
    '0.4-0.79': 4,
    '0.8-1.19': 7,
    '1.2-1.59': 10,
    '1.6-1.99': 13,
    '2-3.99': 21,
    '≥4': 28
  },
  killipClass: {
    '1': 0,
    '2': 20,
    '3': 39,
    '4': 59
  },
  cardiacArrest: 39,
  elevatedCardiacMarkers: 14,
  stSegmentDeviation: 28
};

const TIMI_FACTORS = {
  // TIMI pour STEMI
  age75: 3,
  diabetes: 1,
  hypertension: 1,
  systolicBP: 3,  // <100 mmHg
  heartRate: 2,   // >100 bpm
  killipClass24: 2,
  weight65: 1,
  anteriorSTEMI: 1,
  timeTo6h: 1,

  // TIMI pour NSTEMI/UA
  age65: 2,
  threeRiskFactors: 1,  // HTA, diabète, hypercholestérolémie, tabagisme actif, ATCD familiaux
  knownCAD: 1,          // Sténose coronaire >50%
  aspirinLast7Days: 1,
  severeAngina: 1,      // ≥2 épisodes/24h
  stDeviation: 1,
  elevatedMarkers: 1
};

const CHA2DS2_VASC_FACTORS = {
  congestiveHeartFailure: 1,
  hypertension: 1,
  age75: 2,
  age6574: 1,
  diabetes: 1,
  stroke: 2,
  vascularDisease: 1,
  female: 1
};

const SEPSIS_FACTORS = {
  // Critères qSOFA
  qsofa: {
    alteredMentalStatus: 1,  // Glasgow < 15
    respiratoryRate: 1,      // ≥ 22/min
    systolicBP: 1,           // ≤ 100 mmHg
  },
  
  // Critères SOFA complets
  sofa: {
    respiratory: {  // PaO2/FiO2 ratio
      mild: 1,      // < 400
      moderate: 2,  // < 300
      severe: 3,    // < 200 with respiratory support
      critical: 4   // < 100 with respiratory support
    },
    coagulation: {  // Platelets count (×10³/µL)
      mild: 1,      // < 150
      moderate: 2,  // < 100
      severe: 3,    // < 50
      critical: 4   // < 20
    },
    liver: {        // Bilirubin (mg/dL)
      mild: 1,      // 1.2-1.9
      moderate: 2,  // 2.0-5.9
      severe: 3,    // 6.0-11.9
      critical: 4   // > 12.0
    },
    cardiovascular: {  // Mean arterial pressure OR vasopressors
      mild: 1,        // MAP < 70 mmHg
      moderate: 2,    // Dopamine ≤ 5 or Dobutamine
      severe: 3,      // Dopamine > 5 or Epi/Norepi ≤ 0.1
      critical: 4     // Dopamine > 15 or Epi/Norepi > 0.1
    },
    cns: {          // Glasgow Coma Scale
      mild: 1,      // 13-14
      moderate: 2,  // 10-12
      severe: 3,    // 6-9
      critical: 4   // < 6
    },
    renal: {        // Creatinine (mg/dL) or urine output
      mild: 1,      // 1.2-1.9
      moderate: 2,  // 2.0-3.4
      severe: 3,    // 3.5-4.9 or < 500 mL/day
      critical: 4   // > 5.0 or < 200 mL/day
    }
  },

  // Facteurs de risque additionnels
  riskFactors: {
    age: {
      coefficient: 0.04,
      threshold: 65
    },
    immunosuppression: 2,
    recentSurgery: 1,
    chronicDisease: 1
  }
};

const REQUIRED_PARAMETERS = [
  'age',
  'gender',
  'creatinine',
  'lvef',
  'nyha',
  'urgency'
];

module.exports = {
  EUROSCORE_II_FACTORS,
  GRACE_FACTORS,
  TIMI_FACTORS,
  CHA2DS2_VASC_FACTORS,
  REQUIRED_PARAMETERS,
  SEPSIS_FACTORS
}; 