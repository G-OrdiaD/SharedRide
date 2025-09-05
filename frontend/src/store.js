import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import earningsReducer from './slices/earningsSlice';
import ratingsReducer from './slices/ratingsSlice'; 

export default configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    earnings: earningsReducer,
    ratings: ratingsReducer,
  },
});