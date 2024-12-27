const Joi = require('joi');

const baseSchema = {
  scoreType: Joi.string().required()
};

const scoreValidationSchema = {
  euroscore2: Joi.object({
    ...baseSchema,
    params: Joi.object({
      age: Joi.number().min(18).max(120).required(),
      gender: Joi.string().valid('M', 'F').required(),
      creatinine: Joi.number().min(0).max(1000).required(),
      lvef: Joi.number().min(0).max(100).required(),
      nyha: Joi.number().min(1).max(4).required(),
      urgency: Joi.string().valid('elective', 'urgent', 'emergency', 'salvage').required(),
      diabetes: Joi.boolean(),
      pulmonaryPressure: Joi.number().min(0).max(150),
      weightOfIntervention: Joi.string().valid('single', 'double', 'triple'),
      previousCardiacSurgery: Joi.boolean(),
      criticalPreoperativeState: Joi.boolean(),
      activeEndocarditis: Joi.boolean(),
      chronicLungDisease: Joi.boolean()
    }).required()
  }).options({ allowUnknown: false }),
  grace: Joi.object({
    ...baseSchema,
    params: Joi.object({
      age: Joi.number().min(18).max(120).required(),
      heartRate: Joi.number().min(20).max(300).required(),
      systolicBP: Joi.number().min(40).max(300).required(),
      creatinine: Joi.number().min(0).max(15).required(),
      killipClass: Joi.number().valid(1, 2, 3, 4).required(),
      cardiacArrest: Joi.boolean(),
      elevatedCardiacMarkers: Joi.boolean(),
      stSegmentDeviation: Joi.boolean()
    }).required()
  }).options({ allowUnknown: false }),
  timi: Joi.object({
    ...baseSchema,
    type: Joi.string().valid('STEMI', 'NSTEMI').required(),
    params: Joi.object({
      age: Joi.number().min(18).max(120).required(),
      diabetes: Joi.boolean().required(),
      hypertension: Joi.boolean().required(),
      systolicBP: Joi.number().min(40).max(300).required(),
      heartRate: Joi.number().min(20).max(300).required(),
      killipClass: Joi.number().valid(1, 2, 3, 4).required(),
      weight: Joi.number().min(30).max(200),
      anteriorSTEMI: Joi.boolean(),
      timeTo6h: Joi.boolean(),
      riskFactorsCount: Joi.number().min(0).max(5),
      knownCAD: Joi.boolean(),
      aspirinLast7Days: Joi.boolean(),
      severeAngina: Joi.boolean(),
      stDeviation: Joi.boolean(),
      elevatedMarkers: Joi.boolean()
    }).required()
  }).options({ allowUnknown: false }),
  cha2ds2vasc: Joi.object({
    ...baseSchema,
    params: Joi.object({
      age: Joi.number().min(18).max(120).required(),
      gender: Joi.string().valid('M', 'F').required(),
      congestiveHeartFailure: Joi.boolean().required(),
      hypertension: Joi.boolean().required(),
      diabetes: Joi.boolean().required(),
      stroke: Joi.boolean().required(),
      vascularDisease: Joi.boolean().required()
    }).required()
  }).options({ allowUnknown: false }),
  sepsis: Joi.object().keys({
    scoreType: Joi.string().required(),
    params: Joi.object({
      // qSOFA parameters
      mentalStatus: Joi.number().min(3).max(15).required(),
      respiratoryRate: Joi.number().min(0).max(60).required(),
      systolicBP: Joi.number().min(0).max(300).required(),
      
      // SOFA parameters
      pao2fio2: Joi.number().min(0).max(600).required(),
      platelets: Joi.number().min(0).max(1000).required(),
      bilirubin: Joi.number().min(0).max(30).required(),
      meanArterialPressure: Joi.number().min(0).max(200).required(),
      glasgowComaScale: Joi.number().min(3).max(15).required(),
      creatinine: Joi.number().min(0).max(15).required(),
      urineOutput: Joi.number().min(0).required(),
      
      // Additional parameters
      lactate: Joi.number().min(0).max(20).required(),
      heartRate: Joi.number().min(0).max(300).required(),
      temperature: Joi.number().min(30).max(45).required(),
      
      // Risk factors
      age: Joi.number().min(0).max(120).required(),
      immunosuppression: Joi.boolean().required(),
      recentSurgery: Joi.boolean().required(),
      chronicDisease: Joi.boolean().required()
    }).required()
  }).options({ 
    allowUnknown: false,
    stripUnknown: true
  })
};

const gastroScores = {
  childpugh: Joi.object({
    scoreType: Joi.string().required(),
    params: Joi.object({
      ascites: Joi.string().valid('none', 'mild', 'severe').required(),
      bilirubin: Joi.number().min(0).max(100).required(),
      albumin: Joi.number().min(0).max(10).required(),
      prothrombin: Joi.number().min(0).max(100).required(),
      encephalopathy: Joi.string().valid('none', 'mild', 'severe').required()
    }).required()
  }).options({ allowUnknown: false }),

  meld: Joi.object({
    scoreType: Joi.string().required(),
    params: Joi.object({
      bilirubin: Joi.number().min(0).max(100).required(),
      inr: Joi.number().min(0).max(20).required(),
      creatinine: Joi.number().min(0).max(15).required()
    }).required()
  }).options({ allowUnknown: false }),

  blatchford: Joi.object({
    scoreType: Joi.string().required(),
    params: Joi.object({
      bloodUrea: Joi.number().min(0).max(50).required(),
      hemoglobin: Joi.number().min(0).max(25).required(),
      gender: Joi.string().valid('M', 'F').required(),
      systolicBP: Joi.number().min(0).max(300).required(),
      pulse: Joi.number().min(0).max(300),
      melena: Joi.boolean(),
      syncope: Joi.boolean(),
      hepaticDisease: Joi.boolean(),
      cardiacFailure: Joi.boolean()
    }).required()
  }).options({ allowUnknown: false })
};

module.exports = {
  ...scoreValidationSchema,
  ...gastroScores
}; 