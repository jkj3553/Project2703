require('dotenv').config();

const provider = process.env.AI_PROVIDER || 'openai';
const openaiKey = process.env.OPENAI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (provider === 'openai' && !openaiKey) {
  throw new Error('[AI Config] OPENAI_API_KEY is missing but provider is set to "openai"');
}

if (provider === 'groq' && !groqKey) {
  throw new Error('[AI Config] GROQ_API_KEY is missing but provider is set to "groq"');
}

module.exports = {
  provider,
  openaiKey,
  groqKey
};
