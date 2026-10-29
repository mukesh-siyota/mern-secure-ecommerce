import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice.js';
import authReducer from './authSlice.js';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
});

export default store;
