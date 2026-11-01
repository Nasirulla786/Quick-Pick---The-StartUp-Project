import { adminAuth } from "../config/firebase.js";
import User from "../models/auth.model.js";

export const RegisterUser = async (req, res) => {
  try {
  } catch (error) {
    console.error("Register user error", error);
  }
};

export const LoginUser = async (req, res) => {
  try {
  } catch (error) {
    console.error("Login user error", error);
  }
};

export const LogoutUser = async (req, res) => {
  try {
  } catch (error) {
    console.error("Logout user error", error);
  }
};
export const GoogleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        message: "ID Token is required",
      });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const user = await User.create({
      firebaseUID: decodedToken.uid,
      name: decodedToken.name,
      email: decodedToken.email,
      photoURL: decodedToken.picture,
      password:null
    });

    return res.status(200).json({
      message: "Google Authentication Successful",
      user,
    });
  } catch (error) {
    console.error("Google user error", error);
    return res.status(401).json({
      message: "Invalid Firebase Token",
    });
  }
};
