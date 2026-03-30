const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Client = require('../models/Client'); // Assure-toi d'avoir le modèle Client

router.post('/', auth, async (req, res) => {
  try {
    const client = new Client({ ...req.body, createdBy: req.user.id });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
});

module.exports = router;