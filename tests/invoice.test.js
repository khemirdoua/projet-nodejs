const invoiceController = require('../controllers/invoiceController');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

jest.mock('../models/Invoice');
jest.mock('../models/Client');

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

describe('Invoice Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // ===================== CREATE =====================
  describe('createInvoice', () => {

    test('devrait créer une facture avec succès', async () => {
      const req = mockReq({
        body: { invoiceNumber: 'FAC-001', client: 'c1', amount: 50000, dueDate: '2026-05-01' }
      });
      const res = mockRes();

      Client.findById.mockResolvedValue({ _id: 'c1', name: 'Ahmed' });

      const savedInvoice = { _id: 'inv1', invoiceNumber: 'FAC-001', amount: 50000 };
      Invoice.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedInvoice)
      }));

      await invoiceController.createInvoice(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('devrait retourner 404 si client non trouvé', async () => {
      const req = mockReq({ body: { client: 'unknown' } });
      const res = mockRes();

      Client.findById.mockResolvedValue(null);

      await invoiceController.createInvoice(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Client non trouvé" });
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq({ body: { client: 'c1' } });
      const res = mockRes();
      const error = new Error('DB error');

      Client.findById.mockResolvedValue({ _id: 'c1' });
      Invoice.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error)
      }));

      await invoiceController.createInvoice(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== GET ALL =====================
  describe('getAllInvoices', () => {

    test('devrait retourner toutes les factures', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      const invoices = [{ invoiceNumber: 'FAC-001' }];

      Invoice.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(invoices)
          })
        })
      });

      await invoiceController.getAllInvoices(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(invoices);
    });

    test('devrait filtrer par statut', async () => {
      const req = mockReq({ query: { status: 'En attente' } });
      const res = mockRes();

      Invoice.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      await invoiceController.getAllInvoices(req, res, mockNext);

      expect(Invoice.find).toHaveBeenCalledWith({ status: 'En attente' });
    });

    test('devrait filtrer par client', async () => {
      const req = mockReq({ query: { client: 'c1' } });
      const res = mockRes();

      Invoice.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      await invoiceController.getAllInvoices(req, res, mockNext);

      expect(Invoice.find).toHaveBeenCalledWith({ client: 'c1' });
    });
  });

  // ===================== GET BY ID =====================
  describe('getInvoiceById', () => {

    test('devrait retourner une facture par ID', async () => {
      const req = mockReq({ params: { id: 'inv1' } });
      const res = mockRes();
      const invoice = { _id: 'inv1', invoiceNumber: 'FAC-001' };

      Invoice.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(invoice)
        })
      });

      await invoiceController.getInvoiceById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(invoice);
    });

    test('devrait retourner 404 si facture non trouvée', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      Invoice.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      await invoiceController.getInvoiceById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Facture non trouvée" });
    });
  });

  // ===================== UPDATE =====================
  describe('updateInvoice', () => {

    test('devrait mettre à jour une facture', async () => {
      const req = mockReq({ params: { id: 'inv1' }, body: { status: 'En retard' } });
      const res = mockRes();
      const updated = { _id: 'inv1', status: 'En retard' };

      Invoice.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      await invoiceController.updateInvoice(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('devrait retourner 404 si facture non trouvée', async () => {
      const req = mockReq({ params: { id: 'unknown' }, body: { status: 'Payée' } });
      const res = mockRes();

      Invoice.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await invoiceController.updateInvoice(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ===================== DELETE =====================
  describe('deleteInvoice', () => {

    test('devrait supprimer une facture', async () => {
      const req = mockReq({ params: { id: 'inv1' } });
      const res = mockRes();

      Invoice.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'inv1' });

      await invoiceController.deleteInvoice(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ message: "Facture supprimée avec succès" });
    });

    test('devrait retourner 404 si facture non trouvée', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      Invoice.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await invoiceController.deleteInvoice(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
