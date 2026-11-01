import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

 interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  photoURL?: string;
  firebaseUID?: string;
  entity: string;
}

interface state {
  userData: User | null;
}

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null as User | null,
  },
  reducers: {
    setUserData: (state: state, action: PayloadAction<User>) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;
