import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_Identification term 3.pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = list(re.finditer(r'(PART\s+\d+[\s–\-:][^\n]+)', text, re.IGNORECASE))

print(f"Total PART headers found in dump_Identification term 3.pdf.txt: {len(parts)}\n")

for i, p in enumerate(parts):
    start = p.start()
    end = parts[i+1].start() if i+1 < len(parts) else len(text)
    p_header = p.group(1).strip()
    p_content = text[start:end]
    
    sections = re.split(r'Answer Key|Answer K', p_content, flags=re.IGNORECASE)
    q_sec = sections[0]
    ans_sec = sections[1] if len(sections) > 1 else ''
    
    q_matches = list(re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=\s*Answer:|\n\s*\d+[\.\)]|\Z)', q_sec, re.DOTALL))
    ans_matches = list(re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*([^\n]+)', ans_sec))
    
    print(f"Part Header: {p_header}")
    print(f"  Questions found: {len(q_matches)} | Answers found: {len(ans_matches)}")
    print("-" * 60)

