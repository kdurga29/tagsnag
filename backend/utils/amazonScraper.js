const puppeteer = require("puppeteer");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getAmazonProduct(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );

    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

    // Let Amazon JS load
    await sleep(2500);

    const data = await page.evaluate(() => {
      const cleanPrice = (txt) => {
        if (!txt) return null;
        const m = txt.replace(/[₹,]/g, "").match(/\d+/g);
        return m ? Number(m.join("")) : null;
      };

      const title =
        document.querySelector("#productTitle")?.innerText?.trim() ||
        document.querySelector("h1")?.innerText?.trim() ||
        document.title;

      const priceText =
        document.querySelector(".a-price .a-offscreen")?.innerText ||
        document.querySelector("#priceblock_dealprice")?.innerText ||
        document.querySelector("#priceblock_ourprice")?.innerText ||
        null;

      const price = cleanPrice(priceText);

      const image =
        document.querySelector("#landingImage")?.src ||
        document.querySelector("#imgTagWrapperId img")?.src ||
        document.querySelector('meta[property="og:image"]')?.content ||
        null;

      return { title, price, image };
    });

    if (!data?.price || !data?.image) {
      throw new Error("Amazon data missing");
    }

    return data;
  } catch (err) {
    console.error("❌ Amazon scrape error:", err.message);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { getAmazonProduct };
