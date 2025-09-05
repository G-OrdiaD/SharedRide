import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import walletReducer from './features/walletSlice'; 
import earningsReducer from './features/earningsSlice';
import ratingsReducer from './features/ratingsSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    earnings: earningsReducer,
    ratings: ratingsReducer, 
  },
});