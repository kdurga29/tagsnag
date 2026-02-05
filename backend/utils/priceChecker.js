const Product = require("../models/Product");
const { getMyntraPrice } = require("./myntraScraper");
const { sendPriceAlert } = require("./sendEmail");

let isRunning = false;

async function checkPrices() {
  if (isRunning) return; // prevent parallel runs
  isRunning = true;

  try {
    console.log("🔄 Checking prices...");

    const products = await Product.find({
      targetPrice: { $ne: null },
      alertTriggered: false,
    });

    for (const product of products) {
      try {
        const newPrice = await getMyntraPrice(product.link);
        if (newPrice === null) continue;

        product.price = newPrice;

        if (newPrice <= product.targetPrice) {
          product.alertTriggered = true;

          console.log(
            `🚨 ALERT HIT → ₹${newPrice} | ${product.link}`
          );

          await sendPriceAlert(product.link, newPrice);
        }

        await product.save();
      } catch (err) {
        console.error("❌ Product check failed:", err.message);
      }
    }
  } catch (err) {
    console.error("❌ Price checker error:", err.message);
  } finally {
    isRunning = false;
  }
}

/* 🔁 Run automatically every 15 seconds */
setInterval(checkPrices, 15 * 1000);

module.exports = { checkPrices };
