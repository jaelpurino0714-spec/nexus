import os
import sys
import re
from pypdf import PdfReader
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

def inspect_file(fname):
    fpath = os.path.join(assets_dir, fname)
    print(f'=== {fname} ===')
    text = ''
    if fname.endswith('.pdf'):
        reader = PdfReader(fpath)
        for page in reader.pages:
            text += (page.extract_text() or '') + '\n'
    elif fname.endswith('.docx'):
        doc = Document(fpath)
        text = '\n'.join([p.text for p in doc.paragraphs if p.text.strip()])
    
    lines = text.split('\n')
    print(f'Total characters: {len(text)}, lines: {len(lines)}')
    
    # Find headers and question patterns
    q_matches = re.findall(r'^\s*(\d+)[\.\)]\s*(.*)', text, re.MULTILINE)
    print(f'Matches for N. Question: {len(q_matches)}')
    if q_matches:
        print('Sample questions:')
        for q in q_matches[:5]:
            print('  Q', q[0], ':', q[1][:80])
            
inspect_file('Identification term 1.pdf')
inspect_file('Identification term 3.pdf')
inspect_file('post-test-Term-2-identification.pdf')
inspect_file('T-F-term-1.pdf')
inspect_file('T-or-F-term-2.pdf')
inspect_file('T-or-F-term-3.docx')
inspect_file('nexus-MCQ-term-1 (1).pdf')
inspect_file('nexus-MCQ-term-2.pdf')
inspect_file('MCQ-term-3.pdf')
