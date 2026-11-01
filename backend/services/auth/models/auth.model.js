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
      sparse:true
    },
    entity: {
      type: String,
      enum: ["sender", "traveller"],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
