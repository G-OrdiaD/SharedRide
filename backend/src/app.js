require('dotenv').config(); // Load environment variables first

const http = require('http');
const socketio = require('socket.io');
const express = require('express'); 
const cors = require ('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for Socket.IO auth
const { connectDB, mongooseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const { User } = require('./models/User'); // Import User model to find user by ID

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
  origin: 'http://localhost:3000',
  credentials: true
}));

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

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log(`Socket.IO Middleware: Connection attempt from socket ID: ${socket.id}`);
  console.log(`Socket.IO Middleware: Token provided: ${token ? 'YES' : 'NO'}`);

  if (!token) {
    console.log('Socket.IO Middleware: Allowing unauthenticated connection (no token provided).');
    return next(); 
  }

  try {
    console.log('Socket.IO Middleware: Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Socket.IO Middleware: Token verified. Decoded ID:', decoded.id);

    console.log('Socket.IO Middleware: Attempting to find user in DB...');
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      console.log('Socket.IO Middleware: User not found for token. Rejecting connection.');
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    console.log(`Socket.IO Middleware: User ${user.email} (${user.role}) authenticated successfully.`);

    if (user.role === 'driver') {
      socket.join('drivers');
      console.log(`Socket.IO Middleware: Driver ${user.email} (${socket.id}) joined 'drivers' room.`);
    }

    console.log('Socket.IO Middleware: Authenticated connection allowed.');
    next(); 
  } catch (err) {
    console.error('Socket.IO Middleware: Authentication Error during token verification or user lookup:', err.message);
    // Log the full error object for more details
    console.error('Socket.IO Middleware: Full error object:', err); 
    return next(new Error('Authentication error: Invalid token or server issue'));
  }
});


// Middleware to attach io instance to req object for HTTP routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes); 

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});


// WebSocket (Socket.IO) handling for connections that have passed the middleware
io.on('connection', (socket) => {
  if (socket.user) {
    console.log(`Socket.IO: Authenticated user ${socket.user.email} connected. Socket ID: ${socket.id}`);
  } else {
    console.log('Socket.IO: General unauthenticated socket connected. Socket ID: ${socket.id}');
  }

  socket.on('driverLocation', (data) => {
    if (socket.user && socket.user.role === 'driver') {
      console.log(`Driver ${socket.user.email} location update:`, data.latitude, data.longitude);
      io.emit('locationUpdate', { ...data, driverId: socket.user.id }); 
    } else {
      console.warn('Received driverLocation from non-driver or unauthenticated socket.');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', socket.id, 'Reason:', reason);
    if (socket.user) {
      console.log(`User ${socket.user.email} disconnected.`);
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access API at: http://localhost:${PORT}`);
});
