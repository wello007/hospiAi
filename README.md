# 🏥 API de Scores Médicaux

Une API RESTful moderne pour le calcul de scores médicaux pour une aide à la décision médicale optimisée.

## ✨ Caractéristiques

### 🫀 Scores Cardiaques
- **EuroSCORE II** - Évaluation du risque chirurgical cardiaque
- **Score GRACE** - Pronostic des syndromes coronariens aigus
- **Score TIMI** - Stratification du risque STEMI/NSTEMI
- **CHA2DS2-VASc** - Évaluation du risque thromboembolique

### 🦠 Score Sepsis
- Détection précoce du sepsis
- Analyse multiparamétrique
- Recommandations basées sur les guidelines SSC

### 🫀 Scores Gastroentérologiques
- **Score de Child-Pugh** - Évaluation de la sévérité de la cirrhose
- **Score MELD** - Prédiction de la mortalité hépatique
- **Score de Glasgow-Blatchford** - Évaluation du risque hémorragique digestif
- **Score de Rockall** - Pronostic post-endoscopique des hémorragies digestives

## Documentation

- Documentation Swagger disponible sur : `http://localhost:3000/api-docs`
- README.md pour la documentation générale
- Tests disponibles via `npm test`

## Résolution des problèmes courants

### L'API ne démarre pas

1. Vérifiez que le port 3000 n'est pas déjà utilisé

### Erreur d'authentification

1. Vérifiez que le fichier .env est correctement configuré
2. Assurez-vous d'utiliser le bon token JWT
3. Le token expire après 24h, générez-en un nouveau si nécessaire

### Erreurs de validation

Les paramètres pour chaque score doivent respecter des plages spécifiques :

- **EuroSCORE II**
  - age: 18-120
  - gender: 'M' ou 'F'
  - creatinine: 0-1000
  - lvef: 0-100
  - nyha: 1-4
  - urgency: 'elective', 'urgent', 'emergency', 'salvage'

- **Score Sepsis**
  - mentalStatus: 3-15
  - respiratoryRate: 0-60
  - systolicBP: 0-300
  - etc...

## Support

1. Consultez les issues GitHub
2. Créez une nouvelle issue si nécessaire
3. Consultez la documentation Swagger sur `/api-docs`

---
Pour plus d'informations, consultez le README.md principal.

## Développement

Pour contribuer au projet :
1. Créez une branche pour votre fonctionnalité
2. Ajoutez des tests
3. Suivez les conventions de code
4. Soumettez une Pull Request

## Commandes utiles

```bash
# Démarrer en mode développement
npm run dev

# Lancer les tests
npm test

# Lancer les tests avec couverture
npm test -- --coverage

# Vérifier les logs
tail -f logs/error.log
```