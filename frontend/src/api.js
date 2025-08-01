const API_BASE_URL = 'http://localhost:5000'; // Match your backend

/**
 * Enhanced API service with proper endpoint matching
 */

// Shared request headers
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('jwtToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Universal request handler
 * This function now correctly prepends the API_BASE_URL to the endpoint.
 * The endpoints passed to this function should now be the full relative path
 * from the base URL, including the /api/auth or /api/rides prefix.
 */
const handleRequest = async (endpoint, options = {}) => {
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
    throw error; // Re-throw for components to handle
  }
};

/**
 * Test endpoint connectivity
 */
export const getHelloMessage = async () => {
  return handleRequest('/'); // Assuming / is your backend's base health check
};

/**
 * Authentication service
 */
export const authService = {
  login: async ({ email, password }) => {
    // FIX: Corrected endpoint to include /api/auth prefix
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  },
  register: async ({ name, email, password, phone, isDriver }) => {
    // FIX: Corrected endpoint to include /api/auth prefix
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, phone, role: isDriver ? 'driver' : 'passenger' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  }
};

/**
 * Ride service
 */
export const rideService = {
  requestRide: (pickup, destination) => {
    // FIX: Corrected endpoint to include /api/rides prefix
    return handleRequest('/api/rides/request', {
      method: 'POST',
      body: JSON.stringify({ pickup, destination })
    });
  },

  completeRide: (rideId) => {
    // FIX: Corrected endpoint to include /api/rides prefix
    return handleRequest(`/api/rides/${rideId}/complete`, {
      method: 'PUT'
    });
  }
};

/**
 * User service (if needed)
 */
export const userService = {
  getProfile: () => handleRequest('/api/auth/me'), // Assuming /api/auth/me is the correct endpoint for user profile
  updateProfile: (data) => handleRequest('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};