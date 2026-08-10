import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('seed_master_questions.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

t3_topics = [
    ('b0000000-0000-0000-0000-000000000301', 'Projectile Motion'),
    ('b0000000-0000-0000-0000-000000000302', 'Momentum and Collisions'),
    ('b0000000-0000-0000-0000-000000000303', 'Large-Scale Generation and Distribution of Electricity'),
    ('b0000000-0000-0000-0000-000000000304', 'Renewable and Non-Renewable Energy Sources'),
]

print("=== TERM 3 QUESTION BREAKDOWN IN MASTER SEED SQL ===")
total_t3 = 0
for t_id, title in t3_topics:
    # Match questions with this topic_id
    matches = re.findall(rf"\('{t_id}',\s*(\d+),\s*'([^']+)'", sql)
    qtype2_cnt = len([m for m in matches if m[0] == '2'])
    other_cnt = len([m for m in matches if m[0] != '2'])
    total_t3 += len(matches)
    print(f"  Topic: {title}")
    print(f"    True or False (Type 2): {qtype2_cnt}")
    print(f"    Other Question Types: {other_cnt}")

print(f"\nTotal Term 3 questions in seed_master_questions.sql: {total_t3}")
