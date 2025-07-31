import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Match your backend URL

let socket = null; // Initialize socket instance

export const connectSocket = () => {
  if (!socket) { // Only create a new socket if one doesn't already exist
    socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Socket.IO: Connected to backend!');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO: Disconnected from backend.');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO: Connection error:', err.message);
    });

    // Listen for the 'locationUpdate' event from the backend
    socket.on('locationUpdate', (data) => {
      console.log('Socket.IO: Received location update:', data);
      // In a real app, you would update your map or UI here
    });

    // You can add more listeners for other real-time events here
    // socket.on('rideRequested', (rideData) => { ... });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Clear the socket instance
  }
};

// Example function to emit a message (e.g., driver sending location)
export const emitDriverLocation = (driverId, lat, lng) => {
  if (socket && socket.connected) {
    console.log(`Socket.IO: Emitting driver location for ${driverId}: ${lat}, ${lng}`);
    socket.emit('driverLocation', { driverId, latitude: lat, longitude: lng });
  } else {
    console.warn('Socket.IO: Not connected, cannot emit driver location.');
  }
};
