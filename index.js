import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import cookieParser from "cookie-parser";
import { connectRedis } from "./utils/redis.js";
import cloudinary from "cloudinary";
import cors from "cors";
import axios from "axios"
dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
const url = `https://yocart-server.onrender.com`;
const interval = 30000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloded");
    })
    .catch((error) => {
      console.error(`Error : ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
const port = process.env.PORT || 6000;

//importing routes
import router from "./routes/user.js";
import ProductRouter from "./routes/product.js";
import cartRouter from "./routes/cart.js";
import addressRouter from "./routes/address.js";
import orderRouter from "./routes/order.js";

//using routes
app.get("/", (req, res) => {
  res.send("hello arun");
});
app.use("/api/v1", router);
app.use("/api/v1", ProductRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1", addressRouter);
app.use("/api/v1", orderRouter);

app.listen(port, () => {
  connectDB();

  console.log(`app is running on http://localhost:${port}`);
});
