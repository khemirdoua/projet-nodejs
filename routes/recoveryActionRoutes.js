const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createRecoveryActionSchema, updateRecoveryActionSchema } = require('../validators/recoveryActionValidator');
const recoveryActionController = require('../controllers/recoveryActionController');

/**
 * @swagger
 * tags:
 *   name: Actions de recouvrement
 *   description: Gestion des actions de recouvrement
 */

/**
 * @swagger
 * /api/recovery-actions:
 *   post:
 *     summary: Créer une action de recouvrement
 *     tags: [Actions de recouvrement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceId, clientId, type, description, actionDate]
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: 60f7...
 *               clientId:
 *                 type: string
 *                 example: 60f7...
 *               type:
 *                 type: string
 *                 enum: [call, email, visit, reminder]
 *               description:
 *                 type: string
 *                 example: Appel passé au client
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *               actionDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Action créée
 *       404:
 *         description: Facture ou Client non trouvé
 */
router.post('/', auth, validate(createRecoveryActionSchema), recoveryActionController.createRecoveryAction);

/**
 * @swagger
 * /api/recovery-actions:
 *   get:
 *     summary: Lister toutes les actions de recouvrement
 *     tags: [Actions de recouvrement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: invoiceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des actions
 */
router.get('/', auth, recoveryActionController.getAllRecoveryActions);

/**
 * @swagger
 * /api/recovery-actions/{id}:
 *   get:
 *     summary: Obtenir une action de recouvrement par ID
 *     tags: [Actions de recouvrement]
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
 *         description: Détails de l'action
 *       404:
 *         description: Action non trouvée
 */
router.get('/:id', auth, recoveryActionController.getRecoveryActionById);

/**
 * @swagger
 * /api/recovery-actions/{id}:
 *   put:
 *     summary: Mettre à jour une action
 *     tags: [Actions de recouvrement]
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
 *               type:
 *                 type: string
 *                 enum: [call, email, visit, reminder]
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *               actionDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Action mise à jour
 *       404:
 *         description: Action non trouvée
 */
router.put('/:id', auth, validate(updateRecoveryActionSchema), recoveryActionController.updateRecoveryAction);

/**
 * @swagger
 * /api/recovery-actions/{id}:
 *   delete:
 *     summary: Supprimer une action
 *     tags: [Actions de recouvrement]
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
 *         description: Action supprimée
 *       404:
 *         description: Action non trouvée
 */
router.delete('/:id', auth, role('admin'), recoveryActionController.deleteRecoveryAction);

module.exports = router;
