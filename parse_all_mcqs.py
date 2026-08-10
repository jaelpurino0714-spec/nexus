import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

TOPICS = {
    # Term 1
    't1_physical_chemical': ('b0000000-0000-0000-0000-000000000101', 'Physical vs. Chemical Change'),
    't1_chemical_reactions': ('b0000000-0000-0000-0000-000000000102', 'Chemical Reactions'),
    't1_acids_bases': ('b0000000-0000-0000-0000-000000000103', 'Acids, Bases, and Salts'),
    't1_chemical_equations': ('b0000000-0000-0000-0000-000000000104', 'Chemical Equations'),
    't1_balancing_equations': ('b0000000-0000-0000-0000-000000000105', 'Balancing Chemical Equations'),
    't1_rates_reactions': ('b0000000-0000-0000-0000-000000000106', 'Rates of Reactions'),
    't1_homeostasis': ('b0000000-0000-0000-0000-000000000107', 'Homeostasis'),
    't1_mechanisms_evolution': ('b0000000-0000-0000-0000-000000000108', 'Mechanisms of Evolution'),
    
    # Term 2
    't2_carrying_capacity': ('b0000000-0000-0000-0000-000000000201', 'Ecosystem\'s Carrying Capacity and Population Growth'),
    't2_biotechnology': ('b0000000-0000-0000-0000-000000000202', 'Biotechnology'),
    't2_plate_tectonics': ('b0000000-0000-0000-0000-000000000203', 'Plate Tectonics'),
    't2_global_climate': ('b0000000-0000-0000-0000-000000000204', 'Global Climate'),

    # Term 3
    't3_projectile_motion': ('b0000000-0000-0000-0000-000000000301', 'Projectile Motion'),
    't3_momentum_collisions': ('b0000000-0000-0000-0000-000000000302', 'Momentum and Collisions'),
    't3_electricity_generation': ('b0000000-0000-0000-0000-000000000303', 'Large-Scale Generation and Distribution of Electricity'),
    't3_energy_sources': ('b0000000-0000-0000-0000-000000000304', 'Renewable and Non-Renewable Energy Sources'),
}

records = []

def add_q(top_key, q_stem, ca, cb, cc, cd, ans_let, exp):
    q_stem = re.sub(r'\s+', ' ', q_stem).strip()
    ca = re.sub(r'\s+', ' ', ca).strip()
    cb = re.sub(r'\s+', ' ', cb).strip()
    cc = re.sub(r'\s+', ' ', cc).strip()
    cd = re.sub(r'\s+', ' ', cd).strip()
    exp = re.sub(r'\s+', ' ', exp).strip() if exp else f"Option {ans_let} is the correct answer."
    
    if not q_stem or not ca or not cb or not cc or not cd:
        return
        
    records.append({
        'topic_key': top_key,
        'topic_id': TOPICS[top_key][0],
        'question': q_stem,
        'choice_a': ca,
        'choice_b': cb,
        'choice_c': cc,
        'choice_d': cd,
        'correct_answer': ans_let,
        'explanation': exp
    })

# Parse nexus-MCQ-term-1 (1).pdf
with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text_mcq1 = f.read()

# Clean page markers
text_mcq1 = re.sub(r'--- PAGE \d+ ---', '', text_mcq1)

# Split by Group headers
group_splits = re.split(r'(^[ \t]*(?:GROUP|Group)\s*\d+[^\n]*)', text_mcq1, flags=re.MULTILINE)

topic_map_mcq1 = {
    'physical': 't1_physical_chemical',
    'chemical changes': 't1_physical_chemical',
    'types of chemical': 't1_chemical_reactions',
    'acids': 't1_acids_bases',
    'chemical equations equations': 't1_balancing_equations',
    'chemical equations': 't1_chemical_equations',
    'rates': 't1_rates_reactions',
    'homeostasis': 't1_homeostasis',
    'mechanisms': 't1_mechanisms_evolution',
    'evolution': 't1_mechanisms_evolution',
}

def get_t1_key(header):
    h = header.lower()
    if 'equation' in h and ('balancing' in h or 'equations equations' in h or 'group 5' in h):
        return 't1_balancing_equations'
    if 'equation' in h:
        return 't1_chemical_equations'
    if 'rate' in h:
        return 't1_rates_reactions'
    if 'homeostasis' in h:
        return 't1_homeostasis'
    if 'evolution' in h or 'mechanism' in h:
        return 't1_mechanisms_evolution'
    if 'acid' in h or 'base' in h:
        return 't1_acids_bases'
    if 'type' in h or 'reaction' in h:
        return 't1_chemical_reactions'
    return 't1_physical_chemical'

for idx in range(1, len(group_splits), 2):
    g_header = group_splits[idx].strip()
    g_body = group_splits[idx+1]
    top_key = get_t1_key(g_header)
    
    # Pattern A: Q1. ... A. ... B. ... C. ... D. ... Answer: X – ...
    pat_a = re.findall(r'Q\d+[\.\)]\s*(.*?)\n\s*A\.\s*(.*?)\n\s*B\.\s*(.*?)\n\s*C\.\s*(.*?)\n\s*D\.\s*(.*?)\n\s*Answer:\s*([A-D])\s*[–\-]\s*(.*?)(?=\n\s*Q\d+|\n\s*GROUP|\n\s*Group|\Z)', g_body, re.DOTALL)
    for b in pat_a:
        add_q(top_key, b[0], b[1], b[2], b[3], b[4], b[5].upper(), b[6])

    # Pattern B: N. ... A. ... B. ... C. ... D. ... [sp Spaces] OR X — Explanation
    # Matches N. Question stem \n A. ... B. ... C. ... D. ... \n X — Explanation
    pat_b = re.findall(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)\n\s*A\.\s*(.*?)\n\s*B\.\s*(.*?)\n\s*C\.\s*(.*?)\n\s*D\.\s*(.*?)\n\s*([A-D])\s*[—–\-]\s*(.*?)(?=\n\s*\d+[\.\)]|\n\s*GROUP|\n\s*Group|\Z)', g_body, re.DOTALL)
    for b in pat_b:
        add_q(top_key, b[1], b[2], b[3], b[4], b[5], b[6].upper(), b[7])
        
    # Pattern C: Options inline or separate, with correct answer marked by trailing spaces or checkmark
    # If not caught by Pattern A or B, e.g. Group 2 or 3 checkmark options
    if not pat_a and not pat_b:
        q_blocks = re.findall(r'(?:^|\n)\s*(\d+)[\.\)]\s*(.*?)\n\s*A\.\s*(.*?)\n\s*B\.\s*(.*?)\n\s*C\.\s*(.*?)\n\s*D\.\s*(.*?)(?=\n\s*\d+[\.\)]|\n\s*GROUP|\n\s*Group|\Z)', g_body, re.DOTALL)
        for b in q_blocks:
            q_stem = b[1]
            opts = [b[2], b[3], b[4], b[5]]
            ans_let = 'A'
            for opt_idx, opt_str in enumerate(opts):
                if '✅' in opt_str or re.search(r'\s{3,}$', opt_str):
                    ans_let = chr(65 + opt_idx)
            ca = opts[0].replace('✅', '').strip()
            cb = opts[1].replace('✅', '').strip()
            cc = opts[2].replace('✅', '').strip()
            cd = opts[3].replace('✅', '').strip()
            add_q(top_key, q_stem, ca, cb, cc, cd, ans_let, f'Option {ans_let} is the correct answer.')

print(f"Loaded {len(records)} MCQ Term 1 records.")
