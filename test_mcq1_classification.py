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

total_qs = 0
by_topic_quiz = {}

for idx in range(1, len(sections), 2):
    g_header = sections[idx].strip()
    g_body = sections[idx+1]
    
    h_lower = g_header.lower()
    if 'group 1' in h_lower and 'pretest' in h_lower:
        topic_num = 1
        forced_quiz = 'pre_test'
    elif 'group 1' in h_lower and 'continued' in h_lower:
        topic_num = 4
        forced_quiz = 'post_test'
    elif 'group 2' in h_lower and 'acids' in h_lower:
        topic_num = 3
        forced_quiz = None
    elif 'group 2' in h_lower and 'types' in h_lower:
        topic_num = 2
        forced_quiz = None
    elif 'group 4' in h_lower:
        topic_num = 4
        forced_quiz = None
    elif 'group 5' in h_lower:
        topic_num = 5
        forced_quiz = None
    elif 'group 6' in h_lower or 'rate' in h_lower:
        topic_num = 6
        forced_quiz = None
    elif 'group 7' in h_lower or 'homeostasis' in h_lower:
        topic_num = 7
        forced_quiz = None
    elif 'group 8' in h_lower or 'evolution' in h_lower:
        topic_num = 8
        forced_quiz = None
    else:
        continue

    q_count_in_group = 0
    lines = g_body.split('\n')
    
    curr_q = None
    curr_a = None
    curr_b = None
    curr_c = None
    curr_d = None
    curr_ans = 'A'
    curr_exp = None
    
    for line in lines:
        l = line.strip()
        if not l: continue
        
        # Check inline 4 choices: A. ... B. ... C. ... D. ...
        m_inline = re.match(r'^\*?\s*A[\.\)]\s*(.*?)\s+B[\.\)]\s*(.*?)\s+C[\.\)]\s*(.*?)\s+D[\.\)]\s*(.*?)\s*$', l)
        if m_inline and curr_q:
            opts = [m_inline.group(1), m_inline.group(2), m_inline.group(3), m_inline.group(4)]
            curr_a = opts[0].strip()
            curr_b = opts[1].strip()
            curr_c = opts[2].strip()
            curr_d = opts[3].strip()
            continue

        q_stem_m = re.match(r'^(?:Q?\d+[\.\)]\s*)(.*)$', l)
        if q_stem_m and not re.match(r'^[A-D][\.\)]', l):
            if curr_q and curr_a and curr_b and curr_c and curr_d:
                q_count_in_group += 1
                total_qs += 1
                qtype = forced_quiz if forced_quiz else ('pre_test' if q_count_in_group <= 15 else 'post_test')
                key = (topic_num, qtype)
                by_topic_quiz[key] = by_topic_quiz.get(key, 0) + 1
            curr_q = q_stem_m.group(1).strip()
            curr_a = None
            curr_b = None
            curr_c = None
            curr_d = None
            curr_ans = 'A'
            curr_exp = None
            continue
            
        m_a = re.match(r'^\*?\s*\*?A[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_a and curr_q and not curr_a:
            val = m_a.group(1)
            if '✅' in val or re.search(r'\s{3,}$', l): curr_ans = 'A'
            curr_a = val.replace('✅', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*\*?B[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if '✅' in val or re.search(r'\s{3,}$', l): curr_ans = 'B'
            curr_b = val.replace('✅', '').strip()
            continue

        m_c = re.match(r'^\*?\s*\*?C[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if '✅' in val or re.search(r'\s{3,}$', l): curr_ans = 'C'
            curr_c = val.replace('✅', '').strip()
            continue

        m_d = re.match(r'^\*?\s*\*?D[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if '✅' in val or re.search(r'\s{3,}$', l): curr_ans = 'D'
            curr_d = val.replace('✅', '').strip()
            continue
            
        m_ans1 = re.match(r'^Answer:\s*([A-D])\s*[–\-—]\s*(.*)$', l, re.IGNORECASE)
        if m_ans1 and curr_q:
            curr_ans = m_ans1.group(1).upper()
            curr_exp = m_ans1.group(2).strip()
            continue
            
        m_ans2 = re.match(r'^\s*([A-D])\s*[–\-—]\s*(.*)$', l)
        if m_ans2 and curr_q:
            curr_ans = m_ans2.group(1).upper()
            curr_exp = m_ans2.group(2).strip()
            continue
            
        if curr_q and not curr_a:
            curr_q += " " + l
        elif curr_d and not curr_exp:
            curr_exp = l
            
    if curr_q and curr_a and curr_b and curr_c and curr_d:
        q_count_in_group += 1
        total_qs += 1
        qtype = forced_quiz if forced_quiz else ('pre_test' if q_count_in_group <= 15 else 'post_test')
        key = (topic_num, qtype)
        by_topic_quiz[key] = by_topic_quiz.get(key, 0) + 1

print("=== FINAL PRE-TEST / POST-TEST COUNTS PER TOPIC ===")
for topic_num in range(1, 9):
    t_id, t_title = TOPICS[topic_num]
    pre_cnt = by_topic_quiz.get((topic_num, 'pre_test'), 0)
    post_cnt = by_topic_quiz.get((topic_num, 'post_test'), 0)
    print(f"Topic {topic_num} ({t_title}): Pre-test = {pre_cnt}, Post-test = {post_cnt}, Total = {pre_cnt + post_cnt}")

print(f"\nTOTAL MCQs: {total_qs}")
