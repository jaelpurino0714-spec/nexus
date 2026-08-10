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

def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

def clean_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r"^Here's the same set[^\n\d]*\d+\.\s*", '', s, flags=re.IGNORECASE)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM \d+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^(?:✅\s*)?[A-D]\s*[–\-—]\s*.*?\d+[\.\)]\s*', '', s).strip()
    s = re.sub(r'^\d+[\.\)]\s*', '', s).strip()
    return s

with open('dump_MCQ-term-3.pdf.txt', 'r', encoding='utf-8') as f:
    text = re.sub(r'--- PAGE \d+ ---', '', f.read())

sections = re.split(r'(Group\s+(\d+)[\s·\-:][^\n]+)', text, flags=re.IGNORECASE)

records = []

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

out_path = r'd:\Nexus 2.0\insert_mcq_term3.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 3 MULTIPLE CHOICE QUESTIONS FOR PRE-TEST & POST-TEST\n")
    out.write("-- Source: Assets/MCQ-term-3.pdf\n")
    out.write("-- Question Type: 1 (Multiple Choice)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_MCQ3.values()])
    out.write("-- 1. Clean existing MCQ questions for Term 3 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 1;\n\n")

    out.write("-- 2. Insert Multiple Choice Questions per Topic & Quiz Type\n")
    
    for g_num in range(1, 5):
        t_id, t_title = TOPICS_MCQ3[g_num]
        g_recs = [r for r in records if r['group_num'] == g_num]
        pre_recs = [r for r in g_recs if r['quiz_type'] == 'pre_test']
        post_recs = [r for r in g_recs if r['quiz_type'] == 'post_test']
        
        out.write(f"-- Topic {g_num}: {t_title} (Total {len(g_recs)} items: {len(pre_recs)} Pre-test, {len(post_recs)} Post-test)\n")
        if g_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in g_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 1, {sql_escape(r['quiz_type'])}, {sql_escape(r['question'])}, {sql_escape(r['choice_a'])}, {sql_escape(r['choice_b'])}, {sql_escape(r['choice_c'])}, {sql_escape(r['choice_d'])}, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path} with {len(records)} Term 3 MCQs!")
