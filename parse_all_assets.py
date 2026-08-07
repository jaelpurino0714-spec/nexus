import os
import sys
import json
import re
from pypdf import PdfReader
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

for fname in sorted(os.listdir(assets_dir)):
    fpath = os.path.join(assets_dir, fname)
    print(f'============================== {fname} ==============================')
    if fname.endswith('.pdf'):
        reader = PdfReader(fpath)
        print(f'Pages: {len(reader.pages)}')
        full_text = []
        for i, page in enumerate(reader.pages):
            t = page.extract_text() or ''
            full_text.append(f'--- PAGE {i+1} ---\n' + t)
        content = '\n'.join(full_text)
        print(content[:1500])
        print('...\n' + content[-1000:])
    elif fname.endswith('.docx'):
        doc = Document(fpath)
        content = '\n'.join([p.text for p in doc.paragraphs if p.text.strip()])
        print(content[:1500])
        print('...\n' + content[-1000:])
