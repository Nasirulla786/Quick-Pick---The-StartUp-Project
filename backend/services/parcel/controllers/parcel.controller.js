import { response } from "express";
import redis from "../../../shared/redis.js";
import Parcel from "../model/parcel.js";

const CACHE_TTL = 300;

// Cache key for each sender
const getCacheKey = (userId) => `parcel:my-parcels:${userId}`;

// CREATE PARCEL
export const createParcel = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("user id", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { title, from, to, date, weight, budget } = req.body;

    if (!title || !from || !to || !date || weight == null || budget == null) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const parcel = await Parcel.create({
      sender: userId,
      title,
      from,
      to,
      date,
      weight,
      budget,
    });

    await redis.del(getCacheKey(userId));

    return res.status(201).json({
      success: true,
      message: "Parcel created successfully",
      data: parcel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY PARCELS
export const getMyParcels = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cacheKey = getCacheKey(userId);

    // Check Redis cache
    const cachedParcels = await redis.get(cacheKey);

    if (cachedParcels) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedParcels),
      });
    }

    // Fetch from MongoDB if cache is empty
    const parcels = await Parcel.find({
      sender: userId,
    }).sort({ createdAt: -1 });

    // Save in Redis for 5 minutes
    await redis.set(cacheKey, JSON.stringify(parcels), "EX", CACHE_TTL);

    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: parcels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PARCEL
export const updateParcel = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const parcel = await Parcel.findOne({
      _id: req.params.id,
      sender: userId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    const allowedFields = ["title", "from", "to", "date", "weight", "budget"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        parcel[field] = req.body[field];
      }
    });

    await parcel.save();

    await redis.del(getCacheKey(userId));

    return res.status(200).json({
      success: true,
      message: "Parcel updated successfully",
      data: parcel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PARCEL
export const deleteParcel = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const parcel = await Parcel.findOneAndDelete({
      _id: req.params.id,
      sender: userId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    await redis.del(getCacheKey(userId));

    return res.status(200).json({
      success: true,
      message: "Parcel deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const findParcel = async (req, res) => {
  try {
    const { id } = req.params;

    const myParcel = await Parcel.findById(id);

    if (!myParcel) {
      return res.status(404).json({
        message: "Parcel not found",
      });
    }

    return res.status(200).json({
      success: true,
      parcel: myParcel,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
