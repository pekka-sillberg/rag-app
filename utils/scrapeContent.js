const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeContent(url) {
  const pageResponse = await axios.get(url);
  const pageHtml = pageResponse.data;
  const $ = cheerio.load(pageHtml);
  return $('body').text().substring(0, 2000); // Extract main text
};
