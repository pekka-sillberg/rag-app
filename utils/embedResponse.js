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
        const url = `<a href=${highestScoreDoc.url} target="_blank">${highestScoreDoc.url}</a>`;

        const prompt = `Context: ${highestScoreDoc.description} \n\n Query: ${query} \n\n Answer: \n\n Instruction: make the answer in the same language as the query.`;

        return { prompt,linksHtml: url };
    } catch (err) {
        console.error('Error in embedResponse:', err);
        throw err; // Propagate the error to the caller
    }
}

module.exports = { embedResponse };
