import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Brevo SMTP Configuration
const smtpPort = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
port: smtpPort,
secure: smtpPort === 465,

auth: {
user: process.env.SMTP_LOGIN,
pass: process.env.SMTP_PASS,
},

connectionTimeout: 15000,
greetingTimeout: 15000,
socketTimeout: 20000,
});

// Verify SMTP connection
transporter.verify((error) => {
if (error) {
console.error("SMTP CONNECTION ERROR:", error.message);
} else {
console.log("Brevo SMTP Connected Successfully");
}
});

// Common email sender
const sendEmail = async ({ to, subject, html }) => {
if (
!process.env.SMTP_LOGIN ||
!process.env.SMTP_PASS ||
!process.env.SMTP_SENDER
) {
throw new Error(
"Missing SMTP configuration. Check SMTP_LOGIN, SMTP_PASS and SMTP_SENDER."
);
}

try {
const info = await transporter.sendMail({
from: `"Vingo" <${process.env.SMTP_SENDER}>`,
to,
subject,
html,
});

```
console.log("EMAIL SENT SUCCESSFULLY");
console.log("Message ID:", info.messageId);
console.log("Accepted:", info.accepted);
console.log("Rejected:", info.rejected);

return info;
```

} catch (error) {
console.error("EMAIL SENDING ERROR:", error.message);
throw error;
}
};

// Send password reset OTP
export const sendOtpEmail = async (to, otp) => {
return sendEmail({
to,
subject: "Vingo - Password Reset OTP",
html: ` <div style="
     font-family: Arial, sans-serif;
     max-width: 500px;
     margin: auto;
     padding: 24px;
     border: 1px solid #eeeeee;
     border-radius: 12px;
   "> <h2 style="color: #ff4d2d;">Vingo Password Reset</h2>


    <p>You requested to reset your Vingo account password.</p>
    <p>Your OTP is:</p>

    <div style="
      text-align: center;
      padding: 20px;
      background: #fff4ee;
      border-radius: 10px;
    ">
      <h1 style="
        letter-spacing: 8px;
        color: #ff4d2d;
      ">${otp}</h1>
    </div>

    <p>This OTP expires in 5 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p style="color: #777777;">Thank you for using Vingo!</p>
  </div>
`,


});
};

// Send delivery OTP
export const sendDeliveryOtpEmail = async (to, otp) => {
return sendEmail({
to,
subject: "Vingo - Order Delivery OTP",
html: ` <div style="
     font-family: Arial, sans-serif;
     max-width: 500px;
     margin: auto;
     padding: 24px;
     border: 1px solid #eeeeee;
     border-radius: 12px;
   "> <h2 style="color: #ff4d2d;">Vingo Order Delivery</h2>
    <p>Your order is out for delivery!</p>

    <p>
      Share this OTP with your delivery partner only
      when your order arrives.
    </p>

    <div style="
      text-align: center;
      padding: 20px;
      background: #fff4ee;
      border-radius: 10px;
    ">
      <h1 style="
        letter-spacing: 8px;
        color: #ff4d2d;
      ">${otp}</h1>
    </div>

    <p>This OTP expires in 10 minutes.</p>
    <p style="color: #777777;">Thank you for ordering with Vingo!</p>
  </div>
`,


});
};

export default transporter;
