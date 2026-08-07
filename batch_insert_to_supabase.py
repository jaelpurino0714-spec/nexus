import sys
import json
import urllib.request
from generate_master_sql import TOPICS, records

sys.stdout.reconfigure(encoding='utf-8')

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

# 1. Upsert Terms
terms_data = [
    {"id": "a0000000-0000-0000-0000-000000000001", "name": "Term 1", "title": "1st Quarter: Earth and Space", "order_no": 1},
    {"id": "a0000000-0000-0000-0000-000000000002", "name": "Term 2", "title": "2nd Quarter: Force, Motion & Energy", "order_no": 2},
    {"id": "a0000000-0000-0000-0000-000000000003", "name": "Term 3", "title": "3rd Quarter: Living Things & Environment", "order_no": 3},
    {"id": "a0000000-0000-0000-0000-000000000004", "name": "Term 4", "title": "4th Quarter: Matter & Its Interactions", "order_no": 4},
]
print("Posting terms...")
post_data("terms", terms_data)

# 2. Upsert Question Types
qtypes_data = [
    {"id": 1, "name": "Multiple Choice"},
    {"id": 2, "name": "True or False"},
    {"id": 3, "name": "Identification"},
]
print("Posting question types...")
post_data("question_types", qtypes_data)

# 3. Upsert Topics
topics_data = []
for k, v in TOPICS.items():
    topics_data.append({
        "id": v[0],
        "term_id": v[1],
        "title": v[2],
        "order_no": v[3],
    })
print("Posting topics...")
post_data("topics", topics_data)

# 4. Upsert Questions in batches of 100
print(f"Posting {len(records)} questions in batches of 100...")
batch_size = 100
for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    # format batch items
    post_batch = []
    for q in batch:
        post_batch.append({
            "topic_id": q["topic_id"],
            "question_type_id": q["question_type_id"],
            "question": q["question"],
            "choice_a": q["choice_a"],
            "choice_b": q["choice_b"],
            "choice_c": q["choice_c"],
            "choice_d": q["choice_d"],
            "correct_answer": q["correct_answer"],
            "explanation": q["explanation"],
            "is_active": True,
        })
    print(f"  Uploading batch {i//batch_size + 1}/{(len(records)+batch_size-1)//batch_size}...")
    post_data("questions", post_batch)

print("ALL SEED DATA SUCCESSFULLY INSERTED INTO LIVE SUPABASE DATABASE!")
