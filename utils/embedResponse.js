const { createEmbedding } = require('./createEmbedding');
const UploadedDocument = require('../models/DocumentUpload');

async function embedResponse(query) {
    console.log('embedResponse');

    try {
        // Create the embedding for the query
        const embedding = await createEmbedding(query);

        // Find similar documents using the embedding
        const similarDocuments = await UploadedDocument.aggregate([
            {
                $search: {
                    knnBeta: {
                        vector: embedding,
                        path: 'embedding', // The path to the embedding field in the collection
                        k: 5, // Return top 5 most similar documents
                    },
                },
            },
            {
                $project: {
                    description: 1,
                    url: 1,
                    score: { $meta: 'searchScore' },
                },
            },
        ]);

        if (similarDocuments.length === 0) {
            console.log('No similar documents found.');
            return null; // Return `null` if no similar documents are found
        }
        // Find the document with the highest score
        const highestScoreDoc = similarDocuments.reduce((highest, current) =>
            highest.score > current.score ? highest : current
        );
        const url = `<a style='word-wrap: break-word;' href=${highestScoreDoc.url} target="_blank">${highestScoreDoc.url}</a>`;
        // const prompt = `Context: ${highestScoreDoc.description} \n\n Query: ${query} \n\n Answer (Same language as the query): `;
        const prompt = `Context: ${highestScoreDoc.description} \n\n Query: \n\n Note:if you don't know the answer then say 'No results found for this query.' \n\n ${query} \n\n  Answer:`;
        return { prompt,linksHtml: url };
    } catch (err) {
        console.error('Error in embedResponse:', err);
        throw err; // Propagate the error to the caller
    }
}

module.exports = { embedResponse };
