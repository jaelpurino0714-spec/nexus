import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\Identification term 1.pdf'
reader = PdfReader(pdf_path)

full_text = ""
for i, page in enumerate(reader.pages):
    full_text += f"\n--- PAGE {i+1} ---\n" + (page.extract_text() or "")

parts = re.split(r'PART\s+(\d+)\s+–\s+([^\n]+)', full_text)

part_map = {
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

records_by_part = {}

for idx in range(1, len(parts), 3):
    part_num = int(parts[idx])
    part_title = parts[idx+1].strip()
    part_content = parts[idx+2]
    
    sections = re.split(r'Answer Key', part_content, flags=re.IGNORECASE)
    q_sec = sections[0]
    ans_sec = sections[1] if len(sections) > 1 else ''
    
    ans_matches = re.findall(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*)', ans_sec)
    ans_map = {}
    for num_str, ans_str in ans_matches:
        num = int(num_str)
        ans_clean = ans_str.strip()
        ans_clean = re.sub(r'\s*\.$', '', ans_clean)
        ans_map[num] = ans_clean

    q_matches = re.findall(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=\s*Answer:|\n\s*\d+[\.\)]|\Z)', q_sec, re.DOTALL)
    
    part_records = []
    for q_num_str, q_body in q_matches:
        q_num = int(q_num_str)
        q_clean = re.sub(r'--- PAGE \d+ ---', '', q_body)
        q_clean = re.sub(r'Directions:[^\n]*', '', q_clean)
        q_clean = re.sub(r'Identification', '', q_clean)
        q_clean = re.sub(r'\s+', ' ', q_clean).strip()
        if q_clean and q_num in ans_map:
            topic_id, topic_name = part_map[part_num]
            ans_val = ans_map[q_num]
            part_records.append({
                'topic_id': topic_id,
                'topic_name': topic_name,
                'q_num': q_num,
                'question': q_clean,
                'correct_answer': ans_val,
                'explanation': f"The correct term is: {ans_val}."
            })
    records_by_part[part_num] = part_records

out_path = r'd:\Nexus 2.0\insert_identification_term1.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 1 IDENTIFICATION QUESTIONS (QUESTION_TYPE_ID = 3)\n")
    out.write("-- Source: Assets/Identification term 1.pdf\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in part_map.values()])
    out.write("-- 1. Clean existing Identification questions for Term 1 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 3;\n\n")

    out.write("-- 2. Insert Identification Questions per Topic\n")
    total_count = 0
    for part_num in range(1, 8):
        t_id, t_title = part_map[part_num]
        recs = records_by_part.get(part_num, [])
        total_count += len(recs)
        out.write(f"-- Part {part_num}: {t_title} ({len(recs)} items)\n")
        if recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 3, 'post_test', {sql_escape(r['question'])}, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Generated {out_path} with {total_count} total identification questions across {len(part_map)} Term 1 topics!")
