require('dotenv').config();

module.exports = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 10000, // 10 secondes
  basePrompt: `En tant qu'assistant médical spécialisé, analysez les paramètres suivants et fournissez une réponse structurée :

  1. Une interprétation clinique détaillée du score
  2. Les implications pronostiques (préfixez chaque point par '-')
  3. Des recommandations thérapeutiques basées sur les guidelines actuelles (préfixez chaque point par '-')
  4. Des points de vigilance particuliers (préfixez chaque point par '-')
  
  Basez vos réponses sur les dernières recommandations médicales.`
}; 