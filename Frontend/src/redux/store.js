import { configureStore } from '@reduxjs/toolkit';
import ownerReducer from './ownerSlice';
import userReducer from './userSlice';
export const store = configureStore({
    reducer: {
        owner: ownerReducer,
        user: userReducer
    }
})