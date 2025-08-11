require('dotenv').config(); // Load environment variables first

const http = require('http'); // Import http for creating the server
const express = require('express');   // Import express for creating the server
const cors = require ('cors'); // Import CORS for handling cross-origin requests
const jwt = require('jsonwebtoken'); // Import jwt for token verification
const { connectDB, mongooseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes'); 
const rideRoutes = require('./routes/rideRoutes');
const { User } = require('./models/User');

const app = express();

// Connect Database
(async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

if (mongooseConnection) {
  mongooseConnection.on('connected', () => {
    console.log('Mongoose default connection open to DB');
  });

  mongooseConnection.on('error', (err) => {
    console.error('Mongoose default connection error:', err);
  });

  mongooseConnection.on('disconnected', () => {
    console.warn('Mongoose default connection disconnected');
  });
}

// Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.100.90:3000'], // Keep CORS for HTTP requests
  credentials: true
}));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // Server is still needed for HTTP

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access API at: http://localhost:${PORT}`);
});
