import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/userSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// RootState = poore Redux store ka TypeScript type
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch = dispatch function ka TypeScript type
export type AppDispatch = typeof store.dispatch;
