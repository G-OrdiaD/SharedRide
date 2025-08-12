require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
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

// Mongoose connection events
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
  origin: ['http://localhost:3000', 'http://192.168.100.90:3000'],
  credentials: true
}));

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Add new endpoint for places autocomplete
app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ error: 'Input parameter is required' });
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input,
          key: process.env.GOOGLE_MAPS_API_KEY,
          types: '(cities)'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Google Places API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch place suggestions' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access API at: http://localhost:${PORT}`);
});