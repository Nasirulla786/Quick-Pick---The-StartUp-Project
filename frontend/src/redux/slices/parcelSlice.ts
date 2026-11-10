import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IParcel {
  _id: string;
  sender: string;
  traveller?: string | null;
  trip?: string | null;

  title: string;
  from: string;
  to: string;
  date: string;
  weight: number;
  budget: number;

  status: "pending" | "in_transit" | "delivered" | "cancelled";

  requestStatus: "not_requested" | "pending" | "accepted" | "rejected";

  createdAt: string;
  updatedAt: string;
}

interface state {
  parcelData: IParcel | null;
}

const parcelSlice = createSlice({
  name: "parcel",
  initialState: {
    parcelData: [] as IParcel[],
  },
  reducers: {
    setParcelData: (state, action: PayloadAction<IParcel[]>) => {
      state.parcelData = action.payload;
    },
  },
});

export const { setParcelData } = parcelSlice.actions;
export default parcelSlice.reducer;
