import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def analyze_dump(fname):
    with open(fname, 'r', encoding='utf-8') as f:
        text = f.read()
    print(f"=== {fname} ({len(text)} chars) ===")
    
    # Find group / topic headers
    headers = re.findall(r'^[ \t]*(?:GROUP|Group|TOPIC|Topic|PART|Part)[^\n]*$', text, re.MULTILINE)
    for h in headers:
        print("  Header:", h.strip())

analyze_dump('dump_nexus-MCQ-term-1 (1).pdf.txt')
analyze_dump('dump_nexus-MCQ-term-2.pdf.txt')
analyze_dump('dump_MCQ-term-3.pdf.txt')
