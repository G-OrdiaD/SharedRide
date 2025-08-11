import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { rideService } from '../api';
import RideRequestModal from '../components/RideRequestModal';
import CustomAlertDialog from '../components/CustomAlertDialog';

const DriverHomeScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isDriver = useSelector((state) => state.auth.isDriver);
  const authStatus = useSelector((state) => state.auth.status);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showRideRequestModal, setShowRideRequestModal] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);
  const [newRideRequests, setNewRideRequests] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Navigation effect
  useEffect(() => {
    if (authStatus === 'succeeded' && (!user || !isDriver)) {
      console.log('Redirecting - user not authenticated or not a driver');
      navigate('/');
    }
  }, [user, authStatus, isDriver, navigate]);

  // Fetch ride requests with proper error handling
  const fetchNewRideRequests = useCallback(async () => {
    if (!token || isFetching) return;
    
    setIsFetching(true);
    try {
      const response = await rideService.getNewRides();
      const rides = response.data || response;
      
      // Filter only requests from the last 10 minutes
      const recentRides = rides.filter(ride => {
        const rideTime = new Date(ride.requestedAt).getTime();
        return (Date.now() - rideTime) < (10 * 60 * 1000); // 10 minutes
      });
      
      setNewRideRequests(recentRides);
      
      // Only show modal if there's a new ride
      if (!showRideRequestModal && !currentRideRequest && recentRides.length > 0) {
        setCurrentRideRequest(recentRides[0]);
        setShowRideRequestModal(true);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      setAlertMessage(error.message || 'Failed to fetch rides');
      setShowAlert(true);
      
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      setIsFetching(false);
    }
  }, [token, showRideRequestModal, currentRideRequest, dispatch, navigate, isFetching]);

  // Fetch rides when auth is ready and setup polling
  useEffect(() => {
    if (authStatus === 'succeeded' && isDriver && token) {
      fetchNewRideRequests();
      
      const interval = setInterval(fetchNewRideRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [authStatus, isDriver, token, fetchNewRideRequests]);

  const handleAcceptRide = async () => {
    if (!currentRideRequest) return;
    
    try {
      console.log('Accepting ride:', currentRideRequest.rideId || currentRideRequest._id);
      setAlertMessage(`Ride ${currentRideRequest.rideId || currentRideRequest._id} accepted!`);
      setShowAlert(true);
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
      setNewRideRequests(prev => prev.filter(r => 
        (r.rideId || r._id) !== (currentRideRequest.rideId || currentRideRequest._id)
      ));
    } catch (error) {
      console.error('Error accepting ride:', error);
      setAlertMessage(error.message || 'Failed to accept ride');
      setShowAlert(true);
    }
  };

  const handleRejectRide = async () => {
    if (!currentRideRequest) return;
    
    try {
      console.log('Rejecting ride:', currentRideRequest.rideId || currentRideRequest._id);
      setAlertMessage('Ride request rejected');
      setShowAlert(true);
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
      setNewRideRequests(prev => prev.filter(r => 
        (r.rideId || r._id) !== (currentRideRequest.rideId || currentRideRequest._id)
      ));
    } catch (error) {
      console.error('Error rejecting ride:', error);
      setAlertMessage(error.message || 'Failed to reject ride');
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

  if (authStatus !== 'succeeded') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Authenticating...</p>
      </div>
    );
  }

  if (!user || !isDriver) {
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
          {isFetching ? (
            <p className="text-gray-500 mb-4">Loading rides...</p>
          ) : newRideRequests.length === 0 ? (
            <p className="text-gray-500 mb-4">No new ride requests available</p>
          ) : (
            <ul className="space-y-3 text-left">
              {newRideRequests.map(ride => (
                <li
                  key={ride.rideId || ride._id}
                  className="bg-blue-50 p-3 rounded-md shadow-sm cursor-pointer hover:bg-blue-100 transition duration-200"
                  onClick={() => handleSelectRide(ride)}
                >
                  <p className="font-semibold">From: {ride.origin?.locationString || 'N/A'}</p>
                  <p>To: {ride.destination?.locationString || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    Type: <span className="capitalize">{ride.rideType || 'standard'}</span> | 
                    Fare: £{ride.fare ? ride.fare.toFixed(2) : 'N/A'}
                  </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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