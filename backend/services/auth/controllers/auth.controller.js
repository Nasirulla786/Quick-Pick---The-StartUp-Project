import { adminAuth } from "../config/firebase.js";
import generateToken from "../config/generateToken.js";
import { sendEmail } from "../config/sendMail.js";
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      entity,
      emailVerified: false,
      otp
    });

    await sendEmail(email, otp);

    // 8. Send response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
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
    const { email, password } = req.body;


    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email }).select("password");


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    // 3. Check password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Please login using Google",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    }



    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 4. Login successful
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        entity: user.entity,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Login user error", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const LogoutUser = async (req, res) => {
  try {
  } catch (error) {
    console.error("Logout user error", error);
  }
};
export const GoogleIdRegister = async (req, res) => {
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


    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
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

export const GoogleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID Token is required" });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const user = await User.findOne({
      firebaseUID: decodedToken.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: "Account does not exist. Please register first.",
      });
    }

    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      message: "Google Login Successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        entity: user.entity,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Google login error", error);
    return res.status(401).json({ message: "Google login failed" });
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

export const VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Check required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // 4. Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 5. Check OTP expiry
    if (!user.otpExpiry || user.otpExpiry.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 6. Verify email
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // 7. Generate token
    const token = await generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 8. Response

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};
