



import connectDB from "./db/db.js";
import express from "express";
import dotenv from "dotenv";

import parcelRouter from "./routes/parcel.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser())
// Parcel routes
app.use("/", parcelRouter);

const PORT = process.env.PORT || 4003;

const startServer = async () => {
  try {
    connectDB()

    app.listen(PORT, () => {
      console.log(`Parcel Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Parcel Service startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
