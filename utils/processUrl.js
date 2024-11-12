const UploadedDocument = require('../models/DocumentUpload.js');
const { runWebScraper } = require('./runWebScraper.js');
const { createEmbedding } = require('./createEmbedding.js');

async function processUrlAndSaveDocument(url) {
  try {
    const { text } = await runWebScraper(url);

    const embedding = await createEmbedding(text);

    // Check if a document with the same URL exists
    const existingDoc = await UploadedDocument.findOne({ url: url });

    if (existingDoc) {
      // If the document exists, update its description and embedding
      existingDoc.description = text;
      existingDoc.embedding = embedding;

      await existingDoc.save();

      return {
        completed: true,
        message: 'Document updated successfully',
        data: existingDoc,
      };
    } else {
      // If the document doesn't exist, create a new one
      const newDoc = new UploadedDocument({
        url: url,
        description: text,
        embedding: embedding,
      });

      await newDoc.save();

      return {
        completed: true,
        message: 'Document uploaded successfully',
        data: newDoc,
      };
    }
  } catch (error) {
    console.error('Error processing URL:', error.message);
    return {
      completed: false,
      message: `Error processing URL: ${url}`,
    };
  }
}


module.exports = { processUrlAndSaveDocument };
