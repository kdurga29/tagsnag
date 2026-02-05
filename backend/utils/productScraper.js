const { getMyntraProduct } = require("./myntraScraper");
const { getAjioProduct } = require("./ajioScraper");

function getHost(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

async function scrapeProduct(link) {
  const host = getHost(link);

  if (host.includes("myntra.com")) return getMyntraProduct(link);
  if (host.includes("ajio.com")) return getAjioProduct(link);

  return null;
}

module.exports = { scrapeProduct };
