import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

let generalAppSocket = null;
let authenticatedUserSocket = null;

/**
 * Connects to Socket.IO.
 * If a token is provided, it creates/manages an authenticated socket.
 * If no token is provided, it creates/manages a general, unauthenticated socket.
 * @param {string | null} token - JWT token for authentication. If null, creates unauthenticated socket.
 * @returns {Socket} The Socket.IO client instance.
 */
export const connectSocket = (token = null) => {
  if (token) {
    // --- Handle Authenticated User Socket ---
    if (authenticatedUserSocket && authenticatedUserSocket.connected && authenticatedUserSocket.auth && authenticatedUserSocket.auth.token === token) {
      console.log('Socket.IO: Authenticated socket already connected with same token. Reusing.');
      return authenticatedUserSocket;
    }

    if (authenticatedUserSocket) {
      console.log('Socket.IO: Disconnecting existing authenticated socket for new token or re-auth.');
      authenticatedUserSocket.disconnect();
      authenticatedUserSocket = null;
    }

    authenticatedUserSocket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000
    });

    authenticatedUserSocket.on('connect', () => {
      console.log('Socket.IO: Authenticated user socket connected.');
    });

    authenticatedUserSocket.on('disconnect', (reason) => {
      console.log('Socket.IO: Authenticated user socket disconnected:', reason);
    });

    authenticatedUserSocket.on('connect_error', (err) => {
      console.error('Socket.IO: Authenticated user connection error:', err.message);
    });

    return authenticatedUserSocket;

  } else {
    // --- Handle General App Socket (Unauthenticated) ---
    if (generalAppSocket && generalAppSocket.connected) {
      console.log('Socket.IO: General app socket already connected. Reusing.');
      return generalAppSocket;
    }

    if (generalAppSocket && !generalAppSocket.connected) {
      console.log('Socket.IO: Disconnecting old general app socket (not connected).');
      generalAppSocket.disconnect();
      generalAppSocket = null;
    }

    generalAppSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 1,
      reconnectionDelay: 1000,
      auth: {}, // Explicitly send an empty auth object to avoid token issues
    });

    generalAppSocket.on('connect', () => {
      console.log('Socket.IO: General app socket connected.');
    });

    generalAppSocket.on('disconnect', () => {
      console.log('Socket.IO: General app socket disconnected.');
    });

    generalAppSocket.on('connect_error', (err) => {
      console.error('Socket.IO: General app connection error:', err.message);
    });

    return generalAppSocket;
  }
};

/**
 * Disconnects a specific type of socket.
 * @param {boolean} isAuthSocket - True to disconnect the authenticated socket, false for the general socket.
 */
export const disconnectSocket = (isAuthSocket = true) => {
  if (isAuthSocket && authenticatedUserSocket) {
    console.log('Socket.IO: Explicitly disconnecting authenticated user socket.');
    authenticatedUserSocket.disconnect();
    authenticatedUserSocket = null;
  } else if (!isAuthSocket && generalAppSocket) {
    console.log('Socket.IO: Explicitly disconnecting general app socket.');
    generalAppSocket.disconnect();
    generalAppSocket = null;
  }
};

/**
 * Emits driver location using the authenticated socket.
 */
export const emitLocation = (location) => {
  if (authenticatedUserSocket && authenticatedUserSocket.connected) {
    authenticatedUserSocket.emit('driverLocation', location);
  } else {
    console.warn('Socket.IO: Authenticated user socket not connected, cannot emit driverLocation.');
  }
};

export const getAuthenticatedSocket = () => authenticatedUserSocket;
