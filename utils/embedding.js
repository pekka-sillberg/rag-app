const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
  baseURL: process.env.OPEN_BASE_URL,
});

const generateEmbedding = async (text) => {
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: process.env.MODEL_EMBEDDING,
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
