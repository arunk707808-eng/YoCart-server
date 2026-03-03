import { generateToken } from "../config/token.js";
import { OTP } from "../models/otp.js";
import { User } from "../models/user.js";
import { getOtpHtml } from "../utils/html.js";
import { redisAvailable } from "../utils/redis.js";
import sendOtp from "../utils/sendotp.js";
import tryCatch from "../utils/trycatch.js";

export const loginUser = tryCatch(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "please Provide all details",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const otpKey = `otp:${email}`;
  if (redisAvailable) {
    await redisclient.set(otpKey, JSON.stringify(otp), {
      ex: 300,
    });
  } else {
    await OTP.updateOne(
      { email },
      {
        $set: {
          otp,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      },
      { upsert: true }, //find?true->update:new create
    );
  }

  const subject = "verification for otp";
  const html = getOtpHtml({ email, otp });

  await sendOtp({ email, subject, html });

  res.json({
    message: "otp has been sent to your mail",
  });
});

export const verifyUser = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "please provide all details",
    });
  }
  const otpKey = `otp:${email}`;
  if (redisAvailable) {
    const redisOtpString = await redisclient.get(otpKey);
    if (!redisOtpString) {
      return res.status(400).json({
        message: "otp has been expired",
      });
    }

    if (redisOtpString !== otp) {
      return res.status(400).json({
        message: "otp is invalid",
      });
    }
    await redisclient.del(otpKey);
  } else {
    const dbData = await OTP.findOne({ email, otp });
    if (!dbData) {
      return res.status(400).json({
        message: "invalid or expired otp",
      });
    }
    if (dbData.expiresAt < Date.now()) {
      await OTP.deleteOne({ _id: dbData._id });
      return res.status(400).json({
        message: "invalid or expired otp",
      });
    }
    await OTP.deleteOne({ _id: dbData._id });
  }
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email });
  }
  await generateToken(user._id, res);

  res.status(200).json({
    message: "Logged in successfully",
    user,
  });
});

export const myProfile = tryCatch(async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  res.status(200).json({
    message: "welcome",
    user,
  });
});

export const logoutUser = tryCatch(async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({
    message: "Logged Out",
  });
});
