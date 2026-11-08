import express from "express";
import isAuth from "../../auth/middleware/isAuth.js";

import {
  createParcel,
  getMyParcels,
  updateParcel,
  deleteParcel,
} from "../controllers/parcel.controller.js";

const parcelRouter = express.Router();

parcelRouter.post("/create", isAuth, createParcel);
parcelRouter.get("/my-parcels", isAuth, getMyParcels);
parcelRouter.put("/:id", isAuth, updateParcel);
parcelRouter.delete("/:id", isAuth, deleteParcel);

export default parcelRouter;
