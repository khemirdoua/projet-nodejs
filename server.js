const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Imports des routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware d'erreurs
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();

// --- MIDDLEWARES GLOBAUX ---
app.use(cors());
app.use(express.json());

// --- CONFIGURATION SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Recouvra+',
      version: '1.0.0',
      description: 'API de gestion du recouvrement - Clients, Factures, Paiements',
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
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// --- GESTION D'ERREURS (doit être après les routes) ---
app.use(errorHandler);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/recouvra_db")
  .then(() => {
    console.log("MongoDB Connecté");
    app.listen(3000, () => {
      console.log("Serveur : http://localhost:3000");
      console.log("Swagger : http://localhost:3000/api-docs");
    });
  })
  .catch(err => console.log("Erreur DB:", err));
