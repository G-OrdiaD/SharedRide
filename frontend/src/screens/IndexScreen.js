import React from 'react';
import { useNavigate } from 'react-router-dom';

const IndexScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="centered-page">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-dark mb-4">Welcome to SharedRide</h1>
        <p className="text-xl text-gray-medium mb-8">For an awesome ride experience</p>
        
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => navigate('/auth')}
            className="btn-maroon"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth?register=true')}
            className="btn-maroon"
          >
            Register
          </button>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Safe Rides</h3>
          <p>Verified drivers for your safety</p>
        </div>
        <div className="card">
          <h3>Affordable</h3>
          <p>Competitive pricing</p>
        </div>
        <div className="card">
          <h3>24/7 Service</h3>
          <p>Available anytime</p>
        </div>
      </div>
    </div>
  );
};

export default IndexScreen;