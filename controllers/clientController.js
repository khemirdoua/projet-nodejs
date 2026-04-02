const Client = require('../models/Client');

// Créer un client
exports.createClient = async (req, res, next) => {
  try {
    const client = new Client({ ...req.body, createdBy: req.user.id });
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    next(error);
  }
};

// Lister tous les clients
exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find().populate('createdBy', 'name email');
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

// Obtenir un client par ID
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('createdBy', 'name email');
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

// Supprimer un client
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json({ message: "Client supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};
