# This is a simple text search library that provides exact and fuzzy matching
# using Levenshtein distance. It can be used to find occurrences of a phrase
# in a given text, either exactly or with some tolerance for errors.
# Author: Donghoon Lee
# Date: 2025-05-23
# Version: 1.0

# INPUT: 
# - text: The text in which to search for the phrase.
# - phrase: The phrase to search for.
# - fuzzy: If True, perform fuzzy search using Levenshtein distance.
# - threshold: The minimum score for a match to be considered valid (only used in fuzzy search).
# OUTPUT: A JSON string containing the offsets and lengths of the matches found.
# - offset: The starting index of the match in the text.
# - length: The length of the match.
# - score: The score of the match (only used in fuzzy search).


import json

def levenshtein_distance(a: str, b: str) -> int:
    """Compute the Levenshtein edit distance between string a and string b."""
    n, m = len(a), len(b)
    # special cases
    if n == 0:
        return m
    if m == 0:
        return n

    # initialize DP table
    prev = list(range(m + 1))
    for i in range(1, n + 1):
        curr = [i] + [0] * m
        for j in range(1, m + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            curr[j] = min(
                prev[j] + 1,        # deletion
                curr[j - 1] + 1,    # insertion
                prev[j - 1] + cost  # substitution
            )
        prev = curr
    return prev[m]

def find_exact_offsets(text: str, phrase: str):
    """Find all exact occurrences of phrase in text."""
    results = []
    L = len(phrase)
    start = 0
    while True:
        idx = text.find(phrase, start)
        if idx == -1:
            break
        results.append({"offset": idx, "length": L})
        start = idx + 1
    return results

def find_fuzzy_offsets(text: str, phrase: str, threshold: float = 0.8):
    """
    Sliding window fuzzy search: for each window the same length as phrase,
    compute normalized edit-distance ratio, and report those ≥ threshold.
    """
    results = []
    L = len(phrase)
    if L == 0 or len(text) < L:
        return results

    for i in range(len(text) - L + 1):
        window = text[i : i + L]
        dist = levenshtein_distance(phrase, window)
        score = (L - dist) / L
        if score >= threshold:
            results.append({
                "offset": i,
                "length": L,
                "score": round(score, 3)
            })
    return results

def find_offsets_json(text: str, phrase: str, fuzzy: bool = False, threshold: float = 0.8):
    """
    Wrapper: runs exact or fuzzy search and returns a JSON string.
    """
    if fuzzy:
        matches = find_fuzzy_offsets(text, phrase, threshold)
    else:
        matches = find_exact_offsets(text, phrase)
    return json.dumps(matches, indent=2)

# ----------------------------
# Example usage
# ----------------------------
if __name__ == "__main__":
    sample = "The quick brown fox jumps over the lazy dog. The quack brown fix is swift."
    phrase = "quick brown foxes"

    print("=== Exact matches ===")
    print(find_offsets_json(sample, phrase, fuzzy=False))

    print("\n=== Fuzzy matches (threshold=0.6) ===")
    print(find_offsets_json(sample, phrase, fuzzy=True, threshold=0.6))
