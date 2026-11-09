-- ====================================================================
-- NEXUS: REMOVE ALL MULTIPLE CHOICE QUESTIONS FOR TERM 1 PRE-TEST & POST-TEST
-- Question Type: 1 (Multiple Choice)
-- Term 1 Topics: Physical vs Chemical, Chemical Reactions, Acids/Bases,
--               Chemical Equations, Balancing, Rates, Homeostasis, Evolution
-- ====================================================================

DELETE FROM public.questions 
WHERE topic_id IN (
    'b0000000-0000-0000-0000-000000000101',
    'b0000000-0000-0000-0000-000000000102',
    'b0000000-0000-0000-0000-000000000103',
    'b0000000-0000-0000-0000-000000000104',
    'b0000000-0000-0000-0000-000000000105',
    'b0000000-0000-0000-0000-000000000106',
    'b0000000-0000-0000-0000-000000000107',
    'b0000000-0000-0000-0000-000000000108'
) 
AND question_type_id = 1 
AND quiz_type IN ('pre_test', 'post_test');
