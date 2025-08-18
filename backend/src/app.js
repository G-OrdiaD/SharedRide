require('dotenv').config(); // Load environment variables first

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

// Places API Endpoints
app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ error: "Input parameter required" });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input,
          key: process.env.GOOGLE_MAPS_API_KEY,
          types: 'address',
          components: 'country:uk'
        }
      }
    );

    if (response.data.status === 'REQUEST_DENIED') {
      throw new Error('Google API rejected our key');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ 
      error: "Address suggestions unavailable",
      debug: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.get('/api/places/details', async (req, res) => {
  try {
    const { place_id } = req.query;
    if (!place_id) {
      return res.status(400).json({ error: "Place ID parameter required" });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id,
          key: process.env.GOOGLE_MAPS_API_KEY,
          fields: 'formatted_address,geometry'
        }
      }
    );

    if (response.data.status !== 'OK') {
      throw new Error('Failed to get place details');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ 
      error: "Failed to get location details",
      debug: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
const server = http.createServer(app); // Create HTTP server with Express app

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log the server port
  console.log(`Access API at: http://localhost:${PORT}`); // Log the API access URL
});