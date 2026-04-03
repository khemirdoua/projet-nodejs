const statisticsController = require('../controllers/statisticsController');
const Invoice = require('../models/Invoice');
const RecoveryAction = require('../models/RecoveryAction');

jest.mock('../models/Invoice');
jest.mock('../models/RecoveryAction');

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

describe('Statistics Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // ===================== GET STATISTICS =====================
  describe('getStatistics', () => {

    test('devrait retourner les statistiques complètes', async () => {
      const req = mockReq();
      const res = mockRes();

      // Invoice counts
      Invoice.countDocuments = jest.fn()
        .mockResolvedValueOnce(120)  // totalInvoices
        .mockResolvedValueOnce(80);  // paidInvoices

      // Recovery action counts
      RecoveryAction.countDocuments = jest.fn()
        .mockResolvedValueOnce(200) // totalRecoveryActions
        .mockResolvedValueOnce(150) // completedActions
        .mockResolvedValueOnce(50); // pendingActions

      RecoveryAction.aggregate = jest.fn().mockResolvedValue([]);

      await statisticsController.getStatistics(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        totalInvoices: 120,
        paidInvoices: 80,
        unpaidInvoices: 40,
        totalRecoveryActions: 200,
        completedActions: 150,
        pendingActions: 50,
        actionsPerClient: []
      });
    });

    test('devrait utiliser le bon filtre pour les factures payées', async () => {
      const req = mockReq();
      const res = mockRes();

      Invoice.countDocuments = jest.fn()
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7);

      RecoveryAction.countDocuments = jest.fn()
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      RecoveryAction.aggregate = jest.fn().mockResolvedValue([]);

      await statisticsController.getStatistics(req, res, mockNext);

      expect(Invoice.countDocuments).toHaveBeenNthCalledWith(1);
      expect(Invoice.countDocuments).toHaveBeenNthCalledWith(2, { status: 'Payée' });
    });

    test('devrait utiliser les bons filtres pour les actions de recouvrement', async () => {
      const req = mockReq();
      const res = mockRes();

      Invoice.countDocuments = jest.fn()
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      RecoveryAction.countDocuments = jest.fn()
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(5);

      RecoveryAction.aggregate = jest.fn().mockResolvedValue([]);

      await statisticsController.getStatistics(req, res, mockNext);

      expect(RecoveryAction.countDocuments).toHaveBeenNthCalledWith(1);
      expect(RecoveryAction.countDocuments).toHaveBeenNthCalledWith(2, { status: 'completed' });
      expect(RecoveryAction.countDocuments).toHaveBeenNthCalledWith(3, { status: 'pending' });
    });

    test('devrait retourner les actions par client depuis l\'agrégation', async () => {
      const req = mockReq();
      const res = mockRes();

      const actionsPerClient = [
        { clientId: 'c1', clientName: 'Ahmed Ben Ali', count: 5 },
        { clientId: 'c2', clientName: 'Sana Trabelsi', count: 3 }
      ];

      Invoice.countDocuments = jest.fn()
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30);

      RecoveryAction.countDocuments = jest.fn()
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      RecoveryAction.aggregate = jest.fn().mockResolvedValue(actionsPerClient);

      await statisticsController.getStatistics(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ actionsPerClient })
      );
    });

    test('devrait calculer correctement les factures impayées', async () => {
      const req = mockReq();
      const res = mockRes();

      Invoice.countDocuments = jest.fn()
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60); // paid → unpaid should be 40

      RecoveryAction.countDocuments = jest.fn()
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      RecoveryAction.aggregate = jest.fn().mockResolvedValue([]);

      await statisticsController.getStatistics(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ unpaidInvoices: 40 })
      );
    });

    test('devrait appeler next en cas d\'erreur DB', async () => {
      const req = mockReq();
      const res = mockRes();
      const error = new Error('DB error');

      Invoice.countDocuments = jest.fn().mockRejectedValue(error);

      await statisticsController.getStatistics(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
