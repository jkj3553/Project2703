const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getSubjectData } = require('./utils/getSubjectData');
const planRoutes = require('./routes/planRoutes');
const { generatePlan } = require('./services/aiService');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.send('Onset Backend Engine is running! Use POST /generate-plan to interact.');
});



// Mount the new plan router
// It builds the prompt and attaches it to req.promptPayload.prompt
app.use('/', planRoutes);



/**
 * POST /ask-doubt
 * Input JSON: { subject, question }
 */
app.post('/ask-doubt', async (req, res) => {
  try {
    console.log('[AI SERVICE] Incoming request to /ask-doubt:', req.body);
    
    const { subject, question } = req.body;

    if (!subject || !question) {
      return res.status(400).json({ error: 'Missing required fields: subject, question' });
    }

    const subjectData = getSubjectData(subject);
    let contextBlock = '';

    if (subjectData && Array.isArray(subjectData.topics)) {
      const topicSummaries = subjectData.topics.map(t => `- ${t.name}: ${t.summary}`).join('\\n');
      contextBlock = `\\nUse this context if relevant:\\n${topicSummaries}\\n`;
    }

    const prompt = `You are an expert ${subject} tutor. Answer the student's question clearly and concisely.${contextBlock}
    
Student Question: ${question}`;

    const response = await generatePlan(prompt, `You are a helpful ${subject} tutor.`);

    res.json({
      answer: response.text,
      provider: response.providerUsed,
    });

  } catch (error) {
    console.error('Error answering doubt:', error);
    res.status(500).json({ error: `OpenAI Error: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Onset Backend Engine started on http://localhost:${port}`);
});
