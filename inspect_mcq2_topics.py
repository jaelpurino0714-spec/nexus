import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-2.pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

topics = list(re.finditer(r'(TOPIC\s+\d+[\s·\-:]+[^\n]+)', text))

print(f"Total TOPIC headers found: {len(topics)}\n")

for i, t in enumerate(topics):
    start = t.start()
    end = topics[i+1].start() if i+1 < len(topics) else len(text)
    t_header = t.group(1).strip()
    t_content = text[start:end]
    
    # Count blocks with options A., B., C., D.
    q_blocks = re.findall(r'A\.\s*.*?\n\s*B\.\s*.*?\n\s*C\.\s*.*?\n\s*D\.\s*.*', t_content)
    print(f"Topic Header: {t_header[:80]}")
    print(f"  Character length: {len(t_content)} | Q blocks found: {len(q_blocks)}")
    print("-" * 60)

