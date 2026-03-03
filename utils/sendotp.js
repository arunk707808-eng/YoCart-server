import { createTransport } from "nodemailer";
if (!process.env.GMAIL || !process.env.PASSWORD) {
  throw new Error("Email credentials missing in environment variables");
}

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendOtp = async ({ email, subject, html }) => {
  try {
    await transport.sendMail({
      from: process.env.GMAIL,
      to: email,
      subject,
      html,
    });
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("MAIL ERROR:", error);
    throw new Error("Email sending failed");
  }
};

export default sendOtp;
