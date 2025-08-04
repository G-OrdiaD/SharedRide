import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../api';

// Registration async thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.token) {
        localStorage.setItem('jwtToken', response.token);
      }
      return response.user;
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
      if (response.token) {
        localStorage.setItem('jwtToken', response.token);
      }
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// New async thunk to initialize auth state from token
export const initializeAuth = createAsyncThunk(
    'auth/initializeAuth',
    async (_, { rejectWithValue, dispatch }) => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            return rejectWithValue('No token found');
        }

        try {
            // This call to authService.getProfile() needs to hit a backend endpoint
            // (e.g., /api/auth/me) that validates the token and returns the user object.
            const response = await authService.getProfile();
            return response; // Should return the user object (e.g., { _id, name, email, role, ... })
        } catch (error) {
            console.error('Failed to initialize auth from token:', error);
            localStorage.removeItem('jwtToken'); // Clear invalid/expired token
            dispatch(logout()); // Clear Redux state
            return rejectWithValue(error.message || 'Invalid token');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isDriver: false,
        status: 'idle', // Key: This status will be 'initializing' during the fetch
        error: null,
        token: localStorage.getItem('jwtToken') || null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isDriver = false;
            state.token = null;
            localStorage.removeItem('jwtToken');
        }
    },
    extraReducers: (builder) => {
        builder
            // ... (existing register and login reducers) ...
            .addCase(initializeAuth.pending, (state) => {
                state.status = 'initializing'; // Set status to initializing
                state.error = null;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.isDriver = action.payload?.role === 'driver';
                state.token = localStorage.getItem('jwtToken'); // Re-read token to ensure consistency
                state.error = null;
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.status = 'failed';
                state.user = null;
                state.isDriver = false;
                state.token = null;
                state.error = action.payload;
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;