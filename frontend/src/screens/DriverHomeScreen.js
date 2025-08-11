import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { rideService } from '../api';
import RideRequestModal from '../components/RideRequestModal';
import CustomAlertDialog from '../components/CustomAlertDialog';

const DriverHomeScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthReady = useSelector((state) => state.auth.status !== 'idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showRideRequestModal, setShowRideRequestModal] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);
  const [newRideRequests, setNewRideRequests] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);


  // This useEffect handles navigation based on auth status
  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'driver')) {
      console.log('DriverHomeScreen (Nav Effect): Redirecting - user not authenticated or not a driver. User:', user);
      navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  // Function to fetch all new ride requests from the API
  const fetchNewRideRequests = useCallback(async () => {
    if (user && user.token && user.role === 'driver') {
        try {
            console.log('Fetching all new ride requests...');
            const rides = await rideService.getNewRides();
            console.log('New ride requests fetched:', rides);
            setNewRideRequests(rides);

            // If no modal is currently open and new rides are available, show the latest one
            if (!showRideRequestModal && !currentRideRequest && rides.length > 0) {
                setCurrentRideRequest(rides[0]);
                setShowRideRequestModal(true);
            }
        } catch (error) {
            console.error('Error fetching new ride requests:', error);
            setAlertMessage(`Error fetching rides: ${error.message}`);
            setShowAlert(true);
        }
    } else {
        console.log('fetchNewRideRequests skipped: User not a driver or token not available.');
    }
  }, [user, showRideRequestModal, currentRideRequest]);


  // This useEffect will now only trigger the initial fetch of rides
  // To get "real-time" updates, you would need to implement a polling mechanism here.
  useEffect(() => {
    // CRITICAL: Only proceed if authentication is ready AND user is a driver with a token
    if (isAuthReady && user && user.token && user.role === 'driver') {
        console.log('DriverHomeScreen: User is a driver and token is available. Initiating ride fetch.');
        fetchNewRideRequests(); // Initial fetch

    } else {
        console.log('DriverHomeScreen: User not a driver or token not available (auth not ready or role mismatch).');
    }
  }, [user, isAuthReady, fetchNewRideRequests]);

  const handleAcceptRide = async () => {
    if (currentRideRequest) {
      try {
        console.log('DriverHomeScreen: Accepting ride ID:', currentRideRequest.rideId || currentRideRequest._id);
        // Simulate API call success
        setAlertMessage(`Ride ${currentRideRequest.rideId || currentRideRequest._id} accepted!`);
        setShowAlert(true);
        setShowRideRequestModal(false);
        setCurrentRideRequest(null);
        setNewRideRequests(prevRides => prevRides.filter(r => (r.rideId || r._id) !== (currentRideRequest.rideId || currentRideRequest._id)));

        fetchNewRideRequests(); // Refresh list after action
      } catch (error) {
        console.error('Error accepting ride:', error);
        setAlertMessage(`Error accepting ride: ${error.message}`);
        setShowAlert(true);
      }
    } else {
      console.warn('DriverHomeScreen: Cannot accept ride, no current request.');
      setAlertMessage('Cannot accept ride. No current request selected.');
      setShowAlert(true);
    }
  };

  const handleRejectRide = async () => { // Changed to async
    if (currentRideRequest) {
      try {
    
        console.log('DriverHomeScreen: Rejecting ride ID:', currentRideRequest.rideId || currentRideRequest._id);
        // Simulate API call success
        setAlertMessage('Ride request rejected.');
        setShowAlert(true);
        setShowRideRequestModal(false);
        setCurrentRideRequest(null);
        setNewRideRequests(prevRides => prevRides.filter(r => (r.rideId || r._id) !== (currentRideRequest.rideId || currentRideRequest._id)));

        fetchNewRideRequests(); // Refresh list after action
      } catch (error) {
        console.error('Error rejecting ride:', error);
        setAlertMessage(`Error rejecting ride: ${error.message}`);
        setShowAlert(true);
      }
    } else {
      console.warn('DriverHomeScreen: Cannot reject ride, no current request.');
      setAlertMessage('Cannot reject ride. No current request selected.');
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSelectRide = (ride) => {
    setCurrentRideRequest(ride);
    setShowRideRequestModal(true);
  };

  if (!user || user.role !== 'driver') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Redirecting to login or loading...</p>
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
                  key={ride.rideId || ride._id}
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
            onClose={() => {
                setShowRideRequestModal(false);
                setCurrentRideRequest(null);
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