const axios = require('axios');
const cheerio = require('cheerio');

const runWebScraper = async (url) => {
  const pageResponse = await axios.get(url);
  const pageHtml = pageResponse.data;
  const $ = cheerio.load(pageHtml);
  const text = $('body').text().substring(0, 2000)
  return {text}; // Extract main text
}


module.exports = { runWebScraper }