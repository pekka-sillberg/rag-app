const fetchGoogleSearch = require('./fetchGoogleSearch');
const scrapeContent = require('./scrapeContent');

module.exports = async function browserResponse(query) {

    try {
        // Fetch all URLs from Google search
        const allUrls = await fetchGoogleSearch(query);
        console.log('allUrls:', allUrls);
        if (!allUrls || allUrls.length === 0) {
            return null; // Return null if no URLs are found
        }

        // Scrape the content of the first URL (or you could scrape more if needed)
        const pageContent = await scrapeContent(allUrls[0]);

        // Format the first 3 links with numbering as requested
        const linksHtml = allUrls.slice(0, 3)  // Get only the first 3 URLs
            .map((url, index) => `${index + 1}.<a href="${url}" target="_blank">${url}</a><br>`)
            .join('');

        // Build the prompt with the content from the first URL and include the first 3 links
        const prompt = `Based on this context: ${pageContent} \n\n Query: ${query} \n\n Answer:`;

        // Return structured data
        return { prompt, linksHtml };
    } catch (error) {
        console.error('Error in browserResponse:', error);
        return null; // Return null to indicate an error
    }
};
