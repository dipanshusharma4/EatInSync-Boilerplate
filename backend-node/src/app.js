const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/analysisRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Analysis Routes under /api/v1
app.use('/api/v1', analysisRoutes);

// Auth Routes under root (to match existing frontend)
app.use('/', authRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ status: "active", system: "EatInSync Engine (Node.js)" });
});

module.exports = app;
