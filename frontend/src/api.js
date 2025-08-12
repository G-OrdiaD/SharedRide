const API_BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('jwtToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      throw new Error(errorData.message || 'Request failed');
    }
    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

export const placesService = {
  autocomplete: async (input) => {
    return handleRequest(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
  },
  getPlaceDetails: async (placeId) => {
    return handleRequest(`/api/places/details?place_id=${placeId}`);
  }
};

export const getHelloMessage = async () => handleRequest('/');

export const authService = {
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
  requestRide: (originLocation, destinationLocation, rideType) => {
    return handleRequest('/api/rides/request', {
      method: 'POST',
      body: JSON.stringify({ origin: originLocation, destination: destinationLocation, rideType })
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

export const userService = {
  getProfile: () => handleRequest('/api/auth/me'),
  updateProfile: (data) => handleRequest('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};