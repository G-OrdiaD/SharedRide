const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Backend API base URL

// Helper to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    console.error('No token found in localStorage'); // Log missing token
    return { 'Content-Type': 'application/json' }; // Return without Authorization
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper to handle fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// RideService
const rideService = {
 // Fetch new ride requests for drivers
  getNewRides: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/new-rides`, { 
        headers: getAuthHeader() 
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('[RideService] getNewRides error:', error);
      throw error;
    }
  },

// Request a new ride
  requestRide: async (rideData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/request`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(rideData)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('[RideService] requestRide error:', error);
      throw error;
    }
  },

  // Driver accepts a ride
  acceptRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/accept`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('[RideService] acceptRide error:', error);
      throw error;
    }
  },

  // Driver completes a ride
  completeRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/complete`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('[RideService] completeRide error:', error);
      throw error;
    }
  }
};

export default rideService; // Exporting as default for easier imports