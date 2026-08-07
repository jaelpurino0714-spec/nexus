import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\Nexus 2.0\seed_master_questions.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

lines = sql.split('\n')
print(f"Total lines: {len(lines)}")

# Find all tuple rows: ('...', 1, '...', ...)
# Check if any tuple row has unbalanced single quotes
in_insert = False
tuple_str = ""
tuple_count = 0
errors = []

for line_num, line in enumerate(lines, 1):
    if line.startswith("INSERT INTO public.questions"):
        in_insert = True
        continue
    if not in_insert:
        continue
    
    # Track parens and quotes in tuple
    for char in line:
        tuple_str += char
        if char in (';', ')'):
            if tuple_str.strip().startswith('('):
                t_content = tuple_str.strip()
                # count unescaped single quotes
                # Replace escaped quotes '' with nothing
                sans_escaped = t_content.replace("''", "")
                quote_count = sans_escaped.count("'")
                if quote_count % 2 != 0:
                    errors.append((line_num, t_content[:150]))
            tuple_str = ""

print(f"Found {len(errors)} rows with unescaped single quotes!")
for err in errors[:20]:
    print(f"Line {err[0]}: {err[1]}")
