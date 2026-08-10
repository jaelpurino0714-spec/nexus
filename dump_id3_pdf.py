import os
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\Identification term 3.pdf'
out_txt_path = r'd:\Nexus 2.0\dump_Identification term 3.pdf.txt'

reader = PdfReader(pdf_path)
full_text = []
for i, page in enumerate(reader.pages):
    full_text.append(f"--- PAGE {i+1} ---")
    full_text.append(page.extract_text() or "")

text_content = "\n".join(full_text)

with open(out_txt_path, 'w', encoding='utf-8') as f:
    f.write(text_content)

print(f"Successfully dumped {pdf_path} to {out_txt_path} ({len(text_content)} chars, {len(reader.pages)} pages)")

