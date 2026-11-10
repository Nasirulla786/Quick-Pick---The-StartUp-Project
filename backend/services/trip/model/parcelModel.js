import parcelSchema from "../../../shared/parcelSchema.js";
import parcelConnection from "../db/parceldb.js";

const Parcel = parcelConnection.model("Parcel", parcelSchema);

export default Parcel;
