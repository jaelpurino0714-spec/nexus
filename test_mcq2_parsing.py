import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_MCQ2 = {
    1: ('b0000000-0000-0000-0000-000000000201', 'Ecosystem\'s Carrying Capacity and Population Growth'),
    2: ('b0000000-0000-0000-0000-000000000202', 'Biotechnology'),
    3: ('b0000000-0000-0000-0000-000000000203', 'Plate Tectonics'),
    4: ('b0000000-0000-0000-0000-000000000204', 'Global Climate'),
    5: ('b0000000-0000-0000-0000-000000000205', 'Global Interactions (ENSO)'),
    6: ('b0000000-0000-0000-0000-000000000206', 'Global and Local Sustainability'),
}

with open('dump_nexus-MCQ-term-2.pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

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
                qtype = 'pre_test' if q_idx_in_topic <= 15 else 'post_test'
                clean_q = re.sub(r'\(only use 15 questions in every pretest topic[^\)]*\)', '', curr_q, flags=re.IGNORECASE)
                clean_q = re.sub(r'^pre-test questions[^\n]*', '', clean_q, flags=re.IGNORECASE)
                clean_q = re.sub(r'^TERM 2[^\n]*', '', clean_q, flags=re.IGNORECASE)
                clean_q = re.sub(r'^\d+[\.\)]\s*', '', clean_q).strip()
                records.append({
                    'topic_num': t_num,
                    'topic_id': t_id,
                    'topic_title': t_title,
                    'q_num': q_idx_in_topic,
                    'quiz_type': qtype,
                    'question': clean_q,
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
        clean_q = re.sub(r'\(only use 15 questions in every pretest topic[^\)]*\)', '', curr_q, flags=re.IGNORECASE)
        clean_q = re.sub(r'^pre-test questions[^\n]*', '', clean_q, flags=re.IGNORECASE)
        clean_q = re.sub(r'^TERM 2[^\n]*', '', clean_q, flags=re.IGNORECASE)
        clean_q = re.sub(r'^\d+[\.\)]\s*', '', clean_q).strip()
        records.append({
            'topic_num': t_num,
            'topic_id': t_id,
            'topic_title': t_title,
            'q_num': q_idx_in_topic,
            'quiz_type': qtype,
            'question': clean_q,
            'choice_a': curr_a,
            'choice_b': curr_b,
            'choice_c': curr_c,
            'choice_d': curr_d,
            'correct_answer': curr_ans,
            'explanation': f"Option {curr_ans} is the correct answer."
        })

print(f"Parsed {len(records)} Term 2 MCQs across topics:")
for top_num in range(1, 7):
    t_recs = [r for r in records if r['topic_num'] == top_num]
    pre_cnt = len([r for r in t_recs if r['quiz_type'] == 'pre_test'])
    post_cnt = len([r for r in t_recs if r['quiz_type'] == 'post_test'])
    print(f"  Topic {top_num} ({TOPICS_MCQ2[top_num][1]}): {len(t_recs)} items ({pre_cnt} Pre-test, {post_cnt} Post-test)")

