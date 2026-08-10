import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect text around Group 2 (TYPES OF CHEMICAL REACTIONS...)
pos = text.find('Group 2 · TYPES OF CHEMICAL REACTIONS')
if pos != -1:
    print("=== GROUP 2 SAMPLE TEXT ===")
    print(text[pos:pos+1500])
