# This is a simple test to check if the text matching works correctly.
import json
import v1_lib_text_search

resource_file_name = 'sample_2.json'
resource_file_path = f"resources/{resource_file_name}"

with open(resource_file_path, 'r') as f:
    data = json.load(f)
    essay = data['text']

print("Essay:", essay)
phrase_to_search = "egg-kim-bck-um-bab"

# Perform exact search
exact_matches = v1_lib_text_search.find_offsets_json(essay, phrase_to_search, fuzzy=True, threshold=0.9)
matches = json.loads(exact_matches)

# If it’s a single dict, wrap it in a list for uniform handling:
if isinstance(matches, dict):
    matches = [matches]

print("Matches:", matches)

# Now extract each match
for match in matches:
    offset = match["offset"]
    length = match["length"]
    matched_text = essay[offset : offset + length]
    print(f"Match at {offset} (len {length}):", matched_text)