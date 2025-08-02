import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { connectSocket, disconnectSocket, getAuthenticatedSocket } from '../socket';
import RideRequestModal from '../components/RideRequestModal';

const DriverHomeScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthReady = useSelector((state) => state.auth.status !== 'idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showRideRequestModal, setShowRideRequestModal] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);

  const socketRef = useRef(null); 

  // This useEffect handles navigation based on auth status
  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'driver')) {
      console.log('DriverHomeScreen (Nav Effect): Redirecting - user not authenticated or not a driver.');
      navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  // This useEffect handles the Socket.IO connection and listeners
  useEffect(() => {
    if (user && user.token && user.role === 'driver') {
      console.log('DriverHomeScreen (Socket Effect): User is a driver and token is available.');
      
      // Connect the authenticated socket if it's not already connected or valid
      if (!socketRef.current || !socketRef.current.connected || socketRef.current.auth.token !== user.token) {
        console.log('DriverHomeScreen (Socket Effect): Attempting to connect/reconnect authenticated socket.');
        socketRef.current = connectSocket(user.token);
      } else {
        console.log('DriverHomeScreen (Socket Effect): Authenticated socket already connected. Reusing.');
      }

      const socketInstance = socketRef.current;

      // Only set up listeners if they haven't been set up for this socket instance
      if (!socketInstance._hasListeners) { 
        console.log('DriverHomeScreen (Socket Effect): Setting up newRide listener.');
        socketInstance.on('newRide', (ride) => {
          console.log('DriverHomeScreen (Socket Effect): >>> New ride request RECEIVED by frontend! <<<', ride);
          setCurrentRideRequest(ride); 
          setShowRideRequestModal(true);
        });

        socketInstance.on('rideAccepted', (data) => {
          console.log('DriverHomeScreen (Socket Effect): Ride accepted confirmation:', data);
          setShowRideRequestModal(false);
          setCurrentRideRequest(null);
        });

        socketInstance.on('rideCancelled', (data) => {
          setCurrentRideRequest(prevRequest => {
            if (prevRequest && prevRequest.rideId === data.rideId) {
              setShowRideRequestModal(false);
              alert('The ride request was cancelled by the passenger.');
              return null;
            }
            return prevRequest;
          });
        });

        socketInstance.on('rideRemoved', (data) => {
          setCurrentRideRequest(prevRequest => {
            if (prevRequest && prevRequest.rideId === data.rideId) {
              setShowRideRequestModal(false);
              alert('This ride was accepted by another driver.');
              return null;
            }
            return prevRequest;
          });
        });
        socketInstance._hasListeners = true; // Mark that listeners are attached
      }

      // Cleanup function for when the component unmounts or user changes (logout)
      return () => {
        if (socketRef.current && socketRef.current._hasListeners) {
          console.log('DriverHomeScreen (Socket Effect): Cleaning up socket listeners and disconnecting.');
          socketRef.current.off('newRide');
          socketRef.current.off('rideAccepted');
          socketRef.current.off('rideCancelled');
          socketRef.current.off('rideRemoved');
          socketRef.current._hasListeners = false; // Reset flag
          disconnectSocket(true); // Disconnect the authenticated socket
          socketRef.current = null; // Clear ref
        }
      };
    } else {
      console.log('DriverHomeScreen (Socket Effect): User not a driver or token not available. Ensuring authenticated socket is disconnected.');
      if (socketRef.current) {
        disconnectSocket(true);
        socketRef.current = null;
      }
    }
  }, [user]); // Only re-run this effect when 'user' object changes

  const handleAcceptRide = () => {
    const socket = getAuthenticatedSocket();
    if (socket && currentRideRequest) {
      console.log('DriverHomeScreen: Emitting acceptRide for ride ID:', currentRideRequest.rideId);
      socket.emit('acceptRide', { rideId: currentRideRequest.rideId });
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
    } else {
      console.warn('DriverHomeScreen: Cannot accept ride, socket not connected or no current request.');
    }
  };

  const handleRejectRide = () => {
    const socket = getAuthenticatedSocket();
    if (socket && currentRideRequest) {
      console.log('DriverHomeScreen: Emitting rejectRide for ride ID:', currentRideRequest.rideId);
      socket.emit('rejectRide', { rideId: currentRideRequest.rideId });
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
      alert('Ride request rejected.');
    } else {
      console.warn('DriverHomeScreen: Cannot reject ride, socket not connected or no current request.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user || user.role !== 'driver') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Driver Home</h2>
        <p className="text-gray-600 mb-2">Welcome, <span className="font-semibold">{user.name}</span>!</p>
        <p className="text-gray-600 mb-6">Role: <span className="font-semibold capitalize">{user.role}</span></p>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Ride Requests</h3>
          <p className="text-gray-500 mb-4">Driver's available ride requests will appear here.</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>

      {showRideRequestModal && currentRideRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RideRequestModal
            rideDetails={currentRideRequest}
            onAccept={handleAcceptRide}
            onReject={handleRejectRide}
          />
        </div>
      )}
    </div>
  );
};

export default DriverHomeScreen;