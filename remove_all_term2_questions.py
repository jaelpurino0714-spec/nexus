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

# 1. Delete ALL Term 2 questions from Supabase
topic_filter = "in.(" + ",".join(term2_topic_ids) + ")"
url = f"{SUPABASE_URL}/rest/v1/questions?topic_id={topic_filter}"

req = urllib.request.Request(url, method='DELETE')
req.add_header('apikey', SUPABASE_ANON_KEY)
req.add_header('Authorization', f'Bearer {SUPABASE_ANON_KEY}')
req.add_header('Prefer', 'return=representation')

try:
    with urllib.request.urlopen(req) as resp:
        res_data = resp.read().decode('utf-8')
        deleted_items = json.loads(res_data) if res_data else []
        print(f"SUCCESS: Deleted {len(deleted_items)} Term 2 questions from live Supabase database!")
except urllib.error.HTTPError as e:
    print(f"HTTPError on DELETE Term 2 questions: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error deleting Term 2 questions: {e}")

# 2. Update Python generator scripts to filter out Term 2 questions
for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    # Modify add_q to skip any topic starting with 't2_'
    old_add_q = "def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):"
    new_add_q = """def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):
    if top_key.startswith('t2_'):
        return  # Exclude all Term 2 questions"""

    if old_add_q in code and "if top_key.startswith('t2_'):" not in code:
        code = code.replace(old_add_q, new_add_q)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated {fname} to skip Term 2 questions.")

