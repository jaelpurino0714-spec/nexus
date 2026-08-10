import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    dup_sec = "# --- 3b. Parse T-or-F-term-3.docx ---"
    if dup_sec in code:
        pos_start = code.find(dup_sec)
        pos_end = code.find("# --- 4. Parse Identification files ---")
        if pos_start != -1 and pos_end != -1:
            code = code[:pos_start] + code[pos_end:]
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(code)
            print(f"Removed duplicate section 3b in {fname}")

