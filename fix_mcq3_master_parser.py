import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

mcq3_snippet = r'''# --- 7. Parse MCQ Term 3 ---
with open('dump_MCQ-term-3.pdf.txt', 'r', encoding='utf-8') as f:
    text_mcq3 = re.sub(r'--- PAGE \d+ ---', '', f.read())

top_map_mcq3 = {
    1: 't3_projectile_motion',
    2: 't3_momentum_collisions',
    3: 't3_electricity_generation',
    4: 't3_energy_sources',
}

sec_mcq3 = re.split(r'(Group\s+(\d+)[\s·\-:][^\n]+)', text_mcq3, flags=re.IGNORECASE)

def clean_mcq3_stem(raw_q):
    s = raw_q
    if 'randomized each playthrough' in s.lower():
        s = re.sub(r'^[^\)]*\)\s*', '', s)
    s = re.sub(r"^Here's the same set[^\n\d]*\d+\.\s*", '', s, flags=re.IGNORECASE)
    s = re.sub(r'^pre-test questions[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^TERM \d+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^(?:✅\s*)?[A-D]\s*[–\-—]\s*.*?\d+[\.\)]\s*', '', s).strip()
    s = re.sub(r'^\d+[\.\)]\s*', '', s).strip()
    return s

q_counts_mcq3 = {}

for idx in range(1, len(sec_mcq3), 3):
    g_num = int(sec_mcq3[idx+1])
    g_body = sec_mcq3[idx+2]
    if g_num not in top_map_mcq3: continue
    
    top_k = top_map_mcq3[g_num]
    lines = g_body.split('\n')
    
    curr_q = None
    curr_a = None
    curr_b = None
    curr_c = None
    curr_d = None
    curr_ans = 'A'

    for raw_line in lines:
        l = raw_line.strip()
        if not l: continue
        
        m_a = re.match(r'^\*?\s*\*?\s*A[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_a and curr_q and not curr_a:
            val = m_a.group(1)
            if '✅' in val: curr_ans = 'A'
            curr_a = val.replace('✅', '').replace('*', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*\*?\s*B[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if '✅' in val: curr_ans = 'B'
            curr_b = val.replace('✅', '').replace('*', '').strip()
            continue

        m_c = re.match(r'^\*?\s*\*?\s*C[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if '✅' in val: curr_ans = 'C'
            curr_c = val.replace('✅', '').replace('*', '').strip()
            continue

        m_d = re.match(r'^\*?\s*\*?\s*D[\.\)]\s*(.*?)\s*$', l, re.IGNORECASE)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if '✅' in val: curr_ans = 'D'
            curr_d = val.replace('✅', '').replace('*', '').strip()
            continue
            
        if not curr_a:
            if curr_q:
                curr_q += " " + l
            else:
                curr_q = l
        elif curr_d:
            if curr_q and curr_a and curr_b and curr_c and curr_d:
                q_counts_mcq3[g_num] = q_counts_mcq3.get(g_num, 0) + 1
                q_idx = q_counts_mcq3[g_num]
                qtype = 'pre_test' if q_idx <= 15 else 'post_test'
                add_q(top_k, 1, clean_mcq3_stem(curr_q), curr_a, curr_b, curr_c, curr_d, curr_ans, f'Option {curr_ans} is the correct answer.', qtype)
            curr_q = l
            curr_a = None
            curr_b = None
            curr_c = None
            curr_d = None
            curr_ans = 'A'
            
    if curr_q and curr_a and curr_b and curr_c and curr_d:
        q_counts_mcq3[g_num] = q_counts_mcq3.get(g_num, 0) + 1
        q_idx = q_counts_mcq3[g_num]
        qtype = 'pre_test' if q_idx <= 15 else 'post_test'
        add_q(top_k, 1, clean_mcq3_stem(curr_q), curr_a, curr_b, curr_c, curr_d, curr_ans, f'Option {curr_ans} is the correct answer.', qtype)
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    pos_sec7 = code.find("# --- 7. Parse MCQ Term 3 ---")
    if pos_sec7 != -1:
        code = code[:pos_sec7] + mcq3_snippet
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated Section 7 in {fname}")

