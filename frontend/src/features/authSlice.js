import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../api'; // Import your API service

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
export const login = createAsyncThunk( // This is the exported thunk
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


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isDriver: false, // This should ideally come from the user object's role
    status: 'idle',
    error: null,
    token: localStorage.getItem('jwtToken') || null, // Initialize token from local storage
  },
  reducers: {
    // FIX: REMOVED the 'login' reducer here.
    // The async thunk 'login' (defined above) now handles all login-related state updates
    // via extraReducers. This removes the ambiguity.
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
      });
  }
});

export const { logout } = authSlice.actions; // Export only logout
export default authSlice.reducer;
