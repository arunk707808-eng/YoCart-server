import { createTransport } from "nodemailer";

const sendOrderConfirmation = async({email, subject, html,})=>{
  const transport = createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
      user:process.env.GMAIL,
      pass:process.env.PASSWORD,
    }
  });
  await transport.sendMail({
    from: process.env.GMAIL,
    to: email,
    subject,
    html // HTML version of the message
  });
}

export default sendOrderConfirmation