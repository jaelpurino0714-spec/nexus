import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

group_matches = list(re.finditer(r'^[ \t]*(GROUP|Group)\s*(\d+)[\s:\–\-·]+([^\n]+)', text, re.MULTILINE))

print(f"Found {len(group_matches)} group headers:")
for i, m in enumerate(group_matches):
    start_pos = m.start()
    end_pos = group_matches[i+1].start() if i+1 < len(group_matches) else len(text)
    g_num = m.group(2)
    g_title = m.group(3).strip()
    g_text = text[start_pos:end_pos]
    
    # Check what question patterns exist in g_text
    has_q_prefix = bool(re.search(r'Q\d+[\.\)]', g_text))
    has_num_prefix = bool(re.search(r'^\s*\d+[\.\)]', g_text, re.MULTILINE))
    has_answer_line = bool(re.search(r'Answer:\s*[A-D]', g_text))
    has_checkmark = bool('✅' in g_text)
    
    print(f"  Group {g_num} ({g_title[:40]}): Q-prefix={has_q_prefix}, Num-prefix={has_num_prefix}, AnsLine={has_answer_line}, Checkmark={has_checkmark}")

