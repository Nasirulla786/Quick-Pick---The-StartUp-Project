import express from "express";
import dotenv from "dotenv";
import connectDb from "./db/db.js";
import chatRouter from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Message from "./model/message.model.js";

dotenv.config();

const parseCookies = (cookieHeader = "") => {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .filter(Boolean)
      .map((cookie) => {
        const [key, ...value] = cookie.trim().split("=");
        return [key, decodeURIComponent(value.join("="))];
      }),
  );
};

const PORT = process.env.PORT || 5004;

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// REST API routes
app.use("/", chatRouter);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Store online users
export const onlineUsers = {};

export const getReceiverSocketId = (userId) => {
  return onlineUsers[userId];
};

const notifyMessageStatus = (message, status) => {
  const senderSocketId = getReceiverSocketId(String(message.sender));

  if (senderSocketId) {
    io.to(senderSocketId).emit("message-status", {
      messageId: String(message._id),
      status,
    });
  }
};

const isPendingStatus = {
  $or: [{ status: "sent" }, { status: { $exists: false } }],
};

const deliverPendingMessages = async (socket) => {
  try {
    const pendingMessages = await Message.find({
      receiver: socket.userId,
      ...isPendingStatus,
    });

    for (const message of pendingMessages) {
      const deliveredMessage = await Message.findOneAndUpdate(
        {
          _id: message._id,
          receiver: socket.userId,
          ...isPendingStatus,
        },
        { $set: { status: "delivered" } },
        { new: true },
      );

      if (!deliveredMessage) continue;

      socket.emit("receive-message", {
        _id: String(deliveredMessage._id),
        senderId: String(deliveredMessage.sender),
        text: deliveredMessage.text,
        status: "delivered",
        createdAt: deliveredMessage.createdAt,
      });
      notifyMessageStatus(deliveredMessage, "delivered");
    }
  } catch (error) {
    console.error("Failed to deliver pending messages:", error);
  }
};

// Socket authentication using JWT cookie
io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie || "");

    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JSON_SECRET);

    socket.userId = decoded.id;

    next();
  } catch (error) {
    console.log("❌ Socket authentication error:", error.message);
    next(new Error("Invalid or expired token"));
  }
});

// Socket connection
io.on("connection", (socket) => {
  const userId = socket.userId;

  // Add user to online users
  onlineUsers[userId] = socket.id;

  // Send updated online users list
  io.emit("getOnlineUsers", Object.keys(onlineUsers));

  void deliverPendingMessages(socket);

  socket.on("typing", ({ receiverId } = {}) => {
    if (!mongoose.isValidObjectId(receiverId)) return;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stop-typing", ({ receiverId } = {}) => {
    if (!mongoose.isValidObjectId(receiverId)) return;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop-typing", { senderId: userId });
    }
  });

  socket.on("mark-seen", async ({ receiverId } = {}) => {
    if (!mongoose.isValidObjectId(receiverId)) return;

    try {
      const filter = {
        sender: receiverId,
        receiver: userId,
        status: { $ne: "seen" },
      };
      const messagesToMark = await Message.find(filter).select(
        "_id sender",
      );

      if (messagesToMark.length === 0) return;

      await Message.updateMany(filter, { $set: { status: "seen" } });

      for (const message of messagesToMark) {
        notifyMessageStatus(message, "seen");
      }
    } catch (error) {
      console.error("Failed to mark messages as seen:", error);
    }
  });

  // Receive and forward messages
  socket.on("send-message", async ({ receiverId, text, messageId } = {}) => {
    if (!mongoose.isValidObjectId(receiverId)) return;

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (!messageId) {
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", {
          senderId: userId,
          text,
        });
      }
      return;
    }

    if (!mongoose.isValidObjectId(messageId)) return;

    try {
      const savedMessage = await Message.findOne({
        _id: messageId,
        sender: userId,
        receiver: receiverId,
      });

      if (!savedMessage || !receiverSocketId) return;

      const deliveredMessage =
        savedMessage.status === "sent"
          ? await Message.findOneAndUpdate(
              { _id: savedMessage._id, status: "sent" },
              { $set: { status: "delivered" } },
              { new: true },
            )
          : savedMessage;
      const messageToDeliver =
        deliveredMessage || (await Message.findById(savedMessage._id));

      if (!messageToDeliver) return;

      io.to(receiverSocketId).emit("receive-message", {
        _id: String(messageToDeliver._id),
        senderId: userId,
        text: messageToDeliver.text,
        status: messageToDeliver.status || "delivered",
        createdAt: messageToDeliver.createdAt,
      });
      notifyMessageStatus(
        messageToDeliver,
        messageToDeliver.status || "delivered",
      );
      io.to(receiverSocketId).emit("stop-typing", { senderId: userId });
    } catch (error) {
      console.error("Failed to deliver message:", error);
    }
  });

  // Disconnect user
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", userId);

    if (onlineUsers[userId] === socket.id) {
      delete onlineUsers[userId];

      io.emit("getOnlineUsers", Object.keys(onlineUsers));
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDb();

    server.listen(PORT, () => {
      console.log(`Chat service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Chat service startup failed:", error);
    process.exit(1);
  }
};

startServer();
