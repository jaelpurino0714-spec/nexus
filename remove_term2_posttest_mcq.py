import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8"

term2_topic_ids = [
    'b0000000-0000-0000-0000-000000000201',
    'b0000000-0000-0000-0000-000000000202',
    'b0000000-0000-0000-0000-000000000203',
    'b0000000-0000-0000-0000-000000000204',
    'b0000000-0000-0000-0000-000000000205',
    'b0000000-0000-0000-0000-000000000206',
]

# 1. Delete post_test Term 2 MCQs from Supabase REST API
topic_filter = "in.(" + ",".join(term2_topic_ids) + ")"
url = f"{SUPABASE_URL}/rest/v1/questions?topic_id={topic_filter}&question_type_id=eq.1&quiz_type=eq.post_test"

req = urllib.request.Request(url, method='DELETE')
req.add_header('apikey', SUPABASE_ANON_KEY)
req.add_header('Authorization', f'Bearer {SUPABASE_ANON_KEY}')
req.add_header('Prefer', 'return=representation')

try:
    with urllib.request.urlopen(req) as resp:
        res_data = resp.read().decode('utf-8')
        deleted_items = json.loads(res_data) if res_data else []
        print(f"SUCCESS: Deleted {len(deleted_items)} post_test Term 2 MCQs from live Supabase database!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error deleting post_test Term 2 MCQs: {e}")

# 2. Update build_mcq_term2_sql.py to exclude post_test items
with open('build_mcq_term2_sql.py', 'r', encoding='utf-8') as f:
    code_mcq2 = f.read()

target_save = "qtype = 'pre_test' if q_idx_in_topic <= 15 else 'post_test'"
new_save = "qtype = 'pre_test' if q_idx_in_topic <= 15 else None\n                if qtype is None: continue"

if target_save in code_mcq2:
    code_mcq2 = code_mcq2.replace(target_save, new_save)
    with open('build_mcq_term2_sql.py', 'w', encoding='utf-8') as f:
        f.write(code_mcq2)
    print("Updated build_mcq_term2_sql.py to exclude post_test MCQs.")

# 3. Update build_master_seed_fast.py, generate_master_sql.py, build_clean_seed_sql.py
for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    target_gen = "qtype = 'pre_test' if q_idx_in_topic <= 15 else 'post_test'"
    new_gen = "qtype = 'pre_test' if q_idx_in_topic <= 15 else None\n                if qtype is None: continue"
    
    if target_gen in code:
        code = code.replace(target_gen, new_gen)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated {fname} to exclude post_test Term 2 MCQs.")

