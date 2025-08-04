import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { connectSocket, disconnectSocket, getAuthenticatedSocket } from '../socket';
import { rideService } from '../api'; // Import rideService
import RideRequestModal from '../components/RideRequestModal';
import CustomAlertDialog from '../components/CustomAlertDialog';

const DriverHomeScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthReady = useSelector((state) => state.auth.status !== 'idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showRideRequestModal, setShowRideRequestModal] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);
  const [newRideRequests, setNewRideRequests] = useState([]); // State to hold all available rides
  const [alertMessage, setAlertMessage] = useState(''); // For custom alerts
  const [showAlert, setShowAlert] = useState(false);

  const socketRef = useRef(null);
  const listenersSetRef = useRef(false); // New ref to track if listeners are set for this socket instance

  // This useEffect handles navigation based on auth status
  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'driver')) {
      console.log('DriverHomeScreen (Nav Effect): Redirecting - user not authenticated or not a driver.');
      navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  // Function to fetch all new ride requests from the API
  const fetchNewRideRequests = useCallback(async () => {
    try {
      console.log('Fetching all new ride requests...');
      const rides = await rideService.getNewRides();
      console.log('New ride requests fetched:', rides);
      setNewRideRequests(rides);

      // If no modal is currently active, and there are new rides, show the latest one
      if (!showRideRequestModal && !currentRideRequest && rides.length > 0) {
        setCurrentRideRequest(rides[0]); // Display the newest one first
        setShowRideRequestModal(true);
      }
    } catch (error) {
      console.error('Error fetching new ride requests:', error);
      setAlertMessage(`Error fetching rides: ${error.message}`);
      setShowAlert(true);
    }
  }, [showRideRequestModal, currentRideRequest]); // Depend on modal/current request state for conditional showing

  // This useEffect handles the Socket.IO connection and listeners
  useEffect(() => {
    if (user && user.token && user.role === 'driver') {
      console.log('DriverHomeScreen (Socket Effect): User is a driver and token is available.');

      // Connect the authenticated socket if it's not already connected or valid
      if (!socketRef.current || !socketRef.current.connected || socketRef.current.auth.token !== user.token) {
        console.log('DriverHomeScreen (Socket Effect): Attempting to connect/reconnect authenticated socket.');
        socketRef.current = connectSocket(user.token);
        listenersSetRef.current = false; // Reset listeners flag for new socket instance
      } else {
        console.log('DriverHomeScreen (Socket Effect): Authenticated socket already connected. Reusing.');
      }

      const socketInstance = socketRef.current;

      // Only set up listeners if they haven't been set up for this socket instance
      if (socketInstance && !listenersSetRef.current) {
        console.log('DriverHomeScreen (Socket Effect): Setting up new Socket.IO listeners.');

        // Listener for successful reconnection (after initial connect or disconnect)
        socketInstance.on('connect', () => {
          console.log('DriverHomeScreen: Authenticated socket reconnected. Fetching new rides...');
          fetchNewRideRequests(); // Refetch pending rides on reconnect
        });

        socketInstance.on('newRide', (ride) => {
          console.log('DriverHomeScreen (Socket Effect): >>> New ride request RECEIVED by frontend! <<<', ride);
          setNewRideRequests(prevRides => {
            const updatedRides = [ride, ...prevRides.filter(r => r.rideId !== ride.rideId && r._id !== ride.rideId)];
            // Optionally sort here if needed, but adding to front keeps newest first if API isn't always sorted
            return updatedRides;
          });
          // If no modal is currently open, display this new incoming ride
          if (!showRideRequestModal) {
            setCurrentRideRequest(ride);
            setShowRideRequestModal(true);
          }
        });

        socketInstance.on('rideAccepted', (data) => {
          console.log('DriverHomeScreen (Socket Effect): Ride accepted confirmation:', data);
          setShowRideRequestModal(false);
          setCurrentRideRequest(null);
          // Remove accepted ride from the list
          setNewRideRequests(prevRides => prevRides.filter(r => r.rideId !== data.rideId && r._id !== data.rideId));
          setAlertMessage(`Ride ${data.rideId} accepted!`);
          setShowAlert(true);
        });

        socketInstance.on('rideCancelled', (data) => {
          setCurrentRideRequest(prevRequest => {
            if (prevRequest && (prevRequest.rideId === data.rideId || prevRequest._id === data.rideId)) {
              setShowRideRequestModal(false);
              setAlertMessage('The ride request was cancelled by the passenger.');
              setShowAlert(true);
              return null;
            }
            return prevRequest;
          });
          setNewRideRequests(prevRides => prevRides.filter(r => r.rideId !== data.rideId && r._id !== data.rideId));
        });

        socketInstance.on('rideRemoved', (data) => {
          setCurrentRideRequest(prevRequest => {
            if (prevRequest && (prevRequest.rideId === data.rideId || prevRequest._id === data.rideId)) {
              setShowRideRequestModal(false);
              setAlertMessage('This ride was accepted by another driver.');
              setShowAlert(true);
              return null;
            }
            return prevRequest;
          });
          setNewRideRequests(prevRides => prevRides.filter(r => r.rideId !== data.rideId && r._id !== data.rideId));
        });

        // Set error listener for auth issues
        socketInstance.on('connect_error', (err) => {
          console.error('DriverHomeScreen: Socket connection error:', err.message);
          setAlertMessage(`Socket connection error: ${err.message}. Please try logging in again.`);
          setShowAlert(true);
          if (err.message.includes('Authentication error')) {
            dispatch(logout());
            navigate('/');
          }
        });

        listenersSetRef.current = true; // Mark that listeners are attached
      }

      // Initial fetch of new ride requests when component mounts or user becomes driver
      fetchNewRideRequests();

      // Cleanup function for when the component unmounts or user changes (logout)
      return () => {
        if (socketRef.current && listenersSetRef.current) {
          console.log('DriverHomeScreen (Socket Effect): Cleaning up socket listeners and disconnecting.');
          socketRef.current.off('connect');
          socketRef.current.off('newRide');
          socketRef.current.off('rideAccepted');
          socketRef.current.off('rideCancelled');
          socketRef.current.off('rideRemoved');
          socketRef.current.off('connect_error');
          listenersSetRef.current = false; // Reset flag
          disconnectSocket(true); // Disconnect the authenticated socket
          socketRef.current = null; // Clear ref
        }
      };
    } else {
      console.log('DriverHomeScreen (Socket Effect): User not a driver or token not available. Ensuring authenticated socket is disconnected.');
      if (socketRef.current) {
        disconnectSocket(true);
        socketRef.current = null;
        listenersSetRef.current = false; // Reset flag
      }
    }
  }, [user, dispatch, navigate, fetchNewRideRequests, showRideRequestModal]); // Added showRideRequestModal to dependencies

  const handleAcceptRide = () => {
    const socket = getAuthenticatedSocket();
    if (socket && currentRideRequest) {
      console.log('DriverHomeScreen: Emitting acceptRide for ride ID:', currentRideRequest.rideId || currentRideRequest._id);
      // Use _id from API fetch or rideId from Socket.IO emit
      socket.emit('acceptRide', { rideId: currentRideRequest.rideId || currentRideRequest._id });
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
      // Optimistically remove from local state
      setNewRideRequests(prevRides => prevRides.filter(r => (r.rideId || r._id) !== (currentRideRequest.rideId || currentRideRequest._id)));
    } else {
      console.warn('DriverHomeScreen: Cannot accept ride, socket not connected or no current request.');
      setAlertMessage('Cannot accept ride. Please ensure you are connected and a ride request is selected.');
      setShowAlert(true);
    }
  };

  const handleRejectRide = () => {
    const socket = getAuthenticatedSocket();
    if (socket && currentRideRequest) {
      console.log('DriverHomeScreen: Emitting rejectRide for ride ID:', currentRideRequest.rideId || currentRideRequest._id);
      socket.emit('rejectRide', { rideId: currentRideRequest.rideId || currentRideRequest._id });
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
      // Remove rejected ride from the list
      setNewRideRequests(prevRides => prevRides.filter(r => (r.rideId || r._id) !== (currentRideRequest.rideId || currentRideRequest._id)));
      setAlertMessage('Ride request rejected.');
      setShowAlert(true);
    } else {
      console.warn('DriverHomeScreen: Cannot reject ride, socket not connected or no current request.');
      setAlertMessage('Cannot reject ride. Please ensure you are connected and a ride request is selected.');
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Function to handle clicking on a ride from the list
  const handleSelectRide = (ride) => {
    setCurrentRideRequest(ride);
    setShowRideRequestModal(true);
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
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Ride Requests</h3>
          {newRideRequests.length === 0 ? (
            <p className="text-gray-500 mb-4">No new ride requests at the moment. Waiting for passengers...</p>
          ) : (
            <ul className="space-y-3 text-left">
              {newRideRequests.map(ride => (
                <li
                  key={ride.rideId || ride._id} // Use rideId from socket, or _id from API for consistency
                  className="bg-blue-50 p-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-100 transition duration-200"
                  onClick={() => handleSelectRide(ride)}
                >
                  <p className="font-semibold">From: {ride.origin.locationString}</p>
                  <p>To: {ride.destination.locationString}</p>
                  <p className="text-sm text-gray-600">Type: <span className="capitalize">{ride.rideType}</span> | Fare: ${ride.fare ? ride.fare.toFixed(2) : 'N/A'}</p>
                </li>
              ))}
            </ul>
          )}
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
            onClose={() => { // Added onClose functionality
                setShowRideRequestModal(false);
                setCurrentRideRequest(null); // Clear the current request if modal is closed
            }}
          />
        </div>
      )}

      {showAlert && (
          <CustomAlertDialog
              message={alertMessage}
              onClose={() => setShowAlert(false)}
          />
      )}
    </div>
  );
};

export default DriverHomeScreen;