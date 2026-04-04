const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Récupérer tous les logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des logs
 */
router.get('/', auth, async (req, res) => {
  try {
    const logs = await Log.find().populate('user_id', 'name email').sort({ date_time: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;
