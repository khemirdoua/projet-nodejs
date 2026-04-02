module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: "Erreur de validation", errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Ce ${field} est déjà utilisé` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: "ID invalide" });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: "Token invalide" });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: "Token expiré" });
  }

  if (err.isJoi) {
    return res.status(400).json({
      message: "Données invalides",
      errors: err.details.map(d => d.message)
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Erreur interne du serveur"
  });
};
