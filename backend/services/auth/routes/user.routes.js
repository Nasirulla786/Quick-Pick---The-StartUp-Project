import express from "express";
import {
  getCurrentUser,
  updateController,
} from "../controllers/user.controller.js";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.post(
  "/update-profile",
  isAuth,
  upload.single("image"),
  updateController,
);

export default userRouter;
