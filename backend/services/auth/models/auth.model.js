import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      default: null,
      select: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    photoURL: {
      type: String,
    },
    firebaseUID: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    entity: {
      type: String,
      enum: ["sender", "traveller"],
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
