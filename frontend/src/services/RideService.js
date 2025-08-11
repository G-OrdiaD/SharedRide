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
  /**
   * Fetch available rides for drivers
   * @returns {Promise<Array>} List of available rides
   */
  getAvailableRides: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/available`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] getAvailableRides error:', error);
      throw error;
    }
  },

  /**
   * Request a new ride as passenger
   * @param {Object} rideData - { origin, destination, rideType }
   * @returns {Promise<Object>} Created ride object
   */
  requestRide: async (rideData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(rideData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] requestRide error:', error);
      throw error;
    }
  },

  /**
   * Accept a ride request (driver)
   * @param {string} rideId - ID of the ride to accept
   * @returns {Promise<Object>} Updated ride object
   */
  acceptRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/accept`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] acceptRide error:', error);
      throw error;
    }
  },

  /**
   * Reject a ride request (driver)
   * @param {string} rideId - ID of the ride to reject
   * @returns {Promise<Object>} Updated ride object
   */
  rejectRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/reject`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] rejectRide error:', error);
      throw error;
    }
  },

  /**
   * Get current active ride for user
   * @returns {Promise<Object|null>} Active ride or null if none
   */
  getActiveRide: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/active`, {
        headers: getAuthHeader()
      });
      if (response.status === 404) return null;
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] getActiveRide error:', error);
      throw error;
    }
  },

  /**
   * Complete a ride
   * @param {string} rideId - ID of the ride to complete
   * @returns {Promise<Object>} Completed ride object
   */
  completeRide: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/complete`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] completeRide error:', error);
      throw error;
    }
  },

  /**
   * Cancel a ride
   * @param {string} rideId - ID of the ride to cancel
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} Cancelled ride object
   */
  cancelRide: async (rideId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/cancel`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ reason })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] cancelRide error:', error);
      throw error;
    }
  },

  /**
   * Get ride details
   * @param {string} rideId - ID of the ride
   * @returns {Promise<Object>} Ride details
   */
  getRideDetails: async (rideId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] getRideDetails error:', error);
      throw error;
    }
  },

  /**
   * Get ride history for user
   * @param {Object} [filters] - Optional filters { limit, offset }
   * @returns {Promise<Array>} List of past rides
   */
  getRideHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/rides/history?${params}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('[RideService] getRideHistory error:', error);
      throw error;
    }
  }
};

export default rideService;