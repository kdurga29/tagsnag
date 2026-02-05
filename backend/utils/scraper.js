const axios = require("axios");
const cheerio = require("cheerio");

async function getPriceFromURL(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // AMAZON PRICE SELECTORS
    const selectors = [
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      ".a-price .a-offscreen",
    ];

    for (const sel of selectors) {
      const text = $(sel).first().text();
      if (text) {
        return Number(text.replace(/[₹,]/g, ""));
      }
    }

    return null;
  } catch (err) {
    console.error("❌ Scraper error:", err.message);
    return null;
  }
}

module.exports = { getPriceFromURL };
