import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\T-F-term-1.pdf'
reader = PdfReader(pdf_path)

for i in range(min(5, len(reader.pages))):
    print(f"=== PAGE {i+1} ===")
    txt = reader.pages[i].extract_text() or ''
    for line in txt.split('\n')[:25]:
        print(line)
