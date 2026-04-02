const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// Créer une facture
exports.createInvoice = async (req, res, next) => {
  try {
    const client = await Client.findById(req.body.client);
    if (!client) return res.status(404).json({ message: "Client non trouvé" });

    const invoice = new Invoice({ ...req.body, createdBy: req.user.id });
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    next(error);
  }
};

// Lister toutes les factures (avec filtres optionnels)
exports.getAllInvoices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.client) filter.client = req.query.client;

    const invoices = await Invoice.find(filter)
      .populate('client', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// Obtenir une facture par ID
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('createdBy', 'name');
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une facture
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// Supprimer une facture
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });
    res.json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    next(error);
  }
};
