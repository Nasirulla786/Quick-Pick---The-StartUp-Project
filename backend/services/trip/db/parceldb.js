import mongoose from "mongoose";


const parcelConnection = mongoose.createConnection(
  process.env.PARCEL_MONGO_URL,
  {
    dbName: "quick-pick_parcel",
  },
);

parcelConnection.on("connected", () => {
  console.log("Parcel db connected");
});

parcelConnection.on("error", (err) => {
  console.log("Parcel DB error:", err);
});

export default parcelConnection;
