import e from "express";
import { GoogleLogin, LoginUser, LogoutUser, RegisterUser } from "../controllers/auth.controller.js";
const authRouter = e.Router();


authRouter.post("/register-user" , RegisterUser)
authRouter.post("/login-user" , LoginUser)
authRouter.get("/logout-user" , LogoutUser)
authRouter.post("/google", GoogleLogin)


export default authRouter
