import mongoose from "mongoose";
import parcelSchema from "../../../shared/parcelSchema.js";

const Parcel = mongoose.model("Parcel", parcelSchema);

export default Parcel;
