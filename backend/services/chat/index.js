import express from "express";
import dotenv from "dotenv";
import connectDb from "./db/db.js";
import chatRouter from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/", chatRouter);

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Chat service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Chat service startup failed:", error);
    process.exit(1);
  }
};

startServer();
