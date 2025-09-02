import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import RideRequestForm from '../components/RideRequestForm';
import { rideService } from '../api';
import CustomAlertDialog from '../components/CustomAlertDialog';

const PassengerHomeScreen = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthReady = useSelector((state) => state.auth.status !== 'idle');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // STATE FOR ALERTS
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'passenger')) {
      navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // NAVIGATION HANDLER
  const handleGoHome = () => {
    navigate('/');
  };

  const handleRideRequest = async (rideData) => {
    try {
      const response = await rideService.requestRide(rideData);
      console.log('Ride requested successfully:', response);
      
      // SHOW SUCCESS MESSAGE WITH FARE
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
        {/* NAVIGATION BUTTON */}
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