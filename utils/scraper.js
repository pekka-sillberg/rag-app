const axios = require("axios");
const cheerio = require("cheerio");

const scrapeContent = async (url) => {
  try {
    // Fetch the webpage content
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Remove unwanted tags (script, style, noscript, etc.)
    $("script, style, noscript, iframe, meta, link").remove();

    // Extract visible text from all relevant tags
    const bodyText = $("body")
      .find("*") // Select all elements
      .contents() // Get the children of each element
      .filter(function () {
        // Keep only text nodes
        return this.type === "text";
      })
      .map(function () {
        // Get the trimmed text content of each text node
        return $(this).text().trim();
      })
      .get()
      .filter((text) => text.length > 0) // Remove empty lines
      .join("\n"); // Combine all text with line breaks

    return bodyText || null;
  } catch (error) {
    console.error(`Error scraping URL (${url}):`, error.message);
    return null;
  }
};

const chunkContent = (content, chunkSize = 200) => {
  const words = content.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
};

module.exports = {
  scrapeContent,
  chunkContent,
};
