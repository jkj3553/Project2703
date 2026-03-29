const OpenAI = require('openai');
const aiConfig = require('../config/aiConfig');

let openaiClient;
let groqClient;

// Initialize clients based on availability of keys
if (aiConfig.openaiKey) {
  openaiClient = new OpenAI({ apiKey: aiConfig.openaiKey });
}

if (aiConfig.groqKey) {
  groqClient = new OpenAI({
    apiKey: aiConfig.groqKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

async function executeWithProvider(providerName, prompt, systemContent) {
  const isGroq = providerName === 'groq';

  if (isGroq && !groqClient) {
    throw new Error('Provider set to groq, but client failed to initialize (Missing API Key)');
  }
  if (!isGroq && !openaiClient) {
    throw new Error('Provider set to openai, but client failed to initialize (Missing API Key)');
  }

  const client = isGroq ? groqClient : openaiClient;
  const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

  console.log(`[AI SERVICE] Using provider: ${providerName}`);

  const completion = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  const rawText = completion.choices[0].message.content;
  let parsed;
  try {
    const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("[AI SERVICE] Invalid JSON encountered. Raw response:", rawText);
    throw new Error("Invalid AI JSON response");
  }

  return {
    plan: parsed.plan,
    executionGuide: parsed.executionGuide,
    providerUsed: providerName
  };
}

/**
 * Generates an AI response from the selected provider with a safe fallback mechanism.
 * @param {string} prompt - The assembled prompt for the AI.
 * @param {string} systemContent - System role instructions.
 * @returns {Promise<{text: string, providerUsed: string}>}
 */
async function generatePlan(prompt, systemContent = 'You are a helpful study plan generator.') {
  const primaryProvider = aiConfig.provider;
  const secondaryProvider = primaryProvider === 'openai' ? 'groq' : 'openai';

  try {
    return await executeWithProvider(primaryProvider, prompt, systemContent);
  } catch (primaryErr) {
    console.error(`[AI SERVICE] Error: primary provider (${primaryProvider}) failed - ${primaryErr.message}`);
    console.warn(`[AI SERVICE] Fallback triggered: switching to ${secondaryProvider}`);

    try {
      return await executeWithProvider(secondaryProvider, prompt, systemContent);
    } catch (secondaryErr) {
      console.error(`[AI SERVICE] Error: secondary provider (${secondaryProvider}) failed - ${secondaryErr.message}`);
      throw new Error(`Both AI providers failed. Primary: ${primaryErr.message} | Secondary: ${secondaryErr.message}`);
    }
  }
}

module.exports = {
  generatePlan,
};
