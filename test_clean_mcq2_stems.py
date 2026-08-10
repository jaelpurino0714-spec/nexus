import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def clean_stem(raw_q):
    s = raw_q
    # Remove header comments
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM 2[^\n]*', '', s, flags=re.IGNORECASE)
    
    # Remove any leading answer/explanation tags like "✅ C — Explanation text. 3. " or "A — Explanation. 4. "
    s = re.sub(r'^(?:✅\s*)?[A-D]\s*[–\-—]\s*.*?\d+[\.\)]\s*', '', s).strip()
    s = re.sub(r'^\d+[\.\)]\s*', '', s).strip()
    return s

with open('dump_nexus-MCQ-term-2.pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

TOPICS_MCQ2 = {
    1: ('b0000000-0000-0000-0000-000000000201', 'Ecosystem\'s Carrying Capacity and Population Growth'),
    2: ('b0000000-0000-0000-0000-000000000202', 'Biotechnology'),
    3: ('b0000000-0000-0000-0000-000000000203', 'Plate Tectonics'),
    4: ('b0000000-0000-0000-0000-000000000204', 'Global Climate'),
    5: ('b0000000-0000-0000-0000-000000000205', 'Global Interactions (ENSO)'),
    6: ('b0000000-0000-0000-0000-000000000206', 'Global and Local Sustainability'),
}

sections = re.split(r'(TOPIC\s+(\d+)\s*[·\-\:][^\n]+)', text)

records = []

for idx in range(1, len(sections), 3):
    t_num = int(sections[idx+1])
    t_body = sections[idx+2]
    if t_num not in TOPICS_MCQ2: continue
    
    t_id, t_title = TOPICS_MCQ2[t_num]
    lines = t_body.split('\n')
    
    curr_q = None
    curr_a = None
    curr_b = None
    curr_c = None
    curr_d = None
    curr_ans = 'A'
    q_idx_in_topic = 0

    for raw_line in lines:
        l = raw_line.strip()
        if not l: continue
        
        m_a = re.match(r'^\*?\s*A[\.\)]\s*(.*?)\s*$', l)
        if m_a and curr_q and not curr_a:
            val = m_a.group(1)
            if '✅' in val: curr_ans = 'A'
            curr_a = val.replace('✅', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*B[\.\)]\s*(.*?)\s*$', l)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if '✅' in val: curr_ans = 'B'
            curr_b = val.replace('✅', '').strip()
            continue

        m_c = re.match(r'^\*?\s*C[\.\)]\s*(.*?)\s*$', l)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if '✅' in val: curr_ans = 'C'
            curr_c = val.replace('✅', '').strip()
            continue

        m_d = re.match(r'^\*?\s*D[\.\)]\s*(.*?)\s*$', l)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if '✅' in val: curr_ans = 'D'
            curr_d = val.replace('✅', '').strip()
            continue
            
        if not curr_a:
            if curr_q:
                curr_q += " " + l
            else:
                curr_q = l
        elif curr_d:
            if curr_q and curr_a and curr_b and curr_c and curr_d:
                q_idx_in_topic += 1
                if q_idx_in_topic <= 15:
                    records.append({
                        'topic_num': t_num,
                        'question': clean_stem(curr_q)
                    })
            curr_q = l
            curr_a = None
            curr_b = None
            curr_c = None
            curr_d = None
            curr_ans = 'A'
            
    if curr_q and curr_a and curr_b and curr_c and curr_d:
        q_idx_in_topic += 1
        if q_idx_in_topic <= 15:
            records.append({
                'topic_num': t_num,
                'question': clean_stem(curr_q)
            })

print(f"Total Pre-test MCQs parsed: {len(records)}")
print("\n--- SAMPLE QUESTIONS (Checking Topic 3 & 4) ---")
for r in records:
    if r['topic_num'] in [3, 4]:
        print(f"Topic {r['topic_num']}: {r['question']}")

