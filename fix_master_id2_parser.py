import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

id2_snippet = r'''# --- 4b. Parse post-test-Term-2-identification.pdf ---
with open('dump_post-test-Term-2-identification.pdf.txt', 'r', encoding='utf-8') as f:
    text_id2 = f.read()

top_map_id2 = {
    1: 't2_carrying_capacity',
    2: 't2_biotechnology',
    3: 't2_plate_tectonics',
    4: 't2_global_climate',
    5: 't2_global_interactions',
    6: 't2_sustainability',
}

sec_id2 = re.split(r'(^[ \t]*TOPIC\s*(\d+):[^\n]+)', text_id2, flags=re.MULTILINE)

for idx in range(1, len(sec_id2), 3):
    t_num = int(sec_id2[idx+1])
    if t_num not in top_map_id2: continue
    
    top_k = top_map_id2[t_num]
    t_body = sec_id2[idx+2]
    
    q_matches = re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*([^\n]+)', t_body, re.DOTALL)
    for q_m in q_matches:
        q_body = re.sub(r'\s+', ' ', q_m.group(2)).strip()
        ans_val = re.sub(r'\s*\.$', '', q_m.group(3).strip())
        add_q(top_k, 3, q_body, None, None, None, None, ans_val, f'The correct term is: {ans_val}.', 'post_test')
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    pos_start = code.find("# --- 4b. Parse post-test-Term-2-identification.pdf ---")
    pos_end = code.find("# --- 4c. Parse Identification term 3.pdf ---")

    if pos_start != -1 and pos_end != -1:
        code = code[:pos_start] + id2_snippet + "\n\n" + code[pos_end:]
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated Section 4b in {fname} to include all 6 Term 2 topics.")

