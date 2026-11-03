import express from "express";
import { getCurrentUser, updateController } from "../controllers/user.controller.js";
import isAuth from "../middleware/isAuth.js";


const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.post("/update-profile", isAuth, updateController);

export default userRouter;
