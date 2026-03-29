/**
 * promptBuilder.js
 * Builds a structured, subject-aware prompt for the AI study planner.
 *
 * @param {Object} params
 * @param {string} params.subject          - Subject name (e.g. "Operating Systems")
 * @param {number|string} params.days      - Number of study days
 * @param {string} params.weakAreas        - Comma-separated weak topics
 * @param {string} params.consistency      - Study consistency level
 * @param {string} params.syllabusCoverage - Coverage range e.g. "0-25%", "25-50%"
 * @param {string} params.extra            - Any additional context from user
 * @param {Object|null} params.subjectData - Parsed JSON from getSubjectData()
 * @returns {string} Final prompt string
 */
function buildPrompt({
  subject,
  days,
  weakAreas,
  consistency,
  syllabusCoverage,
  extra,
  subjectData,
}) {
  // ── 1. Coverage strategy ────────────────────────────────────────────────────
  let coverageMode = "balanced learning and practice";
  const cov = (syllabusCoverage || "").replace(/\s/g, "");

  if (cov.startsWith("0") || cov === "0-25%") {
    coverageMode = "focus on covering basics and foundational concepts first";
  } else if (cov.startsWith("25") || cov === "25-50%") {
    coverageMode = "mix learning new topics with practicing already-covered ones";
  } else if (cov.startsWith("50") || cov === "50-75%") {
    coverageMode = "prioritize practice, problem-solving, and past questions";
  } else if (cov.startsWith("75") || cov === "75-100%") {
    coverageMode = "full revision mode — quick reviews, mock tests, and gap fixing";
  }

  // ── 2. Subject knowledge block ──────────────────────────────────────────────
  let subjectBlock = "";
  if (subjectData && Array.isArray(subjectData.topics)) {
    const topicLines = subjectData.topics
      .map(
        (t) =>
          `  • [Priority ${t.priority}] ${t.name} (${t.importance}, ${t.weightage})\n` +
          `    Strategy: ${t.strategy}`
      )
      .join("\n");

    subjectBlock = `\nSUBJECT KNOWLEDGE BASE — ${subjectData.subject}:\n${topicLines}\n`;
  }

  // ── 3. Assemble prompt ──────────────────────────────────────────────────────
  const prompt = `
You are an expert ${subject} exam strategist and study planner AI.
Your job is to produce a precise, day-by-day study plan based on the student's context.

═══════════════════════════════════════════
STUDENT CONTEXT
═══════════════════════════════════════════
- Subject          : ${subject}
- Study Duration   : ${days} days
- Weak Areas       : ${weakAreas || "Not specified"}
- Consistency Level: ${consistency || "Not specified"}
- Syllabus Coverage: ${syllabusCoverage || "Not specified"}
- Coverage Mode    : ${coverageMode}
- Extra Notes      : ${extra || "None"}
${subjectBlock}
═══════════════════════════════════════════
═══════════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════════
- You MUST ONLY generate content for the subject: ${subject}
- DO NOT include any other subjects like Maths, Physics, Chemistry
- ALL tasks must be directly related to ${subject}
- If you include any unrelated subject, the output is INVALID

OUTPUT FORMAT (STRICT JSON):
{
  "plan": [
    { "day": "Day 1", "tasks": ["task1", "task2"] },
    { "day": "Day 2", "tasks": ["task1", "task2"] }
  ],
  "executionGuide": [
    "point1",
    "point2"
  ]
}

RULES:
- executionGuide must be 4–10 points
- each point must be personalized based on:
  - consistency
  - weak areas
  - syllabus coverage
- tasks must reference ${subject} topics (like scheduling, deadlocks, memory, etc.)
- DO NOT return plain text
- DO NOT return markdown
- ONLY return valid JSON

═══════════════════════════════════════════
PLANNING RULES
═══════════════════════════════════════════
- Apply coverage mode: ${coverageMode}
- Give extra attention to weak areas: ${weakAreas || "none specified"}
- Distribute high-importance topics (from Subject Knowledge Base) early
- Allocate last 1–2 days to revision and mock tests if duration allows
- Keep tasks concrete (e.g., "Solve 3 Banker's Algorithm problems", not "Study deadlocks")
`.trim();

  return prompt;
}

module.exports = { buildPrompt };
