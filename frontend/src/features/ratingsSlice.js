import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../api';

// Async thunk to fetch ratings for a user
export const fetchRatings = createAsyncThunk(
  'ratings/fetchRatings',
  async (userId = null, { rejectWithValue }) => { // userId is optional
    try {
      const response = await userService.getRatings(userId);
      return response.data; // { averageRating: 4.5, feedbackList: [...] }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState: {
    averageRating: 0,
    feedbackList: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearRatingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.averageRating = action.payload.averageRating;
        state.feedbackList = action.payload.feedbackList;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || action.error?.message || 'Failed to fetch ratings';
    })
  },
});

export const { clearRatingsError } = ratingsSlice.actions;
export default ratingsSlice.reducer;