import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Quick & Pick" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Quick & Pick - OTP Verification",
      text: `Your OTP is ${otp}. Do not share it with anyone.`,
      html: `
        <h2>Welcome to Quick & Pick!</h2>
        <p>Your email verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
      `,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};
