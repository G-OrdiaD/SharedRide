import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/authSlice';

import IndexScreen from './screens/IndexScreen';
import Auth from './components/Auth';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import PassengerProfile from './screens/PassengerProfile';
import PassengerWallet from './screens/PassengerWallet';
import DriverHomeScreen from './screens/DriverHomeScreen'
import DriverProfile from './screens/DriverProfile';
import DriverEarnings from './screens/DriverEarnings';
import RideScreen from './screens/RideScreen';

function AppContent() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (authStatus === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Loading user session...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<IndexScreen />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/passenger" element={<PassengerHomeScreen />} />
      <Route path="/driver" element={<DriverHomeScreen />} />
      <Route path="/ride" element={<RideScreen />} />
      <Route path="/passenger/wallet" element={<PassengerWallet />} />
      <Route path="/passenger/profile" element={<PassengerProfile />} />
      <Route path="/driver/earnings" element={<DriverEarnings />} />
      <Route path="/driver/profile" element={<DriverProfile />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}