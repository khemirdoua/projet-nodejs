const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: "Accès refusé, token manquant" });

  const token = authHeader.replace('Bearer ', '');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next(); // On passe à la suite
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};