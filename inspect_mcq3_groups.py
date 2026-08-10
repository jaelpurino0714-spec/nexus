import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_MCQ-term-3.pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

groups = list(re.finditer(r'(Group\s+\d+[\s·\-:][^\n]+)', text, re.IGNORECASE))

print(f"Total Group headers found: {len(groups)}\n")

for i, g in enumerate(groups):
    start = g.start()
    end = groups[i+1].start() if i+1 < len(groups) else len(text)
    g_header = g.group(1).strip()
    g_content = text[start:end]
    
    # Count option A lines
    a_lines = re.findall(r'^\s*\*?\s*\*?A[\.\)]', g_content, re.MULTILINE)
    print(f"Group Header: {g_header[:80]}")
    print(f"  Character length: {len(g_content)} | Q blocks found: {len(a_lines)}")
    print("-" * 60)

