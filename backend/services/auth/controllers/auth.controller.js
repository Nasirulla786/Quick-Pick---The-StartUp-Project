import { adminAuth } from "../config/firebase.js";
import generateToken from "../config/generateToken.js";
import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";


export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password, entity } = req.body;

    // 1. Check all required fields
    if (!name || !email || !password || !entity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 3. Check existing user
    const alreadyEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (alreadyEmail) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      entity,
    });

    // 6. Generate JWT token
    const token = await generateToken(user._id);

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Token generation failed",
      });
    }

    // 7. Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 8. Send response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        entity: user.entity,
      },
    });
  } catch (error) {
    console.error("Register user error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
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
