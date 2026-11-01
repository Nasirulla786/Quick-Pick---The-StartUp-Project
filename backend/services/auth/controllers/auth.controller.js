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

    const findUser = await User.findOne({ firebaseUID: decodedToken.uid });
    if (findUser) {
      return res.status(400).json({ message: "User already Exist" });
    }

    const user = await User.create({
      firebaseUID: decodedToken.uid,
      name: decodedToken.name,
      email: decodedToken.email,
      photoURL: decodedToken.picture,
      password: null,
      emailVerified: true,
      entity: null,
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

export const updateEntity = async (req, res) => {
  try {
    const { entity } = req.body;
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "User is not authenticate",
      });
    }
    await User.findByIdAndUpdate(id, { entity });
    return res.status(200).json({ message: "entity update" });
  } catch (error) {
    console.error("Update entity error", error);
    return res.status(500).json({
      message: "Update entity error",
    });
  }
};
