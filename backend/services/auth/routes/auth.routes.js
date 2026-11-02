import e from "express";
import { GoogleIdRegister, GoogleLogin, LoginUser, LogoutUser, RegisterUser, updateEntity, VerifyOTP } from "../controllers/auth.controller.js";
const authRouter = e.Router();


authRouter.post("/register-user" , RegisterUser)
authRouter.post("/login-user" , LoginUser)
authRouter.get("/logout-user" , LogoutUser)
authRouter.post("/google", GoogleIdRegister)
authRouter.post("/google-login", GoogleLogin)
authRouter.post("/update-entity/:id", updateEntity)
authRouter.post("/verify-otp", VerifyOTP)


export default authRouter
