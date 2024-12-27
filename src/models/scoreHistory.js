const mongoose = require('mongoose');

const scoreHistorySchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  scoreType: {
    type: String,
    required: true,
    enum: ['euroscore2', 'grace', 'timi', 'cha2ds2vasc', 'sepsis', 'childpugh', 'meld', 'blatchford', 'rockall']
  },
  score: {
    type: Number,
    required: true
  },
  params: {
    type: Object,
    required: true
  },
  interpretation: String,
  insights: [Object],
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  unit: String,
  context: {
    location: String,
    urgency: Boolean,
    clinicalContext: String
  }
});

module.exports = mongoose.model('ScoreHistory', scoreHistorySchema); 