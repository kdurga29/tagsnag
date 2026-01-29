const Product = require("../models/Product");
const { getMyntraProduct } = require("./myntraScraper");
const { sendPriceDropEmail } = require("./mailer");
const User = require("../models/User");

async function trackAllProducts() {
  const products = await Product.find().populate("user");

  for (const product of products) {
    const data = await getMyntraProduct(product.link);
    if (!data?.price) continue;

    const oldPrice = product.price;
    const newPrice = data.price;

    if (newPrice !== oldPrice) {
      product.price = newPrice;
      product.priceHistory.push({ price: newPrice, date: new Date() });
      await product.save();

      if (newPrice < oldPrice && product.user?.email) {
        await sendPriceDropEmail(
          product.user.email,
          product,
          oldPrice,
          newPrice
        );
      }
    }
  }
}

module.exports = { trackAllProducts };
