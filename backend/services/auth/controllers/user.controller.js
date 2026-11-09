import { json } from "express";
import User from "../models/auth.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
};

export const updateController = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (req)
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required",
        });
      }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.email = email.toLowerCase().trim();

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file);
    }


    user.photoURL = image;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};




export const getTravellerById = async (req, res) => {
    try {
        const { id } = req.params;

        const traveller = await User.findOne({
            _id: id,
            entity: "traveller",
        }).select("name email photoURL entity");

        if (!traveller) {
            return res.status(404).json({
                success: false,
                message: "Traveller not found",
            });
        }

        return res.status(200).json({
            traveller,
        });

    } catch (error) {
        console.error("Get Traveller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
