import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

code = r'''import os
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

def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

def clean_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM 2[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^\d+[\.\)]\s*', '', s)
    return s.strip()

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
                if q_idx_in_topic <= 15:
                    records.append({
                        'topic_num': t_num,
                        'topic_id': t_id,
                        'topic_title': t_title,
                        'q_num': q_idx_in_topic,
                        'quiz_type': 'pre_test',
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
        if q_idx_in_topic <= 15:
            records.append({
                'topic_num': t_num,
                'topic_id': t_id,
                'topic_title': t_title,
                'q_num': q_idx_in_topic,
                'quiz_type': 'pre_test',
                'question': clean_stem(curr_q),
                'choice_a': curr_a,
                'choice_b': curr_b,
                'choice_c': curr_c,
                'choice_d': curr_d,
                'correct_answer': curr_ans,
                'explanation': f"Option {curr_ans} is the correct answer."
            })

out_path = r'd:\Nexus 2.0\insert_mcq_term2.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 2 MULTIPLE CHOICE QUESTIONS FOR PRE-TEST\n")
    out.write("-- Source: Assets/nexus-MCQ-term-2.pdf\n")
    out.write("-- Question Type: 1 (Multiple Choice)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_MCQ2.values()])
    out.write("-- 1. Clean existing MCQ questions for Term 2 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 1;\n\n")

    out.write("-- 2. Insert Pre-test Multiple Choice Questions per Topic\n")
    
    for topic_num in range(1, 7):
        t_id, t_title = TOPICS_MCQ2[topic_num]
        pre_recs = [r for r in records if r['topic_num'] == topic_num and r['quiz_type'] == 'pre_test']
        
        out.write(f"-- Topic {topic_num}: {t_title} (Total {len(pre_recs)} Pre-test MCQs)\n")
        if pre_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in pre_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 1, 'pre_test', {sql_escape(r['question'])}, {sql_escape(r['choice_a'])}, {sql_escape(r['choice_b'])}, {sql_escape(r['choice_c'])}, {sql_escape(r['choice_d'])}, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path} with {len(records)} Term 2 Pre-test MCQs!")
'''

with open('build_mcq_term2_sql.py', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated build_mcq_term2_sql.py cleanly.")
