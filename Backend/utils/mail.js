// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// console.log("EMAIL:", JSON.stringify(process.env.EMAIL));
// console.log("PASS length:", process.env.PASS?.length, JSON.stringify(process.env.PASS));
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.PASS,
//   },
// });


// transporter.verify((err, success) => {
//     if (err) {
//         console.log("SMTP ERROR:", err);
//     } else {
//         console.log("SMTP Connected");
//     }
// });

// export const sendOtpEmail = async (to, otp) => {
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to,
//       subject: "Reset your Password",
//       html:`<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p> `,
      
//     });
//   };
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASS,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP Connected Successfully");
  }
});


// export const sendOtpEmail = async (to, otp) => {
//   const info = await transporter.sendMail({
//     from: process.env.SMTP_SENDER,
//     to: to,
//     subject: "Reset your Password OTP",
//     html: `
//       <h2>Password Reset</h2>
//       <p>Your OTP is:</p>
//       <h1>${otp}</h1>
//       <p>This OTP expires in 5 minutes.</p>
//     `,
//   });
//   console.log("Mail Info:",info);
// };

export const sendOtpEmail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_SENDER,
      to,
      subject: "Reset Password OTP",
      html: `<h1>${otp}</h1>`,
    });

    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log(info);
  } catch (err) {
    console.error("MAIL ERROR:", err);
  }
};
// Send Delivery OTP Email
export const sendDeliveryOtpEmail = async (to, otp) => {
  const info = await transporter.sendMail({
    from: process.env.SMTP_SENDER,
    to,
    subject: "Your Vingo Order Delivery OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #ff4d2d;">Vingo - Order Delivery</h2>

        <p>Your order is out for delivery!</p>

        <p>Please share the following OTP with your delivery partner
        only when your order arrives.</p>

        <div style="text-align: center; padding: 20px; background: #fff4ee; border-radius: 10px;">
          <h1 style="letter-spacing: 8px; color: #ff4d2d;">${otp}</h1>
        </div>

        <p>This OTP expires in 10 minutes.</p>

        <p style="color: #777;">Thank you for ordering with Vingo!</p>
      </div>
    `,
  });

  console.log("Delivery OTP email sent:", info.messageId);

  return info;
};