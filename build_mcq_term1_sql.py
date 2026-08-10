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

def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

sections = re.split(r'(^[ \t]*(?:GROUP|Group)\s*\d+[^\n]*)', text, flags=re.MULTILINE)

records = []

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

    for raw_line in lines:
        l = raw_line.strip()
        if not l: continue
        
        is_marked = ('✅' in raw_line) or bool(re.search(r'\s{3,}$', raw_line.rstrip('\r\n')))

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
                qtype = forced_quiz if forced_quiz else ('pre_test' if q_count_in_group <= 15 else 'post_test')
                exp_text = curr_exp if curr_exp else f"Option {curr_ans} is the correct answer."
                records.append({
                    'topic_num': topic_num,
                    'topic_id': TOPICS[topic_num][0],
                    'topic_title': TOPICS[topic_num][1],
                    'quiz_type': qtype,
                    'question': curr_q,
                    'choice_a': curr_a,
                    'choice_b': curr_b,
                    'choice_c': curr_c,
                    'choice_d': curr_d,
                    'correct_answer': curr_ans,
                    'explanation': exp_text
                })
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
            if is_marked: curr_ans = 'A'
            curr_a = val.replace('✅', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*\*?B[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if is_marked: curr_ans = 'B'
            curr_b = val.replace('✅', '').strip()
            continue

        m_c = re.match(r'^\*?\s*\*?C[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if is_marked: curr_ans = 'C'
            curr_c = val.replace('✅', '').strip()
            continue

        m_d = re.match(r'^\*?\s*\*?D[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if is_marked: curr_ans = 'D'
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
        qtype = forced_quiz if forced_quiz else ('pre_test' if q_count_in_group <= 15 else 'post_test')
        exp_text = curr_exp if curr_exp else f"Option {curr_ans} is the correct answer."
        records.append({
            'topic_num': topic_num,
            'topic_id': TOPICS[topic_num][0],
            'topic_title': TOPICS[topic_num][1],
            'quiz_type': qtype,
            'question': curr_q,
            'choice_a': curr_a,
            'choice_b': curr_b,
            'choice_c': curr_c,
            'choice_d': curr_d,
            'correct_answer': curr_ans,
            'explanation': exp_text
        })

out_path = r'd:\Nexus 2.0\insert_mcq_term1.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 1 MULTIPLE CHOICE QUESTIONS FOR PRE-TEST & POST-TEST\n")
    out.write("-- Source: Assets/nexus-MCQ-term-1 (1).pdf\n")
    out.write("-- Question Type: 1 (Multiple Choice)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS.values()])
    out.write("-- 1. Clean existing MCQ questions for Term 1 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 1;\n\n")

    out.write("-- 2. Insert Multiple Choice Questions per Topic & Quiz Type\n")
    
    for topic_num in range(1, 9):
        t_id, t_title = TOPICS[topic_num]
        t_recs = [r for r in records if r['topic_num'] == topic_num]
        pre_recs = [r for r in t_recs if r['quiz_type'] == 'pre_test']
        post_recs = [r for r in t_recs if r['quiz_type'] == 'post_test']
        
        out.write(f"-- Topic {topic_num}: {t_title} (Total {len(t_recs)} items: {len(pre_recs)} Pre-test, {len(post_recs)} Post-test)\n")
        if t_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 1, {sql_escape(r['quiz_type'])}, {sql_escape(r['question'])}, {sql_escape(r['choice_a'])}, {sql_escape(r['choice_b'])}, {sql_escape(r['choice_c'])}, {sql_escape(r['choice_d'])}, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Generated {out_path} with {len(records)} total MCQs across {len(TOPICS)} Term 1 topics!")
