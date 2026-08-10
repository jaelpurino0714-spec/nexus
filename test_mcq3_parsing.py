import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_MCQ3 = {
    1: ('b0000000-0000-0000-0000-000000000301', 'Projectile Motion'),
    2: ('b0000000-0000-0000-0000-000000000302', 'Momentum and Collisions'),
    3: ('b0000000-0000-0000-0000-000000000303', 'Large-Scale Generation and Distribution of Electricity'),
    4: ('b0000000-0000-0000-0000-000000000304', 'Renewable and Non-Renewable Energy Sources'),
}

with open('dump_MCQ-term-3.pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

sections = re.split(r'(Group\s+(\d+)[\s·\-:][^\n]+)', text, flags=re.IGNORECASE)

records = []

def clean_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM \d+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^(?:✅\s*)?[A-D]\s*[–\-—]\s*.*?\d+[\.\)]\s*', '', s).strip()
    s = re.sub(r'^\d+[\.\)]\s*', '', s).strip()
    return s

for idx in range(1, len(sections), 3):
    g_num = int(sections[idx+1])
    g_body = sections[idx+2]
    if g_num not in TOPICS_MCQ3: continue
    
    t_id, t_title = TOPICS_MCQ3[g_num]
    lines = g_body.split('\n')
    
    curr_q = None
    curr_a = None
    curr_b = None
    curr_c = None
    curr_d = None
    curr_ans = 'A'
    q_idx_in_topic = len([r for r in records if r['group_num'] == g_num])

    for raw_line in lines:
        l = raw_line.strip()
        if not l: continue
        
        m_a = re.match(r'^\*?\s*\*?\s*A[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_a and curr_q and not curr_a:
            val = m_a.group(1)
            if '✅' in val: curr_ans = 'A'
            curr_a = val.replace('✅', '').replace('*', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*\*?\s*B[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if '✅' in val: curr_ans = 'B'
            curr_b = val.replace('✅', '').replace('*', '').strip()
            continue

        m_c = re.match(r'^\*?\s*\*?\s*C[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if '✅' in val: curr_ans = 'C'
            curr_c = val.replace('✅', '').replace('*', '').strip()
            continue

        m_d = re.match(r'^\*?\s*\*?\s*D[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if '✅' in val: curr_ans = 'D'
            curr_d = val.replace('✅', '').replace('*', '').strip()
            continue
            
        if not curr_a:
            if curr_q:
                curr_q += " " + l
            else:
                curr_q = l
        elif curr_d:
            if curr_q and curr_a and curr_b and curr_c and curr_d:
                q_idx_in_topic += 1
                qtype = 'pre_test' if q_idx_in_topic <= 15 else 'post_test'
                records.append({
                    'group_num': g_num,
                    'topic_id': t_id,
                    'topic_title': t_title,
                    'q_num': q_idx_in_topic,
                    'quiz_type': qtype,
                    'question': clean_stem(curr_q),
                    'choice_a': curr_a,
                    'choice_b': curr_b,
                    'choice_c': curr_c,
                    'choice_d': curr_d,
                    'correct_answer': curr_ans,
                    'explanation': f"Option {curr_ans} is the correct answer."
                })
            curr_q = l
            curr_a = None
            curr_b = None
            curr_c = None
            curr_d = None
            curr_ans = 'A'
            
    if curr_q and curr_a and curr_b and curr_c and curr_d:
        q_idx_in_topic += 1
        qtype = 'pre_test' if q_idx_in_topic <= 15 else 'post_test'
        records.append({
            'group_num': g_num,
            'topic_id': t_id,
            'topic_title': t_title,
            'q_num': q_idx_in_topic,
            'quiz_type': qtype,
            'question': clean_stem(curr_q),
            'choice_a': curr_a,
            'choice_b': curr_b,
            'choice_c': curr_c,
            'choice_d': curr_d,
            'correct_answer': curr_ans,
            'explanation': f"Option {curr_ans} is the correct answer."
        })

print(f"Parsed {len(records)} Term 3 MCQs across groups:")
for g_num in range(1, 5):
    g_recs = [r for r in records if r['group_num'] == g_num]
    pre_cnt = len([r for r in g_recs if r['quiz_type'] == 'pre_test'])
    post_cnt = len([r for r in g_recs if r['quiz_type'] == 'post_test'])
    print(f"  Group {g_num} ({TOPICS_MCQ3[g_num][1]}): {len(g_recs)} items ({pre_cnt} Pre-test, {post_cnt} Post-test)")

print("\n--- First 3 questions sample ---")
for r in records[:3]:
    print(f"Q{r['q_num']} [{r['quiz_type']}]: {r['question']}")
    print(f"  A: {r['choice_a']} | B: {r['choice_b']} | C: {r['choice_c']} | D: {r['choice_d']}")
    print(f"  Correct: {r['correct_answer']}\n")

