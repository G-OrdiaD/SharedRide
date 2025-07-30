const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Inside connectDB function.');
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env file!');
    }
    console.log(`Attempting to connect to MongoDB with URI: ${mongoUri.substring(0, 20)}... (masked)`);
    const conn = await mongoose.connect(mongoUri, {
      // useNewUrlParser: true,  <-- Remove this line
      // useUnifiedTopology: true, <-- Remove this line
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error caught in db.js: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;