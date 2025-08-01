import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../api'; // Import your API service

// Registration async thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isDriver: false,
    status: 'idle',
    error: null
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isDriver = action.payload.isDriver;
    },
    logout: (state) => {
      state.user = null;
      state.isDriver = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;