require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/rideshare_db';
const locationEncryptionKey = process.env.LOCATION_ENCRYPTION_KEY;

// Validate encryption key
if (!locationEncryptionKey) {
  console.error('❌ LOCATION_ENCRYPTION_KEY is not set in environment variables');
  console.warn('⚠️  Using default development key. This is insecure for production!');
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
    });
    console.log('✅ MongoDB Connected!');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from DB');
});

// Export as a proper config object
module.exports = {
  mongoURI,
  locationEncryptionKey,
  connectDB,
  mongooseConnection: mongoose.connection
};