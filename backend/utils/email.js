// // import nodemailer from "nodemailer";
// // import ejs from "ejs";
// // import path from "path";

// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
// // });

// // async function sendOtpEmail(options) {
// //   const templatePath = path.join(process.cwd(), "views", "emails", "otp.ejs");

// //   const data = {
// //     appName: "Socially",
// //     userName: options.user.username,
// //     otp: options.otp,
// //     purpose: options.purpose || "verify your email",
// //     expiryMinutes: options.user.otpExpiry ? Math.round((options.user.otpExpiry - Date.now()) / 60000) : 10,
// //     supportEmail: "divyeshodedara1012@gmail.com",
// //     year: new Date().getFullYear(),
// //   };

// //   // Render template with dynamic data
// //   const html = await ejs.renderFile(templatePath, data);

// //   // Send email
// //   await transporter.sendMail({
// //     from: `"Socially" <no-reply@pulse.app>`,
// //     to: options.user.email,
// //     subject: `Your OTP for ${data.appName}`,
// //     html,
// //   });

// //   return data.otp;
// // }

// // export default sendOtpEmail;

// import { Resend } from "resend";
// import ejs from "ejs";
// import path from "path";

// const resend = new Resend(process.env.RESEND_API_KEY);

// async function sendOtpEmail(options) {
//   const templatePath = path.join(process.cwd(), "views", "emails", "otp.ejs");

//   const data = {
//     appName: "Socially",
//     userName: options.user.username,
//     otp: options.otp,
//     purpose: options.purpose || "verify your email",
//     expiryMinutes: 10,
//     supportEmail: "divyeshodedara1012@gmail.com",
//     year: new Date().getFullYear(),
//   };

//   // Render EJS template
//   const html = await ejs.renderFile(templatePath, data);

//   // 🔥 Send using Resend (NO SMTP)
//   await resend.emails.send({
//     from: "Socially <onboarding@resend.dev>", // default domain works
//     to: options.user.email,
//     subject: `Your OTP for ${data.appName}`,
//     html,
//   });

//   return data.otp;
// }

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
