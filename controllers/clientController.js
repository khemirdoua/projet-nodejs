const Client = require('../models/Client');

// Ajouter un nouveau client
exports.createClient = async (req, res) => {
  try {
    const newClient = new Client({
      ...req.body,
      createdBy: req.user.id // Récupéré grâce au middleware
    });
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Voir tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate('createdBy', 'name');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};