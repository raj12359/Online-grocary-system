import { createSlice } from '@reduxjs/toolkit';

let cartItems = [];
try {
  const storedCart = localStorage.getItem('cartItems');
  cartItems = storedCart && storedCart !== 'undefined' && storedCart !== 'null' ? JSON.parse(storedCart) : [];
  if (!Array.isArray(cartItems)) cartItems = [];
} catch (e) {
  console.error('Failed to parse cartItems from localStorage:', e);
  localStorage.removeItem('cartItems');
  cartItems = [];
}

const initialState = {
  cartItems,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
