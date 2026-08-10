import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Search for "Answer" or "Explanation" or checkmarks or trailing spaces in Groups 2 to 8
group_positions = [m.start() for m in re.finditer(r'^[ \t]*(GROUP|Group)\s*\d+', text, re.MULTILINE)]

for i, pos in enumerate(group_positions):
    end = group_positions[i+1] if i+1 < len(group_positions) else len(text)
    g_text = text[pos:end]
    lines = g_text.split('\n')
    header = lines[0].strip()
    
    # Check for Answer Key in g_text
    ans_key_match = re.search(r'Answer\s*Key|Answers|Explanations', g_text, re.IGNORECASE)
    
    # Count questions with trailing 4 spaces or special markers
    space_marked = re.findall(r'^[ \t]*([A-D])\.\s*(.*?)\s{3,}\s*$', g_text, re.MULTILINE)
    
    print(f"Header: {header[:60]}")
    print(f"  Total lines: {len(lines)}")
    print(f"  AnsKey found: {bool(ans_key_match)}")
    print(f"  Space-marked options found: {len(space_marked)}")
