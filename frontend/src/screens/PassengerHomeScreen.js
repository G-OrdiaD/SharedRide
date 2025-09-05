import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import RideRequestForm from '../components/RideRequestForm';
import rideService from '../services/rideService';
import CustomAlertDialog from '../components/CustomAlertDialog';

const PassengerHomeScreen = () => {
  const user = useSelector(state => state.auth.user);
  const isAuthReady = useSelector(state => state.auth.status !== 'idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [isFetchingRide, setIsFetchingRide] = useState(false);

  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'passenger')) navigate('/');
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    const fetchActiveRide = async () => {
      setIsFetchingRide(true);
      try {
        const ride = await rideService.getActiveRide();
        setCurrentRide(ride || null);
      } catch (error) {
        console.error('Error fetching active ride:', error);
      } finally {
        setIsFetchingRide(false);
      }
    };
    fetchActiveRide();
    const interval = setInterval(fetchActiveRide, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };
  const handleGoHome = () => navigate('/');
  const handleGoToWallet = () => navigate('/passenger/wallet');
  const handleGoToProfile = () => navigate('/passenger/profile');

  const handleRideRequest = async (rideData) => {
    try {
      rideData.origin.location.coordinates = [
        rideData.origin.location.coordinates[0],
        rideData.origin.location.coordinates[1]
      ];
      rideData.destination.location.coordinates = [
        rideData.destination.location.coordinates[0],
        rideData.destination.location.coordinates[1]
      ];

      const response = await rideService.requestRide(rideData);
      setAlertMessage(`Ride booked successfully! Fare: £${response.fare?.toFixed(2) || 'Calculating...'}`);
      setShowAlert(true);
      setCurrentRide(response);
    } catch (error) {
      console.error('Failed to request ride:', error);
      setAlertMessage(error.message || 'Failed to request ride');
      setShowAlert(true);
    }
  };

  if (!user || user.role !== 'passenger') return <p>Redirecting to login...</p>;

  return (
    <div className="min-h-screen bg-silver flex flex-col items-center p-4 font-modern">
      
      {/* Blue Header Rectangle */}
      <div style={{backgroundColor: '#1E40AF', width: '100%', padding: '0.75rem 1.5rem', marginBottom: '1.5rem'}}>
        <div style={{maxWidth: '28rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '0.5rem'}}>
          <button
            onClick={handleGoHome}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Home
          </button>
          <button
            onClick={handleGoToWallet}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Wallet
          </button>
          <button
            onClick={handleGoToProfile}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Rest of the component remains exactly the same */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">

          <p className="text-gray-700 mb-2">Welcome, <span className="font-semibold">{user.name}</span>!</p>

          <div className="border-t border-gray-200 pt-6 mt-6 text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Book a Ride</h3>
            <RideRequestForm onSubmit={handleRideRequest} />
          </div>

          {isFetchingRide ? <p className="mt-4">Checking for active rides...</p> :
            currentRide && currentRide.driver ? (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <h3 className="font-semibold">Your Driver</h3>
                <p>Name: {currentRide.driver.name}</p>
                <p>Vehicle Number: {currentRide.driver.vehicle?.licensePlate || 'N/A'}</p>
                <p>Model: {currentRide.driver.vehicle?.model || 'N/A'}</p>
                <p>Color: {currentRide.driver.vehicle?.color || 'N/A'}</p>
              </div>
            ) : <p className="mt-4">No active rides at the moment</p>
          }

        </div>
      </div>

      {showAlert && <CustomAlertDialog message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default PassengerHomeScreen;