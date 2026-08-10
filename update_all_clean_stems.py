import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

clean_func_mcq2 = r'''def clean_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM \d+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^(?:✅\s*)?[A-D]\s*[–\-—]\s*.*?\d+[\.\)]\s*', '', s).strip()
    s = re.sub(r'^\d+[\.\)]\s*', '', s).strip()
    return s'''

clean_func_master = r'''def clean_mcq2_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM \d+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^(?:✅\s*)?[A-D]\s*[–\-—]\s*.*?\d+[\.\)]\s*', '', s).strip()
    s = re.sub(r'^\d+[\.\)]\s*', '', s).strip()
    return s'''

# 1. Update build_mcq_term2_sql.py
with open('build_mcq_term2_sql.py', 'r', encoding='utf-8') as f:
    c2 = f.read()

c2 = re.sub(r'def clean_stem\(raw_q\):.*?(?=\n\nwith open)', lambda m: clean_func_mcq2, c2, flags=re.DOTALL)
with open('build_mcq_term2_sql.py', 'w', encoding='utf-8') as f:
    f.write(c2)
print("Updated build_mcq_term2_sql.py")

# 2. Update build_master_seed_fast.py, generate_master_sql.py, build_clean_seed_sql.py
for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    code = re.sub(r'def clean_mcq2_stem\(raw_q\):.*?(?=\n\nfor idx in range)', lambda m: clean_func_master, code, flags=re.DOTALL)
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Updated {fname}")

