import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proxy from "express-http-proxy";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));

app.listen(PORT, () => {
  console.log("Server is running of Gateway server is : -", PORT);
});
