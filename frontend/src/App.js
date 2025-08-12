import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/authSlice';
import { placesService } from './api';
import IndexScreen from './screens/IndexScreen';
import AuthScreen from './screens/AuthScreen';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import DriverHomeScreen from './screens/DriverHomeScreen';
import RideScreen from './screens/RideScreen';

function AppContent() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const [locationInput, setLocationInput] = useState(''); // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);

  // Initialize auth (existing code)
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Autocomplete fetch function
  const fetchAutocomplete = async (query) => {
    if (query.length < 3) return; // Only fetch after 3+ characters
    try {
      const response = await fetch(`/api/places/autocomplete?input=${query}`);
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  // Loading state (existing code)
  if (authStatus === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Loading user session...</p>
      </div>
    );
  }

  return (
    <>
      {/* Autocomplete UI (add this where you want it) */}
      <div className="p-4">
        <input
          type="text"
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value);
            fetchAutocomplete(e.target.value);
          }}
          placeholder="Search for a place..."
          className="w-full p-2 border rounded"
        />
        {suggestions.length > 0 && (
          <ul className="mt-1 border rounded shadow-lg">
            {suggestions.map((item) => (
              <li
                key={item.place_id}
                onClick={() => setLocationInput(item.description)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {item.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Existing routes (unchanged) */}
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