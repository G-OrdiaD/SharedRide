const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Enhanced API service with guaranteed safe response formats
 */

// Shared request headers with TypeScript-like type safety
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
 * Universal request handler with response normalization
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

    const data = await response.json();
    
    // Normalize response to always return object with data/message
    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Request successful'
    };
    
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    
    // Normalize error response
    return {
      success: false,
      message: error.message || 'Network error',
      error: error
    };
  }
};

/**
 * Test endpoint with guaranteed string return
 */
export const getHelloMessage = async () => {
  const response = await handleRequest('/hello');
  return response.success 
    ? String(response.message || response.data || 'Hello from backend')
    : response.message;
};

/**
 * Authentication service
 */
export const authService = {
  login: async (email, password) => {
    const response = await handleRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.data?.token) {
      localStorage.setItem('jwtToken', response.data.token);
    }
    
    return response;
  },
  
  logout: () => {
    localStorage.removeItem('jwtToken');
  }
};

/**
 * Ride service with normalized responses
 */
export const rideService = {
  requestRide: async (pickup, destination) => {
    const response = await handleRequest('/rides/request', {
      method: 'POST',
      body: JSON.stringify({ pickup, destination })
    });
    
    return {
      ...response,
      rideId: response.data?.id || null
    };
  },
  
  getStatus: async (rideId) => {
    const response = await handleRequest(`/rides/status/${rideId}`);
    return {
      ...response,
      status: response.data?.status || 'unknown'
    };
  },
  
  cancel: async (rideId) => {
    return await handleRequest(`/rides/cancel/${rideId}`, {
      method: 'POST'
    });
  }
};

/**
 * User service
 */
export const userService = {
  getProfile: async () => {
    const response = await handleRequest('/auth/profile');
    return {
      ...response,
      profile: response.data || null
    };
  },
  
  updateProfile: async (profileData) => {
    return await handleRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};

/**
 * Utility to check if error is an API error
 */
export const isApiError = (error) => {
  return error && error.message && !error.success;
};