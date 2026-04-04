const userController = require('../controllers/userController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('bcryptjs');

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  user: { id: 'admin1', role: 'admin' },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('User Controller (Admin)', () => {

  beforeEach(() => jest.clearAllMocks());

  // ===================== GET ALL =====================
  describe('getAllUsers', () => {

    test('devrait retourner tous les utilisateurs sans mot de passe', async () => {
      const req = mockReq();
      const res = mockRes();
      const users = [{ _id: 'u1', name: 'Admin', role: 'admin' }];

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(users)
      });

      await userController.getAllUsers(req, res, mockNext);

      expect(User.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(users);
    });

    test('devrait appeler next en cas d\'erreur', async () => {
      const req = mockReq();
      const res = mockRes();
      const error = new Error('DB error');

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(error)
      });

      await userController.getAllUsers(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ===================== GET BY ID =====================
  describe('getUserById', () => {

    test('devrait retourner un utilisateur par ID', async () => {
      const req = mockReq({ params: { id: 'u1' } });
      const res = mockRes();
      const user = { _id: 'u1', name: 'Agent', role: 'agent' };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await userController.getUserById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(user);
    });

    test('devrait retourner 404 si utilisateur non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.getUserById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
    });
  });

  // ===================== UPDATE =====================
  describe('updateUser', () => {

    test('devrait mettre à jour un utilisateur', async () => {
      const req = mockReq({ params: { id: 'u2' }, body: { name: 'Nouveau Nom', role: 'manager' } });
      const res = mockRes();
      const updated = { _id: 'u2', name: 'Nouveau Nom', role: 'manager' };

      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(updated)
      });

      await userController.updateUser(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('devrait hasher le mot de passe si fourni', async () => {
      const req = mockReq({ params: { id: 'u2' }, body: { password: 'newpass123' } });
      const res = mockRes();

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedNewPass');

      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'u2', name: 'Test' })
      });

      await userController.updateUser(req, res, mockNext);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 'salt');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'u2',
        expect.objectContaining({ password: 'hashedNewPass' }),
        expect.any(Object)
      );
    });

    test('devrait retourner 404 si utilisateur non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' }, body: { name: 'X' } });
      const res = mockRes();

      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.updateUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ===================== DELETE =====================
  describe('deleteUser', () => {

    test('devrait supprimer un utilisateur', async () => {
      const req = mockReq({ params: { id: 'u2' } });
      const res = mockRes();

      User.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'u2', deleted_at: new Date() });

      await userController.deleteUser(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur supprimé avec succès" });
    });

    test('devrait empêcher la suppression de son propre compte', async () => {
      const req = mockReq({ params: { id: 'admin1' } }); // même ID que req.user.id
      const res = mockRes();

      await userController.deleteUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    });

    test('devrait retourner 404 si utilisateur non trouvé', async () => {
      const req = mockReq({ params: { id: 'unknown' } });
      const res = mockRes();

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await userController.deleteUser(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
