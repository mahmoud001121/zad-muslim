import json

# Read the enhanced data
with open('src/data/azkar_enhanced.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add IDs to all entries if missing
for i, entry in enumerate(data):
    if 'id' not in entry:
        entry['id'] = i + 1

# Write back to file
with open('src/data/azkar_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Fixed IDs for {len(data)} entries")
print("Saved to src/data/azkar_fixed.json")

# Also create a version with only the new entries (for reference)
new_entries = [entry for entry in data if entry['id'] > 42]
print(f"\nNew entries added: {len(new_entries)}")
for entry in new_entries:
    print(f"ID {entry['id']}: {entry['content'][:50]}...")
