const axios = require("axios");

async function getShopifyPrice(link) {
  try {
    // Convert product URL to JSON URL
    const jsonUrl = link.endsWith(".json")
      ? link
      : link.replace(/\/products\/(.*)/, "/products/$1.json");

    const res = await axios.get(jsonUrl);

    // Shopify price path
    const product = res.data.product;
    if (!product) return null;

    // Get first variant price
    const priceString = product.variants[0]?.price;
    if (!priceString) return null;

    // Convert to Number
    const price = Number(priceString);

    return isNaN(price) ? null : price;
  } catch (err) {
    console.error("❌ Shopify price fetch failed:", err.message);
    return null;
  }
}

module.exports = { getShopifyPrice };
