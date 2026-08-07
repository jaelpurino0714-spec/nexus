import sys
from docx import Document
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

print('=== T-or-F-term-3.docx ===')
doc = Document(r'd:\Nexus 2.0\Assets\T-or-F-term-3.docx')
for i, p in enumerate(doc.paragraphs[:30]):
    if p.text.strip():
        print(f'{i}: {p.text}')

print('\n=== nexus-MCQ-term-2.pdf (first 100 lines) ===')
reader = PdfReader(r'd:\Nexus 2.0\Assets\nexus-MCQ-term-2.pdf')
text = '\n'.join([(p.extract_text() or '') for p in reader.pages[:4]])
for line in text.split('\n')[:80]:
    print(line)
