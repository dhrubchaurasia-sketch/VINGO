import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopsInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    availableBoys: [],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setshopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload;
    },
    setitemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setAvailableBoys: (state, action) => {
      state.availableBoys = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
      console.log(state.cartItems);
    },
    increaseCartQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);

      if (item) {
        item.quantity += 1;
      }
    },
    decreaseCartQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        }
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload,
      );
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setshopsInMyCity,
  setitemsInMyCity,
  addToCart,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
} = userSlice.actions;
export default userSlice.reducer;
