import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

id3_snippet = r'''
# --- 4c. Parse Identification term 3.pdf ---
with open('dump_Identification term 3.pdf.txt', 'r', encoding='utf-8') as f:
    text_id3 = f.read()

top_map_id3 = {
    1: 't3_projectile_motion',
    2: 't3_momentum_collisions',
    4: 't3_energy_sources',
}

parts_id3 = re.split(r'PART\s+(\d+)\s+[–\-]\s+([^\n]+)', text_id3)

for i in range(1, len(parts_id3), 3):
    p_num = int(parts_id3[i])
    p_content = parts_id3[i+2]
    if p_num not in top_map_id3: continue
    
    top_k = top_map_id3[p_num]
    
    sections = re.split(r'Answer Key|Answer K', p_content, flags=re.IGNORECASE)
    q_sec = sections[0]
    ans_sec = sections[1] if len(sections) > 1 else ''
    
    ans_map = {}
    for a_match in re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*([^\n]+)', ans_sec):
        q_n = int(a_match.group(1))
        a_val = re.sub(r'\s*\.$', '', a_match.group(2).strip())
        ans_map[q_n] = a_val
        
    for q_match in re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=\s*Answer:|\n\s*\d+[\.\)]|\Z)', q_sec, re.DOTALL):
        q_num = int(q_match.group(1))
        q_body = re.sub(r'--- PAGE \d+ ---', '', q_match.group(2))
        q_body = re.sub(r'Directions:[^\n]*', '', q_body)
        q_body = re.sub(r'Identification', '', q_body)
        q_body = re.sub(r'\s+', ' ', q_body).replace('Answer:', '').strip()
        
        ans = ans_map.get(q_num)
        if q_body and ans:
            add_q(top_k, 3, q_body, None, None, None, None, ans, f'The correct term is: {ans}.', 'post_test')
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    # Remove old parse_id_file for Identification term 3.pdf
    old_call = "parse_id_file('Identification term 3.pdf', {\n    1: 't3_projectile_motion',\n    2: 't3_momentum_collisions',\n    3: 't3_electricity_generation',\n    4: 't3_energy_sources',\n})"
    old_call2 = "parse_id_file('Identification term 3.pdf', {\n    1: 't3_projectile_motion',\n    2: 't3_momentum_collisions',\n    3: 't3_energy_sources',\n    4: 't3_energy_sources',\n})"

    if old_call in code:
        code = code.replace(old_call, id3_snippet)
    elif old_call2 in code:
        code = code.replace(old_call2, id3_snippet)

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Updated Term 3 Identification parser in {fname}")

