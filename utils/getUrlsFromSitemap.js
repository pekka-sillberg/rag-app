const axios = require('axios');
const xml2js = require('xml2js');

function extractUrlsFromUrlSet(urlset) {
    if (Array.isArray(urlset?.url)) {
        return urlset.url.map((urlEntry) => urlEntry.loc[0]);
    }
    return [];
}

async function getUrlsFromSitemapIndex(sitemapindex) {
    const urls = [];
    if (Array.isArray(sitemapindex?.sitemap)) {
        const sitemapUrls = sitemapindex.sitemap.map((sitemapEntry) => sitemapEntry.loc[0]);

        for (const sitemapUrl of sitemapUrls) {
            const nestedUrls = await getUrlsFromSitemap(sitemapUrl); 
            urls.push(...nestedUrls);
        }
    }
    return urls;
}

async function getUrlsFromSitemap(sitemapUrl) {
    let urls = []; 

    try {
        const response = await axios.get(sitemapUrl);
        const xml = response.data;

        const result = await xml2js.parseStringPromise(xml);
        
        urls = urls.concat(extractUrlsFromUrlSet(result.urlset));

        if (result.sitemapindex) {
            urls = urls.concat(await getUrlsFromSitemapIndex(result.sitemapindex)); // Get URLs from sitemapindex
        }

        if (urls.length === 0) {
            throw new Error('Unexpected XML structure: No valid URLs found.');
        }

        return urls; // Return the array of actual page URLs
    } catch (error) {
        console.error('Error fetching sitemap:', error.message);
        return []; // Return an empty array on error
    }
}

module.exports = {getUrlsFromSitemap}; // Export the function for use in other modules
