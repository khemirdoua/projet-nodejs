const RecoveryAction = require('../models/RecoveryAction');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

exports.createRecoveryAction = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

    const client = await Client.findById(req.body.clientId);
    if (!client) return res.status(404).json({ message: "Client non trouvé" });

    const action = new RecoveryAction(req.body);
    const savedAction = await action.save();
    res.status(201).json(savedAction);
  } catch (error) {
    next(error);
  }
};

exports.getAllRecoveryActions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.invoiceId) filter.invoiceId = req.query.invoiceId;
    if (req.query.clientId) filter.clientId = req.query.clientId;

    const actions = await RecoveryAction.find(filter)
      .populate('invoiceId', 'invoiceNumber amount status')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(actions);
  } catch (error) {
    next(error);
  }
};

exports.getRecoveryActionById = async (req, res, next) => {
  try {
    const action = await RecoveryAction.findById(req.params.id)
      .populate('invoiceId')
      .populate('clientId');
    if (!action) return res.status(404).json({ message: "Action de recouvrement non trouvée" });
    res.json(action);
  } catch (error) {
    next(error);
  }
};

exports.updateRecoveryAction = async (req, res, next) => {
  try {
    const action = await RecoveryAction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!action) return res.status(404).json({ message: "Action de recouvrement non trouvée" });
    res.json(action);
  } catch (error) {
    next(error);
  }
};

exports.deleteRecoveryAction = async (req, res, next) => {
  try {
    const action = await RecoveryAction.findByIdAndDelete(req.params.id);
    if (!action) return res.status(404).json({ message: "Action de recouvrement non trouvée" });
    res.json({ message: "Action de recouvrement supprimée avec succès" });
  } catch (error) {
    next(error);
  }
};
