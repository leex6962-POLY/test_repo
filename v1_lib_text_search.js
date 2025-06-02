/**
 * This is a simple text search library that provides exact and fuzzy matching
 * using Levenshtein distance. It can be used to find occurrences of a phrase
 * in a given text, either exactly or with some tolerance for errors.
 * Author: Donghoon Lee (Python) / Converted to JS (JavaScript) by gpt-4o
 * Date: 2025-05-23
 * Version: 1.0
 *
 * INPUT:
 * - text: The text in which to search for the phrase.
 * - phrase: The phrase to search for.
 * - fuzzy: If true, perform fuzzy search using Levenshtein distance.
 * - threshold: The minimum score for a match to be considered valid (only used in fuzzy search).
 * OUTPUT: A JSON string containing the offsets and lengths of the matches found.
 * - offset: The starting index of the match in the text.
 * - length: The length of the match.
 * - score: The score of the match (only used in fuzzy search).
 */

/**
 * Compute the Levenshtein edit distance between string a and string b.
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - The edit distance
 */
function levenshteinDistance(a, b) {
  const n = a.length;
  const m = b.length;
  
  // special cases
  if (n === 0) return m;
  if (m === 0) return n;
  
  // initialize DP table
  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  
  for (let i = 1; i <= n; i++) {
    const curr = [i, ...Array(m).fill(0)];
    
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost // substitution
      );
    }
    
    prev = curr;
  }
  
  return prev[m];
}

/**
 * Find all exact occurrences of phrase in text.
 * @param {string} text - Text to search in
 * @param {string} phrase - Phrase to search for
 * @returns {Array} - Array of matches with offset and length
 */
function findExactOffsets(text, phrase) {
  const results = [];
  const L = phrase.length;
  let start = 0;
  
  while (true) {
    const idx = text.indexOf(phrase, start);
    if (idx === -1) break;
    
    results.push({ offset: idx, length: L });
    start = idx + 1;
  }
  
  return results;
}

/**
 * Sliding window fuzzy search: for each window the same length as phrase,
 * compute normalized edit-distance ratio, and report those ≥ threshold.
 * @param {string} text - Text to search in
 * @param {string} phrase - Phrase to search for
 * @param {number} threshold - Minimum score threshold (default: 0.8)
 * @returns {Array} - Array of matches with offset, length, and score
 */
function findFuzzyOffsets(text, phrase, threshold = 0.8) {
  const results = [];
  const L = phrase.length;
  
  if (L === 0 || text.length < L) {
    return results;
  }
  
  for (let i = 0; i <= text.length - L; i++) {
    const window = text.substring(i, i + L);
    const dist = levenshteinDistance(phrase, window);
    const score = (L - dist) / L;
    
    if (score >= threshold) {
      results.push({
        offset: i,
        length: L,
        score: Number(score.toFixed(3))
      });
    }
  }
  
  return results;
}

/**
 * Wrapper: runs exact or fuzzy search and returns a JSON string.
 * @param {string} text - Text to search in
 * @param {string} phrase - Phrase to search for
 * @param {boolean} fuzzy - Whether to use fuzzy matching (default: false)
 * @param {number} threshold - Minimum score threshold for fuzzy matching (default: 0.8)
 * @returns {string} - JSON string of matches
 */
function findOffsetsJson(text, phrase, fuzzy = false, threshold = 0.8) {
  const matches = fuzzy
    ? findFuzzyOffsets(text, phrase, threshold)
    : findExactOffsets(text, phrase);
  
  return JSON.stringify(matches, null, 2);
}

// ---------------------------- 
// Example usage
// ----------------------------
function runExample() {
  const sample = "The quick brown fox jumps over the lazy dog. The quack brown fix is swift.";
  const phrase = "quick brown fox";
  
  console.log("=== Exact matches ===");
  console.log(findOffsetsJson(sample, phrase, false));
  
  console.log("\n=== Fuzzy matches (threshold=0.90) ===");
  console.log(findOffsetsJson(sample, phrase, true, 0.90));
}

// Export functions for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    levenshteinDistance,
    findExactOffsets,
    findFuzzyOffsets,
    findOffsetsJson
  };
}

// Uncomment to run example
runExample();

