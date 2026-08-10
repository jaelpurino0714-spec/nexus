import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('dump_nexus-MCQ-term-1 (1).pdf.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('Group 4 · CHEMICAL EQUATIONS')
if pos != -1:
    print("=== GROUP 4 SAMPLE (1000 chars) ===")
    print(text[pos:pos+1000])

pos = text.find('Group 5 · CHEMICAL EQUATIONS')
if pos != -1:
    print("=== GROUP 5 SAMPLE (1000 chars) ===")
    print(text[pos:pos+1000])

pos = text.find('Group 6 · RATES OF CHEMICAL')
if pos != -1:
    print("=== GROUP 6 SAMPLE (1000 chars) ===")
    print(text[pos:pos+1000])
