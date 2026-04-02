const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createClientSchema, updateClientSchema } = require('../validators/clientValidator');
const clientController = require('../controllers/clientController');

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestion des clients
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Créer un nouveau client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmed Ben Ali
 *               email:
 *                 type: string
 *                 example: ahmed@exemple.com
 *               phone:
 *                 type: string
 *                 example: "0555123456"
 *               address:
 *                 type: string
 *                 example: 10 Rue Didouche, Alger
 *               type:
 *                 type: string
 *                 enum: [Particulier, Entreprise]
 *               debtAmount:
 *                 type: number
 *                 example: 50000
 *               status:
 *                 type: string
 *                 enum: [Actif, En Recouvrement, Litige]
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, validate(createClientSchema), clientController.createClient);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Lister tous les clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 */
router.get('/', auth, clientController.getAllClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtenir un client par ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du client
 *       404:
 *         description: Client non trouvé
 */
router.get('/:id', auth, clientController.getClientById);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Mettre à jour un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Actif, En Recouvrement, Litige]
 *     responses:
 *       200:
 *         description: Client mis à jour
 *       404:
 *         description: Client non trouvé
 */
router.put('/:id', auth, role('admin', 'manager'), validate(updateClientSchema), clientController.updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client supprimé
 *       404:
 *         description: Client non trouvé
 */
router.delete('/:id', auth, role('admin'), clientController.deleteClient);

module.exports = router;
