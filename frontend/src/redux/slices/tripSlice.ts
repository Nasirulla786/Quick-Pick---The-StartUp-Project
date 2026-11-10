import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ITrip {
  _id: string;
  traveller: string;

  from: string;
  to: string;
  date: string;

  parcels: string[];

  status: "active" | "completed" | "cancelled";

  createdAt: string;
  updatedAt: string;
}

interface MyTripsState {
  myTrips: ITrip[];
}

const initialState: MyTripsState = {
  myTrips: [],
};

const myTripsSlice = createSlice({
  name: "myTrips",
  initialState,
  reducers: {
    setMyTrips: (state, action: PayloadAction<ITrip[]>) => {
      state.myTrips = action.payload;
    },
  },
});

export const { setMyTrips } = myTripsSlice.actions;

export default myTripsSlice.reducer;
