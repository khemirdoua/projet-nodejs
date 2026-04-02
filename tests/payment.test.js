const paymentController = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

jest.mock('../models/Payment');
jest.mock('../models/Invoice');

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 'user123' },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Payment Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // ===================== CREATE =====================
  describe('createPayment', () => {

    test('devrait enregistrer un paiement avec succès', async () => {
      const req = mockReq({
        body: { invoice: 'inv1', amount: 30000, method: 'Virement' }
      });
      const res = mockRes();

      const invoice = {
        _id: 'inv1', amount: 100000, paidAmount: 0, client: 'c1',
        status: 'En attente', save: jest.fn().mockResolvedValue(true)
      };
      Invoice.findById.mockResolvedValue(invoice);

      const savedPayment = { _id: 'p1', amount: 30000 };
      Payment.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedPayment)
      }));

      await paymentController.createPayment(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(invoice.paidAmount).toBe(30000);
      expect(invoice.status).toBe('Partiellement payée');
      expect(invoice.save).toHaveBeenCalled();
    });

    test('devrait marquer la facture comme Payée si montant complet', async () => {
      const req = mockReq({
        body: { invoice: 'inv1', amount: 50000, method: 'Espèces' }
      });
      const res = mockRes();

      const invoice = {
        _id: 'inv1', amount: 50000, paidAmount: 0, client: 'c1',
        status: 'En attente', save: jest.fn().mockResolvedValue(true)
      };
      Invoice.findById.mockResolvedValue(invoice);

      Payment.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'p1' })
      }));

      await paymentController.createPayment(req, res, mockNext);

      expect(invoice.status).toBe('Payée');
      expect(invoice.paidAmount).toBe(50000);
    });

    test('devrait refuser si montant dépasse le reste à payer', async () => {
      const req = mockReq({
        body: { invoice: 'inv1', amount: 80000, method: 'Virement' }
      });
      const res = mockRes();

      Invoice.findById.mockResolvedValue({
        _id: 'inv1', amount: 100000, paidAmount: 50000, client: 'c1'
      });

      await paymentController.createPayment(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('50000') })
      );
    });

    test('devrait retourner 404 si facture non trouvée', async () => {
      const req = mockReq({ body: { invoice: 'unknown', amount: 1000, method: 'Espèces' } });
      const res = mockRes();

      Invoice.findById.mockResolvedValue(null);

      await paymentController.createPayment(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Facture non trouvée" });
    });
  });

  // ===================== GET ALL =====================
  describe('getAllPayments', () => {

    test('devrait retourner tous les paiements', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      const payments = [{ _id: 'p1', amount: 30000 }];

      Payment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(payments)
            })
          })
        })
      });

      await paymentController.getAllPayments(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(payments);
    });

    test('devrait filtrer par facture', async () => {
      const req = mockReq({ query: { invoice: 'inv1' } });
      const res = mockRes();

      Payment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      await paymentController.getAllPayments(req, res, mockNext);

      expect(Payment.find).toHaveBeenCalledWith({ invoice: 'inv1' });
    });
  });

  // ===================== GET BY ID =====================
  describe('getPaymentById', () => {

    test('devrait retourner un paiement par ID', async () => {
      const req = mockReq({ params: { id: 'p1' } });
      const res = mockRes();
      const payment = { _id: 'p1', amount: 30000 };

      Payment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(payment)
          })
        })
      });

      await paymentController.getPaymentById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(payment);
    });

    test('devrait retourner 404 si paiement non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      Payment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
          })
        })
      });

      await paymentController.getPaymentById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Paiement non trouvé" });
    });
  });
});
