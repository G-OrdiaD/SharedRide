import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getHelloMessage } from './api';
import './App.css';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import IndexPage from './index';
import AuthScreen from './screens/AuthScreen';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import DriverHomeScreen from './screens/DriverHomeScreen.js';
import RideScreen from './screens/RideScreen';
import { initializeAuth } from './features/authSlice';

function AppContent() {
    const [httpMessage, setHttpMessage] = useState('Loading HTTP message...');
    const dispatch = useDispatch();
    const authStatus = useSelector((state) => state.auth.status);
    const user = useSelector((state) => state.auth.user);


    useEffect(() => {
        // Dispatch initializeAuth on component mount
        dispatch(initializeAuth());

        // HTTP Connection Test
        async function fetchMessage() {
            try {
                const response = await getHelloMessage();
                setHttpMessage(response.message);
            } catch (error) {
                setHttpMessage(`Error: ${error.message}`);
            }
        }
        fetchMessage();

    }, [dispatch]);

    // Wait for authentication to be succeeded or failed before rendering main routes
    if (authStatus === 'initializing') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-700">Loading user session...</p>
            </div>
        );
    }

    // If authentication failed and user is null, and not on the login page, redirect.
    if (authStatus === 'failed' && !user && window.location.pathname !== '/') {
        window.location.replace('/');
        return null;
    }

    return (
        <div className="App">
            <div className="connection-banner">
                <h3>Backend Connection Status</h3>
                <p><strong>HTTP:</strong> {httpMessage}</p>
                {/* Removed: <p><strong>Socket.IO:</strong> {socketStatus}</p> */}
            </div>

            <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/auth" element={<AuthScreen />} />
                <Route path="/passenger" element={<PassengerHomeScreen />} />
                <Route path="/driver" element={<DriverHomeScreen />} />
                <Route path="/ride" element={<RideScreen />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AppContent />
            </Router>
        </Provider>
    );
}

export default App;