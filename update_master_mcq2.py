import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    old_check = "if top_key.startswith('t2_') and q_type_id == 1:\n        return  # Exclude Term 2 MCQs only (include T/F and Identification)"
    
    if old_check in code:
        code = code.replace(old_check, "")
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated {fname} to include Term 2 pre-test and post-test MCQs.")
    else:
        print(f"old_check not found in {fname}")

