import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



export interface ITrip {
  _id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportMode: string;
  availableCapacity: number;
  pricePerKg: number;
  totalEarnings?: number;
  parcels: any[];
  createdAt:Date
}

export interface IParcelRequest {
  _id: string;

  // Users
  sender: string;
  traveller: string | null;

  // Parcel details
  title: string;
  from: string;
  to: string;
  date: string;
  weight: number;
  budget: number;

  // Relationships
  trip: string | null;

  // Status
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  requestStatus: "not_requested" | "pending" | "accepted" | "rejected";

  // Timestamps
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
