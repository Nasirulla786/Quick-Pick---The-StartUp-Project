import { cert, initializeApp } from "firebase-admin/app";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };
import { getAuth } from "firebase-admin/auth";

const app = initializeApp({
  credential: cert(serviceAccount),
});


export const adminAuth = getAuth(app)
