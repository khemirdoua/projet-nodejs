const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

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

exports.getAllInvoices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.client) filter.client = req.query.client;

    filter.deleted_at = null;
    const invoices = await Invoice.find(filter)
      .populate('client', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

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

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { deleted_at: new Date() }, { new: true });
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });
    res.json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    next(error);
  }
};
