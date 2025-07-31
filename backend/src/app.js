const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const express = require('express');
const { connectDB, mongooseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');

const app = express();

// Database Connection with improved error handling
(async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

// Test Endpoints
app.get('/', (req, res) => {
  res.send('Ride-Share Backend API is running!');
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Backend API!' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO Configuration with proper CORS and error handling
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send connection confirmation
  socket.emit('connection_ack', {
    status: 'connected',
    socketId: socket.id,
    message: 'Successfully connected to server'
  });

  // Driver Location Updates
  socket.on('driverLocation', (data) => {
    console.log(`Location update from ${data.driverId || 'unknown'}:`, {
      lat: data.latitude,
      lng: data.longitude
    });
    
    // Broadcast to all clients
    io.emit('locationUpdate', {
      driverId: data.driverId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date().toISOString()
    });
  });

  // Heartbeat/Ping
  socket.on('ping', (callback) => {
    callback('pong');
  });

  // Error Handling
  socket.on('error', (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });

  // Disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected (${socket.id}):`, reason);
  });
});

// Socket.IO Engine Error Handling
io.engine.on("connection_error", (err) => {
  console.error('Socket.IO connection error:', {
    code: err.code,
    message: err.message,
    context: err.context
  });
});

// Server Startup
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`HTTP API: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});