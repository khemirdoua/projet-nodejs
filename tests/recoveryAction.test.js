const recoveryActionController = require('../controllers/recoveryActionController');
const RecoveryAction = require('../models/RecoveryAction');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

jest.mock('../models/RecoveryAction');
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

describe('RecoveryAction Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // ===================== CREATE =====================
  describe('createRecoveryAction', () => {

    test('devrait créer une action avec succès', async () => {
      const req = mockReq({
        body: {
          invoiceId: 'inv1',
          clientId: 'c1',
          type: 'call',
          description: 'Appel de relance',
          actionDate: '2026-04-03'
        }
      });
      const res = mockRes();

      Invoice.findById.mockResolvedValue({ _id: 'inv1' });
      Client.findById.mockResolvedValue({ _id: 'c1', name: 'Ahmed' });

      const savedAction = { _id: 'ra1', type: 'call', status: 'pending' };
      RecoveryAction.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedAction)
      }));

      await recoveryActionController.createRecoveryAction(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('devrait retourner 404 si facture non trouvée', async () => {
      const req = mockReq({ body: { invoiceId: 'unknown', clientId: 'c1' } });
      const res = mockRes();

      Invoice.findById.mockResolvedValue(null);

      await recoveryActionController.createRecoveryAction(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Facture non trouvée' });
    });

    test('devrait retourner 404 si client non trouvé', async () => {
      const req = mockReq({ body: { invoiceId: 'inv1', clientId: 'unknown' } });
      const res = mockRes();

      Invoice.findById.mockResolvedValue({ _id: 'inv1' });
      Client.findById.mockResolvedValue(null);

      await recoveryActionController.createRecoveryAction(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Client non trouvé' });
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq({ body: { invoiceId: 'inv1', clientId: 'c1' } });
      const res = mockRes();
      const error = new Error('DB error');

      Invoice.findById.mockResolvedValue({ _id: 'inv1' });
      Client.findById.mockResolvedValue({ _id: 'c1' });
      RecoveryAction.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error)
      }));

      await recoveryActionController.createRecoveryAction(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== GET ALL =====================
  describe('getAllRecoveryActions', () => {

    test('devrait retourner toutes les actions', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      const actions = [{ _id: 'ra1', type: 'call' }];

      RecoveryAction.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(actions)
          })
        })
      });

      await recoveryActionController.getAllRecoveryActions(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(actions);
    });

    test('devrait filtrer par statut', async () => {
      const req = mockReq({ query: { status: 'pending' } });
      const res = mockRes();

      RecoveryAction.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      await recoveryActionController.getAllRecoveryActions(req, res, mockNext);

      expect(RecoveryAction.find).toHaveBeenCalledWith({ status: 'pending' });
    });

    test('devrait filtrer par type', async () => {
      const req = mockReq({ query: { type: 'email' } });
      const res = mockRes();

      RecoveryAction.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      await recoveryActionController.getAllRecoveryActions(req, res, mockNext);

      expect(RecoveryAction.find).toHaveBeenCalledWith({ type: 'email' });
    });

    test('devrait filtrer par invoiceId', async () => {
      const req = mockReq({ query: { invoiceId: 'inv1' } });
      const res = mockRes();

      RecoveryAction.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
          })
        })
      });

      await recoveryActionController.getAllRecoveryActions(req, res, mockNext);

      expect(RecoveryAction.find).toHaveBeenCalledWith({ invoiceId: 'inv1' });
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();
      const error = new Error('DB error');

      RecoveryAction.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(error)
          })
        })
      });

      await recoveryActionController.getAllRecoveryActions(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== GET BY ID =====================
  describe('getRecoveryActionById', () => {

    test('devrait retourner une action par ID', async () => {
      const req = mockReq({ params: { id: 'ra1' } });
      const res = mockRes();
      const action = { _id: 'ra1', type: 'visit', status: 'pending' };

      RecoveryAction.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(action)
        })
      });

      await recoveryActionController.getRecoveryActionById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(action);
    });

    test('devrait retourner 404 si action non trouvée', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      RecoveryAction.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      await recoveryActionController.getRecoveryActionById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Action de recouvrement non trouvée' });
    });
  });

  // ===================== UPDATE =====================
  describe('updateRecoveryAction', () => {

    test('devrait mettre à jour une action', async () => {
      const req = mockReq({ params: { id: 'ra1' }, body: { status: 'completed' } });
      const res = mockRes();
      const updated = { _id: 'ra1', status: 'completed' };

      RecoveryAction.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      await recoveryActionController.updateRecoveryAction(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(updated);
      expect(RecoveryAction.findByIdAndUpdate).toHaveBeenCalledWith(
        'ra1',
        { status: 'completed' },
        { new: true, runValidators: true }
      );
    });

    test('devrait retourner 404 si action non trouvée', async () => {
      const req = mockReq({ params: { id: 'unknown' }, body: { status: 'completed' } });
      const res = mockRes();

      RecoveryAction.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await recoveryActionController.updateRecoveryAction(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Action de recouvrement non trouvée' });
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq({ params: { id: 'ra1' }, body: { status: 'completed' } });
      const res = mockRes();
      const error = new Error('DB error');

      RecoveryAction.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

      await recoveryActionController.updateRecoveryAction(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== DELETE =====================
  describe('deleteRecoveryAction', () => {

    test('devrait supprimer une action', async () => {
      const req = mockReq({ params: { id: 'ra1' } });
      const res = mockRes();

      RecoveryAction.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'ra1' });

      await recoveryActionController.deleteRecoveryAction(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ message: 'Action de recouvrement supprimée avec succès' });
    });

    test('devrait retourner 404 si action non trouvée', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      RecoveryAction.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await recoveryActionController.deleteRecoveryAction(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Action de recouvrement non trouvée' });
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq({ params: { id: 'ra1' } });
      const res = mockRes();
      const error = new Error('DB error');

      RecoveryAction.findByIdAndDelete = jest.fn().mockRejectedValue(error);

      await recoveryActionController.deleteRecoveryAction(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
