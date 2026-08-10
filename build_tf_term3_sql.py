import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_TF3 = {
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

with open('dump_T-or-F-term-3.docx.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
records = []
curr_topic_num = 1

for l in lines:
    raw_l = l.strip()
    if not raw_l: continue
    
    if 'TOPIC' in raw_l.upper():
        m_top = re.search(r'TOPIC\s*(\d+)', raw_l, re.IGNORECASE)
        if m_top:
            curr_topic_num = int(m_top.group(1))
        continue
        
    if '|' in raw_l:
        parts = raw_l.split('|')
        q_text = parts[0].strip()
        ans_str = parts[1].strip().capitalize()
        if q_text and ans_str in ['True', 'False']:
            t_id, t_title = TOPICS_TF3[curr_topic_num]
            records.append({
                'topic_num': curr_topic_num,
                'topic_id': t_id,
                'topic_title': t_title,
                'question': q_text,
                'correct_answer': ans_str,
                'explanation': f"The statement is {ans_str}."
            })

print(f"Parsed {len(records)} Term 3 True/False questions across topics:")
for top_num in range(1, 5):
    cnt = len([r for r in records if r['topic_num'] == top_num])
    print(f"  Topic {top_num} ({TOPICS_TF3[top_num][1]}): {cnt} True/False questions")

out_path = r'd:\Nexus 2.0\insert_post_test_term3_tf.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 3 TRUE OR FALSE QUESTIONS FOR POST-TEST\n")
    out.write("-- Source: Assets/T-or-F-term-3.docx\n")
    out.write("-- Question Type: 2 (True or False)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_TF3.values()])
    out.write("-- 1. Clean existing True or False questions for Term 3 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 2;\n\n")

    out.write("-- 2. Insert True or False Questions per Topic\n")
    
    for top_num in range(1, 5):
        t_id, t_title = TOPICS_TF3[top_num]
        t_recs = [r for r in records if r['topic_num'] == top_num]
        
        out.write(f"-- Topic {top_num}: {t_title} (Total {len(t_recs)} True/False questions)\n")
        if t_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 2, 'post_test', {sql_escape(r['question'])}, 'True', 'False', NULL, NULL, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path}!")
