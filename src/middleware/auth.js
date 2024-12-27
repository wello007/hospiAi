const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérification des identifiants
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Création du token
    const token = jwt.sign(
      { username: username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      token: token
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Identifiants invalides'
    });
  }
});

module.exports = router;