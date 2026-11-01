import { createSlice } from '@reduxjs/toolkit';

const initialState = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { cartItems: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        existItem.qty = Math.min(
          existItem.qty + (item.qty || 1),
          item.countInStock || existItem.countInStock || Number.MAX_SAFE_INTEGER
        );
      } else {
        state.cartItems.push({
          ...item,
          qty: Math.min(item.qty || 1, item.countInStock || item.qty || 1),
        });
      }
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateCartQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.cartItems.find((cartItem) => cartItem._id === id);

      if (item && Number.isInteger(qty) && qty > 0) {
        item.qty = item.countInStock > 0 ? Math.min(qty, item.countInStock) : qty;
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity } = cartSlice.actions;
export default cartSlice.reducer;
