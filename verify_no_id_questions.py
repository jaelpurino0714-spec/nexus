import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('seed_master_questions.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# Find all question_type_id in SQL
type1_cnt = len(re.findall(r"INSERT INTO public\.questions.*?VALUES\s*(.*)", sql, re.DOTALL))
type3_cnt = len(re.findall(r",\s*3,\s*'", sql))

print("=== QUESTION BREAKDOWN IN MASTER SEED SQL ===")
print(f"Identification (Type 3) questions count in seed_master_questions.sql: {type3_cnt}")

terms = [
    ('a0000000-0000-0000-0000-000000000001', 'Term 1'),
    ('a0000000-0000-0000-0000-000000000002', 'Term 2'),
    ('a0000000-0000-0000-0000-000000000003', 'Term 3'),
]

# Extract all (topic_id, question_type_id, quiz_type)
all_questions = re.findall(r"\('([a-f0-9\-]+)',\s*(\d+),\s*'([^']+)'", sql)
print(f"\nTotal questions parsed: {len(all_questions)}")
print(f"Question types found in SQL: {set([q[1] for q in all_questions])}")

