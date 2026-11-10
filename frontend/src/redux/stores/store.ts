import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/userSlice.ts";
import parcelReducer from "../slices/parcelSlice.ts";
import tripReducer from "../slices/tripSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parcel: parcelReducer,
    trips: tripReducer,
  },
});

// RootState = poore Redux store ka TypeScript type
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch = dispatch function ka TypeScript type
export type AppDispatch = typeof store.dispatch;
