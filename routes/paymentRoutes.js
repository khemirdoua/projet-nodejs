const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createPaymentSchema } = require('../validators/paymentValidator');
const paymentController = require('../controllers/paymentController');

/**
 * @swagger
 * tags:
 *   name: Paiements
 *   description: Enregistrement des paiements manuels
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Enregistrer un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoice, amount, method]
 *             properties:
 *               invoice:
 *                 type: string
 *                 example: 60f7a1b2c3d4e5f6a7b8c9d0
 *               amount:
 *                 type: number
 *                 example: 50000
 *               method:
 *                 type: string
 *                 enum: [Espèces, Virement, Chèque, Carte bancaire]
 *                 example: Virement
 *               reference:
 *                 type: string
 *                 example: VIR-2026-001
 *               note:
 *                 type: string
 *                 example: Paiement partiel
 *     responses:
 *       201:
 *         description: Paiement enregistré
 *       400:
 *         description: Montant dépasse le reste à payer
 *       404:
 *         description: Facture non trouvée
 */
router.post('/', auth, validate(createPaymentSchema), paymentController.createPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Lister tous les paiements
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: invoice
 *         schema:
 *           type: string
 *         description: Filtrer par facture
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Filtrer par client
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/', auth, paymentController.getAllPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Obtenir un paiement par ID
 *     tags: [Paiements]
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
 *         description: Détails du paiement
 *       404:
 *         description: Paiement non trouvé
 */
router.get('/:id', auth, paymentController.getPaymentById);

module.exports = router;
