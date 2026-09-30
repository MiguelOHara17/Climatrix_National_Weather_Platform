const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const streamRoutes = require('./routes/stream');

const app = express();

app.set('trust proxy', 1);

app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);

const allowedOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (
        process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  const connectionStates = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  return res.json({
    status: 'ok',
    database: connectionStates[mongoose.connection.readyState],
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stream', streamRoutes);

app.use((req, res) => {
  return res.status(404).json({
    error: 'Not found',
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  return res.status(error.status || 500).json({
    error: error.message || 'Server error',
  });
});

module.exports = app;