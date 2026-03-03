import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    // console.log("token", token);
    if (!token) {
      return res.status(403).json({
        message: "please login",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
