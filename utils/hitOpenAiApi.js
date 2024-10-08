const { OpenAI } = require("openai");
require('dotenv').config()



const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
  });

async function hitOpenAiApi(prompt) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }], // Pass the prompt as a message
        max_tokens: 150,
    });
    return response.choices[0].message.content.trim();
}

module.exports = { hitOpenAiApi }