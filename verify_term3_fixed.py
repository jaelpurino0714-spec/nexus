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

print("=== TERM 3 DETAILED QUESTION BREAKDOWN IN MASTER SEED SQL ===")
total_t3 = 0
for t_id, title in t3_topics:
    matches = re.findall(rf"\('{t_id}',\s*(\d+),\s*'([^']+)'", sql)
    qtype1_pre = len([m for m in matches if m[0] == '1' and m[1] == 'pre_test'])
    qtype1_post = len([m for m in matches if m[0] == '1' and m[1] == 'post_test'])
    qtype2_cnt = len([m for m in matches if m[0] == '2'])
    qtype3_cnt = len([m for m in matches if m[0] == '3'])
    total_t3 += len(matches)
    print(f"  Topic: {title}")
    print(f"    Multiple Choice (Type 1) - Pre-test: {qtype1_pre} | Post-test: {qtype1_post}")
    print(f"    True or False (Type 2) - Post-test: {qtype2_cnt}")
    print(f"    Identification (Type 3) - Post-test: {qtype3_cnt}")

print(f"\nTotal Term 3 questions in seed_master_questions.sql: {total_t3}")
