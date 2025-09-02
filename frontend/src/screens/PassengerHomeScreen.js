import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import RideRequestForm from '../components/RideRequestForm';
import rideService  from '../services/RideService';
import CustomAlertDialog from '../components/CustomAlertDialog';

const PassengerHomeScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthReady = useSelector((state) => state.auth.status !== 'idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // STATE
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [isFetchingRide, setIsFetchingRide] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'passenger')) {
      navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  // Fetch active ride and poll every 10 seconds
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
    const interval = setInterval(fetchActiveRide, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRideRequest = async (rideData) => {
    try {
      const response = await rideService.requestRide(rideData);
      console.log('Ride requested successfully:', response);
      setAlertMessage(`Ride booked successfully! Fare: £${response.fare?.toFixed(2) || 'Calculating...'}`);
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to request ride:', error);
      setAlertMessage(error.message || 'Failed to request ride');
      setShowAlert(true);
    }
  };

  if (!user || user.role !== 'passenger') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* NAVIGATION */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleGoHome}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            ← Home
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Passenger Dashboard</h2>
        </div>

        <p className="text-gray-600 mb-2">Welcome, <span className="font-semibold">{user.name}</span>!</p>
        <p className="text-gray-600 mb-6">Role: <span className="font-semibold capitalize">{user.role}</span></p>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Book a Ride</h3>
          <RideRequestForm onSubmit={handleRideRequest} />
        </div>

        {/* Active Ride & Driver Info */}
        {isFetchingRide ? (
          <p className="text-gray-500 mt-6">Checking for active rides...</p>
        ) : currentRide && currentRide.driver ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Driver</h3>
            <p><span className="font-semibold">Name:</span> {currentRide.driver.name}</p>
            <p><span className="font-semibold">Vehicle Number:</span> {currentRide.driver.vehicle?.licensePlate || 'N/A'}</p>
            <p><span className="font-semibold">Model:</span> {currentRide.driver.vehicle?.model || 'N/A'}</p>
            <p><span className="font-semibold">Color:</span> {currentRide.driver.vehicle?.color || 'N/A'}</p>
          </div>
        ) : (
          <p className="text-gray-500 mt-6">No active rides at the moment.</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>

      {/* ALERT DIALOG */}
      {showAlert && (
        <CustomAlertDialog
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default PassengerHomeScreen;