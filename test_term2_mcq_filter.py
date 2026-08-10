import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# Read build_master_seed_fast.py to inspect how Term 2 MCQs are currently added
with open('build_master_seed_fast.py', 'r', encoding='utf-8') as f:
    code = f.read()

print("Current build_master_seed_fast.py loaded.")

