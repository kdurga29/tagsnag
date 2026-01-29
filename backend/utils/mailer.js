const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD,
  },
});

async function sendPriceDropEmail(to, product, oldPrice, newPrice) {
  await transporter.sendMail({
    from: `"TagSnag Alerts" <${process.env.ALERT_EMAIL}>`,
    to,
    subject: `🔥 Price Dropped: ${product.title}`,
    html: `
      <h2>Price Drop Alert</h2>
      <p><strong>${product.title}</strong></p>
      <p>Old price: ₹${oldPrice}</p>
      <p>New price: ₹${newPrice}</p>
      <a href="${product.link}">View on Myntra</a>
    `,
  });
}

module.exports = { sendPriceDropEmail };
