const clientController = require('../controllers/clientController');
const Client = require('../models/Client');

jest.mock('../models/Client');

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
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

describe('Client Controller', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  // ===================== CREATE =====================
  describe('createClient', () => {

    test('devrait créer un client avec succès', async () => {
      const req = mockReq({
        body: { name: 'Ahmed', email: 'ahmed@test.com', phone: '0555123456' }
      });
      const res = mockRes();

      const savedClient = { _id: 'c1', name: 'Ahmed', email: 'ahmed@test.com', phone: '0555123456' };
      Client.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedClient)
      }));

      await clientController.createClient(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();
      const error = new Error('Validation error');

      Client.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error)
      }));

      await clientController.createClient(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== GET ALL =====================
  describe('getAllClients', () => {

    test('devrait retourner tous les clients', async () => {
      const req = mockReq();
      const res = mockRes();
      const clients = [{ name: 'Ahmed' }, { name: 'Sara' }];

      Client.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(clients)
      });

      await clientController.getAllClients(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(clients);
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq();
      const res = mockRes();
      const error = new Error('DB error');

      Client.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(error)
      });

      await clientController.getAllClients(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== GET BY ID =====================
  describe('getClientById', () => {

    test('devrait retourner un client par ID', async () => {
      const req = mockReq({ params: { id: 'c1' } });
      const res = mockRes();
      const client = { _id: 'c1', name: 'Ahmed' };

      Client.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(client)
      });

      await clientController.getClientById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(client);
    });

    test('devrait retourner 404 si client non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      Client.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await clientController.getClientById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Client non trouvé" });
    });
  });

  // ===================== UPDATE =====================
  describe('updateClient', () => {

    test('devrait mettre à jour un client', async () => {
      const req = mockReq({ params: { id: 'c1' }, body: { name: 'Ahmed Updated' } });
      const res = mockRes();
      const updated = { _id: 'c1', name: 'Ahmed Updated' };

      Client.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      await clientController.updateClient(req, res, mockNext);

      expect(Client.findByIdAndUpdate).toHaveBeenCalledWith('c1', { name: 'Ahmed Updated' }, { new: true, runValidators: true });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('devrait retourner 404 si client non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' }, body: { name: 'X' } });
      const res = mockRes();

      Client.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await clientController.updateClient(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ===================== DELETE =====================
  describe('deleteClient', () => {

    test('devrait supprimer un client', async () => {
      const req = mockReq({ params: { id: 'c1' } });
      const res = mockRes();

      Client.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'c1' });

      await clientController.deleteClient(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ message: "Client supprimé avec succès" });
    });

    test('devrait retourner 404 si client non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      Client.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await clientController.deleteClient(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
