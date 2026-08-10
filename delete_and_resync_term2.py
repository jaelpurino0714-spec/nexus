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

# Delete Term 2 pre_test MCQs via Supabase REST API
topic_filter = "in.(" + ",".join(term2_topic_ids) + ")"
url = f"{SUPABASE_URL}/rest/v1/questions?topic_id={topic_filter}&question_type_id=eq.1&quiz_type=eq.pre_test"

req = urllib.request.Request(url, method='DELETE')
req.add_header('apikey', SUPABASE_ANON_KEY)
req.add_header('Authorization', f'Bearer {SUPABASE_ANON_KEY}')
req.add_header('Prefer', 'return=representation')

try:
    with urllib.request.urlopen(req) as resp:
        res_data = resp.read().decode('utf-8')
        deleted_items = json.loads(res_data) if res_data else []
        print(f"SUCCESS: Deleted {len(deleted_items)} Term 2 pre_test MCQs from live Supabase database!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error deleting Term 2 pre_test MCQs: {e}")

