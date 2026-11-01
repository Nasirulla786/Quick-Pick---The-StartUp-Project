import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebaseConf";

export const GoogleProvider = new GoogleAuthProvider();
export const auth = getAuth(app);
