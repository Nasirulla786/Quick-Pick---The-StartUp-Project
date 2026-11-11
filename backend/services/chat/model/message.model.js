import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
