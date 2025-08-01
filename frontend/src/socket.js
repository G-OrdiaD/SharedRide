import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';
let socket = null;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 3
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socket.on('newRide', (ride) => {
      console.log('New ride request:', ride);
    });

    socket.on('rideAccepted', (data) => {
      console.log('Ride accepted:', data);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitLocation = (location) => {
  if (socket && socket.connected) {
    socket.emit('driverLocation', location);
  }
};