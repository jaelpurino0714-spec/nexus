import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

term2_topic_ids = [
    'b0000000-0000-0000-0000-000000000201',
    'b0000000-0000-0000-0000-000000000202',
    'b0000000-0000-0000-0000-000000000203',
    'b0000000-0000-0000-0000-000000000204',
    'b0000000-0000-0000-0000-000000000205',
    'b0000000-0000-0000-0000-000000000206',
]

with open('seed_master_questions.sql', 'r', encoding='utf-8') as f:
    sql_text = f.read()

# Match question tuples
tuples = re.findall(r"\('([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']*)'", sql_text)

term2_counts = {}

for t in tuples:
    topic_id, qtype_id, quiz_type, q_stem = t[0], int(t[1]), t[2], t[3]
    if topic_id in term2_topic_ids:
        key = (qtype_id, quiz_type)
        term2_counts[key] = term2_counts.get(key, 0) + 1

print("=== TERM 2 QUESTION BREAKDOWN IN MASTER SEED SQL ===")
for qtype_id, name in [(1, 'Multiple Choice'), (2, 'True or False'), (3, 'Identification')]:
    for quiz_type in ['pre_test', 'post_test']:
        cnt = term2_counts.get((qtype_id, quiz_type), 0)
        print(f"  Question Type {qtype_id} ({name}) - {quiz_type}: {cnt}")

