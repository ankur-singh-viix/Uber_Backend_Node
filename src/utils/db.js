const mongoose = require('mongoose');

async function connectDB() {
  const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/uber_backend';

  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

module.exports = {
  connectDB,
  disconnectDB,
};
