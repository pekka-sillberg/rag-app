const express = require('express');
const UploadedDocument = require('../models/DocumentUpload.js');
const Question = require('../models/Question.js');
const { createEmbedding } = require('../utils/createEmbedding.js');
const { connectToMongoDB } = require('../config/MongoDB.js');
const { runWebScraper } = require('../utils/runWebScraper.js');
const { hitOpenAiApi } = require('../utils/hitOpenAiApi.js');
const { processUrlAndSaveDocument } = require('../utils/processUrl.js');
const { getUrlsFromSitemap } = require('../utils/getUrlsFromSitemap.js');

const fs = require('fs');
const path = require('path');

const router = express.Router();

// router.get('/feed-url-list', async (req, res) => {
//   try {
//     // Dynamically import p-limit
//     const { default: pLimit } = await import('p-limit');
//     const limit = pLimit(5); // Limit concurrent processes to 10

//     // Read file asynchronously
//     const data = await fs.readFileSync('enUnique.txt', 'utf8');
//     const urls = data.split('\n').filter(Boolean);

//     // Process URLs concurrently with a limit
//     const results = await Promise.allSettled(
//       urls.map(url =>
//         limit(async () => {
//           const result = await processUrlAndSaveDocument(url);
//           if (!result.completed) {
//             console.error('Error processing URL:', result.message);
//           }
//         })
//       )
//     );

//     const failedResults = results.filter(result => result.status === 'rejected');
//     if (failedResults.length > 0) {
//       console.error('Failed URLs:', failedResults);
//     }

//     res.send('URL processing completed');
//   } catch (err) {
//     console.error('Error processing URLs:', err.message);
//     res.status(500).send('Error processing URLs');
//   }
// });
router.get('/feed-url-list', async (req, res) => {

  try {
    const data = await fs.readFileSync('fnUnique.txt', 'utf8');
    const urls = data.split('\n').filter(Boolean);
    const urlCount = urls.length;

    if (urlCount === 0) {
      return res.status(404).json({ error: 'No URLs found in the filr.' });
    }
    const successUrls = [];
    const failedUrls = [];

    for (const url of urls) {
      const result = await processUrlAndSaveDocument(url);
      if (result.completed) {
        successUrls.push(url);
      } else {
        failedUrls.push(url);
      }
    }

    const dirPath = path.join(__dirname, '../txtFileFn');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-MM-SS


    const successContent = `Success URLs:\n${successUrls.join('\n')}`;
    const failedContent = `Failed URLs:\n${failedUrls.join('\n')}`;

    fs.writeFileSync(path.join(dirPath, `success_${timestamp}.txt`), successContent);
    fs.writeFileSync(path.join(dirPath, `failed_${timestamp}.txt`), failedContent);

    res.status(200).json({
      message: `Processed ${urlCount} URLs.`,
      successCount: successUrls.length,
      failedCount: failedUrls.length,
    });
  } catch (error) {
    console.error('Error processing XML:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});



router.post('/document', async (req, res) => {
  try {
    const { url } = req.body;

    const result = await processUrlAndSaveDocument(url);
    if (!result.completed) {
      res.status(500).json({ error: result.message });
      return;
    } else {
      res.status(201).json({
        message: result.message,
        document: result.data,
      });
    }
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
        // console.log('documents---------', documents)
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
    //save query and answer in question collection using async await
    const question = new Question({ question: query, answer: answer });
    await question.save();
    
    res.send(answer);
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
});

router.post('/xml', async (req, res) => {
  const { url } = req.body;

  try {
    const urls = await getUrlsFromSitemap(url);
    const urlCount = urls.length;

    if (urlCount === 0) {
      return res.status(404).json({ error: 'No URLs found in the sitemap.' });
    }
    const successUrls = [];
    const failedUrls = [];

    for (const url of urls) {
      const result = await processUrlAndSaveDocument(url);
      if (result.completed) {
        successUrls.push(url);
      } else {
        failedUrls.push(url);
      }
    }

    const dirPath = path.join(__dirname, '../xmlInfo');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-MM-SS
    const mainUrl = url;

    const successContent = `Main URL: ${mainUrl}\n\nSuccess URLs:\n${successUrls.join('\n')}`;
    const failedContent = `Main URL: ${mainUrl}\n\nFailed URLs:\n${failedUrls.join('\n')}`;

    fs.writeFileSync(path.join(dirPath, `success_${timestamp}.txt`), successContent);
    fs.writeFileSync(path.join(dirPath, `failed_${timestamp}.txt`), failedContent);

    res.status(200).json({
      message: `Processed ${urlCount} URLs.`,
      successCount: successUrls.length,
      failedCount: failedUrls.length,
    });
  } catch (error) {
    console.error('Error processing XML:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

module.exports = router;
