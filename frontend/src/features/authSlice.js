import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isDriver: false,
    isAuthenticated: false,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isDriver = action.payload.isDriver || false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isDriver = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;