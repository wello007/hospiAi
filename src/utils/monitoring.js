const prometheus = require('prom-client');

const scoreCalculationDuration = new prometheus.Histogram({
  name: 'score_calculation_duration_seconds',
  help: 'Duration of score calculations',
  labelNames: ['score_type']
});

const scoreCalculationErrors = new prometheus.Counter({
  name: 'score_calculation_errors_total',
  help: 'Total number of score calculation errors',
  labelNames: ['score_type', 'error_type']
});

module.exports = {
  scoreCalculationDuration,
  scoreCalculationErrors
}; 