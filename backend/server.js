const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /generate-plan
 * Input JSON: { exam, days, topics, level, extra }
 */
app.post('/generate-plan', async (req, res) => {
  try {
    const { exam, days, topics, level, extra } = req.body;

    if (!exam || !days || !topics) {
      return res.status(400).json({ error: 'Missing required fields: exam, days, or topics' });
    }

    // AI Generation Logic based on consistency level
    let intensity = 'balanced';
    if (level === 'Inconsistent') intensity = 'starting light, increasing gradually';
    else if (level === 'Highly Consistent') intensity = 'high intensity and maximum discipline';

    const prompt = `
      You are an expert study planner AI. Generate a professional study plan for the following:
      - Exam: ${exam}
      - Duration: ${days} days
      - Topics/Subjects: ${topics}
      - Consistency Level: ${level} (${intensity})
      - Additional Context: ${extra || 'None'}

      REQUIREMENTS:
      1. Provide a clear day-wise study plan.
      2. Keep tasks short and actionable (one per line).
      3. Include a short execution guide (4–5 lines) at the end.
      4. Format the response as a clean plain-text string.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful study plan generator.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const planResponse = completion.choices[0].message.content;

    res.json({
      plan: planResponse
    });

  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: `OpenAI Error: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Onset Backend Engine started on http://localhost:${port}`);
});
