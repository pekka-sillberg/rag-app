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

// Query response
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
    if (answer === 'No results found for this query.') {
      const matchingQuestion = await Question.findOne({ where: { question: query } });

      if (matchingQuestion) {
        matchingQuestion.count += 1;
        await matchingQuestion.save();
        answer = matchingQuestion.answer;
      } else {

        answer = `No specific details found. May be this will help : <a style='word-wrap: break-word;' href="https://www.google.com/search?q=${query} at Tampere University" target="_blank">Link</a>`;
      }
      return res.send(answer);
    }
    answer = `${answer}<br><br>For more details, visit :<br>${linksHtml}`;
    const existingQuestion = await Question.findOne({ question: query });

    if (existingQuestion) {
      existingQuestion.answer = answer;
      existingQuestion.count += 1;
      const upQuestion = await existingQuestion.save();
      return res.send(answer);
    }
    const newQuestion = new Question({ question: query, answer: answer, count: 1 });
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


//questions
router.get('/faqs/top', async (req, res) => {
  try {
    const topQuestions = await Question.find()
      .sort({ count: -1 }) // Sort by count in descending order
      .limit(20); // Limit to top 20
    res.json(topQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// //feed urls from text
// router.get('/feed-url-list', async (req, res) => {

//   try {
//     const data = await fs.readFileSync('allUnique.txt', 'utf8');
//     const urls = data.split('\n').filter(Boolean);
//     const urlCount = urls.length;

//     if (urlCount === 0) {
//       return res.status(404).json({ error: 'No URLs found in the file.' });
//     }
//     const successUrls = [];
//     const failedUrls = [];
//     let i = 1;
//     for (const url of urls) {
//       const result = await processUrlAndSaveDocument(url);
//       console.log(i + '----- ' + url);
//       if (result.completed) {
//         successUrls.push(url);
//       } else {
//         failedUrls.push(url);
//       }
//       i++;
//     }

//     const dirPath = path.join(__dirname, '../txtFileAll');
//     if (!fs.existsSync(dirPath)) {
//       fs.mkdirSync(dirPath);
//     }

//     const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-MM-SS


//     const successContent = `Success URLs:\n${successUrls.join('\n')}`;
//     const failedContent = `Failed URLs:\n${failedUrls.join('\n')}`;

//     fs.writeFileSync(path.join(dirPath, `success_${timestamp}.txt`), successContent);
//     fs.writeFileSync(path.join(dirPath, `failed_${timestamp}.txt`), failedContent);

//     res.status(200).json({
//       message: `Processed ${urlCount} URLs.`,
//       successCount: successUrls.length,
//       failedCount: failedUrls.length,
//     });
//   } catch (error) {
//     console.error('Error processing XML:', error.message);
//     res.status(500).json({
//       error: 'Internal server error',
//       message: error.message,
//     });
//   }
// });


// //single url feeding
// router.post('/document', async (req, res) => {
//   try {
//     const { url } = req.body;

//     const result = await processUrlAndSaveDocument(url);
//     if (!result.completed) {
//       res.status(500).json({ error: result.message });
//       return;
//     } else {
//       res.status(201).json({
//         message: result.message,
//         document: result.data,
//       });
//     }
//   } catch (err) {
//     console.log('err: ', err);
//     res.status(500).json({
//       error: 'Internal server error',
//       message: err,
//     });
//   }
// });


// //sitemap urls
// router.post('/xml', async (req, res) => {
//   const { url } = req.body;

//   try {
//     const urls = await getUrlsFromSitemap(url);
//     const urlCount = urls.length;

//     if (urlCount === 0) {
//       return res.status(404).json({ error: 'No URLs found in the sitemap.' });
//     }
//     const successUrls = [];
//     const failedUrls = [];

//     for (const url of urls) {
//       const result = await processUrlAndSaveDocument(url);
//       if (result.completed) {
//         successUrls.push(url);
//       } else {
//         failedUrls.push(url);
//       }
//     }

//     const dirPath = path.join(__dirname, '../xmlInfo');
//     if (!fs.existsSync(dirPath)) {
//       fs.mkdirSync(dirPath);
//     }

//     const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-MM-SS
//     const mainUrl = url;

//     const successContent = `Main URL: ${mainUrl}\n\nSuccess URLs:\n${successUrls.join('\n')}`;
//     const failedContent = `Main URL: ${mainUrl}\n\nFailed URLs:\n${failedUrls.join('\n')}`;

//     fs.writeFileSync(path.join(dirPath, `success_${timestamp}.txt`), successContent);
//     fs.writeFileSync(path.join(dirPath, `failed_${timestamp}.txt`), failedContent);

//     res.status(200).json({
//       message: `Processed ${urlCount} URLs.`,
//       successCount: successUrls.length,
//       failedCount: failedUrls.length,
//     });
//   } catch (error) {
//     console.error('Error processing XML:', error.message);
//     res.status(500).json({
//       error: 'Internal server error',
//       message: error.message,
//     });
//   }
// });

module.exports = router;
