import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\Nexus 2.0\seed_master_questions.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_insert = False
invalid_lines = []

for i, line in enumerate(lines, 1):
    line_s = line.strip()
    if line_s.startswith("INSERT INTO public.questions"):
        in_insert = True
        continue
    if not in_insert or not line_s:
        continue
        
    if not (line_s.startswith("(") and (line_s.endswith("),") or line_s.endswith(");"))):
        invalid_lines.append((i, line_s[:100]))

print(f"Total lines in file: {len(lines)}")
print(f"Invalid lines found after questions insert: {len(invalid_lines)}")
for inv in invalid_lines[:10]:
    print(f"  Line {inv[0]}: {inv[1]}")
