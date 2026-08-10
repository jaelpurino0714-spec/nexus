import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

TOPICS = {
    1: ('b0000000-0000-0000-0000-000000000101', 'Physical vs. Chemical Change'),
    2: ('b0000000-0000-0000-0000-000000000102', 'Chemical Reactions'),
    3: ('b0000000-0000-0000-0000-000000000103', 'Acids, Bases, and Salts'),
    4: ('b0000000-0000-0000-0000-000000000104', 'Chemical Equations'),
    5: ('b0000000-0000-0000-0000-000000000105', 'Balancing Chemical Equations'),
    6: ('b0000000-0000-0000-0000-000000000106', 'Rates of Reactions'),
    7: ('b0000000-0000-0000-0000-000000000107', 'Homeostasis'),
    8: ('b0000000-0000-0000-0000-000000000108', 'Mechanisms of Evolution'),
}

sections = re.split(r'(^[ \t]*(?:GROUP|Group)\s*\d+[^\n]*)', text, flags=re.MULTILINE)

sample_answers = []

for idx in range(1, len(sections), 2):
    g_header = sections[idx].strip()
    g_body = sections[idx+1]
    
    h_lower = g_header.lower()
    if 'group 2' in h_lower and 'types' in h_lower:
        lines = g_body.split('\n')
        curr_q = None
        curr_a = None
        curr_b = None
        curr_c = None
        curr_d = None
        curr_ans = 'A'
        
        for raw_line in lines:
            l = raw_line.strip()
            if not l: continue
            
            q_stem_m = re.match(r'^(?:Q?\d+[\.\)]\s*)(.*)$', l)
            if q_stem_m and not re.match(r'^[A-D][\.\)]', l):
                if curr_q and curr_a and curr_b and curr_c and curr_d:
                    sample_answers.append((curr_q[:40], curr_ans))
                curr_q = q_stem_m.group(1).strip()
                curr_a = curr_b = curr_c = curr_d = None
                curr_ans = 'A'
                continue
                
            is_marked = ('✅' in raw_line) or bool(re.search(r'\s{3,}$', raw_line.rstrip('\r\n')))
            
            m_a = re.match(r'^\*?\s*\*?A[\.\)]\s*\*?(.*?)\*?\s*$', l)
            if m_a and curr_q and not curr_a:
                if is_marked: curr_ans = 'A'
                curr_a = m_a.group(1).replace('✅', '').strip()
                continue
                
            m_b = re.match(r'^\*?\s*\*?B[\.\)]\s*\*?(.*?)\*?\s*$', l)
            if m_b and curr_q and not curr_b:
                if is_marked: curr_ans = 'B'
                curr_b = m_b.group(1).replace('✅', '').strip()
                continue

            m_c = re.match(r'^\*?\s*\*?C[\.\)]\s*\*?(.*?)\*?\s*$', l)
            if m_c and curr_q and not curr_c:
                if is_marked: curr_ans = 'C'
                curr_c = m_c.group(1).replace('✅', '').strip()
                continue

            m_d = re.match(r'^\*?\s*\*?D[\.\)]\s*\*?(.*?)\*?\s*$', l)
            if m_d and curr_q and not curr_d:
                if is_marked: curr_ans = 'D'
                curr_d = m_d.group(1).replace('✅', '').strip()
                continue
                
        if curr_q and curr_a and curr_b and curr_c and curr_d:
            sample_answers.append((curr_q[:40], curr_ans))

print(f"Sample Group 2 parsed {len(sample_answers)} questions with answers:")
for q, a in sample_answers[:10]:
    print(f"  Q: {q} -> Answer: {a}")

