import User from "../models/auth.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
  

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    console.log("this is user",user);
    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
};
