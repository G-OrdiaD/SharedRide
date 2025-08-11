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
      return response; 
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
      return response;
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
      const response = await authService.getProfile();
      return { user: response, token };
    } catch (error) {
      console.error('Failed to initialize auth from token:', error);
      localStorage.removeItem('jwtToken');
      dispatch(logout());
      return rejectWithValue(error.message || 'Invalid token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isDriver: false,
    status: 'idle',
    error: null,
    token: localStorage.getItem('jwtToken') || null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isDriver = false;
      state.token = null;
      state.status = 'idle';
      localStorage.removeItem('jwtToken');
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('jwtToken', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isDriver = action.payload.user?.role === 'driver';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isDriver = false;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isDriver = action.payload.user?.role === 'driver';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isDriver = false;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'initializing';
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isDriver = action.payload.user?.role === 'driver';
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

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;