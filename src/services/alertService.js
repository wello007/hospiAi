class AlertService {
  async checkThresholds(score, patientId) {
    const alerts = [];
    
    // Vérification des seuils critiques
    if (this.isScoreCritical(score)) {
      alerts.push({
        type: 'critical',
        message: `Score ${score.scoreName} critique`,
        value: score.score,
        timestamp: new Date(),
        recommendations: this.getCriticalRecommendations(score)
      });

      // Notification des équipes concernées
      await this.notifyTeams(alerts, patientId);
    }

    return alerts;
  }

  isScoreCritical(score) {
    const thresholds = {
      'Child-Pugh': 12,
      'MELD': 20,
      'Blatchford': 12,
      'Rockall': 8
    };

    return score.score >= thresholds[score.scoreName];
  }

  getCriticalRecommendations(score) {
    const recommendations = {
      'Child-Pugh': [
        'Contact immédiat hépatologie',
        'Évaluation pour transfert en unité spécialisée'
      ],
      'MELD': [
        'Discussion urgente transplantation',
        'Optimisation thérapeutique immédiate'
      ],
      'Blatchford': [
        'Endoscopie urgente',
        'Réanimation hydro-électrolytique'
      ],
      'Rockall': [
        'Surveillance scope continue',
        'Second-look endoscopique à programmer'
      ]
    };

    return recommendations[score.scoreName];
  }

  async notifyTeams(alerts, patientId) {
    // Implémentation des notifications (email, SMS, etc.)
  }
}

module.exports = new AlertService(); 