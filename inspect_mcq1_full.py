import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

reader = PdfReader(os.path.join(assets_dir, 'nexus-MCQ-term-1 (1).pdf'))
print(f"Total pages in nexus-MCQ-term-1: {len(reader.pages)}")

for i, page in enumerate(reader.pages):
    txt = page.extract_text() or ''
    first_line = txt.split('\n')[0] if txt else ''
    print(f"Page {i+1}: {first_line[:80]}")
