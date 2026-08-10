import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

tf3_snippet = r'''
# --- 3b. Parse T-or-F-term-3.docx ---
with open('dump_T-or-F-term-3.docx.txt', 'r', encoding='utf-8') as f:
    text_tf3 = f.read()

top_map_tf3 = {
    1: 't3_projectile_motion',
    2: 't3_momentum_collisions',
    3: 't3_electricity_generation',
    4: 't3_renewable_energy',
}

curr_top_tf3 = 1
for l in text_tf3.split('\n'):
    raw_l = l.strip()
    if not raw_l: continue
    
    if 'TOPIC' in raw_l.upper():
        m_top = re.search(r'TOPIC\s*(\d+)', raw_l, re.IGNORECASE)
        if m_top:
            curr_top_tf3 = int(m_top.group(1))
        continue
        
    if '|' in raw_l:
        parts = raw_l.split('|')
        q_text = parts[0].strip()
        ans_str = parts[1].strip().capitalize()
        if q_text and ans_str in ['True', 'False']:
            top_k = top_map_tf3.get(curr_top_tf3, 't3_projectile_motion')
            add_q(top_k, 2, q_text, 'True', 'False', None, None, ans_str, f'The statement is {ans_str}.', 'post_test')
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update add_q filter to allow q_type_id == 2 for t3_
    old_filter = "if top_key.startswith('t3_'): return"
    new_filter = "if top_key.startswith('t3_') and q_type_id != 2: return"
    
    if old_filter in code:
        code = code.replace(old_filter, new_filter)

    # 2. Add Section 3b if not present
    if "# --- 3b. Parse T-or-F-term-3.docx ---" not in code:
        pos = code.find("# --- 4. Parse Identification files ---")
        if pos != -1:
            code = code[:pos] + tf3_snippet + "\n" + code[pos:]

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Updated {fname} with Term 3 True/False support.")

