import os
import sys
import re
from pypdf import PdfReader
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

def test_parse_mcq_term1():
    reader = PdfReader(os.path.join(assets_dir, 'nexus-MCQ-term-1 (1).pdf'))
    text = '\n'.join([p.extract_text() or '' for p in reader.pages])
    groups = re.split(r'GROUP\s+(\d+)[:\s]+([^\n]+)', text)
    
    total = 0
    for i in range(1, len(groups), 3):
        g_num = int(groups[i])
        g_title = groups[i+1].strip()
        g_content = groups[i+2]
        
        # Check patterns in g_content
        # Find Q1. or 1.
        q_count = len(re.findall(r'(?:Q\d+|\b\d+)[\.\)]\s*', g_content))
        print(f"Group {g_num} ({g_title}): found ~{q_count} question markers")

test_parse_mcq_term1()
