const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Enregistrer un paiement
exports.createPayment = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.body.invoice);
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

    // Vérifier que le paiement ne dépasse pas le montant restant
    const remaining = invoice.amount - invoice.paidAmount;
    if (req.body.amount > remaining) {
      return res.status(400).json({
        message: `Le montant dépasse le reste à payer (${remaining} DA)`
      });
    }

    const payment = new Payment({
      ...req.body,
      client: invoice.client,
      registeredBy: req.user.id
    });
    await payment.save();

    // Mettre à jour le montant payé et le statut de la facture
    invoice.paidAmount += req.body.amount;
    if (invoice.paidAmount >= invoice.amount) {
      invoice.status = 'Payée';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'Partiellement payée';
    }
    await invoice.save();

    res.status(201).json({
      payment,
      invoiceStatus: invoice.status,
      remainingAmount: invoice.amount - invoice.paidAmount
    });
  } catch (error) {
    next(error);
  }
};

// Lister les paiements (avec filtres)
exports.getAllPayments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.invoice) filter.invoice = req.query.invoice;
    if (req.query.client) filter.client = req.query.client;

    const payments = await Payment.find(filter)
      .populate('invoice', 'invoiceNumber amount')
      .populate('client', 'name')
      .populate('registeredBy', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// Obtenir un paiement par ID
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice', 'invoiceNumber amount status')
      .populate('client', 'name email')
      .populate('registeredBy', 'name');
    if (!payment) return res.status(404).json({ message: "Paiement non trouvé" });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};
