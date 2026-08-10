import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    old_check = "if top_key.startswith('t3_') and q_type_id == 3: return  # Exclude Term 3 Identification questions, allow Term 1 and Term 2"
    new_check = "# Allow all Identification questions for Terms 1, 2, and 3"

    if old_check in code:
        code = code.replace(old_check, new_check)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated add_q filter in {fname} to allow Term 3 Identification questions.")

