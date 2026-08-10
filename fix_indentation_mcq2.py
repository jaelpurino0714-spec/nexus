import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['build_mcq_term2_sql.py', 'build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    bad_indent = "qtype = 'pre_test' if q_idx_in_topic <= 15 else None\n                if qtype is None: continue"
    good_indent = "qtype = 'pre_test' if q_idx_in_topic <= 15 else None\n            if qtype is None: continue"

    if bad_indent in code:
        code = code.replace(bad_indent, good_indent)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Fixed indentation in {fname}")

