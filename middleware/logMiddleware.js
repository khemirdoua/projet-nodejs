const Log = require('../models/Log');

module.exports = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    const action = `${req.method} ${req.originalUrl}`;
    const user_id = req.user ? req.user.id : null;
    const ip_adresse = req.ip || req.connection.remoteAddress;

    Log.create({
      user_id,
      action,
      statut: res.statusCode,
      ip_adresse
    }).catch(err => console.error('Erreur log:', err));

    originalSend.call(this, body);
  };

  next();
};
