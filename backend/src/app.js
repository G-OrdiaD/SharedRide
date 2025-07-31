const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const express = require('express'); 
const { connectDB, mongooseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');

const app = express();

// Connect Database
// Add .then().catch() or an IIFE to handle the async connectDB call more explicitly
// and provide more immediate feedback for the connection attempt.
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB at startup:', err.message);
    process.exit(1); // Exit process if DB connection fails
  }
})();

// Optional: Listen for Mongoose connection events for more robust logging
// This part is useful for understanding connection state changes during runtime.
// Only include if you're using Mongoose and exporting `mongooseConnection` from `db.js`.
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
app.use(express.json()); // Body parser for JSON requests
// Add URL-encoded middleware if you expect form submissions
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Add a simple health check or base route
app.get('/', (req, res) => {
  res.send('Ride-Share Backend API is running!');
});


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketio(server);

// WebSocket (Socket.IO) handling
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id); // Log socket ID for better tracking
  
  // Handle driver location updates
  socket.on('driverLocation', (data) => {
    console.log(`Driver ${data.driverId || 'unknown'} location update:`, data.latitude, data.longitude); // Log received data
    // Emit the location update to all connected clients
    io.emit('locationUpdate', data); 
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected:', socket.id);
  });

  // Optional: Handle other potential Socket.IO errors
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access API at: http://localhost:${PORT}`);
});