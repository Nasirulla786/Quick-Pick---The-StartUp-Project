
    import express from "express";




    import { createTrip, deleteTrip, getAllTrips, getMyTrips, getTravellerById, getTravellerTrips, getTripById, searchTrips, updateTrip } from "../controllers/trip.controller.js";
    import isAuth from "../../auth/middleware/isAuth.js";
import { requestParcel, updatePrice } from "../controllers/request.controller.js";

    const tripRouter = express.Router();

    tripRouter.post("/create", isAuth, createTrip);

    tripRouter.get("/all", getAllTrips);

    tripRouter.get("/my-trips", isAuth, getMyTrips);

    tripRouter.get("/search", searchTrips);

    tripRouter.get("/triproute/:id", getTripById);

    tripRouter.put("/triproute/:id", isAuth, updateTrip);

    tripRouter.get("/delete/:id", isAuth, deleteTrip);



    tripRouter.get("/traveller-trip/:id", isAuth, getTravellerTrips);
    tripRouter.post("/request-parcel/:tripId", isAuth, requestParcel);
    tripRouter.post("/update-price/:id", isAuth, updatePrice);

    export default tripRouter;
