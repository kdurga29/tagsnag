const puppeteer = require("puppeteer");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getMyntraProduct(url) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
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

    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    await sleep(1200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(800);

    const data = await page.evaluate(() => {
      const cleanPrice = (txt) => {
        if (!txt) return null;
        const m = String(txt).replace(/[₹,]/g, "").match(/\d+/g);
        if (!m) return null;
        return Number(m.join(""));
      };

      const title =
        document.querySelector("h1.pdp-title")?.innerText?.trim() ||
        document.querySelector("h1")?.innerText?.trim() ||
        document.querySelector('meta[property="og:title"]')?.content?.trim() ||
        document.title;

      const priceText =
        document.querySelector(".pdp-discounted-price")?.innerText ||
        document.querySelector(".pdp-price")?.innerText ||
        document.querySelector('meta[property="product:price:amount"]')?.content ||
        null;

      const image =
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector('meta[name="twitter:image"]')?.content ||
        document.querySelector("img")?.src ||
        null;

      return { title, price: cleanPrice(priceText), image };
    });

    if (!data?.price || !data?.image) return null;
    return data;
  } catch (err) {
    console.error("❌ Myntra scrape error:", err.message);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}

module.exports = { getMyntraProduct };
