require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_EMAIL_PASSWORD,
      },
    });

    console.log("⏳ Verifying transporter...");
    await transporter.verify();
    console.log("✅ Transporter verified");

    await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to: process.env.ALERT_EMAIL,
      subject: "✅ TagSnag Test Email",
      text: "If you received this, email alerts WORK.",
    });

    console.log("📧 Test email sent successfully");
  } catch (err) {
    console.error("❌ EMAIL TEST FAILED:");
    console.error(err);
  }
}

testEmail();
