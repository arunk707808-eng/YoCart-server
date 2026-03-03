import { Resend } from 'resend';

const resend = new Resend(process.env.Resend_api_key);

const sendOtp = async ({ email, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject,
      html,
    });
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("MAIL ERROR:", error);
    throw error;
  }
};

export default sendOtp;