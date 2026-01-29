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

    await sleep(1500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(800);

    const data = await page.evaluate(() => {
      const cleanPrice = (t) =>
        t ? Number(t.replace(/[₹,]/g, "").match(/\d+/)?.[0]) : null;

      const title =
        document.querySelector("h1.pdp-title")?.innerText ||
        document.querySelector("h1")?.innerText ||
        document.title;

      const priceText =
        document.querySelector(".pdp-discounted-price")?.innerText ||
        document.querySelector(".pdp-price")?.innerText ||
        document.querySelector('meta[property="product:price:amount"]')?.content;

      const image =
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector("img")?.src;

      return {
        title: title?.trim(),
        price: cleanPrice(priceText),
        image,
      };
    });

    if (!data?.price || !data?.image) return null;
    return data;
  } catch (err) {
    console.error("❌ Myntra scrape error:", err.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { getMyntraProduct };
