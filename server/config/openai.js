const { OpenAI } = require('openai');

// Initialize the OpenAI SDK client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-development'
});

module.exports = openai;
