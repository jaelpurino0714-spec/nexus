import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_TF2 = {
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

with open('dump_T-or-F-term-2.pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

sections = re.split(r'(^[ \t]*TOPIC:\s*[^\n]+)', text, flags=re.MULTILINE)

records = []

topic_counter = 0

for idx in range(1, len(sections), 2):
    t_header = sections[idx].strip()
    t_body = sections[idx+1]
    
    topic_counter += 1
    if topic_counter > 6: break
    
    t_id, t_title = TOPICS_TF2[topic_counter]
    
    matches = re.findall(r'(\d+)[\.\)]\s+(.*?)\|\s*(TRUE|FALSE)', t_body, re.DOTALL)
    for item in matches:
        q_txt = item[1].strip()
        ans = item[2].capitalize()
        records.append({
            'topic_num': topic_counter,
            'topic_id': t_id,
            'topic_title': t_title,
            'question': q_txt,
            'correct_answer': ans,
            'explanation': f"The statement is {ans}."
        })

print(f"Parsed {len(records)} Term 2 True/False questions across {topic_counter} topics:")
for top_num in range(1, 7):
    cnt = len([r for r in records if r['topic_num'] == top_num])
    print(f"  Topic {top_num} ({TOPICS_TF2[top_num][1]}): {cnt} T/F questions")

out_path = r'd:\Nexus 2.0\insert_post_test_term2_tf.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 2 TRUE OR FALSE QUESTIONS FOR POST-TEST\n")
    out.write("-- Source: Assets/T-or-F-term-2.pdf\n")
    out.write("-- Question Type: 2 (True or False)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_TF2.values()])
    out.write("-- 1. Clean existing True or False questions for Term 2 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 2;\n\n")

    out.write("-- 2. Insert True or False Questions per Topic\n")
    
    for top_num in range(1, 7):
        t_id, t_title = TOPICS_TF2[top_num]
        t_recs = [r for r in records if r['topic_num'] == top_num]
        
        out.write(f"-- Topic {top_num}: {t_title} (Total {len(t_recs)} True/False questions)\n")
        if t_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 2, 'post_test', {sql_escape(r['question'])}, 'True', 'False', NULL, NULL, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path}!")
