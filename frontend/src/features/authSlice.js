import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../api'; // Ensure authService is correctly imported

// Registration async thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // Store token on successful registration
      if (response.token) {
        localStorage.setItem('jwtToken', response.token);
      }
      return response.user; // Return user data for the fulfilled state
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Login async thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Store token on successful login
      if (response.token) {
        localStorage.setItem('jwtToken', response.token);
      }
      return response.user; // Return user data for the fulfilled state
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to initialize auth state from token on app load
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue, dispatch }) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      // Make an API call to validate the token and get user data
      // This hits your backend's /api/auth/me endpoint
      const response = await authService.getProfile();
      return response; // Should return the user object
    } catch (error) {
      console.error('Failed to initialize auth from token:', error);
      // If token is invalid or expired, clear it
      localStorage.removeItem('jwtToken');
      dispatch(logout()); // Use the existing logout action to clear state
      return rejectWithValue(error.message || 'Invalid token');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isDriver: false, // This should ideally come from the user object's role
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed', 'initializing'
    error: null,
    token: localStorage.getItem('jwtToken') || null, // Initialize token from local storage
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isDriver = false;
      state.token = null;
      localStorage.removeItem('jwtToken'); // Clear token from local storage on logout
    }
  },
  extraReducers: (builder) => {
    builder
      // Reducers for register thunk
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload; // action.payload is now the user object
        state.isDriver = action.payload?.role === 'driver';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isDriver = false;
        state.token = null; // Clear token if registration fails
        state.error = action.payload;
      })
      // Reducers for login thunk
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isDriver = action.payload?.role === 'driver';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isDriver = false;
        state.token = null;
        state.error = action.payload;
      })
      // Reducers for initializeAuth thunk
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'initializing';
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isDriver = action.payload?.role === 'driver';
        state.token = localStorage.getItem('jwtToken'); // Ensure token is set if it was already there
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isDriver = false;
        state.token = null; // Clear token if initialization fails
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions; // Export only logout
export default authSlice.reducer;
