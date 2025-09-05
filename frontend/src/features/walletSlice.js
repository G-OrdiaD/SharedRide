import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../api';

// Async thunk to fetch wallet balance
export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getWallet();
      return response.data; // { balance: 100 }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to top up the wallet
export const topUpWallet = createAsyncThunk(
  'wallet/topUpWallet',
  async ({ amount, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await userService.topUpWallet(amount, paymentMethod);
      return response.data; // { message: "...", newBalance: 110, ... }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet
      .addCase(fetchWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error;
      })
      // Top Up Wallet
      .addCase(topUpWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(topUpWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.newBalance;
      })
      .addCase(topUpWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;