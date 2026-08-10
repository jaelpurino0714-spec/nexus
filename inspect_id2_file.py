import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_post-test-Term-2-identification.pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

topics = list(re.finditer(r'(TOPIC\s+\d+:[^\n]+)', text, re.IGNORECASE))

print(f"Total TOPIC headers found: {len(topics)}\n")

for i, t in enumerate(topics):
    start = t.start()
    end = topics[i+1].start() if i+1 < len(topics) else len(text)
    t_header = t.group(1).strip()
    t_content = text[start:end]
    
    q_matches = list(re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*([^\n]+)', t_content, re.DOTALL))
    print(f"Topic Header: {t_header}")
    print(f"  Questions found: {len(q_matches)}")
    print("-" * 60)

