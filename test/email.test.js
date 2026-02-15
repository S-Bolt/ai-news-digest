import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail } from "../helpers/email.js";

test("sendEmail builds transport config and sends expected payload", async () => {
  const originalEnv = { ...process.env };
  try {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";
    process.env.EMAIL_FROM = "from@example.com";
    process.env.EMAIL_TO = "to@example.com";

    let capturedConfig;
    let capturedPayload;

    const transportFactory = (config) => {
      capturedConfig = config;
      return {
        sendMail: async (payload) => {
          capturedPayload = payload;
        },
      };
    };

    await sendEmail(
      { subject: "Subject", text: "Body", html: "<p>Body</p>" },
      { transportFactory },
    );

    assert.deepEqual(capturedConfig, {
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: { user: "user", pass: "pass" },
    });

    assert.deepEqual(capturedPayload, {
      from: "from@example.com",
      to: "to@example.com",
      subject: "Subject",
      text: "Body",
      html: "<p>Body</p>",
    });
  } finally {
    process.env = originalEnv;
  }
});
