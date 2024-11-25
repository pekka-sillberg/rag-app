const { OpenAI } = require("openai");
require('dotenv').config()



const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
    baseURL: process.env.OPEN_BASE_URL,
});

async function openaiResponse(prompt) {
    
    try {
        const response = await openai.chat.completions.create({
            model: process.env.MODEL_CHAT,
            messages: [{ role: "user", content: prompt }], // Pass the prompt as a message
            max_tokens: 150,
        });

        // Extract the content from the response
        let rawContent = response.choices[0]?.message?.content?.trim();

        if (!rawContent) {
            throw new Error("No content received from the OpenAI API.");
        }

        // Format the content
        const formattedContent = rawContent
            // Convert newlines to HTML tags
            .replace(/\n\n/g, '<p></p>') // Double newlines for paragraphs
            .replace(/\n/g, '<br>') // Single newlines for line breaks
            // Bold text (**text**)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Replace **bold** with <strong> tags
            // Convert lists (e.g., 1. Item)
            .replace(/(\d+\.)\s/g, '<br>$1 ') // Add breaks before numbered lists
            // Convert unordered list (*) items
            .replace(/^\*\s(.+)$/gm, '<ul><li>$1</li></ul>') // Wrap list items in <ul> and <li>
            // Remove stray asterisks that aren't part of bold text
            .replace(/([^*])\*([^*]+)\*([^*])/g, '$1$2$3');

        return formattedContent;
    } catch (error) {
        console.error("Error processing OpenAI API response:", error);
        throw error;
    }
}


module.exports = openaiResponse;
