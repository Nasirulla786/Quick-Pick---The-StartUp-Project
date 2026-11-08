
import express from "express";



import isAuth from "../../auth/middleware/isAuth.js";
import { createTrip, deleteTrip, getAllTrips, getMyTrips, getTripById, searchTrips, updateTrip } from "../controllers/trip.controller.js";

const tripRouter = express.Router();

tripRouter.post("/create", isAuth, createTrip);

tripRouter.get("/all", getAllTrips);

tripRouter.get("/my-trips", isAuth, getMyTrips);

tripRouter.get("/search", searchTrips);

tripRouter.get("/triproute/:id", getTripById);

tripRouter.put("/triproute/:id", isAuth, updateTrip);

tripRouter.get("/delete/:id", isAuth, deleteTrip);

export default tripRouter;
