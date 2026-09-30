require('dotenv').config();

const mongoose = require('mongoose');

const app = require('./app');
const { Report } = require('./models');

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error(
    'Missing MONGODB_URI or JWT_SECRET in environment. Check backend/.env'
  );
  process.exit(1);
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    await Report.init();

    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();