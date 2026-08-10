import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

writer_block = r'''

# --- Write Master SQL ---
with open('seed_master_questions.sql', 'w', encoding='utf-8') as out:
    out.write("-- ====================================================================\n")
    out.write("-- NEXUS: MASTER QUESTION SEED DATA FOR SUPABASE DATABASE\n")
    out.write("-- Sanitized and strictly validated for PostgreSQL syntax\n")
    out.write("-- ====================================================================\n\n")

    # Terms
    out.write("-- 1. TERMS\n")
    out.write("INSERT INTO public.terms (id, name, title, order_no) VALUES\n")
    out.write("('a0000000-0000-0000-0000-000000000001', 'Term 1', '1st Quarter: Earth and Space', 1),\n")
    out.write("('a0000000-0000-0000-0000-000000000002', 'Term 2', '2nd Quarter: Force, Motion & Energy', 2),\n")
    out.write("('a0000000-0000-0000-0000-000000000003', 'Term 3', '3rd Quarter: Living Things & Environment', 3),\n")
    out.write("('a0000000-0000-0000-0000-000000000004', 'Term 4', '4th Quarter: Matter & Its Interactions', 4)\n")
    out.write("ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title;\n\n")

    # Question Types
    out.write("-- 2. QUESTION TYPES\n")
    out.write("INSERT INTO public.question_types (id, name) VALUES\n")
    out.write("(1, 'Multiple Choice'),\n")
    out.write("(2, 'True or False'),\n")
    out.write("(3, 'Identification')\n")
    out.write("ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n\n")

    # Topics
    out.write("-- 3. TOPICS\n")
    out.write("INSERT INTO public.topics (id, term_id, title, order_no) VALUES\n")
    top_rows = []
    for k, v in TOPICS.items():
        top_rows.append(f"({esc(v[0])}, {esc(v[1])}, {esc(v[2])}, {v[3]})")
    out.write(",\n".join(top_rows) + "\n")
    out.write("ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_no = EXCLUDED.order_no;\n\n")

    # Questions
    out.write("-- 4. QUESTIONS\n")
    out.write("INSERT INTO public.questions (topic_id, question_type_id, quiz_type, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES\n")
    
    q_rows = []
    for r in records:
        q_rows.append(f"({esc(r['topic_id'])}, {r['question_type_id']}, {esc(r['quiz_type'])}, {esc(r['question'])}, {esc(r['choice_a'])}, {esc(r['choice_b'])}, {esc(r['choice_c'])}, {esc(r['choice_d'])}, {esc(r['correct_answer'])}, {esc(r['explanation'])}, true)")

    out.write(",\n".join(q_rows) + ";\n")

print(f"SUCCESS: Updated seed_master_questions.sql with {len(records)} total questions!")
'''

for fname in ['build_master_seed_fast.py', 'generate_master_sql.py', 'build_clean_seed_sql.py']:
    if not os.path.exists(fname): continue
    with open(fname, 'r', encoding='utf-8') as f:
        code = f.read()

    if "# --- Write Master SQL ---" not in code:
        code = code.strip() + "\n" + writer_block
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Added Master SQL writer block to {fname}")

