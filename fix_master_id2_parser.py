import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

id2_code_snippet = """
# --- 4b. Parse post-test-Term-2-identification.pdf ---
with open('dump_post-test-Term-2-identification.pdf.txt', 'r', encoding='utf-8') as f:
    text_id2 = f.read()

top_map_id2 = {
    1: 't2_carrying_capacity',
    2: 't2_biotechnology',
    3: 't2_plate_tectonics',
    4: 't2_global_climate',
}

sec_id2 = re.split(r'(^[ \\t]*TOPIC\\s*\\d+:[^\\n]+)', text_id2, flags=re.MULTILINE)
t_cnt = 0
for idx in range(1, len(sec_id2), 2):
    t_cnt += 1
    if t_cnt > 4: break
    top_k = top_map_id2[t_cnt]
    t_body = sec_id2[idx+1]
    
    q_matches = re.finditer(r'(?:^|\\n)\\s*(\\d+)[\\.\\)]\\s*(.*?)\\n\\s*Answer:\\s*([^\\n]+)', t_body, re.DOTALL)
    for q_m in q_matches:
        q_body = re.sub(r'\\s+', ' ', q_m.group(2)).strip()
        ans_val = re.sub(r'\\s*\\.$', '', q_m.group(3).strip())
        add_q(top_k, 3, q_body, None, None, None, None, ans_val, f'The correct term is: {ans_val}.', 'post_test')
"""

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    target = "parse_id_file('post-test-Term-2-identification.pdf', {\n    1: 't2_carrying_capacity',\n    2: 't2_biotechnology',\n    3: 't2_plate_tectonics',\n    4: 't2_global_climate',\n})"
    
    if target in code:
        code = code.replace(target, id2_code_snippet)
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Successfully replaced Term 2 ID parser in {fname}")
    else:
        print(f"target not found in {fname}")

