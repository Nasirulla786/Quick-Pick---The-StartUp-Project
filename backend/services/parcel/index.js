



import connectDB from "./db/db.js";
import express from "express";
import dotenv from "dotenv";

import parcelRouter from "./routes/parcel.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

// Parcel routes
app.use("/", parcelRouter);

const PORT = process.env.PORT || 5003;

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
