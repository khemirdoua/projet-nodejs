const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const errorHandler = require('../middleware/errorHandler');
const Joi = require('joi');

jest.mock('jsonwebtoken');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ===================== AUTH MIDDLEWARE =====================
describe('Auth Middleware', () => {

  test('devrait passer si token valide', () => {
    const req = { header: jest.fn().mockReturnValue('Bearer valid-token') };
    const res = mockRes();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 'user1', role: 'agent' });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: 'user1', role: 'agent' });
    expect(next).toHaveBeenCalled();
  });

  test('devrait refuser si pas de token', () => {
    const req = { header: jest.fn().mockReturnValue(null) };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Accès refusé, token manquant" });
    expect(next).not.toHaveBeenCalled();
  });

  test('devrait refuser si token invalide', () => {
    const req = { header: jest.fn().mockReturnValue('Bearer bad-token') };
    const res = mockRes();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalide" });
  });
});

// ===================== ROLE MIDDLEWARE =====================
describe('Role Middleware', () => {

  test('devrait passer si rôle autorisé', () => {
    const middleware = roleMiddleware('admin', 'manager');
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('devrait refuser si rôle non autorisé', () => {
    const middleware = roleMiddleware('admin');
    const req = { user: { role: 'agent' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Accès interdit : rôle insuffisant" });
    expect(next).not.toHaveBeenCalled();
  });

  test('devrait refuser si pas d\'utilisateur', () => {
    const middleware = roleMiddleware('admin');
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentification requise" });
  });
});

// ===================== VALIDATE MIDDLEWARE =====================
describe('Validate Middleware', () => {

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });

  test('devrait passer si données valides', () => {
    const middleware = validate(schema);
    const req = { body: { name: 'Test', email: 'test@test.com' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('devrait refuser si données invalides', () => {
    const middleware = validate(schema);
    const req = { body: { name: '' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Données invalides",
        errors: expect.any(Array)
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

// ===================== ERROR HANDLER =====================
describe('Error Handler', () => {

  const req = {};
  const next = jest.fn();

  // Supprime console.error pendant les tests
  beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterAll(() => { console.error.mockRestore(); });

  test('devrait gérer les erreurs de validation Mongoose', () => {
    const res = mockRes();
    const err = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Le nom est requis' },
        email: { message: 'Email invalide' }
      }
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur de validation",
      errors: ['Le nom est requis', 'Email invalide']
    });
  });

  test('devrait gérer les doublons MongoDB (code 11000)', () => {
    const res = mockRes();
    const err = { code: 11000, keyValue: { email: 'test@test.com' } };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Ce email est déjà utilisé" });
  });

  test('devrait gérer les erreurs CastError (mauvais ObjectId)', () => {
    const res = mockRes();
    const err = { name: 'CastError' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "ID invalide" });
  });

  test('devrait gérer les erreurs JWT invalide', () => {
    const res = mockRes();
    const err = { name: 'JsonWebTokenError' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalide" });
  });

  test('devrait gérer les erreurs JWT expiré', () => {
    const res = mockRes();
    const err = { name: 'TokenExpiredError' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token expiré" });
  });

  test('devrait gérer les erreurs Joi', () => {
    const res = mockRes();
    const err = {
      isJoi: true,
      details: [{ message: 'Le nom est requis' }]
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Données invalides",
      errors: ['Le nom est requis']
    });
  });

  test('devrait gérer les erreurs génériques (500)', () => {
    const res = mockRes();
    const err = new Error('Something broke');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something broke' });
  });
});
