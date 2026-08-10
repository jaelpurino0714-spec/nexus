import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Clean page markers
text = re.sub(r'--- PAGE \d+ ---', '', text)

# Split by GROUP headers
headers = list(re.finditer(r'^[ \t]*(GROUP|Group)\s*(\d+)[\s:\–\-·]+([^\n]+)', text, re.MULTILINE))

print(f"Total Group headers found: {len(headers)}\n")

for i, h in enumerate(headers):
    start = h.start()
    end = headers[i+1].start() if i+1 < len(headers) else len(text)
    g_num = h.group(2)
    g_title = h.group(3).strip()
    g_content = text[start:end]
    
    print(f"Group {g_num}: {g_title[:70]}")
    # Count questions in g_content
    # Let's count Q\d+ or \d+.
    q_lines = re.findall(r'(?:^|\n)\s*(?:Q?\d+[\.\)])\s*([^\n]+)', g_content)
    print(f"  Length: {len(g_content)} chars | Questions found: {len(q_lines)}")
    if q_lines:
        print(f"  First Q: {q_lines[0][:60]}")
        print(f"  Last Q:  {q_lines[-1][:60]}")
    print("-" * 60)

