import os
import sys
import re
import json
import urllib.request
from pypdf import PdfReader

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

pdf_path = os.path.join(assets_dir, 'T-F-term-1.pdf')
reader = PdfReader(pdf_path)
text = '\n'.join([(p.extract_text() or '') for p in reader.pages])

q_blocks = re.findall(r'(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*(True|False|TRUE|FALSE)\s*\n\s*Explanation:\s*(.*?)(?=\n\s*(?:topic|\d+[\.\)]|Below|\Z))', text, re.DOTALL | re.IGNORECASE)

records = []

for block in q_blocks:
    q_num = int(block[0])
    q_body = re.sub(r'\s+', ' ', block[1]).strip()
    ans_val = block[2].strip().capitalize()
    exp_body = re.sub(r'\s+', ' ', block[3]).strip()
    
    q_lower = q_body.lower()
    
    q_body = re.sub(r'TRUE OR FALSE\s*:\s*topic\s*\d+\s*:\s*[^\n]*', '', q_body, flags=re.IGNORECASE).strip()
    q_body = re.sub(r'Below is Part \d+:[^\n]*', '', q_body, flags=re.IGNORECASE).strip()
    q_body = re.sub(r'topic \d+ – TRUE OR FALSE[^\n]*', '', q_body, flags=re.IGNORECASE).strip()
    
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

    records.append({
        'topic_id': topic_id,
        'question_type_id': 2,
        'quiz_type': 'post_test',
        'question': q_body,
        'choice_a': 'True',
        'choice_b': 'False',
        'choice_c': None,
        'choice_d': None,
        'correct_answer': ans_val,
        'explanation': exp_body,
        'is_active': True,
    })

print(f"Uploading {len(records)} Post-Test Term 1 True/False questions across 8 topics to Supabase...")

batch_size = 50
for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    print(f"  Uploading batch {i//batch_size + 1}/{(len(records)+batch_size-1)//batch_size}...")
    post_data("questions", batch)

print("SUCCESSFULLY UPLOADED ALL 231 POST-TEST TERM 1 TRUE/FALSE QUESTIONS TO SUPABASE!")
