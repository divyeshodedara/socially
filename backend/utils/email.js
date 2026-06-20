import { BrevoClient } from "@getbrevo/brevo";
import ejs from "ejs";
import path from "path";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

async function sendOtpEmail(options) {
  const templatePath = path.join(process.cwd(), "views", "emails", "otp.ejs");

  const data = {
    appName: "Socially",
    userName: options.user.username,
    otp: options.otp,
    purpose: options.purpose || "verify your email",
    expiryMinutes: 10,
    supportEmail: "divyeshodedara1012@gmail.com",
    year: new Date().getFullYear(),
  };

  const html = await ejs.renderFile(templatePath, data);

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: "Socially", email: "divyeshodedara1012@gmail.com" },
    to: [{ email: options.user.email }],
    subject: `Your OTP for ${data.appName}`,
    htmlContent: html,
  });
}

export default sendOtpEmail;
