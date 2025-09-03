import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import RideRequestForm from '../components/RideRequestForm';
import rideService from '../services/RideService';
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

  const handleRideRequest = async (rideData) => {
    try {
      rideData.origin.location.coordinates = [rideData.origin.location.coordinates[0], rideData.origin.location.coordinates[1]];
      rideData.destination.location.coordinates = [rideData.destination.location.coordinates[0], rideData.destination.location.coordinates[1]];

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleGoHome} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">← Home</button>
          <h2 className="text-2xl font-bold text-gray-800">Passenger Dashboard</h2>
        </div>

        <p>Welcome, {user.name}</p>
        <p>Role: {user.role}</p>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3>Book a Ride</h3>
          <RideRequestForm onSubmit={handleRideRequest} />
        </div>

        {isFetchingRide ? <p>Checking for active rides...</p> :
          currentRide && currentRide.driver ? (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <h3>Your Driver</h3>
              <p>Name: {currentRide.driver.name}</p>
              <p>Vehicle Number: {currentRide.driver.vehicle?.licensePlate || 'N/A'}</p>
              <p>Model: {currentRide.driver.vehicle?.model || 'N/A'}</p>
              <p>Color: {currentRide.driver.vehicle?.color || 'N/A'}</p>
            </div>
          ) : <p>No active rides at the moment.</p>
        }

        <button onClick={handleLogout} className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md">Logout</button>
      </div>

      {showAlert && <CustomAlertDialog message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default PassengerHomeScreen;
