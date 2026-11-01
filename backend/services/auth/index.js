import express from "express"
import dotenv from"dotenv"
import authRouter from "./routes/auth.routes.js"
import connectDb from "./db/db.js"
dotenv.config()
const app = express()
const PORT =  process.env.PORT || 3001




app.use(express.json())
app.use("/" ,authRouter);

app.listen(PORT ,()=>{
    connectDb()
    console.log("Server is running of Auth server is : -" , PORT) ;
})
