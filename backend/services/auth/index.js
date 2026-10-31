import express from "express"
import dotenv from"dotenv"
import authRouter from "./routes/auth.routes.js"
dotenv.config()
const app = express()
const PORT =  process.env.PORT || 3001




app.use("/" ,authRouter);

app.listen(PORT ,()=>{
    console.log("Server is running of Auth server is : -" , PORT) ;
})
