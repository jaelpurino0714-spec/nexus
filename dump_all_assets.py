import os
import sys
from pypdf import PdfReader
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

assets_dir = r'd:\Nexus 2.0\Assets'

for fname in os.listdir(assets_dir):
    fpath = os.path.join(assets_dir, fname)
    if fname.endswith('.pdf'):
        try:
            reader = PdfReader(fpath)
            t = '\n'.join([p.extract_text() or '' for p in reader.pages])
            out_name = f"dump_{fname}.txt"
            with open(out_name, 'w', encoding='utf-8') as out:
                out.write(t)
            print(f"Dumped {fname} ({len(t)} chars)")
        except Exception as e:
            print(f"Error dumping {fname}: {e}")
    elif fname.endswith('.docx'):
        try:
            doc = Document(fpath)
            t = '\n'.join([p.text for p in doc.paragraphs])
            out_name = f"dump_{fname}.txt"
            with open(out_name, 'w', encoding='utf-8') as out:
                out.write(t)
            print(f"Dumped {fname} ({len(t)} chars)")
        except Exception as e:
            print(f"Error dumping {fname}: {e}")
