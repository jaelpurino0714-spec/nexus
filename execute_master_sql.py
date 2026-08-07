import os
import sys
import json
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

# Supabase details
SUPABASE_URL = "https://bmebwqvdotwmtqcaxrnk.supabase.co"
# Service key or anon key - we can use REST endpoint or execute in batches
# Let's read seed_master_questions.sql and post to Supabase rest table or RPC
# Or we can split seed_master_questions.sql into chunks of 100 rows and execute.

with open('seed_master_questions.sql', 'r', encoding='utf-8') as f:
    sql_text = f.read()

print(f"Total SQL file length: {len(sql_text)} characters")
