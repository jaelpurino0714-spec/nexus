import os
import sys
import re
from pypdf import PdfReader
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

TOPICS = {
    # Term 1 (a0000000-0000-0000-0000-000000000001)
    't1_physical_chemical': ('b0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Physical vs. Chemical Change', 1),
    't1_chemical_reactions': ('b0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'Chemical Reactions', 2),
    't1_acids_bases': ('b0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'Acids, Bases, and Salts', 3),
    't1_chemical_equations': ('b0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'Chemical Equations', 4),
    't1_balancing_equations': ('b0000000-0000-0000-0000-000000000105', 'a0000000-0000-0000-0000-000000000001', 'Balancing Chemical Equations', 5),
    't1_rates_reactions': ('b0000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000001', 'Rates of Reactions', 6),
    't1_homeostasis': ('b0000000-0000-0000-0000-000000000107', 'a0000000-0000-0000-0000-000000000001', 'Homeostasis', 7),
    't1_mechanisms_evolution': ('b0000000-0000-0000-0000-000000000108', 'a0000000-0000-0000-0000-000000000001', 'Mechanisms of Evolution', 8),

    # Term 2 (a0000000-0000-0000-0000-000000000002)
    't2_carrying_capacity': ('b0000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000002', 'Ecosystem\'s Carrying Capacity and Population Growth', 1),
    't2_biotechnology': ('b0000000-0000-0000-0000-000000000202', 'a0000000-0000-0000-0000-000000000002', 'Biotechnology', 2),
    't2_plate_tectonics': ('b0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000002', 'Plate Tectonics', 3),
    't2_global_climate': ('b0000000-0000-0000-0000-000000000204', 'a0000000-0000-0000-0000-000000000002', 'Global Climate', 4),
    't2_global_interactions': ('b0000000-0000-0000-0000-000000000205', 'a0000000-0000-0000-0000-000000000002', 'Global Interactions (ENSO)', 5),
    't2_sustainability': ('b0000000-0000-0000-0000-000000000206', 'a0000000-0000-0000-0000-000000000002', 'Global and Local Sustainability', 6),

    # Term 3 (a0000000-0000-0000-0000-000000000003)
    't3_projectile_motion': ('b0000000-0000-0000-0000-000000000301', 'a0000000-0000-0000-0000-000000000003', 'Projectile Motion', 1),
    't3_momentum_collisions': ('b0000000-0000-0000-0000-000000000302', 'a0000000-0000-0000-0000-000000000003', 'Momentum and Collisions', 2),
    't3_electricity_generation': ('b0000000-0000-0000-0000-000000000303', 'a0000000-0000-0000-0000-000000000003', 'Large-Scale Generation and Distribution of Electricity', 3),
    't3_energy_sources': ('b0000000-0000-0000-0000-000000000304', 'a0000000-0000-0000-0000-000000000003', 'Renewable and Non-Renewable Energy Sources', 4),
}

def esc(val):
    if val is None:
        return "NULL"
    s_clean = str(val).replace('\r', ' ').replace('\n', ' ').strip()
    s_clean = re.sub(r'\s+', ' ', s_clean).replace("'", "''")
    return f"'{s_clean}'"

records = []

def add_q(top_key, q_type_id, q_text, c_a, c_b, c_c, c_d, ans, exp, quiz_type='post_test'):
    if top_key.startswith('t2_') and q_type_id == 1:
        return  # Exclude Term 2 MCQs only (include T/F and Identification)
    topic_info = TOPICS[top_key]
    topic_id = topic_info[0]
    
    q_text = re.sub(r'\s+', ' ', q_text).strip()
    c_a = re.sub(r'\s+', ' ', c_a).strip() if c_a else None
    c_b = re.sub(r'\s+', ' ', c_b).strip() if c_b else None
    c_c = re.sub(r'\s+', ' ', c_c).strip() if c_c else None
    c_d = re.sub(r'\s+', ' ', c_d).strip() if c_d else None
    ans = str(ans).strip() if ans else None
    exp = re.sub(r'\s+', ' ', exp).strip() if exp else f"Option {ans} is the correct answer."
    
    if not q_text or not ans:
        return
        
    records.append({
        'topic_id': topic_id,
        'question_type_id': q_type_id,
        'quiz_type': quiz_type,
        'question': q_text,
        'choice_a': c_a,
        'choice_b': c_b,
        'choice_c': c_c,
        'choice_d': c_d,
        'correct_answer': ans,
        'explanation': exp,
    })

# --- 1. Parse T-or-F-term-3.docx ---
doc = Document(os.path.join(assets_dir, 'T-or-F-term-3.docx'))
docx_lines = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
for idx, line in enumerate(docx_lines):
    parts = line.split('|')
    if len(parts) == 2:
        q_txt = parts[0].strip()
        ans = parts[1].strip()
        if idx < 30: top_key = 't3_projectile_motion'
        elif idx < 60: top_key = 't3_momentum_collisions'
        elif idx < 90: top_key = 't3_electricity_generation'
        else: top_key = 't3_energy_sources'
        add_q(top_key, 2, q_txt, 'True', 'False', None, None, ans, f'The statement is {ans}.', 'post_test')

# --- 2. Parse T-or-F-term-2.pdf ---
reader_tf2 = PdfReader(os.path.join(assets_dir, 'T-or-F-term-2.pdf'))
text_tf2 = '\n'.join([p.extract_text() or '' for p in reader_tf2.pages])
tf2_matches = re.findall(r'(\d+)\.\s+(.*?)\|\s*(TRUE|FALSE)', text_tf2, re.DOTALL)
for item in tf2_matches:
    num = int(item[0])
    q_txt = item[1].strip()
    ans = item[2].capitalize()
    if num <= 30: top_key = 't2_carrying_capacity'
    elif num <= 60: top_key = 't2_biotechnology'
    elif num <= 90: top_key = 't2_plate_tectonics'
    elif num <= 120: top_key = 't2_global_climate'
    elif num <= 150: top_key = 't2_global_interactions'
    else: top_key = 't2_sustainability'
    add_q(top_key, 2, q_txt, 'True', 'False', None, None, ans, f'The statement is {ans}.', 'post_test')

# --- 3. Parse T-F-term-1.pdf ---
reader_tf1 = PdfReader(os.path.join(assets_dir, 'T-F-term-1.pdf'))
text_tf1 = '\n'.join([p.extract_text() or '' for p in reader_tf1.pages])
parts_tf1 = re.split(r'PART\s+(\d+)\s+–\s+([^\n]+)', text_tf1)

part_to_topic_t1 = {
    1: 't1_physical_chemical',
    2: 't1_acids_bases',
    3: 't1_chemical_equations',
    4: 't1_rates_reactions',
    5: 't1_homeostasis',
    6: 't1_mechanisms_evolution',
}

for i in range(1, len(parts_tf1), 3):
    p_num = int(parts_tf1[i])
    p_content = parts_tf1[i+2]
    top_key = part_to_topic_t1.get(p_num, 't1_physical_chemical')
    
    sections = re.split(r'Answer Key', p_content, flags=re.IGNORECASE)
    q_sec = sections[0]
    ans_sec = sections[1] if len(sections) > 1 else ''
    
    ans_map = {}
    for a_match in re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(True|False|TRUE|FALSE)[^\n]*', ans_sec):
        ans_map[int(a_match.group(1))] = a_match.group(2).capitalize()
        
    for q_match in re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)(?=\s*Answer:|\n\s*\d+[\.\)]|\Z)', q_sec, re.DOTALL):
        q_num = int(q_match.group(1))
        q_body = re.sub(r'--- PAGE \d+ ---', '', q_match.group(2))
        q_body = re.sub(r'Directions:[^\n]*', '', q_body)
        q_body = re.sub(r'TRUE OR FALSE[^\n]*', '', q_body, flags=re.IGNORECASE)
        q_body = re.sub(r'\s+', ' ', q_body).replace('Answer:', '').strip()
        ans = ans_map.get(q_num, 'True')
        add_q(top_key, 2, q_body, 'True', 'False', None, None, ans, f'The statement is {ans}.', 'post_test')

# --- 4. Parse Identification files ---
def parse_id_file(fname, part_map):
    reader = PdfReader(os.path.join(assets_dir, fname))
    text = '\n'.join([p.extract_text() or '' for p in reader.pages])
    parts = re.split(r'PART\s+(\d+)\s+[–\-]\s+([^\n]+)', text)
    
    for i in range(1, len(parts), 3):
        p_num = int(parts[i])
        p_content = parts[i+2]
        top_key = part_map.get(p_num)
        if not top_key: continue
            
        sections = re.split(r'Answer Key', p_content, flags=re.IGNORECASE)
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
            ans = ans_map.get(q_num, 'Science')
            add_q(top_key, 3, q_body, None, None, None, None, ans, f'The correct term is: {ans}.', 'post_test')

parse_id_file('Identification term 1.pdf', {
    1: 't1_physical_chemical',
    2: 't1_acids_bases',
    3: 't1_chemical_reactions',
    4: 't1_chemical_equations',
    5: 't1_rates_reactions',
    6: 't1_homeostasis',
    7: 't1_mechanisms_evolution',
})


# --- 4b. Parse post-test-Term-2-identification.pdf ---
with open('dump_post-test-Term-2-identification.pdf.txt', 'r', encoding='utf-8') as f:
    text_id2 = f.read()

top_map_id2 = {
    1: 't2_carrying_capacity',
    2: 't2_biotechnology',
    3: 't2_plate_tectonics',
    4: 't2_global_climate',
}

sec_id2 = re.split(r'(^[ \t]*TOPIC\s*\d+:[^\n]+)', text_id2, flags=re.MULTILINE)
t_cnt = 0
for idx in range(1, len(sec_id2), 2):
    t_cnt += 1
    if t_cnt > 4: break
    top_k = top_map_id2[t_cnt]
    t_body = sec_id2[idx+1]
    
    q_matches = re.finditer(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*([^\n]+)', t_body, re.DOTALL)
    for q_m in q_matches:
        q_body = re.sub(r'\s+', ' ', q_m.group(2)).strip()
        ans_val = re.sub(r'\s*\.$', '', q_m.group(3).strip())
        add_q(top_k, 3, q_body, None, None, None, None, ans_val, f'The correct term is: {ans_val}.', 'post_test')


parse_id_file('Identification term 3.pdf', {
    1: 't3_projectile_motion',
    2: 't3_momentum_collisions',
    3: 't3_electricity_generation',
    4: 't3_energy_sources',
})

# --- 5. MCQ Term 1 Parser ---
with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text_mcq1 = re.sub(r'--- PAGE \d+ ---', '', f.read())

sections_mcq1 = re.split(r'(^[ \t]*(?:GROUP|Group)\s*\d+[^\n]*)', text_mcq1, flags=re.MULTILINE)

for idx in range(1, len(sections_mcq1), 2):
    g_header = sections_mcq1[idx].strip()
    g_body = sections_mcq1[idx+1]
    
    h_lower = g_header.lower()
    if 'group 1' in h_lower and 'pretest' in h_lower:
        top_k = 't1_physical_chemical'
        forced_q = 'pre_test'
    elif 'group 1' in h_lower and 'continued' in h_lower:
        top_k = 't1_chemical_equations'
        forced_q = 'post_test'
    elif 'group 2' in h_lower and 'acids' in h_lower:
        top_k = 't1_acids_bases'
        forced_q = None
    elif 'group 2' in h_lower and 'types' in h_lower:
        top_k = 't1_chemical_reactions'
        forced_q = None
    elif 'group 4' in h_lower:
        top_k = 't1_chemical_equations'
        forced_q = None
    elif 'group 5' in h_lower:
        top_k = 't1_balancing_equations'
        forced_q = None
    elif 'group 6' in h_lower or 'rate' in h_lower:
        top_k = 't1_rates_reactions'
        forced_q = None
    elif 'group 7' in h_lower or 'homeostasis' in h_lower:
        top_k = 't1_homeostasis'
        forced_q = None
    elif 'group 8' in h_lower or 'evolution' in h_lower:
        top_k = 't1_mechanisms_evolution'
        forced_q = None
    else:
        continue

    q_count_in_group = 0
    lines = g_body.split('\n')
    
    curr_q = None
    curr_a = None
    curr_b = None
    curr_c = None
    curr_d = None
    curr_ans = 'A'
    curr_exp = None

    for raw_line in lines:
        l = raw_line.strip()
        if not l: continue
        
        is_marked = ('✅' in raw_line) or bool(re.search(r'\s{3,}$', raw_line.rstrip('\r\n')))

        m_inline = re.match(r'^\*?\s*A[\.\)]\s*(.*?)\s+B[\.\)]\s*(.*?)\s+C[\.\)]\s*(.*?)\s+D[\.\)]\s*(.*?)\s*$', l)
        if m_inline and curr_q:
            opts = [m_inline.group(1), m_inline.group(2), m_inline.group(3), m_inline.group(4)]
            curr_a = opts[0].strip()
            curr_b = opts[1].strip()
            curr_c = opts[2].strip()
            curr_d = opts[3].strip()
            continue

        q_stem_m = re.match(r'^(?:Q?\d+[\.\)]\s*)(.*)$', l)
        if q_stem_m and not re.match(r'^[A-D][\.\)]', l):
            if curr_q and curr_a and curr_b and curr_c and curr_d:
                q_count_in_group += 1
                qtype = forced_q if forced_q else ('pre_test' if q_count_in_group <= 15 else 'post_test')
                exp_text = curr_exp if curr_exp else f"Option {curr_ans} is the correct answer."
                add_q(top_k, 1, curr_q, curr_a, curr_b, curr_c, curr_d, curr_ans, exp_text, qtype)
            curr_q = q_stem_m.group(1).strip()
            curr_a = curr_b = curr_c = curr_d = None
            curr_ans = 'A'
            curr_exp = None
            continue
            
        m_a = re.match(r'^\*?\s*\*?A[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_a and curr_q and not curr_a:
            val = m_a.group(1)
            if is_marked: curr_ans = 'A'
            curr_a = val.replace('✅', '').strip()
            continue
            
        m_b = re.match(r'^\*?\s*\*?B[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_b and curr_q and not curr_b:
            val = m_b.group(1)
            if is_marked: curr_ans = 'B'
            curr_b = val.replace('✅', '').strip()
            continue

        m_c = re.match(r'^\*?\s*\*?C[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_c and curr_q and not curr_c:
            val = m_c.group(1)
            if is_marked: curr_ans = 'C'
            curr_c = val.replace('✅', '').strip()
            continue

        m_d = re.match(r'^\*?\s*\*?D[\.\)]\s*\*?(.*?)\*?\s*$', l)
        if m_d and curr_q and not curr_d:
            val = m_d.group(1)
            if is_marked: curr_ans = 'D'
            curr_d = val.replace('✅', '').strip()
            continue
            
        m_ans1 = re.match(r'^Answer:\s*([A-D])\s*[–\-—]\s*(.*)$', l, re.IGNORECASE)
        if m_ans1 and curr_q:
            curr_ans = m_ans1.group(1).upper()
            curr_exp = m_ans1.group(2).strip()
            continue
            
        m_ans2 = re.match(r'^\s*([A-D])\s*[–\-—]\s*(.*)$', l)
        if m_ans2 and curr_q:
            curr_ans = m_ans2.group(1).upper()
            curr_exp = m_ans2.group(2).strip()
            continue
            
        if curr_q and not curr_a:
            curr_q += " " + l
        elif curr_d and not curr_exp:
            curr_exp = l
            
    if curr_q and curr_a and curr_b and curr_c and curr_d:
        q_count_in_group += 1
        qtype = forced_q if forced_q else ('pre_test' if q_count_in_group <= 15 else 'post_test')
        exp_text = curr_exp if curr_exp else f"Option {curr_ans} is the correct answer."
        add_q(top_k, 1, curr_q, curr_a, curr_b, curr_c, curr_d, curr_ans, exp_text, qtype)

# --- 6. Parse MCQ Term 2 ---
with open('dump_nexus-MCQ-term-2.pdf.txt', 'r', encoding='utf-8') as f:
    text_mcq2 = re.sub(r'--- PAGE \d+ ---', '', f.read())

topics_raw2 = re.split(r'TOPIC\s+(\d+)\s+·\s+([^\n]+)', text_mcq2)
top_map2 = {
    1: 't2_carrying_capacity',
    2: 't2_biotechnology',
    3: 't2_plate_tectonics',
    4: 't2_global_climate',
}

for i in range(1, len(topics_raw2), 3):
    t_num = int(topics_raw2[i])
    t_content = topics_raw2[i+2]
    top_key = top_map2.get(t_num, 't2_carrying_capacity')
    
    q_blocks = re.findall(r'(.*?)\n\s*A\.\s*(.*?)\n\s*B\.\s*(.*?)\n\s*C\.\s*(.*?)\n\s*D\.\s*(.*?)(?=\n\s*[A-Z].*|\n\s*TOPIC|\Z)', t_content, re.DOTALL)
    for q_idx, block in enumerate(q_blocks, 1):
        q_stem = re.sub(r'\s+', ' ', block[0]).strip()
        ca = block[1].strip()
        cb = block[2].strip()
        cc = block[3].strip()
        cd = block[4].strip()
        
        correct_letter = 'A'
        if '✅' in cb: correct_letter = 'B'
        elif '✅' in cc: correct_letter = 'C'
        elif '✅' in cd: correct_letter = 'D'
        
        ca = ca.replace('✅', '').strip()
        cb = cb.replace('✅', '').strip()
        cc = cc.replace('✅', '').strip()
        cd = cd.replace('✅', '').strip()
        
        # All Term 2 MCQs are post_test (removing hardcoded pre_test MCQs for Term 2)
        q_stem = re.sub(r'\(only use 15 questions in every pretest topic[^\)]*\)', '', q_stem, flags=re.IGNORECASE)
        q_stem = re.sub(r'^and randomized each playthrough\)\s*', '', q_stem, flags=re.IGNORECASE).strip()
        qtype = 'post_test'
        add_q(top_key, 1, q_stem, ca, cb, cc, cd, correct_letter, f'Option {correct_letter} is the correct answer.', qtype)

# --- 7. Parse MCQ Term 3 ---
with open('dump_MCQ-term-3.pdf.txt', 'r', encoding='utf-8') as f:
    text_mcq3 = re.sub(r'--- PAGE \d+ ---', '', f.read())

groups3 = re.split(r'Group\s+(\d+)[·\s]+([^\n]+)', text_mcq3)
top_map3 = {
    1: 't3_projectile_motion',
    2: 't3_momentum_collisions',
    3: 't3_electricity_generation',
    4: 't3_energy_sources',
}

for i in range(1, len(groups3), 3):
    g_num = int(groups3[i])
    g_content = groups3[i+2]
    top_key = top_map3.get(g_num, 't3_projectile_motion')
    
    blocks = re.findall(r'(\d+)[\.\)]\s*(.*?)\n\s*\*\s*A\.\s*(.*?)\n\s*\*\s*B\.\s*(.*?)\n\s*\*\s*C\.\s*(.*?)\n\s*\*\s*D\.\s*(.*?)(?=\n\s*\d+[\.\)]|\n\s*Group|\Z)', g_content, re.DOTALL)
    for q_idx, b in enumerate(blocks, 1):
        q_stem = re.sub(r'\s+', ' ', b[1]).strip()
        ca = b[2].strip()
        cb = b[3].strip()
        cc = b[4].strip()
        cd = b[5].strip()
        
        correct_letter = 'A'
        if '✅' in cb or '*' in cb: correct_letter = 'B'
        if '✅' in cc or '*' in cc: correct_letter = 'C'
        if '✅' in cd or '*' in cd: correct_letter = 'D'
        if '✅' in ca or '*' in ca: correct_letter = 'A'
        
        def clean_opt(o):
            return re.sub(r'[\*✅]', '', o).strip()
            
        ca = clean_opt(ca)
        cb = clean_opt(cb)
        cc = clean_opt(cc)
        cd = clean_opt(cd)
        
        # All Term 2 MCQs are post_test (removing hardcoded pre_test MCQs for Term 2)
        q_stem = re.sub(r'\(only use 15 questions in every pretest topic[^\)]*\)', '', q_stem, flags=re.IGNORECASE)
        q_stem = re.sub(r'^and randomized each playthrough\)\s*', '', q_stem, flags=re.IGNORECASE).strip()
        qtype = 'post_test'
        add_q(top_key, 1, q_stem, ca, cb, cc, cd, correct_letter, f'Option {correct_letter} is the correct answer.', qtype)

# --- Write Master SQL ---
with open('seed_master_questions.sql', 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: MASTER QUESTION SEED DATA FOR SUPABASE DATABASE\n")
    out.write("-- Sanitized and strictly validated for PostgreSQL syntax\n")
    out.write("-- ====================================================================\n\n")

    out.write("-- 1. TERMS\n")
    out.write("INSERT INTO public.terms (id, name, title, order_no) VALUES\n")
    out.write("('a0000000-0000-0000-0000-000000000001', 'Term 1', '1st Quarter: Earth and Space', 1),\n")
    out.write("('a0000000-0000-0000-0000-000000000002', 'Term 2', '2nd Quarter: Force, Motion & Energy', 2),\n")
    out.write("('a0000000-0000-0000-0000-000000000003', 'Term 3', '3rd Quarter: Living Things & Environment', 3),\n")
    out.write("('a0000000-0000-0000-0000-000000000004', 'Term 4', '4th Quarter: Matter & Its Interactions', 4)\n")
    out.write("ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title;\n\n")

    out.write("-- 2. QUESTION TYPES\n")
    out.write("INSERT INTO public.question_types (id, name) VALUES\n")
    out.write("(1, 'Multiple Choice'),\n")
    out.write("(2, 'True or False'),\n")
    out.write("(3, 'Identification')\n")
    out.write("ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n\n")

    out.write("-- 3. TOPICS\n")
    out.write("INSERT INTO public.topics (id, term_id, title, order_no) VALUES\n")
    top_rows = []
    for k, v in TOPICS.items():
        top_rows.append(f"({esc(v[0])}, {esc(v[1])}, {esc(v[2])}, {v[3]})")
    out.write(",\n".join(top_rows) + "\n")
    out.write("ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_no = EXCLUDED.order_no;\n\n")

    out.write("-- 4. QUESTIONS\n")
    out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
    
    q_rows = []
    for r in records:
        q_rows.append(f"({esc(r['topic_id'])}, {r['question_type_id']}, {esc(r['quiz_type'])}, {esc(r['question'])}, {esc(r['choice_a'])}, {esc(r['choice_b'])}, {esc(r['choice_c'])}, {esc(r['choice_d'])}, {esc(r['correct_answer'])}, {esc(r['explanation'])}, true)")

    out.write(",\n".join(q_rows) + ";\n")

print(f"SUCCESS: Updated build_clean_seed_sql.py & seed_master_questions.sql ({len(records)} questions)")
