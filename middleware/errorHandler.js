module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: "Erreur de validation", errors: messages });
  }

  // Doublon MongoDB (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Ce ${field} est déjà utilisé` });
  }

  // Erreur de cast Mongoose (mauvais ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: "ID invalide" });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: "Token invalide" });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: "Token expiré" });
  }

  // Erreur Joi
  if (err.isJoi) {
    return res.status(400).json({
      message: "Données invalides",
      errors: err.details.map(d => d.message)
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    message: err.message || "Erreur interne du serveur"
  });
};
