const mongoose = require('mongoose');

// Get the MongoDB URI from environment variables or use a default
// It's good practice to use environment variables for sensitive info like this.
// Make sure your .env file has MONGO_URI, or use a suitable default.
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/rideshare_db';

const connectDB = async () => {
  try {
    // Mongoose 6.0+ no longer requires useNewUrlParser, useUnifiedTopology,
    // useFindAndModify, or useCreateIndex. These are now default behaviors.
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds of trying to connect
    });
    console.log('✅ MongoDB Connected (via Mongoose)!'); // More descriptive success log
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message); // More descriptive error log
    // Exit process with failure
    process.exit(1);
  }
};

// Export both the connectDB function AND the mongoose connection object.
// Exporting mongoose.connection allows app.js to attach listeners
// for 'connected', 'error', 'disconnected' events, providing more
// granular control and logging over the connection's lifecycle.
module.exports = {
  connectDB,
  mongooseConnection: mongoose.connection // Export the connection object
};