
import express from "express";

import {
  createParcel,
  getMyParcels,
  updateParcel,
  deleteParcel,
} from "../controllers/parcel.controller.js";

const parcelRouter = express.Router();

parcelRouter.post("/create", createParcel);

parcelRouter.get("/my-parcels", getMyParcels);

parcelRouter.put("/:id", updateParcel);

parcelRouter.delete("/:id", deleteParcel);

export default parcelRouter;
