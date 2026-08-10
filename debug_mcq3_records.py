import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

import build_master_seed_fast

mcq3_recs = [r for r in build_master_seed_fast.records if r['question_type_id'] == 1 and r['topic_id'].startswith('b0000000-0000-0000-0000-0000000003')]

print(f"Total Term 3 MCQs in records: {len(mcq3_recs)}")
for r in mcq3_recs[:5]:
    print(r)

