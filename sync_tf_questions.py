import os
import sys
import re
import json
import urllib.request
from pypdf import PdfReader
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

def post_data(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    json_bytes = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=json_bytes, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        print(f"HTTPError on {table}:", e.code, e.read().decode('utf-8'))
        raise e

# Topic mapping
topic_rules = [
    ('Physical & Chemical Changes', 'b0000000-0000-0000-0000-000000000101'),
    ('Acids, Bases, and Salts', 'b0000000-0000-0000-0000-000000000103'),
    ('Chemical Equations', 'b0000000-0000-0000-0000-000000000104'),
    ('Rates of Chemical Reactions', 'b0000000-0000-0000-0000-000000000106'),
    ('Rates of Reactions', 'b0000000-0000-0000-0000-000000000106'),
    ('Homeostasis', 'b0000000-0000-0000-0000-000000000107'),
    ('Mechanisms of Evolution', 'b0000000-0000-0000-0000-000000000108'),
    ('Evolution', 'b0000000-0000-0000-0000-000000000108'),
]

# --- 1. Parse T-F-term-1.pdf ---
pdf_path = os.path.join(assets_dir, 'T-F-term-1.pdf')
reader = PdfReader(pdf_path)
text = '\n'.join([(p.extract_text() or '') for p in reader.pages])

current_topic_id = 'b0000000-0000-0000-0000-000000000101'
q_blocks = re.findall(r'(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*(True|False|TRUE|FALSE)\s*\n\s*Explanation:\s*(.*?)(?=\n\s*(?:topic|\d+[\.\)]|Below|\Z))', text, re.DOTALL | re.IGNORECASE)

tf_records = []

for block in q_blocks:
    q_num = int(block[0])
    q_body = re.sub(r'\s+', ' ', block[1]).strip()
    ans_val = block[2].strip().capitalize()
    exp_body = re.sub(r'\s+', ' ', block[3]).strip()
    
    for t_name, t_id in topic_rules:
        if t_name.lower() in q_body.lower():
            current_topic_id = t_id
            q_body = re.sub(rf'(?:topic|\d+)?\s*[–\-\:]?\s*TRUE OR FALSE\s*[–\-\:]?\s*{re.escape(t_name)}', '', q_body, flags=re.IGNORECASE).strip()

    tf_records.append({
        'topic_id': current_topic_id,
        'question_type_id': 2,
        'question': q_body,
        'choice_a': 'True',
        'choice_b': 'False',
        'choice_c': None,
        'choice_d': None,
        'correct_answer': ans_val,
        'explanation': exp_body,
        'is_active': True,
    })

print(f"Extracted {len(tf_records)} True/False questions from T-F-term-1.pdf.")

# --- 2. Parse T-or-F-term-2.pdf ---
reader_tf2 = PdfReader(os.path.join(assets_dir, 'T-or-F-term-2.pdf'))
text_tf2 = '\n'.join([p.extract_text() or '' for p in reader_tf2.pages])
tf2_matches = re.findall(r'(\d+)\.\s+(.*?)\|\s*(TRUE|FALSE)', text_tf2, re.DOTALL)
for item in tf2_matches:
    num = int(item[0])
    q_txt = re.sub(r'\s+', ' ', item[1]).strip()
    ans = item[2].capitalize()
    if num <= 30: top_id = 'b0000000-0000-0000-0000-000000000201'
    elif num <= 60: top_id = 'b0000000-0000-0000-0000-000000000202'
    elif num <= 90: top_id = 'b0000000-0000-0000-0000-000000000203'
    elif num <= 120: top_id = 'b0000000-0000-0000-0000-000000000204'
    elif num <= 150: top_id = 'b0000000-0000-0000-0000-000000000205'
    else: top_id = 'b0000000-0000-0000-0000-000000000206'
    
    tf_records.append({
        'topic_id': top_id,
        'question_type_id': 2,
        'question': q_txt,
        'choice_a': 'True',
        'choice_b': 'False',
        'choice_c': None,
        'choice_d': None,
        'correct_answer': ans,
        'explanation': f'The statement is {ans}.',
        'is_active': True,
    })

# --- 3. Parse T-or-F-term-3.docx ---
doc = Document(os.path.join(assets_dir, 'T-or-F-term-3.docx'))
docx_lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
for idx, line in enumerate(docx_lines):
    parts = line.split('|')
    if len(parts) == 2:
        q_txt = parts[0].strip()
        ans = parts[1].strip()
        if idx < 30: top_id = 'b0000000-0000-0000-0000-000000000301'
        elif idx < 60: top_id = 'b0000000-0000-0000-0000-000000000302'
        elif idx < 90: top_id = 'b0000000-0000-0000-0000-000000000303'
        else: top_id = 'b0000000-0000-0000-0000-000000000304'
        
        tf_records.append({
            'topic_id': top_id,
            'question_type_id': 2,
            'question': q_txt,
            'choice_a': 'True',
            'choice_b': 'False',
            'choice_c': None,
            'choice_d': None,
            'correct_answer': ans,
            'explanation': f'The statement is {ans}.',
            'is_active': True,
        })

print(f"Total True/False records to upload to Supabase: {len(tf_records)}")

# Post to Supabase in batches
batch_size = 100
for i in range(0, len(tf_records), batch_size):
    batch = tf_records[i:i+batch_size]
    print(f"  Uploading True/False batch {i//batch_size + 1}/{(len(tf_records)+batch_size-1)//batch_size}...")
    post_data("questions", batch)

print("SUCCESSFULLY UPLOADED ALL TRUE/FALSE ASSET QUESTIONS TO SUPABASE!")

# Update insert_true_false_questions.sql with clean SQL
def sql_escape(val):
    if val is None: return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

with open(r'd:\Nexus 2.0\insert_true_false_questions.sql', 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: INSERT TRUE OR FALSE QUESTIONS FROM ASSETS (T-F-term-1.pdf, etc.)\n")
    out.write("-- ====================================================================\n\n")
    out.write("INSERT INTO public.questions (topic_id, question_type_id, question, choice_a, choice_b, correct_answer, explanation, is_active) VALUES\n")
    rows = []
    for r in tf_records:
        rows.append(f"({sql_escape(r['topic_id'])}, 2, {sql_escape(r['question'])}, 'True', 'False', {sql_escape(r['correct_answer'])}, {sql_escape(r['explanation'])}, true)")
    out.write(",\n".join(rows) + ";\n")

print("Updated insert_true_false_questions.sql successfully!")
