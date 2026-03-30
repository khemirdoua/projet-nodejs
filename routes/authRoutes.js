const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion des utilisateurs (Inscription et Connexion)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jean Dupont
 *               email:
 *                 type: string
 *                 example: jean@exemple.com
 *               password:
 *                 type: string
 *                 example: MotDePasse123
 *               role:
 *                 type: string
 *                 enum: [admin, agent]
 *                 example: agent
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides ou email déjà utilisé
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter pour obtenir un token
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jean@exemple.com
 *               password:
 *                 type: string
 *                 example: MotDePasse123
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le JWT
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/login', authController.login);

module.exports = router;