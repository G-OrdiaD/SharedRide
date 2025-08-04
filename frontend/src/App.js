import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getHelloMessage } from './api';
import { connectSocket, disconnectSocket } from './socket'; // connectSocket is used below
import './App.css';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import AuthScreen from './screens/AuthScreen';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import DriverHomeScreen from './screens/DriverHomeScreen.js';
import RideScreen from './screens/RideScreen';
import { initializeAuth } from './features/authSlice';

function AppContent() {
    const [httpMessage, setHttpMessage] = useState('Loading HTTP message...');
    const [socketStatus, setSocketStatus] = useState('Connecting to Socket.IO...');
    const dispatch = useDispatch();
    const authStatus = useSelector((state) => state.auth.status);
    const user = useSelector((state) => state.auth.user); // Added for the redirect logic

    // Use a ref for the general socket to keep track of it across renders
    const generalSocketRef = React.useRef(null); // NEW: Ref to hold the general socket instance

    useEffect(() => {
        // Dispatch initializeAuth on component mount
        dispatch(initializeAuth());

        // HTTP Connection Test
        async function fetchMessage() {
            try {
                const response = await getHelloMessage();
                setHttpMessage(response.message); // Used here
            } catch (error) {
                setHttpMessage(`Error: ${error.message}`); // Used here
            }
        }
        fetchMessage();

        // Socket.IO Connection Test for general connectivity (explicitly no token)
        // Only connect if not already connected or if the ref is null
        if (!generalSocketRef.current || !generalSocketRef.current.connected) {
            console.log('AppContent: Connecting general unauthenticated socket...');
            generalSocketRef.current = connectSocket(null); // connectSocket is used here
        }

        const currentGeneralSocket = generalSocketRef.current; // Use the current ref value

        currentGeneralSocket.on('connect', () => {
            setSocketStatus('Socket.IO: Connected!'); // Used here
        });

        currentGeneralSocket.on('disconnect', () => {
            setSocketStatus('Socket.IO: Disconnected.'); // Used here
        });

        currentGeneralSocket.on('connect_error', (err) => {
            setSocketStatus(`Socket.IO Error: ${err.message}`); // Used here
        });

        return () => {
            // Clean up listeners and disconnect the general socket on unmount
            if (currentGeneralSocket) {
                currentGeneralSocket.off('connect');
                currentGeneralSocket.off('disconnect');
                currentGeneralSocket.off('connect_error');
                disconnectSocket(false); // disconnectSocket is used here
            }
        };
    }, [dispatch]); // Dependency array includes dispatch

    // Show a loading indicator if authentication is still in progress
    if (authStatus === 'initializing') {
        console.log('AppContent: Authentication is initializing...');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-700">Loading user session...</p>
            </div>
        );
    }

    // If authentication failed and user is null, and not on the login page, redirect.
    // This is a robust way to ensure unauthenticated users don't access protected routes.
    if (authStatus === 'failed' && !user && window.location.pathname !== '/') {
        console.log('AppContent: Authentication failed, redirecting to login.');
        // Using window.location.replace to prevent back button from going to a protected route
        // This is a simple redirect. For more complex routing, use useNavigate from react-router-dom
        // if AppContent had access to it (which it does via the Router context).
        // For simplicity here, if you're not already on '/', force a reload to '/'
        if (window.location.pathname !== '/') {
             window.location.replace('/');
        }
    }

    return (
        <div className="App">
            <div className="connection-banner">
                <h3>Backend Connection Status</h3>
                <p><strong>HTTP:</strong> {httpMessage}</p>
                <p><strong>Socket.IO:</strong> {socketStatus}</p>
            </div>

            <Routes>
                <Route path="/" element={<AuthScreen />} />
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