import express from "express";
import dotenv from "dotenv";
import connectDb from "./db/db.js";
import chatRouter from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

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

  // Receive and forward messages
  socket.on("send-message", ({ receiverId, text }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", {
        senderId: userId,
        text,
      });
    } else {
      console.log("❌ Receiver is offline");
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
