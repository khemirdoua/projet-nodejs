const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Imports des routes
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();
app.use(express.json());

// --- CONFIGURATION SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Recouvra+',
      version: '1.0.0',
      description: 'Documentation interactive de l\'API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // CRITIQUE : Assure-toi que tes fichiers sont bien dans le dossier /routes
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- UTILISATION DES ROUTES ---
app.use('/api/auth', authRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/recouvra_db")
  .then(() => {
    console.log("✅ MongoDB Connecté");
    app.listen(3000, () => {
      console.log("🚀 Serveur : http://localhost:3000");
      console.log("📖 Swagger : http://localhost:3000/api-docs");
    });
  })
  .catch(err => console.log("❌ Erreur DB:", err));