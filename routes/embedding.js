const express = require('express');
const UploadedDocument = require('../models/DocumentUpload.js');
const { createEmbedding } = require('../utils/createEmbedding.js');
const { connectToMongoDB } = require('../config/MongoDB.js');
const { runWebScraper } = require('../utils/runWebScraper.js');
const { hitOpenAiApi } = require('../utils/hitOpenAiApi.js');

const router = express.Router();



router.post('/document', async (req, res) => {
  try {
    const { url } = req.body;

    const { text } = await runWebScraper(url);
    const embedding = await createEmbedding(text);

    const newDoc = new UploadedDocument({
      description: text,
      embedding: embedding,
    });
    const savedDoc = await newDoc.save();
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: savedDoc,
    });
  } catch (err) {
    console.log('err: ', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err,
    });
  }
});

// Query embedding for similar documents
router.post('/query-embedding', async (req, res) => {
  try {
    const { query } = req.body;
    const embedding = await createEmbedding(query);

    async function findSimilarDocuments(embedding) {
      try {
        // Query similar documents using Mongoose
        const documents = await UploadedDocument.aggregate([
          {
            $search: {
              knnBeta: {
                vector: embedding,
                path: 'embedding', // The path to the embedding field in the collection
                k: 5,  // Return top 5 most similar documents
              },
            },
          },
          {
            $project: {
              description: 1,
              score: { $meta: 'searchScore' },
            },
          },
        ]);
console.log('documents---------', documents)
        return documents;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }

    const similarDocuments = await findSimilarDocuments(embedding);
    if (similarDocuments.length === 0) {
      res.status(404).json({ message: 'No similar documents found.' });
      return;
    }

    const highestScoreDoc = similarDocuments.reduce((highest, current) => {
      return highest.score > current.score ? highest : current;
    });

    const prompt = `Based on this context: ${highestScoreDoc.description} \n\n Query: ${query} \n\n Answer:`;
    const answer = await hitOpenAiApi(prompt);
    res.send(answer);
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
});

module.exports = router;
