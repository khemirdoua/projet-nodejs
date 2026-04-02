const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Helpers pour créer req/res mock
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  // ===================== REGISTER =====================
  describe('POST /register', () => {

    test('devrait créer un utilisateur avec succès', async () => {
      const req = mockReq({ name: 'Test', email: 'test@test.com', password: 'pass123', role: 'agent' });
      const res = mockRes();

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedpass');

      const savedUser = { _id: 'user123', name: 'Test', role: 'agent', save: jest.fn().mockResolvedValue(true) };
      User.mockImplementation(() => savedUser);

      jwt.sign.mockReturnValue('fake-token');

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Utilisateur créé avec succès !", token: 'fake-token' })
      );
    });

    test('devrait refuser si email déjà utilisé', async () => {
      const req = mockReq({ name: 'Test', email: 'exist@test.com', password: 'pass123' });
      const res = mockRes();

      User.findOne.mockResolvedValue({ _id: 'existing' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email déjà utilisé" });
    });

    test('devrait retourner 500 en cas d\'erreur serveur', async () => {
      const req = mockReq({ name: 'Test', email: 'test@test.com', password: 'pass123' });
      const res = mockRes();

      User.findOne.mockRejectedValue(new Error('DB error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Erreur serveur" }));
    });
  });

  // ===================== LOGIN =====================
  describe('POST /login', () => {

    test('devrait connecter un utilisateur avec succès', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'pass123' });
      const res = mockRes();

      const fakeUser = { _id: 'user123', name: 'Test', role: 'agent', password: 'hashedpass' };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-token');

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'fake-token' })
      );
    });

    test('devrait refuser si email inexistant', async () => {
      const req = mockReq({ email: 'noone@test.com', password: 'pass123' });
      const res = mockRes();

      User.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Identifiants invalides" });
    });

    test('devrait refuser si mot de passe incorrect', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'wrong' });
      const res = mockRes();

      User.findOne.mockResolvedValue({ _id: 'user123', password: 'hashedpass' });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Identifiants invalides" });
    });

    test('devrait retourner 500 en cas d\'erreur serveur', async () => {
      const req = mockReq({ email: 'test@test.com', password: 'pass123' });
      const res = mockRes();

      User.findOne.mockRejectedValue(new Error('DB error'));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
