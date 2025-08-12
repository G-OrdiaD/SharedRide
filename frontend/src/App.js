import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/authSlice';
import IndexScreen from './screens/IndexScreen';
import AuthScreen from './screens/AuthScreen';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import DriverHomeScreen from './screens/DriverHomeScreen';
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
    <>
      <Routes>
        <Route path="/" element={<IndexScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/passenger" element={<PassengerHomeScreen />} />
        <Route path="/driver" element={<DriverHomeScreen />} />
        <Route path="/ride" element={<RideScreen />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
