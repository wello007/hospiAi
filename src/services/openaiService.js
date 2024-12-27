const OpenAI = require('openai');
const config = require('../config/openai');
const logger = require('../utils/logger');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.apiKey
    });
    this.TIMEOUT_DURATION = 10000; // 10 secondes
  }

  async generateMedicalInsights(scoreType, params, score) {
    try {
      const prompt = this.buildPrompt(scoreType, params, score);
      
      // Création d'une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La réponse de ChatGPT a pris trop de temps'));
        }, this.TIMEOUT_DURATION);
      });

      // Course entre la réponse de ChatGPT et le timeout
      const completion = await Promise.race([
        this.openai.chat.completions.create({
          model: config.model,
          messages: [
            { role: 'system', content: config.basePrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: config.maxTokens,
          temperature: config.temperature
        }),
        timeoutPromise
      ]);

      const rawResponse = completion.choices[0].message.content;
      return this.parseResponse(rawResponse, true);
    } catch (error) {
      logger.error(`Erreur OpenAI: ${error.message}`);
      return {
        source: 'local',
        type: 'fallback',
        reason: 'Erreur OpenAI',
        error: {
          message: error.message,
          code: error.status || error.code,
          type: error.type || 'unknown'
        },
        insights: [{
          type: 'warning',
          category: 'Information',
          message: 'Utilisation des recommandations standards (réponse locale)',
          implications: ['Utilisation des recommandations standards'],
          recommendations: ['Consulter les guidelines habituelles']
        }]
      };
    }
  }

  buildPrompt(scoreType, params, score) {
    return `
      Type de score: ${scoreType}
      Score calculé: ${score}
      Paramètres cliniques:
      ${JSON.stringify(params, null, 2)}
      
      Veuillez fournir:
      1. Une interprétation clinique détaillée
      2. Les implications pronostiques (commencez chaque point par '-')
      3. Des recommandations thérapeutiques (commencez chaque point par '-')
      4. Des points de vigilance particuliers (commencez chaque point par '-')
    `;
  }

  parseResponse(content, includeRaw = false) {
    try {
      const sections = content.split('\n\n');
      
      const response = {
        type: 'ai-generated',
        source: 'openai',
        responseTime: Date.now(),
        insights: [
          {
            type: 'clinical',
            category: 'Interprétation',
            message: sections[0],
            implications: this.extractBulletPoints(sections[1]),
            recommendations: this.extractBulletPoints(sections[2])
          },
          {
            type: 'warning',
            category: 'Points de vigilance',
            message: 'Points nécessitant une attention particulière',
            implications: this.extractBulletPoints(sections[3])
          }
        ]
      };

      if (includeRaw) {
        response.rawGPTResponse = {
          timestamp: new Date().toISOString(),
          content: content
        };
      }

      return response;
    } catch (error) {
      logger.error(`Erreur parsing OpenAI: ${error.message}`);
      return this.getFallbackResponse('Erreur de parsing');
    }
  }

  getFallbackResponse(reason) {
    return {
      type: 'fallback',
      source: 'local',
      reason: reason,
      timestamp: new Date().toISOString(),
      insights: [{
        type: 'warning',
        category: 'Information',
        message: 'Utilisation des recommandations standards (réponse locale)',
        implications: ['Utilisation des recommandations standards'],
        recommendations: ['Consulter les guidelines habituelles']
      }]
    };
  }

  extractBulletPoints(text) {
    if (!text) return [];
    return text
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(2));
  }
}

module.exports = new OpenAIService(); 