const nodemailer = require("nodemailer");

function createTransporter() {
  if (!process.env.ALERT_EMAIL || !process.env.ALERT_EMAIL_PASSWORD) {
    throw new Error("Missing ALERT_EMAIL or ALERT_EMAIL_PASSWORD in .env");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASSWORD,
    },
  });
}

async function sendPriceDropEmail(to, product, oldPrice, newPrice) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"TagSnag Alerts" <${process.env.ALERT_EMAIL}>`,
    to,
    subject: `🔥 Price Dropped: ${product.title}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Price Drop Alert</h2>
        <p><strong>${product.title}</strong></p>
        <p>Old price: <strong>₹${oldPrice}</strong></p>
        <p>New price: <strong>₹${newPrice}</strong></p>
        <p>
          <a href="${product.link}" target="_blank" rel="noreferrer">
            View on Myntra
          </a>
        </p>
      </div>
    `,
  });
}

module.exports = { sendPriceDropEmail };
