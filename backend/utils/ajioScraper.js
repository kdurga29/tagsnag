const puppeteer = require("puppeteer");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getAjioProduct(url) {
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

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (type === "font" || type === "media") return req.abort();
      req.continue();
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
    await sleep(1500);

    // light scroll for lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await sleep(600);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 1.2));
    await sleep(600);

    const data = await page.evaluate(() => {
      const cleanPrice = (txt) => {
        if (!txt) return null;
        const m = String(txt).replace(/[₹,]/g, "").match(/\d+/g);
        if (!m) return null;
        return Number(m.join(""));
      };

      // Try meta first
      const title =
        document.querySelector('meta[property="og:title"]')?.content?.trim() ||
        document.querySelector("h1")?.innerText?.trim() ||
        document.title;

      const image =
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector('meta[name="twitter:image"]')?.content ||
        document.querySelector("img")?.src ||
        null;

      // Price can vary across pages; try common patterns
      const priceText =
        document.querySelector('[itemprop="price"]')?.getAttribute("content") ||
        document.querySelector('[class*="price"]')?.innerText ||
        document.querySelector('[data-testid*="price"]')?.innerText ||
        null;

      const price = cleanPrice(priceText);

      return { title: title || "AJIO Product", price, image };
    });

    if (!data || !data.price || !data.image) return null;
    return data;
  } catch (err) {
    console.error("❌ AJIO scrape error:", err.message);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}

module.exports = { getAjioProduct };
