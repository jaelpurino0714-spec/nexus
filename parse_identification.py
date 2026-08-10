import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\Identification term 1.pdf'
reader = PdfReader(pdf_path)

full_text = ""
for i, page in enumerate(reader.pages):
    full_text += f"\n--- PAGE {i+1} ---\n" + (page.extract_text() or "")

parts = re.split(r'PART\s+(\d+)\s+–\s+([^\n]+)', full_text)

part_map = {
    1: ('b0000000-0000-0000-0000-000000000101', 'Physical vs. Chemical Change'),
    2: ('b0000000-0000-0000-0000-000000000103', 'Acids, Bases, and Salts'),
    3: ('b0000000-0000-0000-0000-000000000102', 'Chemical Reactions'),
    4: ('b0000000-0000-0000-0000-000000000104', 'Chemical Equations'),
    5: ('b0000000-0000-0000-0000-000000000106', 'Rates of Reactions'),
    6: ('b0000000-0000-0000-0000-000000000107', 'Homeostasis'),
    7: ('b0000000-0000-0000-0000-000000000108', 'Mechanisms of Evolution'),
}

records = []

for idx in range(1, len(parts), 3):
    part_num = int(parts[idx])
    part_title = parts[idx+1].strip()
    part_content = parts[idx+2]
    
    sections = re.split(r'Answer Key', part_content, flags=re.IGNORECASE)
    q_sec = sections[0]
    ans_sec = sections[1] if len(sections) > 1 else ''
    
    # Parse answers (must be at start of line)
    ans_matches = re.findall(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*)', ans_sec)
    ans_map = {}
    for num_str, ans_str in ans_matches:
        num = int(num_str)
        ans_clean = ans_str.strip()
        ans_map[num] = ans_clean

    # Parse questions: question starts with newline + number + dot
    # Lookahead for newline + number + dot OR Answer: OR end of text
    q_matches = re.findall(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=\s*Answer:|\n\s*\d+[\.\)]|\Z)', q_sec, re.DOTALL)
    
    for q_num_str, q_body in q_matches:
        q_num = int(q_num_str)
        q_clean = re.sub(r'--- PAGE \d+ ---', '', q_body)
        q_clean = re.sub(r'Directions:[^\n]*', '', q_clean)
        q_clean = re.sub(r'Identification', '', q_clean)
        q_clean = re.sub(r'\s+', ' ', q_clean).strip()
        if q_clean and q_num in ans_map:
            topic_id, topic_name = part_map[part_num]
            records.append({
                'part': part_num,
                'topic_id': topic_id,
                'topic_name': topic_name,
                'q_num': q_num,
                'question': q_clean,
                'answer': ans_map[q_num]
            })

print(f"Total parsed with refined regex: {len(records)}")

with open('id_term1_dump.txt', 'w', encoding='utf-8') as f:
    for r in records:
        f.write(f"P{r['part']} Q{r['q_num']:02d} [{r['topic_name']}]:\n  Q: {r['question']}\n  A: {r['answer']}\n\n")
