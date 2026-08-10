import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8"

# 1. Delete all Identification questions (question_type_id = 3) from live Supabase
url = f"{SUPABASE_URL}/rest/v1/questions?question_type_id=eq.3"

req = urllib.request.Request(url, method='DELETE')
req.add_header('apikey', SUPABASE_ANON_KEY)
req.add_header('Authorization', f'Bearer {SUPABASE_ANON_KEY}')
req.add_header('Prefer', 'return=representation')

try:
    with urllib.request.urlopen(req) as resp:
        res_data = resp.read().decode('utf-8')
        deleted_items = json.loads(res_data) if res_data else []
        print(f"SUCCESS: Deleted {len(deleted_items)} Identification questions (Type 3) from live Supabase database!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error deleting Identification questions: {e}")

# 2. Update add_q filter in master generator scripts
for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    # In add_q definition:
    old_line1 = "def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):"
    
    if old_line1 in code and "if q_type_id == 3: return" not in code:
        new_block = "def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):\n    if q_type_id == 3: return  # Exclude all Identification questions"
        code = code.replace(old_line1, new_block)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated add_q filter in {fname} to exclude Identification questions.")

