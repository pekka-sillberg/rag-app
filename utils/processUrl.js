const UploadedDocument = require('../models/DocumentUpload.js');
const { runWebScraper } = require('./runWebScraper.js');
const { createEmbedding } = require('./createEmbedding.js');

async function processUrlAndSaveDocument(url) {
  try {
    const { text } = await runWebScraper(url);

    const embedding = await createEmbedding(text);

    const newDoc = new UploadedDocument({
      url: url,
      description: text,
      embedding: embedding,
    });

    await newDoc.save();
    
    return {completed: true, message: 'Document uploaded successfully',data:newDoc};
  } catch (error) {
    console.error('Error processing URL:', error.message);
    return {completed: false, message: `Error processing URL: ${url}`};
  }
}

module.exports = { processUrlAndSaveDocument };
