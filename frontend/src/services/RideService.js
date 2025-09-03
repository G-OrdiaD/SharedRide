const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

const rideService = {
  getAvailableRides: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/available`, { headers: getAuthHeader() });
      const rides = await handleResponse(response);
      return rides.map(ride => ({
        ...ride,
        _id: ride._id.toString(),
        driver: ride.driver ? {
          name: ride.driver.name,
          licensePlate: ride.driver.vehicle?.licensePlate || '',
          make: ride.driver.vehicle?.make || '',
          model: ride.driver.vehicle?.model || '',
          color: ride.driver.vehicle?.color || ''
        } : null
      }));
    } catch (error) {
      console.error('[RideService] getAvailableRides error:', error);
      throw error;
    }
  },

  requestRide: async (rideData) => {
    try {
      const validateCoords = (coords) => {
        if (!Array.isArray(coords) || coords.length !== 2 || 
            typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
          throw new Error('Invalid coordinates format');
        }
      };
      validateCoords(rideData.origin.location.coordinates);
      validateCoords(rideData.destination.location.coordinates);

      const response = await fetch(`${API_BASE_URL}/rides/request`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          origin: { locationString: rideData.origin.locationString, location: { type: 'Point', coordinates: rideData.origin.location.coordinates } },
          destination: { locationString: rideData.destination.locationString, location: { type: 'Point', coordinates: rideData.destination.location.coordinates } },
          rideType: rideData.rideType
        })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] requestRide error:', error);
      throw error;
    }
  },

  acceptRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/accept`, { method: 'POST', headers: getAuthHeader() });
      const ride = await handleResponse(response);
      if (ride.driver) {
        ride.driver = {
          name: ride.driver.name,
          licensePlate: ride.driver.vehicle?.licensePlate || '',
          make: ride.driver.vehicle?.make || '',
          model: ride.driver.vehicle?.model || '',
          color: ride.driver.vehicle?.color || ''
        };
      }
      return ride;
    } catch (error) {
      console.error('[RideService] acceptRide error:', error);
      throw error;
    }
  },

  rejectRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/reject`, { method: 'POST', headers: getAuthHeader() });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] rejectRide error:', error);
      throw error;
    }
  },

  getActiveRide: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/active`, { headers: getAuthHeader() });
      if (response.status === 404) return null;
      const ride = await handleResponse(response);
      if (ride.driver) {
        ride.driver.vehicle = ride.driver.vehicle || {};
      }
      return ride;
    } catch (error) {
      console.error('[RideService] getActiveRide error:', error);
      throw error;
    }
  },

  completeRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/complete`, { method: 'POST', headers: getAuthHeader() });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] completeRide error:', error);
      throw error;
    }
  }
};

export default rideService;