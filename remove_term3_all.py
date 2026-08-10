import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8"

term3_topic_ids = [
    'b0000000-0000-0000-0000-000000000301',
    'b0000000-0000-0000-0000-000000000302',
    'b0000000-0000-0000-0000-000000000303',
    'b0000000-0000-0000-0000-000000000304',
]

# 1. Delete all Term 3 questions from live Supabase
topic_filter = "in.(" + ",".join(term3_topic_ids) + ")"
url = f"{SUPABASE_URL}/rest/v1/questions?topic_id={topic_filter}"

req = urllib.request.Request(url, method='DELETE')
req.add_header('apikey', SUPABASE_ANON_KEY)
req.add_header('Authorization', f'Bearer {SUPABASE_ANON_KEY}')
req.add_header('Prefer', 'return=representation')

try:
    with urllib.request.urlopen(req) as resp:
        res_data = resp.read().decode('utf-8')
        deleted_items = json.loads(res_data) if res_data else []
        print(f"SUCCESS: Deleted {len(deleted_items)} Term 3 questions from live Supabase database!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error deleting Term 3 questions: {e}")

# 2. Update add_q filter in master generator scripts
for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    # In add_q definition:
    old_add = "def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):"
    new_add = "def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):\n    if top_key.startswith('t3_'): return"

    if old_add in code and "if top_key.startswith('t3_'): return" not in code:
        code = code.replace(old_add, new_add)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated add_q in {fname} to exclude Term 3 questions.")

