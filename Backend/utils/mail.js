import * as Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

// Initialize Brevo Transactional Email API
const apiInstance = new Brevo.TransactionalEmailsApi();

// Configure API key
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY,
  );
}

// Common function to send emails using Brevo HTTPS API
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing from environment variables.");
  }

  if (!process.env.SMTP_SENDER) {
    throw new Error("SMTP_SENDER is missing from environment variables.");
  }

  if (!to) {
    throw new Error("Recipient email address is required.");
  }

  try {
    const email = new Brevo.SendSmtpEmail();

    email.sender = {
      name: "Vingo",
      email: process.env.SMTP_SENDER,
    };

    email.to = [{ email: to }];
    email.subject = subject;
    email.htmlContent = html;

    const response = await apiInstance.sendTransacEmail(email);

    console.log("EMAIL REQUEST ACCEPTED BY BREVO");
    console.log("Brevo Message ID:", response.body?.messageId);

    return response;
  } catch (error) {
    console.error("BREVO EMAIL ERROR:", error.response?.body || error.message);

    throw error;
  }
};

// Send password reset OTP
export const sendOtpEmail = async (to, otp) => {
  return sendEmail({
    to,
    subject: "Vingo - Password Reset OTP",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 24px;
        border: 1px solid #eeeeee;
        border-radius: 12px;
      ">
        <h2 style="color: #ff4d2d;">Vingo Password Reset</h2>

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
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 24px;
        border: 1px solid #eeeeee;
        border-radius: 12px;
      ">
        <h2 style="color: #ff4d2d;">Vingo Order Delivery</h2>

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
