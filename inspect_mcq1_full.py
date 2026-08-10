import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\nexus-MCQ-term-1 (1).pdf'
reader = PdfReader(pdf_path)

full_text = ""
for i, p in enumerate(reader.pages):
    full_text += f"\n--- PAGE {i+1} ---\n" + (p.extract_text() or "")

with open('mcq1_raw_text.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print(f"Extracted {len(full_text)} chars from nexus-MCQ-term-1 (1).pdf to mcq1_raw_text.txt")
