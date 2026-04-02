const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createInvoiceSchema, updateInvoiceSchema } = require('../validators/invoiceValidator');
const invoiceController = require('../controllers/invoiceController');

/**
 * @swagger
 * tags:
 *   name: Factures
 *   description: Gestion des factures
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Créer une nouvelle facture
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceNumber, client, amount, dueDate]
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *                 example: FAC-2026-001
 *               client:
 *                 type: string
 *                 example: 60f7a1b2c3d4e5f6a7b8c9d0
 *               amount:
 *                 type: number
 *                 example: 150000
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-01"
 *               description:
 *                 type: string
 *                 example: Facture de service mensuel
 *     responses:
 *       201:
 *         description: Facture créée
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Client non trouvé
 */
router.post('/', auth, role('admin', 'manager'), validate(createInvoiceSchema), invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Lister toutes les factures
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [En attente, Payée, En retard, Partiellement payée, Annulée]
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: ID du client
 *     responses:
 *       200:
 *         description: Liste des factures
 */
router.get('/', auth, invoiceController.getAllInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtenir une facture par ID
 *     tags: [Factures]
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
 *         description: Détails de la facture
 *       404:
 *         description: Facture non trouvée
 */
router.get('/:id', auth, invoiceController.getInvoiceById);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Mettre à jour une facture
 *     tags: [Factures]
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
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [En attente, Payée, En retard, Partiellement payée, Annulée]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Facture mise à jour
 *       404:
 *         description: Facture non trouvée
 */
router.put('/:id', auth, role('admin', 'manager'), validate(updateInvoiceSchema), invoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Supprimer une facture
 *     tags: [Factures]
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
 *         description: Facture supprimée
 *       404:
 *         description: Facture non trouvée
 */
router.delete('/:id', auth, role('admin'), invoiceController.deleteInvoice);

module.exports = router;
