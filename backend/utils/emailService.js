const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD,
  },
});

async function sendPriceAlert(to, link, price, targetPrice) {
  await transporter.sendMail({
    from: `"TagSnag Alerts" <${process.env.ALERT_EMAIL}>`,
    to,
    subject: "🚨 Price Alert Triggered!",
    html: `
      <h2>Price Drop Alert 🎯</h2>
      <p><strong>Product:</strong> <a href="${link}">${link}</a></p>
      <p><strong>Current Price:</strong> ₹${price}</p>
      <p><strong>Your Target Price:</strong> ₹${targetPrice}</p>
      <p>Status: <b>Target Reached</b></p>
    `,
  });
}

module.exports = { sendPriceAlert };
