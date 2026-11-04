
import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {

    traveller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    from: {
      type: String,
      required: true,
      trim: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    departureDate: {
      type: Date,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
    },


    transportMode: {
      type: String,
      enum: ["car", "bike", "bus", "train", "flight", "other"],
      required: true,
    },


    availableCapacity: {
      type: Number,
      required: true,
      min: 0.1,
    },


    pricePerKg: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },


    status: {
      type: String,
      enum: ["available", "booked", "completed", "cancelled"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({
  from: 1,
  to: 1,
  departureDate: 1,
  status: 1,
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
