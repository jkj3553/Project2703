const fs = require("fs");
const path = require("path");

/**
 * Loads and returns structured subject data from the exams directory.
 * @param {string} subjectName - The subject identifier (e.g., "os", "operating systems")
 * @returns {object|null} Parsed JSON data or null if not found
 */
function getSubjectData(subjectName) {
  if (!subjectName) return null;

  const name = subjectName.toLowerCase();

  let filePath = null;

  if (name.includes("os") || name.includes("operating")) {
    filePath = path.join(__dirname, "../data/exams/os.json");
  }

  if (!filePath) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[getSubjectData] Failed to load subject data: ${err.message}`);
    return null;
  }
}

module.exports = { getSubjectData };
