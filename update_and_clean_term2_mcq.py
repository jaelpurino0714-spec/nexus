import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# Update build_master_seed_fast.py
with open('build_master_seed_fast.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace Term 2 MCQ qtype line
old_block = """        qtype = 'pre_test' if q_idx <= 15 else 'post_test'
        add_q(top_key, 1, q_stem, ca, cb, cc, cd, correct_letter, f'Option {correct_letter} is the correct answer.', qtype)"""

new_block = """        # All Term 2 MCQs are post_test (removing hardcoded pre_test MCQs for Term 2)
        q_stem = re.sub(r'\(only use 15 questions in every pretest topic[^\)]*\)', '', q_stem, flags=re.IGNORECASE)
        q_stem = re.sub(r'^and randomized each playthrough\)\s*', '', q_stem, flags=re.IGNORECASE).strip()
        qtype = 'post_test'
        add_q(top_key, 1, q_stem, ca, cb, cc, cd, correct_letter, f'Option {correct_letter} is the correct answer.', qtype)"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open('build_master_seed_fast.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated build_master_seed_fast.py")
else:
    print("old_block not found in build_master_seed_fast.py")

# Update generate_master_sql.py & build_clean_seed_sql.py
for fname in ['generate_master_sql.py', 'build_clean_seed_sql.py']:
    with open(fname, 'r', encoding='utf-8') as f:
        c = f.read()
    if old_block in c:
        c = c.replace(old_block, new_block)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"Updated {fname}")

