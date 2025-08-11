import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import './App.css';

const App = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to SharedRide</h1>
        <p className="text-xl text-gray-600 mb-8">For an awesome ride experience</p>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="bg-peach-primary hover:bg-peach-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth?register=true')}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg border border-gray-300"
          >
            Register
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg mb-2">Safe Rides</h3>
          <p className="text-gray-600">Verified drivers for your safety</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg mb-2">Affordable</h3>
          <p className="text-gray-600">Competitive pricing</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg mb-2">24/7 Service</h3>
          <p className="text-gray-600">Available anytime</p>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);