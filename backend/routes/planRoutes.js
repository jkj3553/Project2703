const express = require("express");
const router = express.Router();

const { getSubjectData } = require("../utils/getSubjectData");
const { buildPrompt } = require("../utils/promptBuilder");
const { generatePlan } = require("../services/aiService");

// ========================
// LAYER 2 — IN-MEMORY CACHE
// ========================
const cache = {};
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function normalizeInput(input) {
  return {
    subject: (input.subject || '').trim().toLowerCase(),
    days: Number(input.days),
    weakAreas: (input.weakAreas || '').trim().toLowerCase(),
    consistency: (input.consistency || '').trim().toLowerCase(),
    syllabusCoverage: (input.syllabusCoverage || '').trim(),
    extra: (input.extra || '').trim().toLowerCase()
  };
}

/**
 * POST /generate-plan
 * Input: { subject, days, weakAreas, consistency, syllabusCoverage, extra }
 */
router.post("/generate-plan", async (req, res) => {
  try {
    console.log('[AI SERVICE] Incoming request to /generate-plan:', req.body);

    const { subject, days, weakAreas, consistency, syllabusCoverage, extra } =
      req.body;

    if (!subject || !days) {
      return res
        .status(400)
        .json({ error: "Missing required fields: subject, days" });
    }

    // --- LAYER 2: Cache Check ---
    const normalized = normalizeInput({ subject, days, weakAreas, consistency, syllabusCoverage, extra });
    const cacheKey = JSON.stringify(normalized);

    if (cache[cacheKey]) {
      const age = Date.now() - cache[cacheKey].timestamp;
      if (age < CACHE_TTL_MS) {
        console.log('[CACHE HIT] Returning cached response for key:', cacheKey);
        return res.json(cache[cacheKey].data);
      } else {
        // Expired — evict
        delete cache[cacheKey];
      }
    }

    console.log('[CACHE MISS] No valid cache found. Calling AI...');

    const subjectData = getSubjectData(subject);

    const prompt = buildPrompt({
      subject,
      days,
      weakAreas,
      consistency,
      syllabusCoverage,
      extra,
      subjectData,
    });

    // AI call is handled directly in this route now
    const aiResponse = await generatePlan(prompt, 'You are a helpful study plan generator.');

    const responsePayload = {
      plan: aiResponse.plan,
      executionGuide: aiResponse.executionGuide,
      provider: aiResponse.providerUsed,
      generatedAt: new Date().toISOString()
    };

    // Store in cache
    cache[cacheKey] = {
      data: responsePayload,
      timestamp: Date.now()
    };

    return res.json(responsePayload);
  } catch (err) {
    console.error("[planRoutes] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

