import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:process.env.SMTP_ENDPOINT,
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user:process.env.SMTP_AUTH_EMAIL,
    pass:process.env.SMTP_AUTH_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, body: string) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_AUTH_EMAIL, 
    to,
    subject: "From Automation App", 
    text: body ,
  });

  console.log("Message sent: %s", info.messageId);
}


