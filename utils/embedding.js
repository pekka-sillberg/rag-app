const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const generateEmbedding = async (text) => {
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return embeddingResponse.data[0].embedding;
     
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    return null;
  }
};

module.exports = {
  generateEmbedding,
};
