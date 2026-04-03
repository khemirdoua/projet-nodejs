const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const statisticsController = require('../controllers/statisticsController');

/**
 * @swagger
 * tags:
 *   name: Statistiques
 *   description: Statistiques globales sur les factures et actions de recouvrement
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Obtenir les statistiques globales
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques retournées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalInvoices:
 *                   type: integer
 *                   example: 120
 *                 paidInvoices:
 *                   type: integer
 *                   example: 80
 *                 unpaidInvoices:
 *                   type: integer
 *                   example: 40
 *                 totalRecoveryActions:
 *                   type: integer
 *                   example: 200
 *                 completedActions:
 *                   type: integer
 *                   example: 150
 *                 pendingActions:
 *                   type: integer
 *                   example: 50
 *                 actionsPerClient:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       clientId:
 *                         type: string
 *                       clientName:
 *                         type: string
 *                       count:
 *                         type: integer
 */
router.get('/', auth, statisticsController.getStatistics);

module.exports = router;
