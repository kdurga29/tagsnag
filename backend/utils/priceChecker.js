const Product = require("../models/Product");
const User = require("../models/User");
const { getMyntraProduct } = require("./myntraScraper");
const { sendPriceDropEmail } = require("./mailer");

let isRunning = false;

async function trackAllProducts() {
  if (isRunning) return;
  isRunning = true;

  try {
    console.log("⏳ Background price check running...");

    const products = await Product.find().lean();

    for (const p of products) {
      try {
        // Only Myntra supported
        if (!p.link || !p.link.includes("myntra.com")) continue;

        const scraped = await getMyntraProduct(p.link);
        if (!scraped?.price) continue;

        const oldPrice = p.price;
        const newPrice = scraped.price;

        // If price didn't change, skip
        if (oldPrice === newPrice) continue;

        // Update product
        await Product.updateOne(
          { _id: p._id },
          {
            $set: {
              title: scraped.title || p.title,
              image: scraped.image || p.image,
              price: newPrice,
            },
            $push: {
              priceHistory: { price: newPrice, date: new Date() },
            },
          }
        );

        // Send email only if drop
        if (oldPrice && newPrice < oldPrice) {
          const user = await User.findById(p.user).lean();
          if (user?.email) {
            await sendPriceDropEmail(
              user.email,
              { title: scraped.title || p.title, link: p.link },
              oldPrice,
              newPrice
            );
          }
        }
      } catch (err) {
        console.error("❌ Background product check failed:", err.message);
      }
    }
  } catch (err) {
    console.error("❌ trackAllProducts fatal:", err.message);
  } finally {
    isRunning = false;
  }
}

module.exports = { trackAllProducts };
