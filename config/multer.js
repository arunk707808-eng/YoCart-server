import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "public"));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const fileName = uniqueId + path.extname(file.originalname);
    cb(null, fileName);
  },
});
// const fileFilter = (req, file, cb) => {
//   const allowMime = ["image/jpeg", "image/png"];
//   const allowExt = [".jpeg", ".jpg", ".png"];
//   const mime = allowMime.includes(file.mimetype);
//   const ext = allowExt.includes(path.extname(file.originalname).toLowerCase());
//   if (mime && ext) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPG and PNG images are allowed"), false);
//   }
// };

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
