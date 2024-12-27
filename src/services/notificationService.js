const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      // Configuration email
    });
    
    this.smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendCriticalAlert(alert, recipients) {
    await Promise.all([
      this.sendEmail(alert, recipients.email),
      this.sendSMS(alert, recipients.phone)
    ]);
  }

  async sendEmail(alert, emailRecipients) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailRecipients,
      subject: `Alerte Critique - Score ${alert.scoreName}`,
      html: this.generateAlertEmail(alert)
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  async sendSMS(alert, phoneNumbers) {
    const message = this.generateAlertSMS(alert);
    
    await Promise.all(
      phoneNumbers.map(phone =>
        this.smsClient.messages.create({
          body: message,
          to: phone,
          from: process.env.TWILIO_PHONE_NUMBER
        })
      )
    );
  }

  generateAlertEmail(alert) {
    return `
      <h2>Alerte Critique - Score ${alert.scoreName}</h2>
      <p>Valeur: ${alert.value}</p>
      <p>Patient ID: ${alert.patientId}</p>
      <h3>Recommandations:</h3>
      <ul>
        ${alert.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    `;
  }

  generateAlertSMS(alert) {
    return `ALERTE: Score ${alert.scoreName} critique (${alert.value}) pour patient ${alert.patientId}. Action requise.`;
  }
}

module.exports = new NotificationService(); 