import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

new_sec_6 = r'''# --- 6. Parse MCQ Term 2 ---
with open('dump_nexus-MCQ-term-2.pdf.txt', 'r', encoding='utf-8') as f:
    text_mcq2 = re.sub(r'--- PAGE \d+ ---', '', f.read())

top_map_mcq2 = {
    1: 't2_carrying_capacity',
    2: 't2_biotechnology',
    3: 't2_plate_tectonics',
    4: 't2_global_climate',
    5: 't2_global_interactions',
    6: 't2_sustainability',
}

sec_mcq2 = re.split(r'(TOPIC\s+(\d+)\s*[·\-\:][^\n]+)', text_mcq2)

def clean_mcq2_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM 2[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^\d+[\.\)]\s*', '', s)
    return s.strip()

for idx in range(1, len(sec_mcq2), 3):
    t_num = int(sec_mcq2[idx+1])
    t_body = sec_mcq2[idx+2]
    if t_num not in top_map_mcq2: continue
    
    top_k = top_map_mcq2[t_num]
    lines = t_body.split('\n')
    
    curr_q = None
    curr_a = None
    curr_b = None
    curr_c = None
    curr_d = None
    curr_ans = 'A'
    q_idx_in_topic = 0

    for raw_line in lines:
        l = raw_line.strip()
        if not l: continue
        
        m_a = re.match(r'^\*?\s*A[\.\)]\s*(.*?)\s*$', l)
        if m_a and curr_q and not curr_a:
            val = m_a.group(1)
            if '✅' in val: curr_ans = 'A'
            curr_a = val.replace('✅', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*B[\.\)]\s*(.*?)\s*$', l)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if '✅' in val: curr_ans = 'B'
            curr_b = val.replace('✅', '').strip()
            continue

        m_c = re.match(r'^\*?\s*C[\.\)]\s*(.*?)\s*$', l)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if '✅' in val: curr_ans = 'C'
            curr_c = val.replace('✅', '').strip()
            continue

        m_d = re.match(r'^\*?\s*D[\.\)]\s*(.*?)\s*$', l)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if '✅' in val: curr_ans = 'D'
            curr_d = val.replace('✅', '').strip()
            continue
            
        if not curr_a:
            if curr_q:
                curr_q += " " + l
            else:
                curr_q = l
        elif curr_d:
            if curr_q and curr_a and curr_b and curr_c and curr_d:
                q_idx_in_topic += 1
                if q_idx_in_topic <= 15:
                    add_q(top_k, 1, clean_mcq2_stem(curr_q), curr_a, curr_b, curr_c, curr_d, curr_ans, f'Option {curr_ans} is the correct answer.', 'pre_test')
            curr_q = l
            curr_a = None
            curr_b = None
            curr_c = None
            curr_d = None
            curr_ans = 'A'
            
    if curr_q and curr_a and curr_b and curr_c and curr_d:
        q_idx_in_topic += 1
        if q_idx_in_topic <= 15:
            add_q(top_k, 1, clean_mcq2_stem(curr_q), curr_a, curr_b, curr_c, curr_d, curr_ans, f'Option {curr_ans} is the correct answer.', 'pre_test')
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    pos_sec6 = code.find("# --- 6. Parse MCQ Term 2 ---")
    pos_sec7 = code.find("# --- 7. Parse MCQ Term 3 ---")
    
    if pos_sec6 != -1 and pos_sec7 != -1:
        code = code[:pos_sec6] + new_sec_6 + "\n\n" + code[pos_sec7:]
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated Section 6 in {fname}")
    else:
        print(f"Section markers not found in {fname}")

