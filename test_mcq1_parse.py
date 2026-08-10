import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

reader = PdfReader(os.path.join(assets_dir, 'nexus-MCQ-term-1 (1).pdf'))
text = '\n'.join([p.extract_text() or '' for p in reader.pages])

# Strip page markers or headers if any, but in memory
text = re.sub(r'--- PAGE \d+ ---', '', text)

groups = re.split(r'GROUP\s+(\d+)[:\s]+([^\n]+)', text)

top_map = {
    1: 't1_physical_chemical',
    2: 't1_acids_bases',
    3: 't1_chemical_equations',
    4: 't1_rates_reactions',
    5: 't1_homeostasis',
    6: 't1_mechanisms_evolution',
}

parsed_mcq1 = []
for i in range(1, len(groups), 3):
    g_num = int(groups[i])
    g_content = groups[i+2]
    top_key = top_map.get(g_num, 't1_physical_chemical')
    
    blocks = re.findall(r'Q(\d+)[\.\)]\s*(.*?)\n\s*A\.\s*(.*?)\n\s*B\.\s*(.*?)\n\s*C\.\s*(.*?)\n\s*D\.\s*(.*?)\n\s*Answer:\s*([A-D])\s*[–\-]\s*(.*?)(?=\n\s*Q\d+|\n\s*GROUP|\Z)', g_content, re.DOTALL)
    for b in blocks:
        q_num = int(b[0])
        q_stem = re.sub(r'\s+', ' ', b[1]).strip()
        ca = re.sub(r'\s+', ' ', b[2]).strip()
        cb = re.sub(r'\s+', ' ', b[3]).strip()
        cc = re.sub(r'\s+', ' ', b[4]).strip()
        cd = re.sub(r'\s+', ' ', b[5]).strip()
        ans_let = b[6].strip().upper()
        exp = re.sub(r'\s+', ' ', b[7]).strip()
        parsed_mcq1.append((g_num, q_num, q_stem, ca, cb, cc, cd, ans_let, exp))

print(f"Total MCQ Term 1 parsed: {len(parsed_mcq1)}")

# Check for Q31 or any missing numbers
q_nums = [item[1] for item in parsed_mcq1]
print("Question numbers parsed:", sorted(q_nums))
