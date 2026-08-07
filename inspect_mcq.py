import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

def inspect_pdf(fname):
    print(f'=== {fname} ===')
    reader = PdfReader(f'd:\\Nexus 2.0\\Assets\\{fname}')
    text = '\n'.join([(p.extract_text() or '') for p in reader.pages[:4]])
    for line in text.split('\n')[:80]:
        print(line)

inspect_pdf('nexus-MCQ-term-1 (1).pdf')
inspect_pdf('MCQ-term-3.pdf')
