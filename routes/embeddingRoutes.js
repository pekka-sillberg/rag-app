const express = require("express");
const fs = require("fs");
const path = require("path");
const { scrapeContent } = require("../utils/scraper");
const { generateEmbedding } = require("../utils/embedding");
const { findSimilarDocuments, generateResponseFromContext } = require("../utils/responseManager");
const { queryDatabase, runDatabase } = require("../models/database");
const openaiResponse = require("../utils/openaiResponse");

const router = express.Router();

// Query Endpoint
router.post("/query", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  try {
    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) throw new Error("Failed to generate query embedding.");

    // Step 2: Find similar documents
    const similarDocuments = await findSimilarDocuments(queryEmbedding);
    // Step 3: Generate context from similar documents
    const context = similarDocuments.map((doc) => doc.content).join("\n");

    // Step 4: Generate response from OpenAI
    const prompt = `Context: ${context}  \n\n Query: ${query} \n\n Note: If you don't know the answer, then say 'No results found for this query.' \n\n Answer:`;
    // const prompt = `Context: ${context}  \n\n Query: ${query} \n\n Answer:`;

    let answer = await openaiResponse(prompt);
    // Step 5: Handle OpenAI "No results" response
    if (answer == "No results found for this query.") {
      const existingAnswer = await queryDatabase(
        "SELECT answer FROM questions WHERE question = ?",
        [query]
      );

      if (existingAnswer.length > 0) {
        if (existingAnswer[0].answer.includes('provided text')) {
          answer = `No specific details found. May be this will help: <a style='word-wrap: break-word;' href="https://www.google.com/search?q=${query} at Tampere University" target="_blank">Link</a>`;
        } else {
          answer = existingAnswer[0].answer;
        }

        // Use the existing answer
      } else {
        // Handle case where no existing answer is found
        answer = `No specific details found. May be this will help: <a style='word-wrap: break-word;' href="https://www.google.com/search?q=${query} at Tampere University" target="_blank">Link</a>`;
      }

    } else {
      // Concatenate URLs of matched documents with the answer
      const links = similarDocuments
        .map((doc) => `<a href="${doc.url}" target="_blank">- ${doc.url}</a>`)
        .join("<br>");
      answer = `${answer}<br><br>For more details, visit:<br>${links}`;

      // Save/update the response for this question
      const existingQuestion = await queryDatabase(
        "SELECT id FROM questions WHERE question = ?",
        [query]
      );

      if (existingQuestion.length > 0) {
        // Update existing record
        await runDatabase(
          "UPDATE questions SET answer = ?, count = count + 1 WHERE id = ?",
          [answer, existingQuestion[0].id]
        );
      } else {
        // Insert new record
        await runDatabase(
          "INSERT INTO questions (question, answer, count) VALUES (?, ?, ?)",
          [query, answer, 1]
        );
      }
    }

    res.json({ answer });
  } catch (error) {
    console.error("Error querying:", error.message);
    res.status(500).json({ error: "Failed to process query." });
  }
});



// Feed Multiple URLs Endpoint

router.get("/feed-url-list", async (req, res) => {
  const filePath = path.join(__dirname, "../allUnique.txt");

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "allUnique.txt file not found." });
  }

  try {
    // Read URLs from the file
    const urls = fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean);

    if (urls.length === 0) {
      return res.status(400).json({ error: "No URLs found in allUnique.txt file." });
    }

    const successUrls = [];
    const failedUrls = [];
    let i = 1;
    for (const url of urls) {
      console.log(i);
      i++;
      try {
        const content = await scrapeContent(url);

        if (!content) {
          failedUrls.push(url);
          continue;
        }

        const embedding = await generateEmbedding(content);

        if (!embedding) {
          failedUrls.push(url);
          continue;
        }

        // Check if the URL already exists
        const existingDocument = await queryDatabase(
          "SELECT id FROM documents WHERE url = ?",
          [url]
        );

        if (existingDocument.length > 0) {
          // Update the existing document
          await runDatabase(
            "UPDATE documents SET content = ?, embedding = ? WHERE url = ?",
            [content, JSON.stringify(embedding), url]
          );
        } else {
          // Insert a new document
          await runDatabase(
            "INSERT INTO documents (url, content, embedding) VALUES (?, ?, ?)",
            [url, content, JSON.stringify(embedding)]
          );
        }

        successUrls.push(url);
      } catch (error) {
        console.error(`Error processing URL (${url}):`, error.message);
        failedUrls.push(url);
      }
    }

    // Write the successful URLs to a file
    const todayDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const successFilePath = path.join(__dirname, `../success-${todayDate}.txt`);
    const failedFilePath = path.join(__dirname, `../failed-${todayDate}.txt`);


    fs.writeFileSync(successFilePath, successUrls.join("\n"), "utf8");
    fs.writeFileSync(failedFilePath, failedUrls.join("\n"), "utf8");

    res.json({
      message: "URLs processed.",
      total: urls.length,
      successCount: successUrls.length,
      failedCount: failedUrls.length
    });
  } catch (error) {
    console.error("Error processing URL list:", error.message);
    res.status(500).json({ error: "Failed to process URL list." });
  }
});


// Feed Single URL Endpoint
router.post("/feed-single-url", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const content = await scrapeContent(url);

    if (!content) {
      return res.status(400).json({ error: "Failed to scrape content from the URL." });
    }

    const embedding = await generateEmbedding(content);

    if (!embedding) {
      return res.status(500).json({ error: "Failed to generate embedding for the content." });
    }

    // Check if the URL already exists
    const existingDocument = await queryDatabase(
      "SELECT id FROM documents WHERE url = ?",
      [url]
    );

    if (existingDocument.length > 0) {
      // Update the existing document
      await runDatabase(
        "UPDATE documents SET content = ?, embedding = ? WHERE url = ?",
        [content, JSON.stringify(embedding), url]
      );

      res.json({ message: "URL content and embedding updated successfully." });
    } else {
      // Insert a new document
      await runDatabase(
        "INSERT INTO documents (url, content, embedding) VALUES (?, ?, ?)",
        [url, content, JSON.stringify(embedding)]
      );

      res.json({ message: "URL processed and saved successfully." });
    }
  } catch (error) {
    console.error("Error processing single URL:", error.message);
    res.status(500).json({ error: "Failed to process URL." });
  }
});


// Top Questions Endpoint
router.get("/top-questions", async (req, res) => {
  try {
    const questions = await queryDatabase(
      "SELECT question, answer, count FROM questions ORDER BY count DESC LIMIT 30"
    );

    res.json(questions);
  } catch (error) {
    console.error("Error fetching top questions:", error.message);
    res.status(500).json({ error: "Failed to fetch top questions." });
  }
});

module.exports = router;
