import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\Nexus 2.0\seed_master_questions.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

lines = sql.split('\n')
for i, line in enumerate(lines, 1):
    if 'separate' in line.lower():
        print(f"Line {i}: {line}")
