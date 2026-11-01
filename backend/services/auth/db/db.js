import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Auth mongodb connect");
  } catch (error) {
    console.error("Db error", error);
  }
};

export default connectDb;
