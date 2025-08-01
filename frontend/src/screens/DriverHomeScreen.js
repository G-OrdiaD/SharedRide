import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice'; // Import the logout action

const DriverHomeScreen = () => {
  // Access user data from Redux store
  const user = useSelector((state) => state.auth.user);
  const isAuthReady = useSelector((state) => state.auth.status !== 'idle'); // Check if auth state has been initialized
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Basic route protection: Redirect if not authenticated or not a driver
  useEffect(() => {
    // Only check after auth state is no longer 'idle' (meaning initial load/check is done)
    if (isAuthReady && (!user || user.role !== 'driver')) {
      navigate('/'); // Redirect to AuthScreen if not logged in or not a driver
    }
  }, [user, isAuthReady, navigate]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/'); // Redirect to the authentication screen after logout
  };

  // Render content only if user is authenticated and is a driver
  if (!user || user.role !== 'driver') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Redirecting to login...</p>
      </div>
    ); // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Driver Home</h2>
        <p className="text-gray-600 mb-2">Welcome, <span className="font-semibold">{user.name}</span>!</p>
        {/* Removed email display as requested */}
        <p className="text-gray-600 mb-6">Role: <span className="font-semibold capitalize">{user.role}</span></p>

        {/* Placeholder for driver-specific features */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Ride Requests</h3>
          <p className="text-gray-500 mb-4">Driver's available ride requests will appear here.</p>
          {/* Future: <DriverRideRequests /> */}
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DriverHomeScreen;
