import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('seed_master_questions.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in seed_master_questions.sql: {len(lines)}")

# Find any line that does NOT start with '--' or 'INSERT' or '(' or 'ON CONFLICT' or ';' or empty line
invalid_lines = []
for i, line in enumerate(lines):
    s = line.strip()
    if not s: continue
    if s.startswith('--'): continue
    if s.startswith('INSERT'): continue
    if s.startswith('('): continue
    if s.startswith('ON CONFLICT'): continue
    if s.startswith(';'): continue
    invalid_lines.append((i+1, s))

print(f"Total invalid SQL lines found: {len(invalid_lines)}")
for line_no, content in invalid_lines[:20]:
    print(f"Line {line_no}: {content[:100]}")
