import os
import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8"

term1_topic_ids = [
    'b0000000-0000-0000-0000-000000000101',
    'b0000000-0000-0000-0000-000000000102',
    'b0000000-0000-0000-0000-000000000103',
    'b0000000-0000-0000-0000-000000000104',
    'b0000000-0000-0000-0000-000000000105',
    'b0000000-0000-0000-0000-000000000106',
    'b0000000-0000-0000-0000-000000000107',
    'b0000000-0000-0000-0000-000000000108',
]

# Delete both pre_test and post_test MCQs for Term 1
topic_filter = "in.(" + ",".join(term1_topic_ids) + ")"
quiz_types = ['pre_test', 'post_test']

total_deleted = 0
for qt in quiz_types:
    url = f"{SUPABASE_URL}/rest/v1/questions?topic_id={topic_filter}&question_type_id=eq.1&quiz_type=eq.{qt}"
    req = urllib.request.Request(url, method='DELETE')
    req.add_header('apikey', SUPABASE_ANON_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_ANON_KEY}')
    req.add_header('Prefer', 'return=representation')

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res_data = resp.read().decode('utf-8')
            deleted_items = json.loads(res_data) if res_data else []
            count = len(deleted_items)
            total_deleted += count
            print(f"SUCCESS: Deleted {count} {qt} Term 1 MCQs from Supabase.")
    except urllib.error.HTTPError as e:
        print(f"HTTPError deleting {qt} Term 1 MCQs: {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Notice deleting {qt} Term 1 MCQs via REST API: {e}")
        print("Note: If the Supabase project is currently paused or inactive, execute remove_term1_mcq.sql in Supabase SQL editor.")

print(f"Total Term 1 MCQs deleted from Supabase: {total_deleted}")
