import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'
pdf_path = os.path.join(assets_dir, 'T-F-term-1.pdf')
reader = PdfReader(pdf_path)

# Topic ID Map
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

text = '\n'.join([(p.extract_text() or '') for p in reader.pages])

# Extract question blocks: N. question \n Answer: True/False \n Explanation: ...
q_blocks = re.findall(r'(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*(True|False|TRUE|FALSE)\s*\n\s*Explanation:\s*(.*?)(?=\n\s*(?:topic|\d+[\.\)]|Below|\Z))', text, re.DOTALL | re.IGNORECASE)

print(f"Extracted {len(q_blocks)} total raw question blocks from T-F-term-1.pdf.")

def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

current_topic_id = TOPICS[1][0]
records_by_topic = {t_id[0]: [] for t_id in TOPICS.values()}

for block in q_blocks:
    q_num = int(block[0])
    q_body = re.sub(r'\s+', ' ', block[1]).strip()
    ans_val = block[2].strip().capitalize()
    exp_body = re.sub(r'\s+', ' ', block[3]).strip()
    
    q_lower = q_body.lower()
    
    # Clean topic headers if embedded inside q_body
    q_body = re.sub(r'TRUE OR FALSE\s*:\s*topic\s*\d+\s*:\s*[^\n]*', '', q_body, flags=re.IGNORECASE).strip()
    q_body = re.sub(r'Below is Part \d+:[^\n]*', '', q_body, flags=re.IGNORECASE).strip()
    q_body = re.sub(r'topic \d+ – TRUE OR FALSE[^\n]*', '', q_body, flags=re.IGNORECASE).strip()
    
    # Classify topic based on keywords
    if 'acid' in q_lower or 'base' in q_lower or 'litmus' in q_lower or 'ph' in q_lower or 'salt' in q_lower or 'arrhenius' in q_lower:
        topic_id = TOPICS[3][0]
    elif 'rate' in q_lower or 'collision' in q_lower or 'catalyst' in q_lower or 'surface area' in q_lower or 'activation energy' in q_lower:
        topic_id = TOPICS[6][0]
    elif 'homeostasis' in q_lower or 'feedback' in q_lower or 'temperature' in q_lower or 'hormone' in q_lower or 'kidney' in q_lower or 'insulin' in q_lower or 'thermoregulation' in q_lower:
        topic_id = TOPICS[7][0]
    elif 'evolution' in q_lower or 'natural selection' in q_lower or 'fossil' in q_lower or 'darwin' in q_lower or 'species' in q_lower or 'homologous' in q_lower or 'adaptation' in q_lower:
        topic_id = TOPICS[8][0]
    elif 'balancing' in q_lower or 'coefficient' in q_lower or 'subscript' in q_lower or 'conservation of mass' in q_lower:
        topic_id = TOPICS[5][0]
    elif 'equation' in q_lower or 'reactants' in q_lower or 'products' in q_lower or 'symbol' in q_lower or 'yields' in q_lower:
        topic_id = TOPICS[4][0]
    elif 'combustion' in q_lower or 'synthesis' in q_lower or 'decomposition' in q_lower or 'single displacement' in q_lower or 'double displacement' in q_lower:
        topic_id = TOPICS[2][0]
    else:
        topic_id = TOPICS[1][0]

    records_by_topic[topic_id].append({
        'topic_id': topic_id,
        'question_type_id': 2,
        'quiz_type': 'post_test',
        'question': q_body,
        'correct_answer': ans_val,
        'explanation': exp_body,
    })

# Output file
out_path = r'd:\Nexus 2.0\insert_post_test_term1_tf.sql'
with open(out_path, 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: POST-TEST TERM 1 TRUE OR FALSE QUESTIONS PER TOPIC\n")
    out.write("-- Parsed from Assets/T-F-term-1.pdf\n")
    out.write("-- ====================================================================\n\n")

    out.write("-- 1. Clean existing Post-Test Term 1 True/False questions\n")
    topic_ids_str = ", ".join([f"'{v[0]}'" for v in TOPICS.values()])
    out.write(f"DELETE FROM public.questions WHERE topic_id IN ({topic_ids_str}) AND question_type_id = 2 AND quiz_type = 'post_test';\n\n")

    out.write("-- 2. Insert True/False Questions per Topic\n")
    total_count = 0
    for topic_num in range(1, 9):
        t_id, t_title = TOPICS[topic_num]
        t_records = records_by_topic[t_id]
        total_count += len(t_records)
        out.write(f"-- Topic {topic_num}: {t_title} ({len(t_records)} items)\n")
        if t_records:
            out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, correct_answer, explanation, is_active) VALUES\n")
            rows = []
            for r in t_records:
                rows.append(f"({sql_escape(r['topic_id'])}, 2, 'post_test', {sql_escape(r['question'])}, 'True', 'False', {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
            out.write(",\n".join(rows) + ";\n\n")

print(f"Generated {out_path} with {total_count} total questions across 8 Term 1 topics!")
