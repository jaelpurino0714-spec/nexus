import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    if "'t3_renewable_energy'" in code:
        code = code.replace("'t3_renewable_energy'", "'t3_energy_sources'")
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Fixed t3_energy_sources in {fname}")

