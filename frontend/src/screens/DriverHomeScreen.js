import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import rideService from '../services/RideService';
import RideRequestModal from '../components/RideRequestModal';
import CustomAlertDialog from '../components/CustomAlertDialog';

const DriverHomeScreen = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const isDriver = useSelector(state => state.auth.isDriver);
  const authStatus = useSelector(state => state.auth.status);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showRideRequestModal, setShowRideRequestModal] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);
  const [newRideRequests, setNewRideRequests] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [acceptedRides, setAcceptedRides] = useState(new Set());

  useEffect(() => {
    if (authStatus === 'succeeded' && (!user || !isDriver)) navigate('/');
  }, [user, authStatus, isDriver, navigate]);

  const fetchNewRideRequests = useCallback(async () => {
    if (!token || isFetching) return;
    setIsFetching(true);
    try {
      const rides = await rideService.getAvailableRides();
      const recentRides = rides.filter(ride => !acceptedRides.has(ride._id));
      setNewRideRequests(recentRides);

      if (!showRideRequestModal && recentRides.length > 0) {
        setCurrentRideRequest(recentRides[0]);
        setShowRideRequestModal(true);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      setAlertMessage(error.message || 'Failed to fetch rides');
      setShowAlert(true);
      if (error.response?.status === 401) {
        dispatch(logout());
        navigate('/');
      }
    } finally {
      setIsFetching(false);
    }
  }, [token, showRideRequestModal, acceptedRides, dispatch, navigate, isFetching]);

  useEffect(() => {
    if (authStatus === 'succeeded' && isDriver && token) {
      fetchNewRideRequests();
      const interval = setInterval(fetchNewRideRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [authStatus, isDriver, token, fetchNewRideRequests]);

  const handleAcceptRide = async () => {
    if (!currentRideRequest) return;
    try {
      const ride = await rideService.acceptRide(currentRideRequest._id);
      setAcceptedRides(prev => new Set(prev).add(currentRideRequest._id));
      setNewRideRequests(prev => prev.filter(r => r._id !== currentRideRequest._id));
      setAlertMessage(`Ride accepted! Fare: £${ride.fare?.toFixed(2) || 'N/A'}`);
      setShowAlert(true);
      setShowRideRequestModal(false);
      setCurrentRideRequest(null);
    } catch (error) {
      console.error('Error accepting ride:', error);
      setAlertMessage(error.message || 'Failed to accept ride');
      setShowAlert(true);
    }
  };

  const handleRejectRide = () => {
    if (!currentRideRequest) return;
    setAcceptedRides(prev => new Set(prev).add(currentRideRequest._id));
    setNewRideRequests(prev => prev.filter(r => r._id !== currentRideRequest._id));
    setAlertMessage('Ride request rejected');
    setShowAlert(true);
    setShowRideRequestModal(false);
    setCurrentRideRequest(null);
  };

  const handleLogout = () => { dispatch(logout()); navigate('/'); };
  const handleGoHome = () => navigate('/');

  if (authStatus !== 'succeeded') return <p>Authenticating...</p>;
  if (!user || !isDriver) return <p>Redirecting to login...</p>;

  return (
    <div className="min-h-screen bg-silver flex flex-col items-center p-4 font-modern">
      
      {/* Blue Header Rectangle */}
      <div style={{backgroundColor: '#1E40AF', width: '100%', padding: '0.75rem 1.5rem', marginBottom: '1.5rem'}}>
        <div style={{maxWidth: '28rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between'}}>
          <button
            onClick={handleGoHome}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer'}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            ← Home
          </button>
          <button
            onClick={handleLogout}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer'}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Driver Dashboard</h2>
          <p className="text-gray-700 mb-2">Welcome, <span className="font-semibold">{user.name}</span>!</p>
    
          <div className="border-t border-gray-200 pt-6 mt-6 text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Ride Requests</h3>
            {isFetching ? <p>Loading rides...</p> :
              newRideRequests.length === 0 ? <p>No new ride requests</p> :
              <ul>
                {newRideRequests.map(ride => (
                  <li
                    key={ride._id}
                    className="bg-blue-50 p-3 rounded-md cursor-pointer hover:bg-blue-100 mb-2"
                    onClick={() => { setCurrentRideRequest(ride); setShowRideRequestModal(true); }}
                  >
                    <p>From: {ride.origin.locationString}</p>
                    <p>To: {ride.destination.locationString}</p>
                    <p>Fare: £{ride.fare?.toFixed(2) || 'N/A'}</p>
                    {ride.passenger?.name && <p>Passenger: {ride.passenger.name}</p>}
                  </li>
                ))}
              </ul>
            }
          </div>
        </div>
      </div>

      {showRideRequestModal && currentRideRequest && (
        <RideRequestModal
          rideDetails={currentRideRequest}
          onAccept={handleAcceptRide}
          onReject={handleRejectRide}
          onClose={() => { setShowRideRequestModal(false); setCurrentRideRequest(null); }}
        />
      )}

      {showAlert && <CustomAlertDialog message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default DriverHomeScreen;