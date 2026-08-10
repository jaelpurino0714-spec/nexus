import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_ID1 = {
    1: ('b0000000-0000-0000-0000-000000000101', 'Physical vs. Chemical Change'),
    2: ('b0000000-0000-0000-0000-000000000103', 'Acids, Bases, and Salts'),
    3: ('b0000000-0000-0000-0000-000000000102', 'Chemical Reactions'),
    4: ('b0000000-0000-0000-0000-000000000104', 'Chemical Equations'),
    5: ('b0000000-0000-0000-0000-000000000106', 'Rates of Reactions'),
    6: ('b0000000-0000-0000-0000-000000000107', 'Homeostasis'),
    7: ('b0000000-0000-0000-0000-000000000108', 'Mechanisms of Evolution'),
}

def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

with open('dump_Identification term 1.pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = re.split(r'PART\s+(\d+)\s+[–\-]\s+([^\n]+)', text)

records = []

for i in range(1, len(parts), 3):
    p_num = int(parts[i])
    p_content = parts[i+2]
    if p_num not in TOPICS_ID1: continue
    
    t_id, t_title = TOPICS_ID1[p_num]
    
    sections = re.split(r'Answer Key|Answer K', p_content, flags=re.IGNORECASE)
    q_sec = sections[0]
    ans_sec = sections[1] if len(sections) > 1 else ''
    
    ans_map = {}
    for a_match in re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*([^\n]+)', ans_sec):
        q_n = int(a_match.group(1))
        a_val = re.sub(r'\s*\.$', '', a_match.group(2).strip())
        ans_map[q_n] = a_val
        
    for q_match in re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=\s*Answer:|\n\s*\d+[\.\)]|\Z)', q_sec, re.DOTALL):
        q_num = int(q_match.group(1))
        q_body = re.sub(r'--- PAGE \d+ ---', '', q_match.group(2))
        q_body = re.sub(r'Directions:[^\n]*', '', q_body)
        q_body = re.sub(r'Identification', '', q_body)
        q_body = re.sub(r'\s+', ' ', q_body).replace('Answer:', '').strip()
        
        ans = ans_map.get(q_num)
        if q_body and ans:
            records.append({
                'part_num': p_num,
                'topic_id': t_id,
                'topic_title': t_title,
                'q_num': q_num,
                'question': q_body,
                'correct_answer': ans,
                'explanation': f"The correct term is: {ans}."
            })

print(f"Parsed {len(records)} Term 1 Identification questions across parts:")
for p_num in range(1, 8):
    cnt = len([r for r in records if r['part_num'] == p_num])
    print(f"  Part {p_num} ({TOPICS_ID1[p_num][1]}): {cnt} Identification questions")

out_path = r'd:\Nexus 2.0\insert_identification_term1.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 1 IDENTIFICATION QUESTIONS FOR POST-TEST\n")
    out.write("-- Source: Assets/Identification term 1.pdf\n")
    out.write("-- Question Type: 3 (Identification)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_ID1.values()])
    out.write("-- 1. Clean existing Identification questions for Term 1 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 3;\n\n")

    out.write("-- 2. Insert Identification Questions per Topic\n")
    
    for p_num in range(1, 8):
        t_id, t_title = TOPICS_ID1[p_num]
        t_recs = [r for r in records if r['part_num'] == p_num]
        
        out.write(f"-- Topic (Part {p_num}): {t_title} (Total {len(t_recs)} Identification questions)\n")
        if t_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 3, 'post_test', {sql_escape(r['question'])}, NULL, NULL, NULL, NULL, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path}!")
