import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\T-F-term-1.pdf'
reader = PdfReader(pdf_path)
text = '\n'.join([(p.extract_text() or '') for p in reader.pages])

# Topic mapping
topic_rules = [
    ('Physical & Chemical Changes', 't1_physical_chemical'),
    ('Acids, Bases, and Salts', 't1_acids_bases'),
    ('Chemical Equations', 't1_chemical_equations'),
    ('Rates of Chemical Reactions', 't1_rates_reactions'),
    ('Rates of Reactions', 't1_rates_reactions'),
    ('Homeostasis', 't1_homeostasis'),
    ('Mechanisms of Evolution', 't1_mechanisms_evolution'),
    ('Evolution', 't1_mechanisms_evolution'),
]

current_topic_key = 't1_physical_chemical'

# Match question blocks: N. Question \n Answer: True/False \n Explanation: ...
# Or split by number
q_blocks = re.findall(r'(\d+)[\.\)]\s*(.*?)\n\s*Answer:\s*(True|False|TRUE|FALSE)\s*\n\s*Explanation:\s*(.*?)(?=\n\s*(?:topic|\d+[\.\)]|Below|\Z))', text, re.DOTALL | re.IGNORECASE)

print(f"Total q_blocks extracted: {len(q_blocks)}")

extracted = []
for block in q_blocks:
    q_num = int(block[0])
    q_body = re.sub(r'\s+', ' ', block[1]).strip()
    ans_val = block[2].strip().capitalize()
    exp_body = re.sub(r'\s+', ' ', block[3]).strip()
    
    # Check if there is a topic header inside q_body or before it
    for t_name, t_key in topic_rules:
        if t_name.lower() in q_body.lower():
            # Adjust current topic key if it appears
            current_topic_key = t_key
            # Clean header from q_body
            q_body = re.sub(rf'(?:topic|\d+)?\s*[–\-\:]?\s*TRUE OR FALSE\s*[–\-\:]?\s*{re.escape(t_name)}', '', q_body, flags=re.IGNORECASE).strip()

    extracted.append({
        'topic_key': current_topic_key,
        'q_num': q_num,
        'question': q_body,
        'correct_answer': ans_val,
        'explanation': exp_body
    })

print(f"Successfully extracted {len(extracted)} questions!")
for item in extracted[:5]:
    print("  Q:", item['q_num'], "| Topic:", item['topic_key'], "| Text:", item['question'][:60], "| Ans:", item['correct_answer'])
