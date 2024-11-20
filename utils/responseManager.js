const { queryDatabase } = require("../models/database");
const { generateEmbedding } = require("./embedding");

// Calculate cosine similarity
const calculateCosineSimilarity = (embedding1, embedding2) => {
  const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magnitude1 * magnitude2);
};

// Find top similar documents
const findSimilarDocuments = async (queryEmbedding) => {
  const documents = await queryDatabase("SELECT id,url, content, embedding FROM documents");
  const results = documents
    .map((doc) => {
      const embedding = JSON.parse(doc.embedding);
      const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
      return { ...doc, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 2); // Top 5 results

  return results;
};



module.exports = {
  findSimilarDocuments
};
