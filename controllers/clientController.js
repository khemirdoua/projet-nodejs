const Client = require('../models/Client');

exports.createClient = async (req, res, next) => {
  try {
    const existingClient = await Client.findOne({ email: req.body.email, deleted_at: null });
    if (existingClient) return res.status(400).json({ message: "Ce email est déjà utilisé" });

    const client = new Client({ ...req.body, createdBy: req.user.id });
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    next(error);
  }
};

exports.getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ deleted_at: null }).populate('createdBy', 'name email');
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('createdBy', 'name email');
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

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

exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { deleted_at: new Date() }, { new: true });
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json({ message: "Client supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};
