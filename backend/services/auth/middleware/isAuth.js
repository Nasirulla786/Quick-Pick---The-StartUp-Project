import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const decodeToken = jwt.verify(token, process.env.JSON_SECRET);

    console.log("env", process.env.JSON_SECRET);
    req.userId = decodeToken.id;

    next();
  } catch (error) {
    console.error("isAuth error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default isAuth;
