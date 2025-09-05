import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../api';

// Async thunk to fetch driver earnings
export const fetchEarnings = createAsyncThunk(
  'earnings/fetchEarnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getEarnings();
      return response.data; // { total: 500, today: 75 }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const earningsSlice = createSlice({
  name: 'earnings',
  initialState: {
    today: 0,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearEarningsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.today = action.payload.today;
        state.total = action.payload.total;
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || action.error?.message || 'Failed to fetch earnings';
      })
  },
});

export const { clearEarningsError } = earningsSlice.actions;
export default earningsSlice.reducer;