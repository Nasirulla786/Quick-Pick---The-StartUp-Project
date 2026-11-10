import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



export interface ITrip {
  _id: string;
  traveller: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportMode: string;
  availableCapacity: number;
  pricePerKg: number;
  description?: string;
  status: string;
  parcels: IParcelRequest[];
}


export interface IParcelRequest {
  _id: string;
  sender: string;
  title: string;
  from: string;
  to: string;
  date: string;
  weight: number;
  budget: number;
  status: string;
  requestStatus: "not_requested" | "pending" | "accepted" | "rejected";
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
