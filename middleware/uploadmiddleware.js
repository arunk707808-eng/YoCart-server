import multer from "multer";
import upload from "../config/multer.js";

const uploadmiddleware = (req, res, next) => {
  upload.array("files", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "file size should be less then 5MB",
        });
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message: "file count should be less then 5",
        });
      }
      return res.status(400).json({
        message: err.message || "something went wrong",
      });
    }
    next();
  });
};
export default uploadmiddleware;
