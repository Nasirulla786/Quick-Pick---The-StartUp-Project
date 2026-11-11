
import express from "express";

import isAuth from "../../auth/middleware/isAuth.js";
import { GetMessages, sendMessage } from "../controllers/chat.controller.js";


const chatRouter = express.Router();

chatRouter.post("/send-message/:id", isAuth, sendMessage);
chatRouter.get("/get-messages/:id", isAuth, GetMessages);

export default chatRouter;
