import express from "express";
import {
  getCurrentUser,
  getTravellerById,
  getUserProfileById,
  updateController,
} from "../controllers/user.controller.js";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.get("/profile/:id", isAuth, getUserProfileById);
userRouter.post(
  "/update-profile",
  isAuth,
  upload.single("image"),
  updateController,
);

userRouter.get("/traveller/:id",  getTravellerById);

export default userRouter;
