import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_ID2 = {
    1: ('b0000000-0000-0000-0000-000000000201', 'Ecosystem\'s Carrying Capacity and Population Growth'),
    2: ('b0000000-0000-0000-0000-000000000202', 'Biotechnology'),
    3: ('b0000000-0000-0000-0000-000000000203', 'Plate Tectonics'),
    4: ('b0000000-0000-0000-0000-000000000204', 'Global Climate'),
}

def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

with open('dump_post-test-Term-2-identification.pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Split by TOPIC headers
sections = re.split(r'(^[ \t]*TOPIC\s*\d+:[^\n]+)', text, flags=re.MULTILINE)

records = []
topic_counter = 0

for idx in range(1, len(sections), 2):
    t_header = sections[idx].strip()
    t_body = sections[idx+1]
    
    topic_counter += 1
    if topic_counter > 4: break
    
    t_id, t_title = TOPICS_ID2[topic_counter]
    
    # Split question blocks: \d+\. ... Answer: ...
    q_matches = re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*([^\n]+)', t_body, re.DOTALL)
    for q_m in q_matches:
        q_num = int(q_m.group(1))
        q_body = re.sub(r'\s+', ' ', q_m.group(2)).strip()
        ans_val = re.sub(r'\s*\.$', '', q_m.group(3).strip())
        
        records.append({
            'topic_num': topic_counter,
            'topic_id': t_id,
            'topic_title': t_title,
            'question': q_body,
            'correct_answer': ans_val,
            'explanation': f"The correct term is: {ans_val}."
        })

print(f"Parsed {len(records)} Term 2 Identification questions across {topic_counter} topics:")
for top_num in range(1, 5):
    cnt = len([r for r in records if r['topic_num'] == top_num])
    print(f"  Topic {top_num} ({TOPICS_ID2[top_num][1]}): {cnt} Identification questions")

out_path = r'd:\Nexus 2.0\insert_identification_term2.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 2 IDENTIFICATION QUESTIONS FOR POST-TEST\n")
    out.write("-- Source: Assets/post-test-Term-2-identification.pdf\n")
    out.write("-- Question Type: 3 (Identification)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_ID2.values()])
    out.write("-- 1. Clean existing Identification questions for Term 2 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 3;\n\n")

    out.write("-- 2. Insert Identification Questions per Topic\n")
    
    for top_num in range(1, 5):
        t_id, t_title = TOPICS_ID2[top_num]
        t_recs = [r for r in records if r['topic_num'] == top_num]
        
        out.write(f"-- Topic {top_num}: {t_title} (Total {len(t_recs)} Identification questions)\n")
        if t_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 3, 'post_test', {sql_escape(r['question'])}, NULL, NULL, NULL, NULL, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path}!")
