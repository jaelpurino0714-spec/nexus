import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

TOPICS_ID3 = {
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

# Parse Part 1, Part 2, Part 4 from PDF dump
with open('dump_Identification term 3.pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = re.split(r'PART\s+(\d+)\s+[–\-]\s+([^\n]+)', text)

records = []

for i in range(1, len(parts), 3):
    p_num = int(parts[i])
    p_content = parts[i+2]
    if p_num not in TOPICS_ID3: continue
    
    t_id, t_title = TOPICS_ID3[p_num]
    
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

# Add Part 3 manually from OCR/screenshot
part3_data = [
    (1, "What device generates electrical energy from mechanical energy?", "Generator"),
    (2, "What device changes AC voltage up or down?", "Transformer"),
    (3, "What voltage is used for long-distance transmission?", "High voltage"),
    (4, "Why is electricity transmitted at high voltage?", "Reduce losses"),
    (5, "What device lowers voltage before electricity reaches homes?", "Step-down transformer"),
    (6, "What carries electricity over long distances?", "Transmission lines"),
    (7, "What distributes electricity to homes and businesses?", "Distribution lines"),
    (8, "What measures household electricity use?", "Electric meter"),
    (9, "What unit does an electric meter measure?", "Kilowatt-hour"),
    (10, "What device protects a circuit from excessive current?", "Fuse"),
    (11, "What reusable device trips during overcurrent?", "Circuit breaker"),
    (12, "What pin on a three-prong plug provides safety grounding?", "Ground pin"),
    (13, "Why is octopus wiring dangerous?", "Overheating"),
    (14, "Why should water not be used on electrical fires?", "Electrocution risk"),
    (15, "What should you turn off during an electrical emergency?", "Main breaker"),
    (16, "What wire carries electrical current to appliances?", "Live wire"),
    (17, "What wire provides a return path for current?", "Neutral wire"),
    (18, "What wire provides protection from electrical faults?", "Ground wire"),
    (19, "What device detects electrical leakage?", "GFCI"),
    (20, "What does a generator convert?", "Mechanical to electrical"),
    (21, "What does an electric motor convert?", "Electrical to mechanical"),
    (22, "What do motors and generators have in common?", "Coils and magnets"),
    (23, "What is the main difference between a motor and generator?", "Energy conversion"),
    (24, "What happens when a motor is mechanically spun?", "Produces electricity"),
    (25, "Why are transmission wires made thick?", "Reduce resistance"),
    (26, "Why are transmission towers tall?", "Safe clearance"),
    (27, "What reduces electricity use in homes?", "Energy conservation"),
    (28, "What type of bulb uses less electricity?", "LED bulb"),
    (29, "What happens to transmission losses when voltage increases?", "Losses decrease"),
    (30, "What are two benefits of reducing electricity use?", "Lower bills, emissions"),
]

t3_id, t3_title = TOPICS_ID3[3]
for q_num, q_body, ans in part3_data:
    records.append({
        'part_num': 3,
        'topic_id': t3_id,
        'topic_title': t3_title,
        'q_num': q_num,
        'question': q_body,
        'correct_answer': ans,
        'explanation': f"The correct term is: {ans}."
    })

print(f"Parsed {len(records)} Term 3 Identification questions across parts:")
for p_num in range(1, 5):
    cnt = len([r for r in records if r['part_num'] == p_num])
    print(f"  Part {p_num} ({TOPICS_ID3[p_num][1]}): {cnt} Identification questions")

out_path = r'd:\Nexus 2.0\insert_identification_term3.sql'

with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: TERM 3 IDENTIFICATION QUESTIONS FOR POST-TEST\n")
    out.write("-- Source: Assets/Identification term 3.pdf + Screenshots\n")
    out.write("-- Question Type: 3 (Identification)\n")
    out.write("-- ====================================================================\n\n")

    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS_ID3.values()])
    out.write("-- 1. Clean existing Identification questions for Term 3 topics\n")
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 3;\n\n")

    out.write("-- 2. Insert Identification Questions per Topic\n")
    
    for p_num in range(1, 5):
        t_id, t_title = TOPICS_ID3[p_num]
        t_recs = [r for r in records if r['part_num'] == p_num]
        
        out.write(f"-- Topic (Part {p_num}): {t_title} (Total {len(t_recs)} Identification questions)\n")
        if t_recs:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_recs:
                rows.append(f"({sql_escape(r['topic_id'])}, 3, 'post_test', {sql_escape(r['question'])}, NULL, NULL, NULL, NULL, {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Successfully generated {out_path}!")
