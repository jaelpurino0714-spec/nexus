import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWJ3cXZkb3R3bXRxY2F4cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NzUxNTQsImV4cCI6MjEwMTU1MTE1NH0._t0YaKroymMbtSnySVpe8Sw9uwUviAFYdkXeZADeVL8"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}

url = f"{SUPABASE_URL}/rest/v1/topics?select=*"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print(f"Total topics in Supabase: {len(data)}")
    for t in data:
        print(f"  ID: {t['id']} | Term: {t['term_id']} | Title: {t['title']}")
