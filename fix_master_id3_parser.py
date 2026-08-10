import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

id3_snippet = r'''# --- 4c. Parse Identification term 3.pdf + Part 3 ---
with open('dump_Identification term 3.pdf.txt', 'r', encoding='utf-8') as f:
    text_id3 = f.read()

top_map_id3 = {
    1: 't3_projectile_motion',
    2: 't3_momentum_collisions',
    3: 't3_electricity_generation',
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

# Add Part 3 items
part3_id3_data = [
    ("What device generates electrical energy from mechanical energy?", "Generator"),
    ("What device changes AC voltage up or down?", "Transformer"),
    ("What voltage is used for long-distance transmission?", "High voltage"),
    ("Why is electricity transmitted at high voltage?", "Reduce losses"),
    ("What device lowers voltage before electricity reaches homes?", "Step-down transformer"),
    ("What carries electricity over long distances?", "Transmission lines"),
    ("What distributes electricity to homes and businesses?", "Distribution lines"),
    ("What measures household electricity use?", "Electric meter"),
    ("What unit does an electric meter measure?", "Kilowatt-hour"),
    ("What device protects a circuit from excessive current?", "Fuse"),
    ("What reusable device trips during overcurrent?", "Circuit breaker"),
    ("What pin on a three-prong plug provides safety grounding?", "Ground pin"),
    ("Why is octopus wiring dangerous?", "Overheating"),
    ("Why should water not be used on electrical fires?", "Electrocution risk"),
    ("What should you turn off during an electrical emergency?", "Main breaker"),
    ("What wire carries electrical current to appliances?", "Live wire"),
    ("What wire provides a return path for current?", "Neutral wire"),
    ("What wire provides protection from electrical faults?", "Ground wire"),
    ("What device detects electrical leakage?", "GFCI"),
    ("What does a generator convert?", "Mechanical to electrical"),
    ("What does an electric motor convert?", "Electrical to mechanical"),
    ("What do motors and generators have in common?", "Coils and magnets"),
    ("What is the main difference between a motor and generator?", "Energy conversion"),
    ("What happens when a motor is mechanically spun?", "Produces electricity"),
    ("Why are transmission wires made thick?", "Reduce resistance"),
    ("Why are transmission towers tall?", "Safe clearance"),
    ("What reduces electricity use in homes?", "Energy conservation"),
    ("What type of bulb uses less electricity?", "LED bulb"),
    ("What happens to transmission losses when voltage increases?", "Losses decrease"),
    ("What are two benefits of reducing electricity use?", "Lower bills, emissions"),
]

for q_b, a_v in part3_id3_data:
    add_q('t3_electricity_generation', 3, q_b, None, None, None, None, a_v, f'The correct term is: {a_v}.', 'post_test')
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    pos_start = code.find("# --- 4c. Parse Identification term 3.pdf ---")
    pos_end = code.find("# --- 5. MCQ Term 1 Parser ---")

    if pos_start != -1 and pos_end != -1:
        code = code[:pos_start] + id3_snippet + "\n\n" + code[pos_end:]
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Updated Section 4c in {fname} to include Part 3.")

