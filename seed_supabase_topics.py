import sys
import json
import urllib.request

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

# 1. Terms
terms = [
    {"id": "a0000000-0000-0000-0000-000000000001", "name": "Term 1", "title": "First Term", "order_no": 1},
    {"id": "a0000000-0000-0000-0000-000000000002", "name": "Term 2", "title": "Second Term", "order_no": 2},
    {"id": "a0000000-0000-0000-0000-000000000003", "name": "Term 3", "title": "Third Term", "order_no": 3},
]
print("Posting terms...")
post_data("terms", terms)

# 2. Question Types
qtypes = [
    {"id": 1, "name": "Multiple Choice"},
    {"id": 2, "name": "True or False"},
    {"id": 3, "name": "Identification"},
]
print("Posting question types...")
post_data("question_types", qtypes)

# 3. Topics
topics = [
    # Term 1 Topics
    {"id": "b0000000-0000-0000-0000-000000000101", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Physical vs. Chemical Change", "order_no": 1},
    {"id": "b0000000-0000-0000-0000-000000000102", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Chemical Reactions", "order_no": 2},
    {"id": "b0000000-0000-0000-0000-000000000103", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Acids, Bases, and Salts", "order_no": 3},
    {"id": "b0000000-0000-0000-0000-000000000104", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Chemical Equations", "order_no": 4},
    {"id": "b0000000-0000-0000-0000-000000000105", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Balancing Chemical Equations", "order_no": 5},
    {"id": "b0000000-0000-0000-0000-000000000106", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Rates of Reactions", "order_no": 6},
    {"id": "b0000000-0000-0000-0000-000000000107", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Homeostasis", "order_no": 7},
    {"id": "b0000000-0000-0000-0000-000000000108", "term_id": "a0000000-0000-0000-0000-000000000001", "title": "Mechanisms of Evolution", "order_no": 8},

    # Term 2 Topics
    {"id": "b0000000-0000-0000-0000-000000000201", "term_id": "a0000000-0000-0000-0000-000000000002", "title": "Ecosystem's Carrying Capacity and Population Growth", "order_no": 1},
    {"id": "b0000000-0000-0000-0000-000000000202", "term_id": "a0000000-0000-0000-0000-000000000002", "title": "Biotechnology", "order_no": 2},
    {"id": "b0000000-0000-0000-0000-000000000203", "term_id": "a0000000-0000-0000-0000-000000000002", "title": "Plate Tectonics", "order_no": 3},
    {"id": "b0000000-0000-0000-0000-000000000204", "term_id": "a0000000-0000-0000-0000-000000000002", "title": "Global Climate", "order_no": 4},
    {"id": "b0000000-0000-0000-0000-000000000205", "term_id": "a0000000-0000-0000-0000-000000000002", "title": "Global Interactions (ENSO)", "order_no": 5},
    {"id": "b0000000-0000-0000-0000-000000000206", "term_id": "a0000000-0000-0000-0000-000000000002", "title": "Global and Local Sustainability", "order_no": 6},

    # Term 3 Topics
    {"id": "b0000000-0000-0000-0000-000000000301", "term_id": "a0000000-0000-0000-0000-000000000003", "title": "Projectile Motion", "order_no": 1},
    {"id": "b0000000-0000-0000-0000-000000000302", "term_id": "a0000000-0000-0000-0000-000000000003", "title": "Momentum and Collisions", "order_no": 2},
    {"id": "b0000000-0000-0000-0000-000000000303", "term_id": "a0000000-0000-0000-0000-000000000003", "title": "Large-Scale Generation and Distribution of Electricity", "order_no": 3},
    {"id": "b0000000-0000-0000-0000-000000000304", "term_id": "a0000000-0000-0000-0000-000000000003", "title": "Renewable and Non-Renewable Energy Sources", "order_no": 4},
]
print("Posting topics...")
post_data("topics", topics)
print("SUCCESSFULLY SEEDED TERMS, QUESTION TYPES, AND TOPICS IN SUPABASE!")
