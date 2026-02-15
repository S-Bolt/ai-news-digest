import nodemailer from "nodemailer";

export async function sendEmail(
  { subject, text, html },
  { transportFactory = nodemailer.createTransport } = {},
) {
  const transporter = transportFactory({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // correct for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject,
    text,
    html,
  });
}
