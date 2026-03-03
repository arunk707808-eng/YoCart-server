import { Resend } from "resend";

const sendOtp = async ({ email, subject, html }) => {

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing in environment");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // test phase
      to: email,
      subject,
      html,
    });

    console.log("OTP sent:", response);
    return response;

  } catch (error) {
    console.error("MAIL ERROR:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendOtp;