import os
import sys
import re
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'd:\Nexus 2.0\Assets\T-F-term-1.pdf'
reader = PdfReader(pdf_path)

print(f"Total pages: {len(reader.pages)}")

# Print text of all pages
full_text = []
for i, p in enumerate(reader.pages):
    t = p.extract_text() or ''
    full_text.append(f"--- PAGE {i+1} ---\n" + t)

all_str = '\n'.join(full_text)

# Look for topic headers
matches = re.finditer(r'(topic\s*\d+.*|physical.*|acids.*|chemical.*|rates.*|homeostasis.*|mechanisms.*|evolution.*)', all_str, re.IGNORECASE)
print("=== TOPIC HEADERS FOUND ===")
for m in matches:
    print(m.group(0)[:80])
