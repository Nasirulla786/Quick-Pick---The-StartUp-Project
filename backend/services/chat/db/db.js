import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Chat  mongodb connect");
  } catch (error) {
    console.error("Chat Db error", error);
  }
};

export default connectDb;
