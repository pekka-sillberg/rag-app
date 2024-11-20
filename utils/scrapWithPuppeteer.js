const puppeteer = require("puppeteer");

const scrapeContentWithPuppeteer = async (url) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Remove unwanted elements and get visible text
    const text = await page.evaluate(() => {
      document.querySelectorAll("script, style, noscript, iframe, meta, link").forEach((el) => el.remove());
      return document.body.innerText.trim();
    });

    await browser.close();
    return text || null;
  } catch (error) {
    console.error(`Error scraping URL (${url}):`, error.message);
    return null;
  }
};

module.exports = scrapeContentWithPuppeteer;
