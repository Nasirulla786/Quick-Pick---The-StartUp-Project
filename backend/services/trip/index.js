import express from "express"
import dotenv from"dotenv"
import tripRouter from "./routes/trip.routes.js"
import connectDb from "./db/db.js"
import cookieParser from "cookie-parser"
dotenv.config()
const app = express()
const PORT =  process.env.PORT || 3002




app.use(cookieParser())
app.use(express.json())
app.use("/",tripRouter)


app.listen(PORT ,()=>{
    connectDb()
    console.log("Server is running of Auth server is : -" , PORT) ;
})
