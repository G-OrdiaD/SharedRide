const API_BASE_URL = 'http://localhost:5000';

const getHeaders = () => { // Set up headers for API requests
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('jwtToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleRequest = async (endpoint, options = {}) => { // Handle API requests with error handling
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || 'Request failed');
    }
    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

export const placesService = { // Service for interacting with Google Places API
  autocomplete: async (input) => {
    const data = await handleRequest(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
    if (data.status === 'REQUEST_DENIED') {
      throw new Error('API key rejected by Google');
    }
    return data;
  },
  getPlaceDetails: async (placeId) => {
    const data = await handleRequest(`/api/places/details?place_id=${encodeURIComponent(placeId)}`);
    if (data.status !== 'OK') {
      throw new Error('Invalid place details response');
    }
    return data;
  }
};

export const getHelloMessage = async () => handleRequest('/');

export const authService = { // Service for user authentication
  login: async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  },
  register: async ({ name, email, password, phone, isDriver }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role: isDriver ? 'driver' : 'passenger' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },
  getProfile: () => handleRequest('/api/auth/me')
  };

export const rideService = {
  requestRide: (rideData) => {

   // Validate coordinates before sending
    // if (!rideData?.origin?.location?.coordinates || 
    //   !rideData?.destination?.location?.coordinates || 
    //   !Array.isArray(rideData.origin.location.coordinates) ||
    //   !Array.isArray(rideData.destination.location.coordinates)) { 
    // console.log('Requesting ride with data:', rideData);
    // throw new Error(`Invalid location coordinates format: ${JSON.stringify(rideData)}`); 
    // }

    // Original implementation remains unchanged below
    return handleRequest('/api/rides/request', {
      method: 'POST',
      body: JSON.stringify(rideData)
    });
  },
  completeRide: (rideId) => {
    return handleRequest(`/api/rides/${rideId}/complete`, {
      method: 'PUT'
    });
  },
  getNewRides: () => {
    return handleRequest('/api/rides/new-rides');
  },
  acceptRide: (rideId) => {
    return handleRequest(`/api/rides/${rideId}/accept`, {
      method: 'PUT'
    });
  }
};

export const userService = { // Service for user profile management
  getProfile: () => handleRequest('/api/auth/me'),
  updateProfile: (data) => handleRequest('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};