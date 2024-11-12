const express = require('express');
const UploadedDocument = require('../models/DocumentUpload.js');
const Question = require('../models/Question.js');
const { createEmbedding } = require('../utils/createEmbedding.js');
const { connectToMongoDB } = require('../config/MongoDB.js');
const { runWebScraper } = require('../utils/runWebScraper.js');
const { hitOpenAiApi } = require('../utils/hitOpenAiApi.js');
const { processUrlAndSaveDocument } = require('../utils/processUrl.js');
const { getUrlsFromSitemap } = require('../utils/getUrlsFromSitemap.js');
const { embedResponse } = require('../utils/embedResponse.js');

const fs = require('fs');
const path = require('path');
const browserResponse = require('../utils/browserResponse.js');

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
    const data = await fs.readFileSync('allUnique.txt', 'utf8');
    const urls = data.split('\n').filter(Boolean);
    const urlCount = urls.length;

    if (urlCount === 0) {
      return res.status(404).json({ error: 'No URLs found in the file.' });
    }
    const successUrls = [];
    const failedUrls = [];
    let i = 1;
    for (const url of urls) {
      const result = await processUrlAndSaveDocument(url);
      console.log(i+'----- '+url);
      if (result.completed) {
        successUrls.push(url);
      } else {
        failedUrls.push(url);
      }
      i++;
    }

    const dirPath = path.join(__dirname, '../txtFileAll');
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


//single url feeding
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
  const { query } = req.body;


  try {
    // Get the prompt and links HTML (scraped content from browser response)
    const { prompt, linksHtml } = await embedResponse(query);
    // const { prompt, linksHtml } = await browserResponse(query);
    if (!prompt) {
      throw new Error('No prompt generated.');
    }

    // Generate the answer using the OpenAI API
    let answer = await hitOpenAiApi(prompt);
    answer = `${answer}<br><br>For more details, visit :<br>${linksHtml}`;

    const existingQuestion = await Question.findOne({ question: query });

    if (existingQuestion) {
      existingQuestion.answer = answer;
      await existingQuestion.save();
      return res.send(answer);
    }
    const newQuestion = new Question({ question: query, answer: answer });
    await newQuestion.save();

    return res.send(answer);

  } catch (err) {
    console.error('Error occurred:', err.message); // Log for debugging
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    }
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
