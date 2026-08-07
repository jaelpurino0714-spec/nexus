-- ====================================================================
-- MASTER QUESTION SEED DATA FOR SUPABASE DATABASE
-- Generated from Assets PDFs & DOCX files
-- ====================================================================

-- 1. TERMS
INSERT INTO public.terms (id, name, title, order_no) VALUES
('a0000000-0000-0000-0000-000000000001', 'Term 1', '1st Quarter: Earth and Space', 1),
('a0000000-0000-0000-0000-000000000002', 'Term 2', '2nd Quarter: Force, Motion & Energy', 2),
('a0000000-0000-0000-0000-000000000003', 'Term 3', '3rd Quarter: Living Things & Environment', 3),
('a0000000-0000-0000-0000-000000000004', 'Term 4', '4th Quarter: Matter & Its Interactions', 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, title = EXCLUDED.title;

-- 2. QUESTION TYPES
INSERT INTO public.question_types (id, name) VALUES
(1, 'Multiple Choice'),
(2, 'True or False'),
(3, 'Identification')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. TOPICS
INSERT INTO public.topics (id, term_id, title, order_no) VALUES
('b0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Physical vs. Chemical Change', 1),
('b0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'Chemical Reactions', 2),
('b0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'Acids, Bases, and Salts', 3),
('b0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'Chemical Equations', 4),
('b0000000-0000-0000-0000-000000000105', 'a0000000-0000-0000-0000-000000000001', 'Balancing Chemical Equations', 5),
('b0000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000001', 'Rates of Reactions', 6),
('b0000000-0000-0000-0000-000000000107', 'a0000000-0000-0000-0000-000000000001', 'Homeostasis', 7),
('b0000000-0000-0000-0000-000000000108', 'a0000000-0000-0000-0000-000000000001', 'Mechanisms of Evolution', 8),
('b0000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000002', 'Ecosystem''s Carrying Capacity and Population Growth', 1),
('b0000000-0000-0000-0000-000000000202', 'a0000000-0000-0000-0000-000000000002', 'Biotechnology', 2),
('b0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000002', 'Plate Tectonics', 3),
('b0000000-0000-0000-0000-000000000204', 'a0000000-0000-0000-0000-000000000002', 'Global Climate', 4),
('b0000000-0000-0000-0000-000000000205', 'a0000000-0000-0000-0000-000000000002', 'Global Interactions (ENSO)', 5),
('b0000000-0000-0000-0000-000000000206', 'a0000000-0000-0000-0000-000000000002', 'Global and Local Sustainability', 6),
('b0000000-0000-0000-0000-000000000301', 'a0000000-0000-0000-0000-000000000003', 'Projectile Motion', 1),
('b0000000-0000-0000-0000-000000000302', 'a0000000-0000-0000-0000-000000000003', 'Momentum and Collisions', 2),
('b0000000-0000-0000-0000-000000000303', 'a0000000-0000-0000-0000-000000000003', 'Large-Scale Generation and Distribution of Electricity', 3),
('b0000000-0000-0000-0000-000000000304', 'a0000000-0000-0000-0000-000000000003', 'Renewable and Non-Renewable Energy Sources', 4)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_no = EXCLUDED.order_no;

-- 4. QUESTIONS
INSERT INTO public.questions (topic_id, question_type_id, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, is_active) VALUES
('b0000000-0000-0000-0000-000000000301', 2, 'Any object thrown or launched into the air acted on mainly by gravity is a projectile.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'The curved path a projectile follows is called its trajectory.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Projectile motion combines constant horizontal motion and accelerated vertical motion.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'On level ground, a launch angle near 45° gives the maximum horizontal range.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Complementary angles like 30° and 60° give almost the same range.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Higher launch angles produce greater maximum height but shorter flight time.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'At the very top of its path, the projectile’s vertical velocity is momentarily zero.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'If thrown horizontally and dropped from the same height, both hit the ground at the same time.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Horizontal velocity stays constant if air resistance is ignored.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Gravity acts both horizontally and vertically on a moving projectile.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Greater launch speed increases both range and maximum height.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Range depends on the square of the initial speed.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Air resistance makes the actual range shorter than the ideal calculation.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Maximum height depends mostly on the vertical component of velocity.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Projectile motion applies to sports like basketball, sepak takraw, and archery.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Launch angle has no effect on how long the projectile stays in the air.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'A ball thrown straight up has zero horizontal velocity throughout its flight.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Symmetry means speed is equal at equal heights above launch level.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Projectile motion only happens when objects move straight up or down.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Even without air resistance, total speed is lowest at the highest point.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Increasing launch speed four times doubles the range.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Long jumpers aim for fast run-up plus an angle close to 45°.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'The horizontal and vertical motions affect each other strongly.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'At landing level equal to launch, speed matches speed at launch.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Steeper angle means more time in air but less horizontal distance covered.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Earth’s curvature is usually ignored in basic Grade 10 projectile calculations.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Only mass determines how far a projectile will travel.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'The ideal model assumes no air resistance and constant gravity.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Angle and speed together determine the path of the projectile.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000301', 2, 'Projectile motion follows a parabolic shape under ideal conditions.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Momentum equals mass multiplied by velocity (p = m×v).', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'A heavy slow object can have the same momentum as a light fast object.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'In an isolated system, total momentum before collision equals total momentum after.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Elastic collisions conserve both momentum and kinetic energy.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Inelastic collisions conserve momentum but lose some kinetic energy.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Perfectly inelastic means objects stick together after impact.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Force multiplied by time equals change in momentum (impulse-momentum theorem).', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Increasing stopping time reduces the average force experienced.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Seatbelts and airbags work mainly by lengthening the stopping time.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'A fast small object can have more momentum than a slow large one.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Momentum depends on mass and speed only, not direction.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'When a cannon fires, recoil shows momentum conservation.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Billiard ball collisions are nearly perfectly elastic.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Clay sticking to a wall is an example of perfectly elastic collision.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'A jeepney has more momentum than a motorcycle at the same speed.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'If velocity doubles, momentum also doubles.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Total momentum is always conserved even if kinetic energy is not.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Crumple zones in cars extend collision time to lower impact force.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Catching an egg while pulling your hand back reduces force by increasing time.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Momentum is a scalar quantity with no direction.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Stationary objects have zero momentum.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Any change in momentum requires an applied force over time.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Two cars with equal speed and mass colliding head-on each experience similar force as hitting a wall.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Mass alone determines how hard it is to stop a moving object.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Doubling both mass and velocity quadruples the momentum.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'In single displacement collisions, one object loses momentum the other gains it.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Restitution is perfect in ideal elastic collisions.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Heavy trucks need longer stopping distances even at same speed as cars.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000302', 2, 'Momentum conservation applies to all collision types.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'The unit for momentum is kilogram-meter per second (kg·m/s).', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'A generator converts mechanical energy into electrical energy.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'An electric motor converts electrical energy into mechanical motion.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Transformers change AC voltage levels efficiently.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Step-up transformers raise voltage for long-distance transmission.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'High voltage transmission reduces energy lost as heat in wires.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Step-down transformers lower voltage for safe household use.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Standard Philippine residential supply is about 220 V.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Transmission lines operate at much higher voltages than distribution lines.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'The grid sequence is: Power plant → Step-up → Transmission → Step-down → Home.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Fuses melt to break the circuit during dangerous overcurrent.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Circuit breakers can be reset after tripping unlike fuses.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'The third pin on plugs connects to the ground wire for safety.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Octopus wiring increases fire risk by overloading the circuit.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Water should never be used on an electrical fire.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'The kilowatt-hour meter measures total electrical energy consumed.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Motors and generators have similar main parts: coils, magnets, rotor.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Transformers work efficiently only with alternating current (AC).', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'NGCP manages transmission; utilities like MERALCO handle distribution.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Live wire carries voltage; neutral is the return path; ground is for safety.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Energy conservation reduces demand and lowers greenhouse gas emissions.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Power plants use turbines driven by steam, water, wind, or heat.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'High voltage transmission lines are supported by tall towers for safety.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Electrical energy is easily stored in large amounts along transmission lines.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'GFCI or ELCB outlets protect against fatal electric shock in wet areas.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'The symbol ΔV means change in voltage.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Power loss in lines increases with the square of the current.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Turning off unused appliances reduces load and your monthly bill.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000303', 2, 'Transformers can create extra electrical energy for free.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Proper grounding prevents shocks if an appliance casing becomes live.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Understanding the grid helps us use electricity safely and wisely.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Renewable energy replenishes naturally within a human lifetime.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Non-renewable energy takes millions of years to form and cannot be replaced quickly.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Coal, oil, and natural gas are classified as fossil fuels.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Solar, wind, hydro, geothermal, and biomass are renewable sources.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'The Philippines ranks second globally in geothermal energy production.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Coal currently supplies the largest share of electricity in the Philippines.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Burning fossil fuels releases carbon dioxide that contributes to global warming.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Hydropower uses flowing or falling water to turn turbines and generate electricity.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Solar panels convert sunlight directly into electrical energy.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Natural gas is a renewable energy resource.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Renewable energy produces almost zero greenhouse gas emissions during operation.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Non-renewable sources will eventually run out if used continuously.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Biomass uses organic materials like crop waste, wood, and manure for energy.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Wind energy relies on moving air to spin turbine blades.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Geothermal energy uses heat from deep inside the Earth.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Switching to renewables reduces our dependence on imported fuels.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Hydroelectric dams can also help control floods and supply irrigation water.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'All renewable energy sources work perfectly 24 hours every day.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Energy conservation helps stretch both renewable and non-renewable supplies.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Fossil fuels cause air pollution that harms human health.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Nuclear energy is considered a renewable resource.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Using rice husks and bagasse for energy is an example of biomass.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'High-voltage transmission lines work the same way for all energy sources.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Renewable energy is always cheaper and easier to set up everywhere.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'The Malampaya gas field is a major local source of natural gas.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Increasing renewable use supports both energy security and climate action.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Once used, fossil fuels can be grown back like plants.', 'True', 'False', NULL, NULL, 'FALSE', 'The statement is FALSE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'Energy efficiency means wasting less energy to do the same work.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'The Philippines has abundant natural resources for all major renewable types.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000304', 2, 'A balanced mix of renewables and responsible use is key to sustainable energy.', 'True', 'False', NULL, NULL, 'TRUE', 'The statement is TRUE.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Carrying capacity is the maximum number of individuals an ecosystem can support long-term.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Limiting factors stop a population from growing beyond available resources.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Food, water, and shelter are core limiting factors for most populations.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Body color is one of the main limiting factors that control population size.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Unrestricted growth produces a J-shaped curve called exponential growth.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'As a population nears carrying capacity, its growth rate slows down.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Logistic growth forms an S-shaped curve that levels off near carrying capacity.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Lack of available mates acts as a limiting factor for small populations.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Density-dependent factors affect crowded populations more strongly.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Typhoons and earthquakes are density-independent limiting factors.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Disease spreads faster in crowded areas so it is density-independent.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Competition for resources increases as population size gets larger.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Overshooting carrying capacity often leads to population crash or dieback.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Birth rate higher than death rate causes population to increase.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Immigration means moving out of an area permanently.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Emigration reduces the number of individuals in a local population.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Habitat destruction can lower an ecosystem’s carrying capacity.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Carrying capacity is fixed and can never change for any reason.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Population density counts individuals per unit area or volume.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Predation helps keep prey populations balanced with resources.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Drought affects plants and animals regardless of how dense they are.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Exponential growth can continue forever in natural ecosystems.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'When birth rate equals death rate, population size stays nearly stable.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Limiting factors can be biotic, abiotic, or related to reproduction.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Higher carrying capacity means more resources are available to sustain life.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Human activities often reduce or damage available limiting factors.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'A population below carrying capacity will usually increase in size.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'All resources are finite, so no population can grow indefinitely.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Protecting food, water, and shelter helps maintain stable carrying capacity.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Balanced populations depend on both limiting factors and resource use.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Biotechnology uses living organisms or processes to make useful products.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Traditional biotechnology relies mostly on fermentation by microbes.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Nata de coco is made by fermenting coconut water with bacteria.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Soy sauce is commonly made by fermenting soybeans and grains.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Vinegar forms when alcohol is oxidized into acetic acid.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Cheese and yogurt are produced using lactic acid bacteria.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Modern biotechnology does not involve changing genetic material.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'GMOs have their DNA or genetic material altered intentionally.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'In vitro fertilization happens outside the body then implanted later.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'GMO crops may be bred for pest resistance or higher yield.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Fermentation is a very new technology developed only recently.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Biotechnology can have ethical, environmental, and social impacts.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'All uses of biotechnology are always safe and have no risks.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Traditional fermented foods are part of Filipino cultural heritage.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Microorganisms like yeast and bacteria are essential in many biotech products.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Genetic engineering never changes traits passed to offspring.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Biotechnology helps produce medicines, food, and industrial materials.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'IVF is one method used to assist couples with fertility issues.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Using biotechnology always harms natural ecosystems.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Fermentation preserves food and improves its flavor or nutrition.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Only modern laboratories can perform biotechnology work.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Changes in DNA can affect how an organism grows or functions.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Biotechnology can help address food security challenges.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'All GMOs look exactly the same as their non-GMO versions.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Ethical questions often involve safety, choice, and long-term effects.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Biotechnology can also help in cleaning up pollution.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Yeast uses fermentation to make bread rise and produce alcohol.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Traditional and modern biotechnology share the same basic principles.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Regulations help manage the safe use of biotechnology.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Biotechnology benefits society but requires responsible use.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Earth’s outer layer is broken into moving plates called tectonic plates.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Plates move because of convection currents in the asthenosphere.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Divergent boundaries occur where plates move away from each other.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Convergent boundaries form when plates collide or push together.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Transform boundaries involve plates sliding past one another.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Trenches and volcanoes often form at divergent boundaries.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Mountains like the Himalayas form from continental-continental convergence.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Philippines sits on the Pacific Ring of Fire.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Most earthquakes and volcanoes happen along plate boundaries.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Subduction happens when one plate sinks beneath another plate.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Plate movement is fast and easily felt every day.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'We can measure plate displacement using satellites and GPS.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Volcanoes and trenches near the Philippines show active subduction.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'At transform boundaries, crust is neither created nor destroyed.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'New crust forms at mid-ocean ridges in divergent zones.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Oceanic crust usually subducts under less dense continental crust.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Plate movement will not change the Philippine islands in the future.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Andes Mountains formed from ocean-continental convergence.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Faults are cracks in the crust where movement occurs.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Earthquakes happen when stored energy along faults is released.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Convection in the mantle drives plate motion.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'All plate boundaries produce exactly the same landforms.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Plates move at roughly the speed fingernails grow.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Tectonic activity shapes the location of mountains, faults, and coastlines.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Plate movement provides evidence for the theory of evolution.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Continents have moved apart from one large supercontinent called Pangaea.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Seafloor spreading supports the idea of moving plates.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'In millions of years, plate movement will rearrange the map again.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Understanding plate tectonics helps prepare for earthquakes and volcanoes.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The theory of plate tectonics unifies many geological observations.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Climate is the long-term average pattern of weather conditions in an area.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Weather describes day-to-day conditions while climate spans decades or longer.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Global warming refers to the rising average temperature of Earth’s atmosphere and oceans.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Greenhouse gases trap heat and keep Earth warmer than it would be otherwise.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Carbon dioxide is the main human-caused greenhouse gas driving modern warming.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Natural greenhouse effect makes Earth too hot for life to exist.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Enhanced greenhouse effect is caused by extra gases released by human activities.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Burning fossil fuels adds large amounts of carbon dioxide to the atmosphere.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Melting glaciers and ice sheets contribute to rising sea levels.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Warmer oceans expand in volume, which also raises sea levels.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Ice core data shows current carbon dioxide levels are far higher than in 800 000 years.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'A single hot summer or strong typhoon is direct proof of climate change.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Deforestation reduces the number of trees that absorb carbon dioxide.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Volcanic eruptions and solar activity fully explain recent rapid warming.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Methane is more potent than carbon dioxide but stays in the air for a shorter time.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Nitrous oxide and CFCs are also greenhouse gases.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Ocean acidification happens when carbon dioxide dissolves in seawater.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Coral reefs and shell-forming animals are harmed by ocean acidification.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Climate change can shift rainfall patterns and worsen extreme weather events.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Higher global temperatures always mean every place gets hotter equally.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Arctic sea ice loss creates a feedback loop that speeds up warming.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Climate change can happen naturally but current rate is extremely fast.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Stopping emissions today will instantly stop all climate change effects.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Philippines is highly vulnerable to sea-level rise and stronger storms.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Protecting forests helps slow climate change by storing carbon.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Energy conservation and renewable energy use reduce greenhouse gas emissions.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Climate change only affects polar regions and not tropical countries.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Scientific evidence supports human activities as the main cause of current warming.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Higher temperatures can reduce crop yields and threaten food security.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Understanding climate change helps communities prepare and adapt effectively.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO stands for El Niño Southern Oscillation.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'El Niño is the warm phase of the ENSO cycle.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'La Niña is the cool phase of the ENSO cycle.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO originates mainly in the tropical Pacific Ocean.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'During El Niño, trade winds weaken or reverse direction.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'During El Niño, warm ocean water shifts toward the eastern and central Pacific.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'El Niño usually brings drier, hotter conditions to the Philippines.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'El Niño often causes droughts, water shortages, and crop losses locally.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'La Niña typically brings above-average rainfall and more frequent floods to the Philippines.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'La Niña often increases the number and intensity of typhoons affecting the country.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Normal trade winds blow steadily from east to west across the tropical Pacific.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO events typically last about 9 to 12 months or longer.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'During La Niña, the western Pacific near the Philippines stays warmer than usual.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Southern Oscillation refers to changes in air pressure across the Pacific.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO can shift global weather patterns far beyond the Pacific region.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'El Niño always causes the same effects in every country.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Complementary seasons and opposite impacts mark El Niño and La Niña.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'PAGASA and international agencies monitor ocean and atmosphere indicators to forecast ENSO.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Strong El Niño events can delay or weaken the southwest monsoon (Habagat).', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'La Niña can prolong and intensify the rainy season in the Philippines.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO affects agriculture, water supply, energy, and disaster management.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Global warming may make extreme El Niño and La Niña events more frequent or intense.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Neutral phase means ocean and atmosphere conditions are near long-term averages.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'El Niño brings more typhoons to the Philippines than usual.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'La Niña increases flood and landslide risk in many parts of the country.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO is entirely caused by human pollution and greenhouse gases.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Knowing ENSO status helps farmers, fishermen, and communities prepare better.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Rising sea surface temperatures provide more energy for stronger tropical cyclones.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'ENSO impacts are predictable enough to support early warning and action plans.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Climate change interacts with ENSO to amplify many of its effects.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Mitigation means reducing or preventing greenhouse gas emissions at the source.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Adaptation means adjusting to climate changes that are already happening.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Renewable energy comes from sources that replenish naturally within a human lifetime.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Coal, oil, and natural gas are renewable energy sources.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Philippines ranks second worldwide in geothermal energy production.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Hydropower uses flowing or falling water to generate electricity.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Solar energy is captured directly from sunlight using panels.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Burning fossil fuels releases large amounts of carbon dioxide into the atmosphere.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Renewable energy produces almost zero carbon dioxide during normal operation.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Energy efficiency means using more energy to do the same amount of work.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The 3 Rs are Reduce, Reuse, and Recycle.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Planting native trees helps fight climate change by absorbing carbon dioxide.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Sea-level rise causes saltwater intrusion into coastal wells and farmland.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Geothermal energy is available 24 hours a day unlike solar and wind.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Philippines spends billions of pesos yearly importing coal and oil.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Switching to renewables can help lower electricity price volatility.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Drought-resistant crops and flood barriers are examples of mitigation.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Mangroves and coral reefs protect coastlines from storm surges and erosion.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Landfill waste produces methane, a very potent greenhouse gas.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Composting organic waste reduces methane emissions and makes natural fertilizer.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The Renewable Energy Act of the Philippines aims to increase clean energy use.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Coal use improves public health by reducing air pollution.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Higher energy use always means better sustainability.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Wasting electricity increases the amount of fossil fuels burned at power plants.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'The country targets 35% renewable energy share by year 2030.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Climate justice means those who contributed least often suffer the most.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'All renewable energy sources have exactly the same advantages and costs.', 'True', 'False', NULL, NULL, 'False', 'The statement is False.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Individual actions like saving energy add up to large national impacts.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Sustainability balances human needs with protecting the environment.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000201', 2, 'Choosing renewable energy benefits both the climate and the local economy.', 'True', 'False', NULL, NULL, 'True', 'The statement is True.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'A change that produces one or more new substances.', NULL, NULL, NULL, NULL, 'Chemical change', 'The correct term is: Chemical change.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'A change that only affects the size, shape, or state of a substance without changing its composition.', NULL, NULL, NULL, NULL, 'Physical change', 'The correct term is: Physical change.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The process of tomatoes spoiling and producing new substances.', NULL, NULL, NULL, NULL, 'Rotting (rotting of tomatoes)', 'The correct term is: Rotting (rotting of tomatoes).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The type of change represented by crushing chunks of ice.', NULL, NULL, NULL, NULL, 'Physical change', 'The correct term is: Physical change.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The main characteristic that distinguishes a chemical change from a physical change.', NULL, NULL, NULL, NULL, 'Formation of a new substance', 'The correct term is: Formation of a new substance.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The evidence of a chemical reaction shown when vinegar reacts with baking soda and bubbles are produced.', NULL, NULL, NULL, NULL, 'Gas evolution (gas formation)', 'The correct term is: Gas evolution (gas formation).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The evidence of a chemical reaction shown when milk forms lumpy solids.', NULL, NULL, NULL, NULL, 'Formation of a precipitate', 'The correct term is: Formation of a precipitate.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The evidence shown when quicklime reacts with water and releases heat.', NULL, NULL, NULL, NULL, 'Temperature change (heat released)', 'The correct term is: Temperature change (heat released).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The change that occurs when paper is cut into smaller pieces.', NULL, NULL, NULL, NULL, 'Physical change', 'The correct term is: Physical change.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The evidence of a chemical reaction when a yellow solid forms after mixing two clear solutions.', NULL, NULL, NULL, NULL, 'Precipitate formation', 'The correct term is: Precipitate formation.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The substances found on the left side of a chemical equation.', NULL, NULL, NULL, NULL, 'Reactants', 'The correct term is: Reactants.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The substances formed on the right side of a chemical equation.', NULL, NULL, NULL, NULL, 'Products', 'The correct term is: Products.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The meaning of the symbol (aq) in a chemical equation.', NULL, NULL, NULL, NULL, 'Aqueous (dissolved in water)', 'The correct term is: Aqueous (dissolved in water).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The meaning of the symbol Δ written above the reaction arrow.', NULL, NULL, NULL, NULL, 'Heat is supplied', 'The correct term is: Heat is supplied.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The meaning of the downward arrow (↓) in a chemical equation.', NULL, NULL, NULL, NULL, 'Precipitate (solid formed)', 'The correct term is: Precipitate (solid formed).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The meaning of the plus sign (+) between substances in a chemical equation.', NULL, NULL, NULL, NULL, 'Reacts with / mixed with', 'The correct term is: Reacts with / mixed with.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The reaction type represented by A + B → AB.', NULL, NULL, NULL, NULL, 'Combination (Synthesis) reaction', 'The correct term is: Combination (Synthesis) reaction.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The reaction type shown by 2Na + Cl₂ → 2NaCl.', NULL, NULL, NULL, NULL, 'Combination (Synthesis) reaction', 'The correct term is: Combination (Synthesis) reaction.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The reaction type represented by CaCO₃ → CaO + CO₂.', NULL, NULL, NULL, NULL, 'Decomposition reaction', 'The correct term is: Decomposition reaction.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The general equation for a decomposition reaction.', NULL, NULL, NULL, NULL, 'AB → A + B', 'The correct term is: AB → A + B.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The reaction in which one element replaces another element in a compound.', NULL, NULL, NULL, NULL, 'Single displacement reaction', 'The correct term is: Single displacement reaction.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The reaction type represented by AgNO₃ + NaCl → AgCl + NaNO₃.', NULL, NULL, NULL, NULL, 'Double displacement reaction', 'The correct term is: Double displacement reaction.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The gas that is always required for combustion reactions.', NULL, NULL, NULL, NULL, 'Oxygen (O₂)', 'The correct term is: Oxygen (O₂).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The two products always formed during the complete combustion of a hydrocarbon.', NULL, NULL, NULL, NULL, 'Carbon dioxide (CO₂) and water (H₂O)', 'The correct term is: Carbon dioxide (CO₂) and water (H₂O).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The reaction represented by HBr + NaOH → NaBr + H₂O.', NULL, NULL, NULL, NULL, 'Neutralization (Acid–Base reaction)', 'The correct term is: Neutralization (Acid–Base reaction).', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The special type of double displacement reaction involving an acid and a base.', NULL, NULL, NULL, NULL, 'Neutralization', 'The correct term is: Neutralization.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The type of change represented by melting wax.', NULL, NULL, NULL, NULL, 'Physical change', 'The correct term is: Physical change.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The process represented by dissolving salt in water.', NULL, NULL, NULL, NULL, 'Physical change', 'The correct term is: Physical change.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'In the equation Mg + O₂ → MgO, the substance MgO is called the ________.', NULL, NULL, NULL, NULL, 'Product', 'The correct term is: Product.', true),
('b0000000-0000-0000-0000-000000000101', 3, 'The meaning of the reaction arrow (→) in a chemical equation.', NULL, NULL, NULL, NULL, 'Yields / Produces', 'The correct term is: Yields / Produces.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'A substance that has a sour taste and turns blue litmus paper red.', NULL, NULL, NULL, NULL, 'Acid', 'The correct term is: Acid.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'A substance that turns red litmus paper blue and has a pH greater than 7.', NULL, NULL, NULL, NULL, 'Base', 'The correct term is: Base.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The pH value of pure water at 25°C.', NULL, NULL, NULL, NULL, 'pH 7', 'The correct term is: pH 7.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The color of phenolphthalein in a basic solution.', NULL, NULL, NULL, NULL, 'Bright pink', 'The correct term is: Bright pink.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The ion released by acids in water according to the Arrhenius definition.', NULL, NULL, NULL, NULL, 'H⁺ (Hydrogen ion) / H₃O⁺', 'The correct term is: H⁺ (Hydrogen ion) / H₃O⁺.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The ion released by bases in water according to the Arrhenius definition.', NULL, NULL, NULL, NULL, 'OH⁻ (Hydroxide ion)', 'The correct term is: OH⁻ (Hydroxide ion).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The chemical formula of common table salt.', NULL, NULL, NULL, NULL, 'NaCl', 'The correct term is: NaCl.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The chemical formula of hydrochloric acid found in the stomach.', NULL, NULL, NULL, NULL, 'HCl', 'The correct term is: HCl.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The chemical formula of sodium hydroxide (caustic soda).', NULL, NULL, NULL, NULL, 'NaOH', 'The correct term is: NaOH.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The color of methyl orange in an acidic solution.', NULL, NULL, NULL, NULL, 'Red', 'The correct term is: Red.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'A natural indicator obtained from plants that turns reddish-brown in a base.', NULL, NULL, NULL, NULL, 'Turmeric', 'The correct term is: Turmeric.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'A solution with a pH of 7 is described as __________.', NULL, NULL, NULL, NULL, 'Neutral', 'The correct term is: Neutral.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The weak acid commonly found in vinegar.', NULL, NULL, NULL, NULL, 'Acetic acid (CH₃COOH)', 'The correct term is: Acetic acid (CH₃COOH).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The base commonly found in milk of magnesia.', NULL, NULL, NULL, NULL, 'Magnesium hydroxide [Mg(OH)₂]', 'The correct term is: Magnesium hydroxide [Mg(OH)₂].', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The color of blue litmus paper when placed in a base.', NULL, NULL, NULL, NULL, 'Blue', 'The correct term is: Blue.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The reaction between an acid and a base that produces salt and water.', NULL, NULL, NULL, NULL, 'Neutralization', 'The correct term is: Neutralization.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The type of indicator that changes smell instead of color in acids and bases.', NULL, NULL, NULL, NULL, 'Olfactory indicator', 'The correct term is: Olfactory indicator.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The approximate mouth pH at which tooth enamel begins to dissolve.', NULL, NULL, NULL, NULL, 'pH 5.5', 'The correct term is: pH 5.5.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The salt that forms a basic solution when dissolved in water.', NULL, NULL, NULL, NULL, 'Sodium carbonate (Na₂CO₃)', 'The correct term is: Sodium carbonate (Na₂CO₃).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The salt that forms an acidic solution when dissolved in water.', NULL, NULL, NULL, NULL, 'Ammonium chloride (NH₄Cl)', 'The correct term is: Ammonium chloride (NH₄Cl).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The reason dry hydrogen chloride gas does not affect dry blue litmus paper.', NULL, NULL, NULL, NULL, 'No water is present to ionize HCl and produce H⁺ ions', 'The correct term is: No water is present to ionize HCl and produce H⁺ ions.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The factor by which hydrogen ion concentration changes for every one-unit change in pH.', NULL, NULL, NULL, NULL, '10×', 'The correct term is: 10×.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'Arrange the following pH values from strongest acid to strongest base: 2, 6, 7, 9, 12.', NULL, NULL, NULL, NULL, '2 → 6 → 7 → 9 → 12', 'The correct term is: 2 → 6 → 7 → 9 → 12.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The neutral salt produced by the reaction of hydrochloric acid and sodium hydroxide.', NULL, NULL, NULL, NULL, 'Sodium chloride (NaCl)', 'The correct term is: Sodium chloride (NaCl).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The particles that allow acidic and basic solutions to conduct electricity.', NULL, NULL, NULL, NULL, 'Mobile ions', 'The correct term is: Mobile ions.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The safe laboratory practice when diluting concentrated acids.', NULL, NULL, NULL, NULL, 'Pour acid slowly into water while stirring', 'The correct term is: Pour acid slowly into water while stirring.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The gas released when baking soda reacts with an acid.', NULL, NULL, NULL, NULL, 'Carbon dioxide (CO₂)', 'The correct term is: Carbon dioxide (CO₂).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The indicator that remains blue in a basic solution.', NULL, NULL, NULL, NULL, 'Blue litmus paper', 'The correct term is: Blue litmus paper.', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The substance released by bases that gives them their basic properties.', NULL, NULL, NULL, NULL, 'Hydroxide ion (OH⁻)', 'The correct term is: Hydroxide ion (OH⁻).', true),
('b0000000-0000-0000-0000-000000000103', 3, 'The product formed together with water during a neutralization reaction.', NULL, NULL, NULL, NULL, 'Salt', 'The correct term is: Salt.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by A + B → AB.', NULL, NULL, NULL, NULL, 'Combination (Synthesis) reaction', 'The correct term is: Combination (Synthesis) reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by AB → A + B.', NULL, NULL, NULL, NULL, 'Decomposition reaction', 'The correct term is: Decomposition reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction in which a hydrocarbon reacts with oxygen to produce carbon dioxide, water, and heat.', NULL, NULL, NULL, NULL, 'Combustion', 'The correct term is: Combustion.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction between an acid and a base that forms salt and water.', NULL, NULL, NULL, NULL, 'Neutralization (special double displacement)', 'The correct term is: Neutralization (special double displacement).', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by AB + C → AC + B.', NULL, NULL, NULL, NULL, 'Single displacement (Single replacement) reaction', 'The correct term is: Single displacement (Single replacement) reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by AB + CD → AD + CB.', NULL, NULL, NULL, NULL, 'Double displacement (Double replacement) reaction', 'The correct term is: Double displacement (Double replacement) reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction type shown by 2Na + Cl₂ → 2NaCl.', NULL, NULL, NULL, NULL, 'Combination (Synthesis) reaction', 'The correct term is: Combination (Synthesis) reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction type represented by CaCO₃ → CaO + CO₂.', NULL, NULL, NULL, NULL, 'Decomposition reaction', 'The correct term is: Decomposition reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The process by which plants produce glucose from carbon dioxide and water using sunlight.', NULL, NULL, NULL, NULL, 'Photosynthesis', 'The correct term is: Photosynthesis.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The process by which body cells break down glucose to release energy.', NULL, NULL, NULL, NULL, 'Cellular respiration', 'The correct term is: Cellular respiration.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'A reaction in which one reactant breaks down into two or more simpler substances.', NULL, NULL, NULL, NULL, 'Decomposition reaction', 'The correct term is: Decomposition reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The slow oxidation of iron that produces rust.', NULL, NULL, NULL, NULL, 'Oxidation (Corrosion/Rusting)', 'The correct term is: Oxidation (Corrosion/Rusting).', true),
('b0000000-0000-0000-0000-000000000102', 3, 'A reaction that forms an insoluble solid from two solutions.', NULL, NULL, NULL, NULL, 'Precipitation reaction', 'The correct term is: Precipitation reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'A reaction in which one element replaces another element in a compound.', NULL, NULL, NULL, NULL, 'Single displacement reaction', 'The correct term is: Single displacement reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The biological process that is the reverse of photosynthesis.', NULL, NULL, NULL, NULL, 'Cellular respiration', 'The correct term is: Cellular respiration.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by Zn + 2HCl → ZnCl₂ + H₂.', NULL, NULL, NULL, NULL, 'Single displacement reaction', 'The correct term is: Single displacement reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by AgNO₃ + NaCl → AgCl + NaNO₃.', NULL, NULL, NULL, NULL, 'Double displacement with precipitation', 'The correct term is: Double displacement with precipitation.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The combustion of methane represented by CH₄ + 2O₂ → CO₂ + 2H₂O + heat.', NULL, NULL, NULL, NULL, 'Combustion of methane', 'The correct term is: Combustion of methane.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The environmental problem caused when sulfur dioxide and nitrogen oxides react with rainwater.', NULL, NULL, NULL, NULL, 'Acid rain', 'The correct term is: Acid rain.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The process represented by 4Fe + 3O₂ + H₂O → 2Fe₂O₃·H₂O.', NULL, NULL, NULL, NULL, 'Corrosion (Slow oxidation/Rusting)', 'The correct term is: Corrosion (Slow oxidation/Rusting).', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The process that is considered the opposite of cellular respiration.', NULL, NULL, NULL, NULL, 'Photosynthesis', 'The correct term is: Photosynthesis.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction that occurs when acid rain reacts with limestone statues.', NULL, NULL, NULL, NULL, 'Acid-carbonate double displacement reaction', 'The correct term is: Acid-carbonate double displacement reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The greenhouse gas commonly released during the burning of fuels, forests, and volcanic eruptions.', NULL, NULL, NULL, NULL, 'Carbon dioxide (CO₂)', 'The correct term is: Carbon dioxide (CO₂).', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The process by which plants help reduce global warming by removing carbon dioxide from the atmosphere.', NULL, NULL, NULL, NULL, 'Photosynthesis', 'The correct term is: Photosynthesis.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'A reaction that has only one reactant and produces two or more products.', NULL, NULL, NULL, NULL, 'Decomposition reaction', 'The correct term is: Decomposition reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction type represented by 2Mg + O₂ → 2MgO.', NULL, NULL, NULL, NULL, 'Combination and oxidation reaction', 'The correct term is: Combination and oxidation reaction.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction type that always produces heat according to the source material.', NULL, NULL, NULL, NULL, 'Combustion', 'The correct term is: Combustion.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reaction represented by 2H₂O → 2H₂ + O₂ using electricity.', NULL, NULL, NULL, NULL, 'Electrolytic decomposition', 'The correct term is: Electrolytic decomposition.', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The reason iron replaces copper in the reaction Fe + CuSO₄ → FeSO₄ + Cu.', NULL, NULL, NULL, NULL, 'Iron is more reactive than copper (activity series rule)', 'The correct term is: Iron is more reactive than copper (activity series rule).', true),
('b0000000-0000-0000-0000-000000000102', 3, 'The main environmental effects of uncontrolled combustion.', NULL, NULL, NULL, NULL, 'Global warming, acid rain, and air pollution', 'The correct term is: Global warming, acid rain, and air pollution.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The substances found on the left side of a chemical equation.', NULL, NULL, NULL, NULL, 'Reactants', 'The correct term is: Reactants.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The substances found on the right side of a chemical equation.', NULL, NULL, NULL, NULL, 'Products', 'The correct term is: Products.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The meaning of the symbol (aq) in a chemical equation.', NULL, NULL, NULL, NULL, 'Aqueous (dissolved in water)', 'The correct term is: Aqueous (dissolved in water).', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The meaning of the symbol (s) in a chemical equation.', NULL, NULL, NULL, NULL, 'Solid', 'The correct term is: Solid.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The meaning of the symbol (g) in a chemical equation.', NULL, NULL, NULL, NULL, 'Gas', 'The correct term is: Gas.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The scientific law stating that the total mass of reactants equals the total mass of products.', NULL, NULL, NULL, NULL, 'Law of Conservation of Mass', 'The correct term is: Law of Conservation of Mass.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The meaning of the arrow (→) in a chemical equation.', NULL, NULL, NULL, NULL, 'Yields / Produces / Forms', 'The correct term is: Yields / Produces / Forms.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The meaning of the plus sign (+) between reactants.', NULL, NULL, NULL, NULL, 'Reacts with (or "and")', 'The correct term is: Reacts with (or "and").', true),
('b0000000-0000-0000-0000-000000000104', 3, 'A balanced chemical equation has __________ atoms of each element on both sides.', NULL, NULL, NULL, NULL, 'Equal', 'The correct term is: Equal.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'Write the balanced chemical equation for the reaction of hydrogen and oxygen to form water.', NULL, NULL, NULL, NULL, '2H₂ + O₂ → 2H₂O', 'The correct term is: 2H₂ + O₂ → 2H₂O.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The meaning of the symbol (l) in a chemical equation.', NULL, NULL, NULL, NULL, 'Liquid', 'The correct term is: Liquid.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'A number written in front of a chemical formula that indicates the number of molecules or moles.', NULL, NULL, NULL, NULL, 'Coefficient', 'The correct term is: Coefficient.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'A small number written below and to the right of an element symbol showing the number of atoms in one molecule.', NULL, NULL, NULL, NULL, 'Subscript', 'The correct term is: Subscript.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The correct chemical formula for carbon dioxide.', NULL, NULL, NULL, NULL, 'CO₂', 'The correct term is: CO₂.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'In the formula CaCl₂, the subscript "2" refers to the number of __________ atoms.', NULL, NULL, NULL, NULL, 'Chlorine', 'The correct term is: Chlorine.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The only numbers that may be changed when balancing a chemical equation.', NULL, NULL, NULL, NULL, 'Coefficients', 'The correct term is: Coefficients.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'In 3H₂O, identify the large number 3 and the small number 2.', NULL, NULL, NULL, NULL, '3 = Coefficient; 2 = Subscript', 'The correct term is: 3 = Coefficient; 2 = Subscript.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The balanced equation among the following: Ca + Cl₂ → CaCl₂. What is its condition?', NULL, NULL, NULL, NULL, 'Already balanced', 'The correct term is: Already balanced.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The total number of hydrogen atoms in 2H₂SO₄.', NULL, NULL, NULL, NULL, '4 hydrogen atoms', 'The correct term is: 4 hydrogen atoms.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The total number of oxygen atoms in 4Al₂O₃.', NULL, NULL, NULL, NULL, '12 oxygen atoms', 'The correct term is: 12 oxygen atoms.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'In the equation Mg + 2HCl → MgCl₂ + H₂, how many chlorine atoms are present in the product?', NULL, NULL, NULL, NULL, '2 chlorine atoms', 'The correct term is: 2 chlorine atoms.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The first step in balancing any chemical equation.', NULL, NULL, NULL, NULL, 'Count the atoms of each element on both sides', 'The correct term is: Count the atoms of each element on both sides.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The reason chemical equations must be balanced.', NULL, NULL, NULL, NULL, 'To obey the Law of Conservation of Mass', 'The correct term is: To obey the Law of Conservation of Mass.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'If gas escapes from an open container during a reaction, what law still applies?', NULL, NULL, NULL, NULL, 'Law of Conservation of Mass', 'The correct term is: Law of Conservation of Mass.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'In the equation N₂ + H₂ → NH₃, the elements that are initially unbalanced are __________.', NULL, NULL, NULL, NULL, 'Nitrogen and Hydrogen', 'The correct term is: Nitrogen and Hydrogen.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The total number of carbon atoms in 5C₆H₁₂O₆.', NULL, NULL, NULL, NULL, '30 carbon atoms', 'The correct term is: 30 carbon atoms.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'The action that is not allowed when balancing chemical equations.', NULL, NULL, NULL, NULL, 'Changing the subscripts', 'The correct term is: Changing the subscripts.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'Balance the equation: __ H₂ + __ O₂ → __ H₂O.', NULL, NULL, NULL, NULL, '2, 1, 2', 'The correct term is: 2, 1, 2.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'Balance the equation: __ N₂ + __ H₂ → __ NH₃.', NULL, NULL, NULL, NULL, '1, 3, 2', 'The correct term is: 1, 3, 2.', true),
('b0000000-0000-0000-0000-000000000104', 3, 'Balance the equation: __ Al + __ O₂ → __ Al₂O₃.', NULL, NULL, NULL, NULL, '4, 3, 2', 'The correct term is: 4, 3, 2.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The measure of how fast a chemical reaction occurs.', NULL, NULL, NULL, NULL, 'Reaction rate', 'The correct term is: Reaction rate.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The factor that generally increases reaction rate by increasing particle movement.', NULL, NULL, NULL, NULL, 'Temperature', 'The correct term is: Temperature.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A substance that speeds up a reaction without being consumed.', NULL, NULL, NULL, NULL, 'Catalyst', 'The correct term is: Catalyst.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A reaction that releases heat to its surroundings.', NULL, NULL, NULL, NULL, 'Exothermic reaction', 'The correct term is: Exothermic reaction.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A reaction that absorbs heat from its surroundings.', NULL, NULL, NULL, NULL, 'Endothermic reaction', 'The correct term is: Endothermic reaction.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The factor increased when a solid reactant is crushed into smaller pieces.', NULL, NULL, NULL, NULL, 'Surface area', 'The correct term is: Surface area.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The three components of the fire triangle.', NULL, NULL, NULL, NULL, 'Fuel, oxygen, and heat (ignition temperature)', 'The correct term is: Fuel, oxygen, and heat (ignition temperature).', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The factor responsible for slowing food spoilage inside a refrigerator.', NULL, NULL, NULL, NULL, 'Lower temperature', 'The correct term is: Lower temperature.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A substance that slows down a chemical reaction.', NULL, NULL, NULL, NULL, 'Inhibitor', 'The correct term is: Inhibitor.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A common example of an exothermic reaction.', NULL, NULL, NULL, NULL, 'Combustion (burning wood)', 'The correct term is: Combustion (burning wood).', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The minimum amount of energy required for a reaction to begin.', NULL, NULL, NULL, NULL, 'Activation energy', 'The correct term is: Activation energy.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The theory stating that particles must collide with enough energy and proper orientation for a reaction to occur.', NULL, NULL, NULL, NULL, 'Collision theory', 'The correct term is: Collision theory.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The effect of crushing a solid reactant on its reaction rate.', NULL, NULL, NULL, NULL, 'Increases the reaction rate', 'The correct term is: Increases the reaction rate.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The effect of lowering temperature on most chemical reactions.', NULL, NULL, NULL, NULL, 'Slows the reaction rate', 'The correct term is: Slows the reaction rate.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Powdered calcium carbonate reacts faster than marble chips because it has greater __________.', NULL, NULL, NULL, NULL, 'Surface area', 'The correct term is: Surface area.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Concentrated hydrochloric acid reacts faster than dilute hydrochloric acid because of higher __________.', NULL, NULL, NULL, NULL, 'Concentration', 'The correct term is: Concentration.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Biological catalysts found in living organisms.', NULL, NULL, NULL, NULL, 'Enzymes', 'The correct term is: Enzymes.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Water extinguishes fire mainly by removing __________.', NULL, NULL, NULL, NULL, 'Heat', 'The correct term is: Heat.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A fire blanket extinguishes fire by removing __________.', NULL, NULL, NULL, NULL, 'Oxygen', 'The correct term is: Oxygen.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Painting or galvanizing iron prevents rust by blocking contact with __________ and __________.', NULL, NULL, NULL, NULL, 'Oxygen and water (moisture)', 'The correct term is: Oxygen and water (moisture).', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The food preservation method that removes water needed by microorganisms.', NULL, NULL, NULL, NULL, 'Drying, salting, or sugaring', 'The correct term is: Drying, salting, or sugaring.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The food preservation method that kills microorganisms with heat and seals out oxygen.', NULL, NULL, NULL, NULL, 'Canning', 'The correct term is: Canning.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Stirring reactants usually has what effect on reaction rate?', NULL, NULL, NULL, NULL, 'Speeds up the reaction', 'The correct term is: Speeds up the reaction.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'A process that continuously absorbs energy from sunlight.', NULL, NULL, NULL, NULL, 'Photosynthesis', 'The correct term is: Photosynthesis.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The way a catalyst speeds up a reaction.', NULL, NULL, NULL, NULL, 'By lowering the activation energy', 'The correct term is: By lowering the activation energy.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The reason higher temperatures greatly increase reaction rate.', NULL, NULL, NULL, NULL, 'More frequent collisions and more particles have enough energy to react', 'The correct term is: More frequent collisions and more particles have enough energy to react.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The reason explosions occur extremely rapidly.', NULL, NULL, NULL, NULL, 'Instant gas release, heat, and large surface contact', 'The correct term is: Instant gas release, heat, and large surface contact.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'Why does a reaction eventually stop after all reactants are used up?', NULL, NULL, NULL, NULL, 'The reactants are completely used up, so no more effective collisions occur', 'The correct term is: The reactants are completely used up, so no more effective collisions occur.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The device in vehicles that uses catalysts to reduce harmful exhaust gases.', NULL, NULL, NULL, NULL, 'Catalytic converter', 'The correct term is: Catalytic converter.', true),
('b0000000-0000-0000-0000-000000000106', 3, 'The factor increased when oxygen concentration becomes higher, causing fire to burn faster.', NULL, NULL, NULL, NULL, 'Concentration of oxygen (reactant concentration)', 'The correct term is: Concentration of oxygen (reactant concentration).', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The process of maintaining a stable internal environment despite external changes.', NULL, NULL, NULL, NULL, 'Homeostasis', 'The correct term is: Homeostasis.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The two body systems that serve as the main control systems for homeostasis.', NULL, NULL, NULL, NULL, 'Nervous system and Endocrine system', 'The correct term is: Nervous system and Endocrine system.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The type of feedback mechanism that reverses a change and returns the body to its normal condition.', NULL, NULL, NULL, NULL, 'Negative feedback', 'The correct term is: Negative feedback.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The normal or target value maintained by the body during homeostasis.', NULL, NULL, NULL, NULL, 'Set point', 'The correct term is: Set point.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The structure that detects changes in the internal or external environment.', NULL, NULL, NULL, NULL, 'Receptor (Sensor)', 'The correct term is: Receptor (Sensor).', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The structure that carries out the response to restore balance.', NULL, NULL, NULL, NULL, 'Effector', 'The correct term is: Effector.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The main function of negative feedback in the body.', NULL, NULL, NULL, NULL, 'Reverse the change and restore the set point', 'The correct term is: Reverse the change and restore the set point.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The body characteristic that is not maintained by homeostasis according to the lesson.', NULL, NULL, NULL, NULL, 'Constant body height', 'The correct term is: Constant body height.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The part of the brain responsible for regulating body temperature.', NULL, NULL, NULL, NULL, 'Hypothalamus', 'The correct term is: Hypothalamus.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The response of blood vessels in the skin when the body is cold.', NULL, NULL, NULL, NULL, 'Vasoconstriction (blood vessels constrict)', 'The correct term is: Vasoconstriction (blood vessels constrict).', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The body system that uses hormones as chemical messengers.', NULL, NULL, NULL, NULL, 'Endocrine system', 'The correct term is: Endocrine system.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The two hormones responsible for regulating blood glucose levels.', NULL, NULL, NULL, NULL, 'Insulin and Glucagon', 'The correct term is: Insulin and Glucagon.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The hormone released by the pancreas when blood sugar becomes too high.', NULL, NULL, NULL, NULL, 'Insulin', 'The correct term is: Insulin.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The hormone released by the pancreas when blood sugar becomes too low.', NULL, NULL, NULL, NULL, 'Glucagon', 'The correct term is: Glucagon.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The organ that regulates water and salt balance by adjusting urine concentration.', NULL, NULL, NULL, NULL, 'Kidneys', 'The correct term is: Kidneys.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The body''s response that generates heat when a person feels cold.', NULL, NULL, NULL, NULL, 'Shivering', 'The correct term is: Shivering.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The type of feedback mechanism demonstrated by shivering.', NULL, NULL, NULL, NULL, 'Negative feedback', 'The correct term is: Negative feedback.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The relationship between insulin and glucagon in regulating blood sugar.', NULL, NULL, NULL, NULL, 'Opposing negative feedback', 'The correct term is: Opposing negative feedback.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The type of feedback mechanism that amplifies a change away from the set point.', NULL, NULL, NULL, NULL, 'Positive feedback', 'The correct term is: Positive feedback.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The hormone released after eating to lower blood glucose levels.', NULL, NULL, NULL, NULL, 'Insulin', 'The correct term is: Insulin.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The organ that mainly removes waste while helping regulate body fluids.', NULL, NULL, NULL, NULL, 'Kidneys', 'The correct term is: Kidneys.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The two body responses that help lower body temperature when a person becomes too hot.', NULL, NULL, NULL, NULL, 'Sweating and vasodilation', 'The correct term is: Sweating and vasodilation.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'A common example of positive feedback in the human body.', NULL, NULL, NULL, NULL, 'Blood clotting', 'The correct term is: Blood clotting.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'Homeostasis requires a constant supply of what to maintain balance?', NULL, NULL, NULL, NULL, 'Energy', 'The correct term is: Energy.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'If blood pH is not properly maintained, what happens first to many enzymes?', NULL, NULL, NULL, NULL, 'They denature or stop functioning properly', 'The correct term is: They denature or stop functioning properly.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'During exercise, breathing rate increases to maintain the balance of which two gases?', NULL, NULL, NULL, NULL, 'Oxygen (O₂) and Carbon dioxide (CO₂)', 'The correct term is: Oxygen (O₂) and Carbon dioxide (CO₂).', true),
('b0000000-0000-0000-0000-000000000107', 3, 'Arrange the correct sequence of a homeostatic feedback loop.', NULL, NULL, NULL, NULL, 'Stimulus → Receptor → Control Center → Effector → Response', 'The correct term is: Stimulus → Receptor → Control Center → Effector → Response.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The hormone that strengthens uterine contractions during childbirth through positive feedback.', NULL, NULL, NULL, NULL, 'Oxytocin', 'The correct term is: Oxytocin.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The long-term result if homeostasis fails to maintain stable internal conditions.', NULL, NULL, NULL, NULL, 'Disease, organ damage, or death', 'The correct term is: Disease, organ damage, or death.', true),
('b0000000-0000-0000-0000-000000000107', 3, 'The active process that continuously keeps the body''s internal environment stable.', NULL, NULL, NULL, NULL, 'Homeostasis', 'The correct term is: Homeostasis.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The gradual change in the inherited traits of a population over many generations.', NULL, NULL, NULL, NULL, 'Evolution', 'The correct term is: Evolution.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The scientist who proposed natural selection as the primary mechanism of evolution.', NULL, NULL, NULL, NULL, 'Charles Darwin', 'The correct term is: Charles Darwin.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The process in which organisms best adapted to their environment survive and reproduce.', NULL, NULL, NULL, NULL, 'Natural selection', 'The correct term is: Natural selection.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'An inherited characteristic that helps an organism survive and reproduce in its environment.', NULL, NULL, NULL, NULL, 'Adaptation', 'The correct term is: Adaptation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The natural differences in traits among individuals of the same species.', NULL, NULL, NULL, NULL, 'Variation', 'The correct term is: Variation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The passing of genetic traits from parents to offspring.', NULL, NULL, NULL, NULL, 'Heredity (Inheritance)', 'The correct term is: Heredity (Inheritance).', true),
('b0000000-0000-0000-0000-000000000108', 3, 'Preserved remains, traces, or impressions of ancient organisms found in rocks.', NULL, NULL, NULL, NULL, 'Fossils', 'The correct term is: Fossils.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'Body parts with similar internal structures but different functions due to common ancestry.', NULL, NULL, NULL, NULL, 'Homologous structures', 'The correct term is: Homologous structures.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'A reduced structure that has lost most or all of its original function through evolution.', NULL, NULL, NULL, NULL, 'Vestigial structure', 'The correct term is: Vestigial structure.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The study of the geographic distribution of living organisms.', NULL, NULL, NULL, NULL, 'Biogeography', 'The correct term is: Biogeography.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The famous example of evolution involving light and dark peppered moths during the Industrial Revolution.', NULL, NULL, NULL, NULL, 'Natural selection (Peppered moth example)', 'The correct term is: Natural selection (Peppered moth example).', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The type of isolation that occurs when a physical barrier separates populations.', NULL, NULL, NULL, NULL, 'Geographic isolation', 'The correct term is: Geographic isolation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'Structures that perform the same function but have different evolutionary origins.', NULL, NULL, NULL, NULL, 'Analogous structures', 'The correct term is: Analogous structures.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The process that prevents gene flow between separated populations, leading to the formation of new species.', NULL, NULL, NULL, NULL, 'Reproductive isolation', 'The correct term is: Reproductive isolation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'Fossils found in deeper rock layers are generally __________ than those in younger layers.', NULL, NULL, NULL, NULL, 'Simpler and more different from modern organisms', 'The correct term is: Simpler and more different from modern organisms.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The evolutionary explanation for the long necks of giraffes.', NULL, NULL, NULL, NULL, 'Natural selection favored longer-necked giraffes over many generations', 'The correct term is: Natural selection favored longer-necked giraffes over many generations.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The process in which humans choose organisms with desirable traits for breeding.', NULL, NULL, NULL, NULL, 'Artificial selection', 'The correct term is: Artificial selection.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The study of similarities in the early development of embryos as evidence for evolution.', NULL, NULL, NULL, NULL, 'Comparative embryology', 'The correct term is: Comparative embryology.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The type of isolation that occurs when populations do not interbreed because of differences in behavior or breeding time.', NULL, NULL, NULL, NULL, 'Reproductive isolation', 'The correct term is: Reproductive isolation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'A species found naturally in only one geographic location.', NULL, NULL, NULL, NULL, 'Endemic species', 'The correct term is: Endemic species.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The process through which new species are formed.', NULL, NULL, NULL, NULL, 'Speciation', 'The correct term is: Speciation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The primary mechanism of evolution that consistently produces adaptations suited to the environment.', NULL, NULL, NULL, NULL, 'Natural selection', 'The correct term is: Natural selection.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'Tiny unused pelvic bones in modern whales are an example of what type of evolutionary evidence?', NULL, NULL, NULL, NULL, 'Vestigial structure', 'The correct term is: Vestigial structure.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'In science, a well-tested explanation supported by extensive evidence is called a __________.', NULL, NULL, NULL, NULL, 'Scientific theory', 'The correct term is: Scientific theory.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The supercontinent whose existence is supported by matching fossils found in South America and Africa.', NULL, NULL, NULL, NULL, 'Pangaea', 'The correct term is: Pangaea.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'A condition required for natural selection in which inherited differences already exist within a population.', NULL, NULL, NULL, NULL, 'Variation', 'The correct term is: Variation.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'Homologous structures provide evidence that different species share a __________.', NULL, NULL, NULL, NULL, 'Common ancestor', 'The correct term is: Common ancestor.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'During a long drought, finches with larger beaks survived better because of __________.', NULL, NULL, NULL, NULL, 'Natural selection', 'The correct term is: Natural selection.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The movement of individuals between populations that keeps their gene pools similar.', NULL, NULL, NULL, NULL, 'Gene flow', 'The correct term is: Gene flow.', true),
('b0000000-0000-0000-0000-000000000108', 3, 'The strongest evidence for evolution comes from multiple independent lines of evidence, including fossils, homologous structures, DNA similarity, and __________.', NULL, NULL, NULL, NULL, 'Biogeography', 'The correct term is: Biogeography.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'An object that is thrown, kicked, or launched and is acted upon mainly by gravity after release.', NULL, NULL, NULL, NULL, 'Projectile', 'The correct term is: Projectile.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'The curved path followed by a projectile during its motion.', NULL, NULL, NULL, NULL, 'Trajectory', 'The correct term is: Trajectory.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'The two independent motions that combine to produce projectile motion.', NULL, NULL, NULL, NULL, 'Constant horizontal motion and accelerated vertical free fall', 'The correct term is: Constant horizontal motion and accelerated vertical free fall.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'The launch angle that produces the maximum horizontal range on level ground.', NULL, NULL, NULL, NULL, '45°', 'The correct term is: 45°.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'The launch angle that produces the greatest maximum height.', NULL, NULL, NULL, NULL, '90° (straight upward)', 'The correct term is: 90° (straight upward).', true),
('b0000000-0000-0000-0000-000000000301', 3, 'If a ball is thrown horizontally while another is dropped from the same height at the same time, what happens to both balls?', NULL, NULL, NULL, NULL, 'Both hit the ground at the same time', 'The correct term is: Both hit the ground at the same time.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'The horizontal distance traveled by a projectile from launch to landing.', NULL, NULL, NULL, NULL, 'Range', 'The correct term is: Range.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'The greatest vertical distance a projectile reaches above its launch point.', NULL, NULL, NULL, NULL, 'Maximum height', 'The correct term is: Maximum height.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'If the launch angle remains constant, what happens to the range and maximum height as launch speed increases?', NULL, NULL, NULL, NULL, 'Both range and height increase', 'The correct term is: Both range and height increase.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Ignoring air resistance, what is the only force acting on a projectile after it is released?', NULL, NULL, NULL, NULL, 'Gravity', 'The correct term is: Gravity.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Two launch angles that add up to 90° and produce the same range are called what?', NULL, NULL, NULL, NULL, 'Complementary angles', 'The correct term is: Complementary angles.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Between launch angles of 30° and 60° with the same launch speed, which angle produces the greater maximum height?', NULL, NULL, NULL, NULL, '60°', 'The correct term is: 60°.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Why do basketball players often use a high arc when shooting?', NULL, NULL, NULL, NULL, 'More flight time and a better entry angle to the hoop', 'The correct term is: More flight time and a better entry angle to the hoop.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Between launch angles of 20° and 70° with the same launch speed, which angle has the shorter flight time?', NULL, NULL, NULL, NULL, '20°', 'The correct term is: 20°.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'How does the horizontal velocity of a projectile behave during flight when air resistance is ignored?', NULL, NULL, NULL, NULL, 'Remains constant', 'The correct term is: Remains constant.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'What is the vertical velocity of a projectile at the highest point of its trajectory?', NULL, NULL, NULL, NULL, 'Zero', 'The correct term is: Zero.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Compared with the ideal prediction, what effect does air resistance have on a projectile''s range?', NULL, NULL, NULL, NULL, 'Makes the range shorter', 'The correct term is: Makes the range shorter.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'What launch condition helps a long jumper achieve maximum range?', NULL, NULL, NULL, NULL, 'Fast run-up with a launch angle near 45°', 'The correct term is: Fast run-up with a launch angle near 45°.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'If the launch speed doubles while the launch angle remains at 45°, approximately how many times greater will the range become?', NULL, NULL, NULL, NULL, 'Four times', 'The correct term is: Four times.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Which two variables determine the range and maximum height of a projectile?', NULL, NULL, NULL, NULL, 'Launch speed and launch angle', 'The correct term is: Launch speed and launch angle.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'At what point in its flight is a projectile''s total speed the slowest?', NULL, NULL, NULL, NULL, 'At the peak (top of the trajectory)', 'The correct term is: At the peak (top of the trajectory).', true),
('b0000000-0000-0000-0000-000000000301', 3, 'At what positions along the trajectory does a projectile have equal speed due to symmetry?', NULL, NULL, NULL, NULL, 'Any two points at the same height above the launch point', 'The correct term is: Any two points at the same height above the launch point.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Why do archers aim slightly above the target?', NULL, NULL, NULL, NULL, 'To compensate for gravity pulling the arrow downward', 'The correct term is: To compensate for gravity pulling the arrow downward.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Which pair of launch angles produces the same range but different maximum heights?', NULL, NULL, NULL, NULL, 'Any pair of complementary angles (e.g., 40° and 50°)', 'The correct term is: Any pair of complementary angles (e.g., 40° and 50°).', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Does horizontal motion affect the time required for vertical free fall?', NULL, NULL, NULL, NULL, 'No', 'The correct term is: No.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'As the launch angle increases from 0° to 45° to 90°, how do the range and maximum height change?', NULL, NULL, NULL, NULL, 'Range peaks at 45° then decreases; maximum height continues to increase', 'The correct term is: Range peaks at 45° then decreases; maximum height continues to increase.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Why does a launch angle of 45° produce the maximum range on level ground?', NULL, NULL, NULL, NULL, 'It balances horizontal speed and flight time', 'The correct term is: It balances horizontal speed and flight time.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'In an experiment with a fixed launch angle, how does increasing launch speed affect the range?', NULL, NULL, NULL, NULL, 'It increases approximately as the square of the launch speed', 'The correct term is: It increases approximately as the square of the launch speed.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'Which of the following is not an example of projectile motion?', NULL, NULL, NULL, NULL, 'Driving a car on a straight, flat road', 'The correct term is: Driving a car on a straight, flat road.', true),
('b0000000-0000-0000-0000-000000000301', 3, 'What is the shape of the ideal path followed by a projectile?', NULL, NULL, NULL, NULL, 'Parabola', 'The correct term is: Parabola.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The quantity defined as the product of an object''s mass and velocity.', NULL, NULL, NULL, NULL, 'Momentum', 'The correct term is: Momentum.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The formula used to calculate momentum.', NULL, NULL, NULL, NULL, 'p = m × v', 'The correct term is: p = m × v.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Momentum describes how difficult it is to __________ a moving object.', NULL, NULL, NULL, NULL, 'Stop', 'The correct term is: Stop.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The two factors that determine an object''s momentum.', NULL, NULL, NULL, NULL, 'Mass and velocity', 'The correct term is: Mass and velocity.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'A collision in which no kinetic energy is lost and the objects bounce apart.', NULL, NULL, NULL, NULL, 'Elastic collision', 'The correct term is: Elastic collision.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'A collision in which the objects stick together or deform, causing kinetic energy to decrease.', NULL, NULL, NULL, NULL, 'Inelastic collision', 'The correct term is: Inelastic collision.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'In an isolated system, the total momentum before a collision is equal to the total momentum __________.', NULL, NULL, NULL, NULL, 'After the collision', 'The correct term is: After the collision.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The product of force and the time during which it acts.', NULL, NULL, NULL, NULL, 'Impulse', 'The correct term is: Impulse.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Seatbelts and airbags reduce the force during a collision by increasing the __________.', NULL, NULL, NULL, NULL, 'Stopping time (impact time)', 'The correct term is: Stopping time (impact time).', true),
('b0000000-0000-0000-0000-000000000302', 3, 'For objects with equal mass, what happens to momentum as speed increases?', NULL, NULL, NULL, NULL, 'Momentum increases', 'The correct term is: Momentum increases.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Billiard balls colliding and bouncing off with nearly the same speed are an example of what type of collision?', NULL, NULL, NULL, NULL, 'Nearly elastic collision', 'The correct term is: Nearly elastic collision.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Train cars coupling together after a collision demonstrate what type of collision?', NULL, NULL, NULL, NULL, 'Perfectly inelastic collision', 'The correct term is: Perfectly inelastic collision.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Between a jeepney and a motorcycle traveling at the same speed, which has the greater momentum?', NULL, NULL, NULL, NULL, 'Jeepney', 'The correct term is: Jeepney.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Catching an egg by moving your hand backward increases the __________, reducing the force on the egg.', NULL, NULL, NULL, NULL, 'Impact time (stopping time)', 'The correct term is: Impact time (stopping time).', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The recoil of a cannon after firing is explained by what physical principle?', NULL, NULL, NULL, NULL, 'Conservation of momentum', 'The correct term is: Conservation of momentum.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Crumple zones in vehicles reduce the force of impact by increasing the __________ and __________.', NULL, NULL, NULL, NULL, 'Stopping distance and stopping time', 'The correct term is: Stopping distance and stopping time.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'In any collision involving an isolated system, what quantity is always conserved?', NULL, NULL, NULL, NULL, 'Total momentum', 'The correct term is: Total momentum.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The form of energy that is conserved only in elastic collisions.', NULL, NULL, NULL, NULL, 'Kinetic energy', 'The correct term is: Kinetic energy.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'A 1 kg object moving at 5 m/s sticks to a 4 kg object at rest. What is their final speed?', NULL, NULL, NULL, NULL, '1 m/s', 'The correct term is: 1 m/s.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Why is falling onto a mattress less painful than falling onto concrete?', NULL, NULL, NULL, NULL, 'Longer stopping time results in a smaller force', 'The correct term is: Longer stopping time results in a smaller force.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Momentum is the product of what two quantities?', NULL, NULL, NULL, NULL, 'Mass and velocity', 'The correct term is: Mass and velocity.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Two balls moving at equal speeds toward each other and bouncing apart demonstrate what type of collision?', NULL, NULL, NULL, NULL, 'Elastic collision', 'The correct term is: Elastic collision.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'A boxer''s punch has large momentum mainly because of the __________ of the fist.', NULL, NULL, NULL, NULL, 'High velocity', 'The correct term is: High velocity.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'During a car crash, what effect does a longer impact time have on the force experienced?', NULL, NULL, NULL, NULL, 'It reduces the force', 'The correct term is: It reduces the force.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'The recoil of a fire hose when water is released demonstrates what law?', NULL, NULL, NULL, NULL, 'Conservation of momentum', 'The correct term is: Conservation of momentum.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'According to the impulse-momentum theorem, the product of force and time equals the __________.', NULL, NULL, NULL, NULL, 'Change in momentum (Δp)', 'The correct term is: Change in momentum (Δp).', true),
('b0000000-0000-0000-0000-000000000302', 3, 'What is the main difference between elastic and inelastic collisions?', NULL, NULL, NULL, NULL, 'Kinetic energy is conserved in elastic collisions but not in inelastic collisions; momentum', 'The correct term is: Kinetic energy is conserved in elastic collisions but not in inelastic collisions; momentum.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'When momentum is conserved during a collision, what quantity is exchanged between the objects?', NULL, NULL, NULL, NULL, 'Momentum', 'The correct term is: Momentum.', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Which object is harder to stop: a heavy, slow-moving object or a light, fast-moving object?', NULL, NULL, NULL, NULL, 'It depends on the product of mass and velocity (momentum)', 'The correct term is: It depends on the product of mass and velocity (momentum).', true),
('b0000000-0000-0000-0000-000000000302', 3, 'Safety devices such as airbags and seatbelts reduce injuries by increasing __________ to decrease force.', NULL, NULL, NULL, NULL, 'Stopping time', 'The correct term is: Stopping time.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Energy sources that are depleted after use and require millions of years to form.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Energy sources that are naturally replenished within a relatively short period of time.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'The primary source of electricity generation in the Philippines today.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'The renewable energy resource in which the Philippines ranks second in the world.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'The greenhouse gas mainly released when fossil fuels are burned.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Energy produced from the movement or falling of water.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Energy obtained directly from sunlight.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Energy produced from organic materials such as agricultural waste, wood, and crops.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'The major nonrenewable natural gas source in the Philippines.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Why do renewable energy sources help reduce climate change?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Identify the group composed only of nonrenewable energy sources.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Identify the group composed only of renewable energy sources commonly used in the Philippines.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'What is the major environmental effect of coal-fired power plants?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'What is the primary disadvantage of constructing large hydroelectric dams?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Why is geothermal energy highly suitable for the Philippines?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'What economic benefit results from increasing the use of renewable energy sources?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Solar and wind energy are classified as what type of energy sources because their output depends on weather conditions?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Why is natural gas considered a transition fuel?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Replacing coal-fired power plants helps reduce what health problem?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'State one major advantage of wind energy.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Compare the long-term cost of renewable energy with fossil fuels.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'The Philippine goal of achieving 35% renewable energy by 2030 and 50% by 2040 primarily supports what two objectives?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Geothermal and hydropower are classified as what type of renewable energy because they can provide continuous electricity?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'What social issue is commonly associated with large energy development projects?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Besides fuel costs, what other impacts should be included in the true cost of energy production?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Coal ash and mining waste may release what harmful materials into the environment?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Energy choices affect what four important aspects of society and electricity use?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Give a reliable clean energy mix recommended for the Philippines.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Why are renewable energy prices generally more stable than fossil fuel prices?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Why is learning about renewable and nonrenewable energy important for students?', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Nonrenewable energy', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Renewable energy', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Coal', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Geothermal energy', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Carbon dioxide (CO₂)', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Hydropower (Hydroelectric power)', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Solar energy', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Biomass energy', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Natural gas (Malampaya)', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'They emit little to no CO₂ during operation', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Coal, oil, and natural gas', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Geothermal, hydropower, solar, wind, and biomass', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Air pollution and high carbon dioxide emissions', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Flooding and displacement of communities', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'The Philippines is located along the Ring of Fire', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Lower fuel imports and greater price stability', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Intermittent energy sources', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'It is cleaner than coal but is still a finite fossil fuel', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Respiratory illnesses caused by air pollution', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Free fuel and low emissions', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Renewable energy has higher installation costs but lower long-term operating costs', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Climate goals and energy security', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Baseload renewable energy sources', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Local communities often bear the negative impacts of the projects', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Health, environmental, and climate impacts', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Toxic substances', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Cost, reliability, emissions, and electricity bills', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Geothermal + Hydropower + Solar + Wind + Energy Storage', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'They have no fuel cost once the facilities are built', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000304', 3, 'Because today''s energy choices will affect people''s lives and the environment in the future.', NULL, NULL, NULL, NULL, 'Science', 'The correct term is: Science.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which of the following is a CHEMICAL change?', 'Dissolving sugar in water', 'Melting ice cream', 'Cutting paper', 'Rotting of tomatoes', 'D', 'Rotting forms new substances; others only change appearance.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which shows ONLY a PHYSICAL change?', 'Crushing chunks of ice', 'Rusting of iron', 'Burning wood', 'Milk turning sour', 'A', 'Ice is still water; no new substance formed.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'What is the MAIN difference between chemical and physical change?', 'Physical change cannot be reversed', 'Physical change always releases heat', 'Chemical change produces a NEW substance', 'Chemical change is always faster', 'C', 'Composition changes in chemical change; stays the same in physical.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which of these is a CHEMICAL change?', 'Opening a soda can', 'Photosynthesis in plants', 'Painting wood', 'Bending metal', 'B', 'Plants turn CO₂ and water into glucose and oxygen.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Bubbles forming when vinegar is mixed with baking soda is evidence of:', 'Evolution of gas', 'Color change', 'Physical change only', 'Precipitate formation', 'A', 'Bubbles indicate CO₂ gas is released.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Curdling of milk into lumpy solids is an example of which evidence?', 'Temperature drop only', 'Gas evolution', 'Production of light', 'Formation of a precipitate', 'D', 'A precipitate is an insoluble solid formed during a reaction.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Mixing quicklime and water makes the container feel hot. What evidence is this?', 'Color change', 'Change in temperature', 'Gas formation', 'Precipitate formation', 'B', 'Heat released indicates an exothermic chemical reaction.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which is NOT evidence that a chemical reaction occurred?', 'Production of light (like burning)', 'Formation of gas bubbles', 'Change in shape only by cutting', 'Change in color', 'C', 'Cutting changes only the shape, not the substance.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'A student mixes two clear liquids and a yellow solid settles at the bottom. This is:', 'Precipitate formation', 'Physical change', 'Gas evolution', 'Boiling', 'A', 'Formation of a solid from two liquids is a precipitate.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'In a chemical equation, substances on the LEFT side of the arrow are called:', 'Coefficients', 'Products', 'Precipitates', 'Reactants', 'D', 'Reactants are the starting substances.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Substances written on the RIGHT side of the arrow are:', 'Symbols only', 'Products', 'Reactants', 'Gases always', 'B', 'Products are the new substances formed.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'What does the symbol (aq) mean in a chemical equation?', 'Solid precipitate', 'Gaseous state', 'Dissolved in water (aqueous)', 'Liquid pure substance', 'C', 'Aqueous means dissolved in water.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'The symbol Δ written above the arrow means:', 'Heat is supplied to the reaction', 'Gas is released', 'A precipitate forms', 'Reaction is reversible', 'A', 'Δ indicates heat is added.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'The downward arrow (↓) next to a product means:', 'Heat released', 'Gas evolved', 'Liquid product', 'A solid precipitate was formed', 'D', 'The downward arrow indicates a precipitate.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'What does the + sign between reactants mean?', 'Heat is added', 'Substances are mixed / added together', '"Yields" or "produces"', 'Only one reacts', 'B', 'The plus sign means "reacts with" or "and."', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which general equation represents COMBINATION (Synthesis)?', 'AB + CD → AD + CB', 'A + B → AB', 'AB → A + B', 'AB + C → AC + B', 'B', 'Two or more reactants form ONE product.', true),
('b0000000-0000-0000-0000-000000000101', 1, '2Na + Cl₂ → 2NaCl is an example of:', 'Single displacement', 'Combustion', 'Decomposition', 'Combination', 'D', 'Na + Cl combine to make one product, NaCl.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'The reaction CaCO₃ → CaO + CO₂ is classified as:', 'Combination', 'Double displacement', 'Decomposition', 'Acid-base reaction', 'C', 'One reactant breaks down into two simpler substances.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'What is the general form of DECOMPOSITION?', 'AB + C → AC + B', 'Acid + Base → Salt + Water', 'A + B → AB', 'AB → A + B', 'D', 'Opposite of combination; one becomes two or more substances.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Pb + FeSO₄ → PbSO₄ + Fe is which type?', 'Single displacement', 'Double displacement', 'Combustion', 'Decomposition', 'A', 'Pb replaces Fe in the compound.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'In SINGLE DISPLACEMENT, what happens?', 'Ions of two compounds swap', 'One element replaces another element in a compound', 'One compound splits into two', 'Oxygen reacts with a hydrocarbon', 'B', 'General form: AB + C → AC + B.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'AgNO₃ + NaCl → AgCl↓ + NaNO₃ is:', 'Decomposition', 'Combination', 'Double displacement', 'Single displacement', 'C', 'Ag⁺ and Na⁺ exchange partners.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which is ALWAYS a reactant in COMBUSTION reactions?', 'Water', 'Nitrogen', 'Carbon dioxide', 'Oxygen gas (O₂)', 'D', 'Combustion always requires oxygen.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Combustion of a hydrocarbon always produces these two products:', 'Carbon dioxide (CO₂) and Water (H₂O)', 'Oxygen and hydrogen', 'Salt and water', 'Metal oxide and gas', 'A', 'Hydrocarbon + O₂ → CO₂ + H₂O.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'HBr + NaOH → NaBr + H₂O is an example of:', 'Combustion', 'Acid-Base / Neutralization', 'Decomposition', 'Single displacement', 'B', 'Acid + Base → Salt + Water.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Neutralization is a special type of:', 'Decomposition', 'Combination', 'Combustion', 'Double displacement', 'D', 'H⁺ from the acid and the metal from the base exchange places.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which change is reversible and only alters form?', 'Digesting food', 'Tarnishing silver', 'Melting wax', 'Burning wood', 'C', 'Melting is a physical change.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which observation does NOT suggest a chemical change?', 'Permanent color change', 'Light and heat given off', 'Salt dissolving in water', 'New solid not easily separated', 'C', 'Dissolving salt is a physical change.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'In the equation Mg + O₂ → MgO, what is magnesium oxide?', 'Catalyst', 'Product', 'Gas', 'Reactant', 'B', 'It is on the right side of the arrow.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which reaction type is: Fuel + O₂ → CO₂ + H₂O?', 'Decomposition', 'Synthesis', 'Single displacement', 'Combustion', 'D', 'Burning a fuel in oxygen is combustion.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'What does the arrow (→) mean in a chemical equation?', 'Reacts with', 'Yields / produces', 'Dissolves in', 'Equals', 'B', 'The arrow separates reactants from products.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which is a decomposition reaction?', 'Zn + 2HCl → ZnCl₂ + H₂', '2H₂ + O₂ → 2H₂O', '2H₂O₂ → 2H₂O + O₂', 'NaOH + HCl → NaCl + H₂O', 'C', 'One reactant breaks into two products.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'A reaction where two compounds exchange ions is called:', 'Double displacement', 'Single displacement', 'Decomposition', 'Synthesis', 'A', 'The ions swap partners.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which is an example of synthesis?', 'Sodium chloride + Silver nitrate → Silver chloride + Sodium nitrate', 'Water → Hydrogen + Oxygen', 'Iron + Sulfur → Iron sulfide', 'Wood + Oxygen → Ash + CO₂', 'C', 'Two elements combine to form one compound.', true),
('b0000000-0000-0000-0000-000000000101', 1, 'Which symbol shows a gaseous product?', '(l)', '(aq)', '(s)', '(g) or ↑', 'D', '(g) or an upward arrow indicates a gas.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which is a property of ALL acids?', 'Bitter taste', 'Soapy feel', 'pH > 7', 'Sour taste; turns blue litmus RED', 'D', 'Classic acid property (vinegar, calamansi).', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Bases turn red litmus paper:', 'Yellow', 'Blue', 'Colorless', 'Red', 'B', 'Mnemonic: Base turns Red litmus Blue.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Pure water at 25°C has pH:', '14', '5', '7', '0', 'C', 'pH 7 is neutral.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Phenolphthalein is colorless in acid and ______ in base.', 'Green', 'Yellow', 'Bright pink', 'Red', 'C', 'Standard indicator rule.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which ion do acids release in water?', 'Cl⁻', 'Na⁺', 'OH⁻', 'H⁺ / H₃O⁺', 'D', 'Arrhenius definition of an acid.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Bases release which ion in water?', 'O²⁻', 'OH⁻ (hydroxide)', 'H₃O⁺', 'H⁺', 'B', 'Arrhenius definition of a base.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Common table salt (saline solution) is chemically:', 'NaOH', 'KCl', 'NaCl', 'HCl', 'C', 'Sodium chloride is a neutral salt.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Hydrochloric acid found in the stomach has formula:', 'CH₃COOH', 'HCl', 'H₂SO₄', 'HNO₃', 'B', 'HCl is gastric acid.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Sodium hydroxide, a common strong base (lye), has formula:', 'NH₄OH', 'NaCl', 'NaOH', 'Ca(OH)₂', 'C', 'NaOH is caustic soda.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Methyl orange is ____ in acid and ____ in base.', 'Blue / Red', 'Red / Yellow', 'Yellow / Red', 'Pink / Colorless', 'B', 'Standard synthetic indicator.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which is a natural indicator?', 'Litmus paper only', 'Turmeric', 'Phenolphthalein', 'Methyl orange', 'B', 'Turmeric, red cabbage, and onion are natural indicators.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'A solution with pH 7 is:', 'Basic', 'Strongly acidic', 'Neutral', 'Acidic', 'C', 'Equal H⁺ and OH⁻ concentration.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which acid is found in vinegar?', 'Sulfuric acid', 'Acetic acid', 'Citric acid', 'HCl', 'B', 'Acetic acid gives vinegar its sour taste.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which base is found in antacids like milk of magnesia?', 'NaOH', 'NH₄OH', 'KOH', 'Mg(OH)₂', 'D', 'Neutralizes excess stomach acid.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'When blue litmus paper is placed in a base, it stays:', 'Green', 'Blue', 'Colorless', 'Red', 'B', 'Blue litmus remains blue in a base.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which set are ALL ACIDS?', 'Soap, detergent, antacid', 'NaOH, KOH, Ca(OH)₂', 'HCl, vinegar, calamansi juice', 'NaCl, baking soda, bleach', 'C', 'All are acids.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which set are ALL BASES?', 'Salt, sugar, water', 'NaOH, bleach, milk of magnesia', 'Vinegar, lemon, soda', 'HCl, HNO₃, H₂SO₄', 'B', 'All are bases.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Antacids (Kremil-S) fight hyperacidity because they are:', 'Neutral salts', 'Strong acids', 'Indicators', 'Weak bases', 'D', 'Mild bases neutralize stomach acid.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'A solution with pH = 4 is:', 'Neutral', 'Strongly acidic', 'Weak base', 'Weak acid', 'B', 'Lower pH means stronger acidity.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'pH = 11 is classified as:', 'Neutral', 'Acidic', 'Strongly basic / alkaline', 'Weakly acidic', 'C', 'High pH indicates a strong base.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which pH is the WEAKEST acid?', 'pH 8', 'pH 3', 'pH 6', 'pH 1', 'C', 'Closest to 7 on the acidic side.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Acid + Base → Salt + Water. This reaction is:', 'Combination', 'Decomposition', 'Neutralization', 'Combustion', 'C', 'Neutralization cancels acidic and basic properties.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Turmeric stain turns reddish-brown when soap is applied because soap is:', 'Basic', 'Neutral', 'Acidic', 'A salt', 'A', 'Turmeric turns reddish-brown in a base.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Onion and vanilla change SMELL in acids/bases. They are:', 'Catalysts', 'Olfactory indicators', 'Synthetic indicators', 'Natural color indicators', 'B', 'They indicate acidity/basicity through smell.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Tooth decay starts when mouth pH:', 'Equals 7', 'Is exactly 9', 'Drops below 5.5', 'Rises above 8', 'C', 'Enamel begins dissolving below pH 5.5.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which salt is basic when dissolved in water?', 'NH₄Cl', 'KNO₃', 'NaCl', 'Na₂CO₃', 'D', 'Sodium carbonate forms a basic solution.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which salt is acidic when dissolved in water?', 'KCl', 'NH₄Cl', 'CH₃COONa', 'Na₂SO₄', 'B', 'Ammonium chloride forms an acidic solution.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Dry HCl gas does NOT change dry blue litmus. Why?', 'Litmus only works in bases', 'Dry HCl is a base', 'HCl is not an acid', 'No water → no free H⁺ ions', 'D', 'Water is needed for HCl to ionize.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Each pH unit = ______ change in H⁺ concentration.', '100×', '10×', '5×', '2×', 'B', 'The pH scale is logarithmic.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Arrange STRONGEST ACID → STRONGEST BASE: pH 2, pH 12, pH 6, pH 7, pH 9.', '12 → 9 → 7 → 6 → 2', '2 → 7 → 6 → 9 → 12', '2 → 6 → 7 → 9 → 12', '7 → 2 → 6 → 9 → 12', 'C', 'Lowest pH is the strongest acid.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which salt comes from a strong acid + strong base (neutral pH ≈ 7)?', 'Sodium carbonate', 'Sodium chloride (NaCl)', 'Ammonium chloride', 'Sodium acetate', 'B', 'HCl + NaOH → NaCl + H₂O.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Acidic/basic solutions conduct electricity because they have:', 'Neutral molecules', 'Metal atoms', 'Mobile ions', 'Free electrons', 'C', 'Ions carry electric current.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'When diluting concentrated acid in the lab, ALWAYS:', 'Heat first', 'Pour acid SLOWLY into water with stirring', 'Pour water into acid', 'Mix fast in any order', 'B', 'This prevents dangerous splashing.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Which is a WEAK acid found in vinegar?', 'H₂SO₄', 'HCl', 'CH₃COOH (acetic acid)', 'HNO₃', 'C', 'Acetic acid is the acid in vinegar.', true),
('b0000000-0000-0000-0000-000000000103', 1, 'Baking soda (NaHCO₃) reacts with acids to release:', 'O₂', 'N₂', 'CO₂ gas', 'H₂', 'C', 'Acid + bicarbonate → salt + H₂O + CO₂. 
 
Here''s Group 2 with the correct answers randomized (no obvious pattern). I only changed the order of the choices while 
keeping the questions and explanations the same. 
________________________________________ 
Group 2 · TYPES OF CHEMICAL REACTIONS IN THE ENVIRONMENT 
1. A + B → AB is: 
A. Single displacement 
B. Combustion 
C. Combination / Synthesis    
D. Decomposition 
2. AB → A + B is: 
A. Combination 
B. Double displacement 
C. Neutralization 
D. Decomposition    
3. Hydrocarbon + O₂ → CO₂ + H₂O + heat is: 
A. Combustion    
B. Acid base 
C. Precipitation 
D. Decomposition 
4. Acid + Base → Salt + Water is: 
A. Decomposition 
B. Single replacement 
C. Neutralization (special double displacement)    
D. Combustion 
5. AB + C → AC + B is: 
A. Synthesis 
B. Decomposition 
C. Single Displacement / Replacement    
D. Double displacement 
6. AB + CD → AD + CB is: 
A. Combination 
B. Double Displacement / Replacement    
C. Combustion 
D. Single displacement 
7. 2Na + Cl₂ → 2NaCl is: 
A. Combustion 
B. Single displacement 
C. Combination    
D. Decomposition 
8. CaCO₃ → CaO + CO₂ is: 
A. Acid base 
B. Combination 
C. Double displacement 
D. Decomposition    
9. Plants build glucose from CO₂ + H₂O using sunlight. This is: 
A. Corrosion 
B. Photosynthesis (combination / endothermic)    
C. Respiration 
D. Combustion 
10. Glucose + O₂ → CO₂ + H₂O + energy in body cells is: 
A. Cellular Respiration (exothermic)    
B. Photosynthesis 
C. Decomposition 
D. Combustion only 
11. Which reaction involves one reactant breaking down into many? 
A. Neutralization 
B. Single replacement 
C. Decomposition    
D. Synthesis 
12. Rusting of iron is an example of: 
A. Photosynthesis 
B. Neutralization 
C. Combustion 
D. Oxidation / Corrosion    
13. Precipitation reactions form: 
A. Insoluble solid    
B. Gas only 
C. Water only 
D. No new substance 
14. In a single displacement reaction: 
A. All substances combine 
B. One element swaps place with another    
C. One compound splits 
D. Nothing changes 
15. Photosynthesis is the reverse of: 
A. Acid rain 
B. Combustion 
C. Respiration    
D. Decomposition 
16. Zn + 2HCl → ZnCl₂ + H₂↑ is: 
A. Combination 
B. Decomposition 
C. Double displacement 
D. Single displacement (metal replaces H in acid)    
17. AgNO₃ + NaCl → AgCl↓ + NaNO₃ is: 
A. Combustion 
B. Synthesis 
C. Double displacement + precipitation    
D. Single displacement 
18. CH₄ + 2O₂ → CO₂ + 2H₂O + heat is: 
A. Neutralization 
B. Decomposition 
C. Photosynthesis 
D. Combustion of methane (natural gas)    
19. SO₂ + NOₓ from vehicles + rain → 
A. Ozone 
B. Freshwater 
C. Acid rain    
D. Neutral water 
20. 4Fe + 3O₂ + H₂O → 2Fe₂O₃·H₂O (rust) is called: 
A. Corrosion / slow oxidation    
B. Combustion 
C. Neutralization 
D. Single displacement 
21. Which reaction is OPPOSITE of photosynthesis? 
A. Neutralization 
B. Corrosion 
C. Acid rain 
D. Cellular respiration    
22. Limestone statues dissolve in acid rain via: 
A. Photosynthesis 
B. Acid Carbonate double displacement    
C. Combustion 
D. Synthesis 
23. Burning gasoline, forests, volcanoes all add what to atmosphere? 
A. Water only 
B. Nitrogen only 
C. CO₂ (greenhouse gas) + acid rain gases    
D. Oxygen 
24. How does photosynthesis help fight global warming? 
A. Makes acid rain 
B. Produces heat 
C. Releases CO₂ 
D. Absorbs / removes CO₂; releases O₂    
25. A reaction has only ONE reactant. It MUST be: 
A. Single displacement 
B. Decomposition    
C. Combination 
D. Combustion 
26. Burning magnesium ribbon: 2Mg + O₂ → 2MgO is: 
A. Neutralization 
B. Combination + oxidation    
C. Double displacement 
D. Decomposition 
27. Which reaction type always produces heat? 
A. Electrolysis 
B. Melting 
C. Combustion    
D. Photosynthesis 
28. 2H₂O → 2H₂↑ + O₂↑ (with electricity) is: 
A. Combustion 
B. Single displacement 
C. Combination 
D. Electrolytic Decomposition    
29. Fe + CuSO₄ → FeSO₄ + Cu. Why does Fe replace Cu? 
A. Cu more active 
B. Random 
C. Fe is MORE reactive (activity series rule)    
D. Fe is lighter 
30. Which environmental reaction is BOTH combination AND exothermic? 
A. Corrosion only 
B. Electrolysis 
C. Formation of acid rain gases in atmosphere    
D. Photosynthesis 
31. Acid rain reacting with steel bridges is which type? 
A. Decomposition 
B. Single displacement (acid + metal)    
C. Combustion 
D. Precipitation 
32. A reaction has O₂ as reactant AND releases heat. It is almost always: 
A. Combustion    
B. Neutralization 
C. Decomposition 
D. Precipitation 
33. Which correctly classifies respiration? 
A. Single replacement 
B. Endothermic decomposition 
C. Exothermic combustion-like oxidation    
D. Endothermic combination 
34. The main environmental impact of uncontrolled combustion is: 
A. Only corrosion 
B. Global warming + acid rain + air pollution    
C. Ozone layer only 
D. Only photosynthesis increase 
35. CaCO₃ (coral/shells) + ocean acidification causes: 
A. Respiration decrease 
B. Coral growth 
C. Photosynthesis 
D. Double displacement dissolving coral skeletons    
This version avoids the repetitive "B" pattern by distributing the correct answers across A, B, C, and D while keeping the 
content unchanged. 
 
   
Group 4 · CHEMICAL EQUATIONS (only use 15 questions in every pretest topic, this will be rephrased and randomized each 
playthrough)  
  
1. Left side of the arrow (→) contains:  
A. Products B. Reactants C. Coefficients D. Catalysts  
   B — Starting materials you put in.  
2. Right side of the arrow contains:  
A. Reactants B. Products C. Subscripts D. Heat  
   B — New substances formed.  
3. (aq) in equations means:  
A. Gas B. Pure liquid C. Aqueous / dissolved in water D. Solid  
   C — From Latin aqua = water.  
4. (s) means:  
A. Gas B. Solid C. Solution D. Catalyst  
   B — Solid state of matter.  
5. (g) means:  
A. Gas B. Liquid C. Aqueous D. Precipitate  
   A — Gaseous state.  
6. Law of Conservation of Mass says:  
A. Mass can be created B. Mass can be destroyed C. Total mass reactants = total mass products; atoms rearranged only D. 
Mass always increases  
   C — Lavoisier’s fundamental law.  
7. The arrow → is read as:  
A. equals B. yields / produces / forms C. plus D. reacts with  
   B — Standard chemical equation terminology.  
8.   
o between reactants is read as:  
A. yields B. reacts with / and C. produces D. equals  
   B — Separates substances being mixed.  
9. Balanced equations have ______ atoms of each element on both sides.  
A. different B. equal C. increasing D. random  
   B — Required by conservation of mass.  
10. Word equation: Hydrogen + Oxygen → Water. Formula version:  
A. H + O → HO B. 2H₂ + O₂ → 2H₂O C. H₂ + O → H₂O D. H₂O → H₂ + O₂  
   B — Correct formulas + balanced.  
11. Symbol (l) stands for:  
A. Solid B. Liquid C. Gas D. Dissolved  
   B — Pure liquid state.  
12. A coefficient tells you:  
A. Number of atoms in a molecule B. Number of molecules / moles of substance C. Charge of the ion D. Type of reaction  
   B — Multiplies every atom in that formula.  
13. A subscript tells you:  
A. Number of molecules B. Number of that specific atom in one molecule C. Mass of the substance D. Speed of reaction  
   B — H₂O = 2 H, 1 O per molecule.  
14. Which is the correct formula for carbon dioxide?  
A. CO B. CO₂ C. C₂O D. CO₃  
   B — One carbon, two oxygen atoms.  
15. In CaCl₂, the subscript “2” refers to:  
A. Calcium atoms B. Chlorine atoms C. Total molecules D. Charge  
   B — Two chlorine atoms bonded to one calcium.  
16. When balancing, you may ONLY change:  
A. Subscripts B. Coefficients (big front numbers) C. Formulas D. Element symbols  
   B — Changing subscripts changes the substance itself!  
17. In 3 H₂O, “3” is a ______; small “2” is a ______.  
A. subscript / coefficient B. coefficient / subscript C. reactant / product D. symbol / formula  
   B — Coefficient × subscript = total atoms.  
18. Which is already BALANCED?  
A. H₂ + O₂ → H₂O B. Ca + Cl₂ → CaCl₂ C. Na + Cl₂ → NaCl D. Fe + O₂ → Fe₂O₃  
   B — 1 Ca, 2 Cl each side.  
19. In 2 H₂SO₄, total H atoms = ?  
A. 2 B. 4 C. 6 D. 8  
   B — 2 × 2 = 4 H atoms total.  
20. In 4 Al₂O₃, total O atoms = ?  
A. 3 B. 7 C. 12 D. 8  
   C — 4 × 3 = 12 O atoms.  
21. In Mg + 2HCl → MgCl₂ + H₂, how many Cl on product side?  
A. 1 B. 2 C. 3 D. 4  
   B — Subscript 2 on Cl in MgCl₂.  
22. First step in balancing any equation:  
A. Add coefficients randomly B. Change subscripts C. Count atoms of each element on BOTH sides D. Add water  
   C — Know what you have before adjusting.  
23. Why must equations be balanced?  
A. Teacher rule B. To obey Law of Conservation of Mass C. To look nice D. To speed reaction  
   B — Atoms are never created/destroyed.  
24. Open beaker releases gas; measured mass drops. Conservation law?  
A. Broken B. Still holds — gas escaped; total mass of all matter unchanged C. Only applies in labs D. Atoms destroyed  
   B — Closed system = same mass; open = gas escapes measurement.  
25. N₂ + H₂ → NH₃. Which atoms are unbalanced?  
A. Only N B. Only H C. Both N and H D. Both balanced  
   C — 2N→1N; 2H→3H.  
26. In 5C₆H₁₂O₆, total C atoms = ?  
A. 6 B. 12 C. 30 D. 5  
   C — 5 × 6 = 30 carbon atoms.  
27. Which action is FORBIDDEN when balancing?  
A. Adding coefficients B. Changing subscripts C. Counting atoms D. Writing formulas  
   B — Alters the identity of the compound.  
28. Balance: __ H₂ + __ O₂ → __ H₂O  
A. 1,1,2 B. 2, 1, 2 C. 2,2,2 D. 1,2,1  
   B — 4H + 2O each side.  
29. Balance: __ N₂ + __ H₂ → __ NH₃  
A. 1,2,2 B. 1,3,3 C. 1, 3, 2 D. 2,3,2  
   C — 2N, 6H each side.  
30. Balance: __ Al + __ O₂ → __ Al₂O₃  
A. 2,3,1 B. 2,1,2 C. 4, 3, 2 D. 3,4,2  
   C — 4Al, 6O each side.  
31. Balance: __ Fe + __ H₂O → __ Fe₃O₄ + __ H₂  
A. 1,1,1,1 B. 3, 4, 1, 4 C. 2,3,1,2 D. 3,2,1,2  
   B — 3Fe, 8H, 4O each side.  
32. In balanced 2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O, total O atoms LEFT?  
A. 7 B. 14 C. 8 D. 6  
   B — 7 × 2 = 14 O in 7O₂.  
33. If 12g C reacts completely with 32g O₂, mass of CO₂ formed = ?  
A. 12g B. 32g C. 44g D. 20g  
   C — 12 + 32 = 44g; conservation of mass.  
34. What is the BEST explanation for balanced equations?  
A. Atoms multiply B. Atoms are rearranged; same number before and after C. New atoms form D. Atoms become smaller  
   B — Core meaning of conservation of mass.  
35. Never change subscripts because:  
A. It makes numbers bigger B. It changes the identity of the substance C. It violates charge D. Coefficients are easier  
   B — H₂O vs H₂O₂ = completely different chemicals.  
  
Group 5 · CHEMICAL EQUATIONS EQUATIONS  (only use 15 questions in every pretest topic, this will be rephrased and 
randomized each playthrough)  
  
1. In a chemical equation, what do we call the substances that are present BEFORE the reaction takes place? 
A. Catalysts 
B. Products 
C. Reactants 
D. Precipitates 
   C — Reactants are the starting materials; they appear on the left side of the arrow. 
2. Where are the PRODUCTS of a chemical reaction written in an equation? 
A. Above the arrow 
B. Left side of the arrow 
C. Right side of the arrow 
D. Below the arrow 
   C — Products are the new substances formed; they appear after the reaction arrow. 
3. What does the symbol "→" mean when used in a chemical equation? 
A. Dissolves in 
B. Reacts to form 
C. Mixes with 
D. Equals 
   B — It shows the direction of the chemical change from reactants to products. 
4. Which symbol indicates that a substance is a SOLID in a chemical equation? 
A. (g) 
B. (aq) 
C. (l) 
D. (s) 
   D — State symbols tell the physical form of each substance; (s) = solid. 
5. The symbol (aq) next to a substance means: 
A. It is dissolved in water 
B. It is a gas 
C. It is a solid powder 
D. It is pure liquid water 
   A — "Aqueous" means dissolved in water to form a solution. 
6. A number written IN FRONT of a chemical formula (e.g., "2 H₂O") is called a: 
A. Charge 
B. Superscript 
C. Coefficient 
D. Subscript 
   C — Coefficients show how many molecules or formula units take part in the reaction. 
7. A small number written AFTER an element symbol (e.g., "O₂") is called a: 
A. Mass number 
B. Coefficient 
C. Yield 
D. Subscript 
   D — Subscripts show how many atoms of that element are in one molecule or formula unit. 
8. What does the law of conservation of mass state about chemical reactions? 
A. Total mass increases when new substances form 
B. Mass changes depending on temperature 
C. Total mass of reactants equals total mass of products 
D. Total mass decreases when bonds break 
   C — Atoms are only rearranged; no atoms are created or destroyed. 
9. A reaction where two or more substances combine to make ONE new substance is called: 
A. Double displacement 
B. Single displacement 
C. Combination / Synthesis 
D. Decomposition 
   C — General form: A + B → AB. 
10. A reaction where ONE reactant breaks apart into two or more simpler substances is: 
A. Combustion 
B. Decomposition 
C. Replacement 
D. Synthesis 
   B — General form: AB → A + B. 
11. What is a CATALYST? 
A. A gas always produced 
B. A product formed at the end 
C. A substance used up during the reaction 
D. A substance that speeds up a reaction without being changed or used up 
   D — Catalysts are often written above the reaction arrow. 
12. A reaction that releases heat or light energy to the surroundings is called: 
A. Exothermic 
B. Thermal 
C. Endothermic 
D. Isothermic 
   A — Energy comes OUT of the reaction. 
13. A reaction that ABSORBS energy from its surroundings (feels cold) is: 
A. Combustion 
B. Endothermic 
C. Displacement 
D. Exothermic 
   B — Energy goes INTO the reaction. 
14. In a single displacement reaction: 
A. One element replaces another element in a compound 
B. Nothing changes partners 
C. One compound breaks into elements 
D. Two compounds swap partners 
   A — General form: A + BC → AC + B. 
15. In a double displacement reaction: 
A. A fuel reacts with oxygen 
B. One element replaces another 
C. Two compounds exchange ions to form new compounds 
D. Two elements combine 
   C — General form: AB + CD → AD + CB. 
16. Combustion reactions always have which reactant? 
A. Water 
B. Nitrogen 
C. Oxygen gas (O₂) 
D. Carbon dioxide 
   C — Combustion = substance + oxygen → oxides + energy. 
17. A chemical equation is the best way to represent: 
A. Only phase changes like melting 
B. A chemical change where new substances form 
C. Only physical mixing 
D. Just a drawing of atoms 
   B — It summarizes exactly what reacts, what forms, and their amounts and states. 
18. If you see a symbol "Δ" written above the reaction arrow, it means: 
A. Electricity is used 
B. A catalyst is present 
C. Heat is applied 
D. Light is needed 
   C — Delta (Δ) is the standard symbol for heating. 
19. Which of the following is an example of a CHEMICAL change represented by an equation? 
A. Sugar dissolving in tea 
B. Cutting wood into pieces 
C. Iron turning into rust 
D. Ice melting to water 
   C — Rust is a new substance; the others are only physical changes. 
20. What is the main difference between a WORD EQUATION and a CHEMICAL EQUATION? 
A. There is no difference 
B. Chemical equations are always longer 
C. Word equations show mass conservation; chemical equations do not 
D. Word equations use only element names; chemical equations use formulas and symbols 
   D — Example: "Hydrogen + Oxygen → Water" (word) vs. "2 H₂ + O₂ → 2 H₂O" (chemical). 
21. When an insoluble solid forms and settles out of a solution during reaction, it is called a: 
A. Product gas 
B. Solvent 
C. Solute 
D. Precipitate 
   D — Often marked (s) or "↓" in equations. 
22. Which statement about subscripts is TRUE? 
A. They only matter for balancing 
B. You can change them to make an equation "look right" 
C. They are part of the chemical identity of a substance 
D. They count how many reactions happen 
   C — Changing a subscript changes the compound itself (e.g., H₂O vs. H₂O₂). 
23. In a chemical equation, coefficients apply to: 
A. Only the last element 
B. The entire formula they stand before 
C. Only the first element in the formula 
D. Nothing—they are just for counting 
   B — "2 NaCl" means two whole units of sodium chloride, not two sodium atoms. 
24. What information is NOT directly given in a typical chemical equation? 
A. Exact speed of the reaction 
B. Which substances are reactants and products 
C. Physical states of each substance 
D. Direction of the reaction 
   A — Equations show what happens, not how fast it happens. 
25. A reversible reaction (one that can go forward and backward) uses which symbol? 
A. ↓ 
B. → 
C. ⇌ 
D. = 
   C — Reactants form products, and products can reform reactants. 
26. When balancing is NOT the focus, what does a chemical equation show clearly? 
A. The exact cost of chemicals 
B. Only the total mass 
C. The identity of reactants, products, and reaction type 
D. How dangerous it is 
   C — Even unbalanced, it tells you what goes in, what comes out, and what kind of change occurs. 
27. Which is TRUE about the arrow in a chemical equation? 
A. It separates reactants from products and shows direction of change 
B. It means "is equal to" 
C. It only appears in big reactions 
D. It means "can never reverse" 
   A — It marks the boundary between starting materials and new substances. 
28. If you see (g) next to a product, it means: 
A. It is hot 
B. It dissolves in water 
C. A gas is produced 
D. A solid is formed 
   C — Common example: CO₂(g) or H₂(g). 
29. Why do we use chemical formulas instead of full names in equations? 
A. Only for scientists 
B. To make it harder to read 
C. To show exactly which atoms and how many are present 
D. To make it shorter 
   C — Formulas carry precise information about composition. 
30. Which best describes the purpose of a chemical equation? 
A. To explain safety rules 
B. To summarize a chemical reaction in a standard, clear way 
C. To show how to balance numbers 
D. To list all lab equipment needed 
   B — It is the universal language for describing chemical changes. 
  
   
Group 6 · RATES OF CHEMICAL REACTIONS (only use 15 questions in every pretest topic, this will be rephrased and 
randomized each playthrough)  
  
Reaction rate measures how ______ a reaction happens. 
A. colorful 
B. hot 
C. fast 
D. big 
   C — Change in concentration per unit time. 
1. Higher temperature makes reactions generally: 
A. Stop 
B. Unaffected 
C. Faster 
D. Slower 
   C — Faster particles = more/harder collisions. 
2. Substance that speeds reaction without being consumed: 
A. Inhibitor 
B. Catalyst 
C. Product 
D. Reactant 
   B — Lowers activation energy; enzymes are biological examples. 
3. Reaction that RELEASES heat (feels hot): 
A. Slow 
B. Endothermic 
C. Needs heating 
D. Exothermic 
   D — Exo = out; thermic = heat. 
4. Reaction that ABSORBS heat (feels cold): 
A. Endothermic 
B. Fast always 
C. Catalyzed 
D. Exothermic 
   A — Endo = in; takes heat from surroundings. 
5. Smaller particle size → faster reaction because of larger: 
A. Catalyst 
B. Temperature 
C. Surface area 
D. Concentration 
   C — More exposed area = more collisions. 
6. Fire triangle = fuel + oxygen +: 
A. Heat / ignition temperature 
B. Water 
C. Inhibitor 
D. Catalyst 
   A — Remove any one → fire stops. 
7. Food stays fresh longer in fridge. Which factor? 
A. Catalyst 
B. Concentration 
C. Surface area 
D. Lower temperature slows decay 
   D — #1 real-life food preservation application. 
8. Substance that SLOWS reactions (food preservatives): 
A. Product 
B. Reactant 
C. Inhibitor 
D. Catalyst 
   C — Opposite of catalyst; e.g., antioxidants. 
9. Which is exothermic? 
A. Burning wood / combustion 
B. Melting ice 
C. Cooking egg 
D. Photosynthesis 
   A — Combustion releases large amounts of heat. 
10. Activation energy is: 
A. Speed of reaction 
B. Energy released 
C. Total energy of reactants 
D. Minimum energy needed to start reaction 
   D — "Energy hill" reactants must climb. 
11. Collision theory states reactions happen when particles: 
A. Have high mass 
B. Are close only 
C. Touch lightly 
D. Collide with enough energy and correct orientation 
   D — Effective collisions cause reaction. 
12. Crushing a solid reactant: 
A. Adds catalyst 
B. Lowers concentration 
C. Increases surface area 
D. Lowers temperature 
   C — Speeds reaction by exposing more particles. 
13. Which factor does NOT increase rate? 
A. Higher concentration 
B. Catalyst 
C. Larger pieces 
D. Higher temperature 
   C — Larger pieces = less surface area → slower. 
14. Lowering temperature: 
A. Stops all reactions 
B. Speeds all reactions 
C. Has no effect 
D. Slows most reactions 
   D — Particles move slower; fewer effective collisions. 
15. Powdered CaCO₃ reacts FASTER than solid chips with acid because: 
A. Catalyst added 
B. Higher concentration 
C. Higher temperature 
D. Greater surface area 
   D — Powder exposes far more particles to acid. 
16. Concentrated acid reacts faster than dilute acid. Factor? 
A. Surface area 
B. Catalyst 
C. Higher concentration = more particles = more collisions 
D. Temperature 
   C — More reactant in the same volume. 
17. Enzymes in your body are examples of: 
A. Biological catalysts 
B. Products 
C. Inhibitors 
D. Reactants 
   A — Speed digestion, respiration, etc. 
18. Water extinguishes fire mainly by: 
A. Adding catalyst 
B. Removing fuel 
C. Increasing O₂ 
D. Removing HEAT (cools below ignition temperature) 
   D — Also smothers via steam blanket. 
19. Fire blanket extinguishes fire by: 
A. Cooling 
B. Removing OXYGEN (smothers) 
C. Removing fuel 
D. Adding inhibitor 
   B — Cuts off air supply. 
20. Painting / galvanizing iron prevents rust by: 
A. Increasing concentration 
B. Adding catalyst 
C. Blocking contact with H₂O and O₂ 
D. Increasing temperature 
   C — Removes reactants needed for corrosion. 
21. Which food preservation uses LOW water concentration (osmosis)? 
A. Freezing 
B. Refrigeration 
C. Canning 
D. Drying / salting / sugaring 
   D — Removes water microbes need for decay reactions. 
22. Canning food stops spoilage mainly by: 
A. Removing OXYGEN + killing microbes with heat 
B. Lowering temperature 
C. Increasing surface area 
D. Adding catalyst 
   A — No O₂ = no aerobic decay reactions. 
23. Crushing solid reactant into dust increases rate because: 
A. Adds catalyst 
B. Increases purity 
C. Increases surface area drastically 
D. Raises temperature 
   C — Same mass, far more exposed particles. 
24. Collision theory says reactions happen when particles: 
A. Stop moving 
B. Only touch lightly 
C. Are far apart 
D. Collide with correct orientation AND enough energy 
   D — Effective collisions = reaction; others bounce. 
25. Stirring reactants usually: 
A. Stops reaction 
B. Changes product 
C. Speeds reaction 
D. Slows reaction 
   C — Brings fresh reactants together faster. 
26. Which is endothermic? 
A. Neutralization 
B. Burning 
C. Freezing water 
D. Photosynthesis 
   D — Needs continuous energy input from sunlight. 
27. Why does higher temperature INCREASE rate so much? 
A. Lowers surface area 
B. Changes reactants 
C. More frequent collisions AND more have energy ≥ activation energy 
D. Only more collisions 
   C — Energy factor is bigger than frequency. 
28. Catalyst speeds reaction by: 
A. Becoming product 
B. Lowering required activation energy 
C. Increasing temperature 
D. Increasing surface area 
   B — Makes the "energy hill" easier to climb. 
29. Photosynthesis needs constant sunlight. It is: 
A. Very fast 
B. Catalyst free 
C. Endothermic 
D. Exothermic 
   C — Continuously absorbs light energy. 
30. Explosions are extremely fast due to: 
A. Instant gas release + heat + huge surface contact 
B. Inhibitors 
C. Low concentration 
D. Low temperature 
   A — All rate factors maximized at once. 
31. Reaction fast at start, slows, stops. Why? 
A. Catalyst disappears 
B. Temperature increases 
C. Surface area grows 
D. Reactants used up → concentration drops to zero 
   D — No reactant particles left = no more collisions. 
32. How does a catalyst reduce air pollution in car exhaust? 
A. Blocks exhaust 
B. Speeds conversion of toxic gases → harmless N₂ + CO₂ + H₂O 
C. Burns fuel 
D. Cools engine 
   B — Catalytic converters = environmental catalyst application. 
33. Higher O₂ concentration makes fire burn faster. This is which factor? 
A. Temperature 
B. Catalyst 
C. Concentration of reactant (O₂) 
D. Surface area 
   C — More O₂ molecules = more frequent effective collisions. 
34. The MAIN factor in corrosion prevention (paint/zinc) is: 
A. Eliminate contact between metal and O₂/H₂O 
B. Increase concentration 
C. Add catalyst 
D. Lower temperature 
   A — Remove one required reactant → reaction cannot happen. 
   
Group 7 · HOMEOSTASIS (only use 15 questions in every pretest topic, this will be rephrased and randomized each 
playthrough)  
 1. Homeostasis is best defined as: 
A. Constant unchanging state 
B. Only temperature control 
C. Stable internal balance despite external changes 
D. All body reactions stopping 
   C — Dynamic balance; conditions fluctuate within a normal range. 
2. Which organ system is the MAIN control center for homeostasis? 
A. Skeletal system 
B. Digestive system 
C. Excretory system 
D. Nervous + Endocrine systems 
   D — Nerves send fast signals; hormones give slower, longer lasting control. 
3. When body temperature rises, you sweat to cool down. This is: 
A. No feedback 
B. Negative feedback 
C. Positive feedback 
D. Stimulus only 
   B — Reverses the change back to normal. 
4. The “normal” or target value in homeostasis is called the: 
A. Set point 
B. Effector 
C. Response 
D. Stimulus 
   A — E.g., human body temperature set point ≈ 37°C. 
5. Which detects changes in the body’s internal or external environment? 
A. Control center 
B. Response 
C. Receptor / Sensor 
D. Effector 
   C — E.g., nerve endings in skin detect heat/cold. 
6. Which part carries out the action to fix the change? 
A. Stimulus 
B. Effector (muscle / gland) 
C. Receptor 
D. Control center 
   B — Muscles contract; glands release hormones/sweat. 
7. Negative feedback works to: 
A. Reverse / correct change back to set point 
B. Stop all activity 
C. Change the set point permanently 
D. Increase change 
   A — Most common homeostatic mechanism. 
8. Which is NOT maintained by homeostasis? 
A. Blood glucose 
B. Random constant height 
C. Blood pH 
D. Body temperature 
   B — Height changes with growth; not a regulated balance. 
9. The control center for temperature regulation is the: 
A. Heart 
B. Lungs 
C. Hypothalamus (brain) 
D. Liver 
   C — Receives signals and sends commands. 
10. When you are cold, blood vessels in skin: 
A. Burst 
B. Constrict / narrow 
C. Dilate / widen 
D. Disappear 
   B — Keeps warm blood inside core → reduces heat loss. 
11. Which system uses chemical messengers called hormones? 
A. Digestive 
B. Nervous 
C. Endocrine 
D. Circulatory 
   C — Slower but longer lasting control. 
12. Insulin and glucagon regulate: 
A. Water balance 
B. Blood glucose level 
C. Heart rate 
D. Body temperature 
   B — Work together to keep sugar stable. 
13. If blood sugar rises, pancreas releases: 
A. Thyroxine 
B. Adrenaline 
C. Insulin 
D. Glucagon 
   C — Lowers sugar by moving it into cells. 
14. If blood sugar drops, pancreas releases: 
A. Estrogen 
B. Insulin 
C. Cortisol 
D. Glucagon 
   D — Releases stored sugar from liver. 
15. Kidneys help maintain: 
A. Water and salt balance 
B. Bone density 
C. Muscle strength 
D. Body temperature 
   A — Adjust urine concentration. 
16. Shivering when cold is an example of: 
A. Exothermic reaction only 
B. No homeostatic control 
C. Negative feedback generating heat 
D. Positive feedback increasing heat loss 
   C — Muscle movement produces heat to raise body temperature back to the set point. 
17. Which is NOT a key homeostatic balance in humans? 
A. Water / salt balance 
B. Constant body weight forever 
C. Blood glucose level 
D. Body temperature 
   B — Weight changes naturally; it is not a fixed regulated set point. 
18. Insulin lowers blood sugar; glucagon raises it. This is: 
A. Positive feedback loop 
B. Excretion only 
C. Opposing negative feedback 
D. Uncontrolled reaction 
   C — Two hormones work against each other to keep glucose stable. 
19. Positive feedback differs from negative feedback because it: 
A. Has no control center 
B. Only works in plants 
C. Reverses the change 
D. AMPLIFIES / increases the change away from the set point 
   D — Rare in the body; e.g., childbirth, blood clotting. 
20. When blood sugar rises after eating, the pancreas releases: 
A. Adrenaline 
B. Glucagon 
C. Thyroxine 
D. Insulin 
   D — Insulin helps cells take in glucose; lowers blood sugar. 
21. Which organ MAINLY controls water balance and waste removal? 
A. Stomach 
B. Heart 
C. Kidney 
D. Lungs 
   C — Adjusts urine concentration; keeps salt/water levels stable. 
22. Sweating and vasodilation both help: 
A. Raise blood sugar 
B. Lower body temperature 
C. Lower blood pressure 
D. Raise body temperature 
   B — Remove excess heat from the body. 
23. Which is an example of positive feedback? 
A. Insulin action 
B. Sweating 
C. Blood clotting 
D. Breathing rate 
   C — More clotting chemicals → faster clotting until sealed. 
24. Homeostasis requires: 
A. Constant energy input 
B. No energy 
C. Only sleep 
D. Only food 
   A — Active balancing process. 
25. If homeostasis fails for blood pH, this happens first: 
A. Faster breathing 
B. More sweating 
C. Growth 
D. Enzymes stop working / denature 
   D — Wrong pH changes protein shape. 
26. When you exercise, breathing rate increases to balance: 
A. Heat in / heat out 
B. Water in / salt out 
C. O₂ in / CO₂ out 
D. Sugar in / fat out 
   C — Maintain gas balance in blood. 
27. The order of a feedback loop is: 
A. Control → Stimulus → Receptor → Effector 
B. Response → Stimulus → Effector → Control 
C. Stimulus → Receptor → Control → Effector → Response 
D. Effector → Receptor → Control → Response 
   C — Correct sequence for all homeostatic loops. 
28. Which is the ONLY example of POSITIVE feedback below? 
A. Kidneys saving water when dehydrated 
B. Sweating when hot 
C. Insulin lowering sugar 
D. Oxytocin increasing stronger contractions during birth 
   D — More contraction → more hormone → even stronger contraction until birth. 
29. If homeostasis FAILS for a long time, the result is: 
A. Faster growth 
B. Permanent set point change 
C. Disease / organ damage / death 
D. Improved health 
   C — Unbalanced conditions damage cells and stop organs working. 
30. Which statement about homeostasis is TRUE? 
A. Only controls temperature 
B. Stops when you sleep 
C. Only happens in warm-blooded animals 
D. Requires constant energy input 
   D — Active process; needs energy to keep balancing levels. 
31. Dehydration causes kidneys to: 
A. Reabsorb more water back into blood 
B. Release more water 
C. Make more urine 
D. Stop working 
   A — Negative feedback restores water balance. 
32. When blood pressure rises, body responds to: 
A. Stop heart 
B. Ignore it 
C. Lower it back to normal 
D. Raise it more 
   C — Negative feedback corrects the change. 
33. Which best describes “dynamic equilibrium”? 
A. Rapid wild swings 
B. Never changes 
C. Always exactly the same 
D. Small changes within a healthy range 
   D — Homeostasis is stable but flexible. 
34. Diabetes is a disease related to which homeostatic failure? 
A. Water balance 
B. Blood glucose regulation 
C. Salt balance 
D. Temperature 
   B — Problem with insulin production or use. 
35. Without homeostasis: 
A. No change occurs 
B. Growth speeds up 
C. Cells and organs cannot function 
D. Body works better 
   C — Conditions drift outside safe limits → damage or death. 
 
---  
 Group 8 · MECHANISMS OF EVOLUTION (only use 15 questions in every pretest topic, this will be rephrased and 
randomized each playthrough)  
  
1. Evolution is BEST defined as: 
A. Instant creation of new species 
B. Only large animals getting stronger 
C. Gradual change in the inherited traits of a POPULATION over many generations 
D. Individual organisms changing during their lifetime 
   C — Evolution happens to populations, not single individuals; traits are passed across generations. 
2. Who is the scientist who first proposed natural selection as the main mechanism of evolution? 
A. Charles Darwin 
B. Gregor Mendel 
C. Antoine Lavoisier 
D. Albert Einstein 
   A — Darwin published On the Origin of Species in 1859 based on Galápagos Islands observations. 
3. Natural selection is often summarized as: 
A. Traits you acquire during life are passed to offspring 
B. Survival and reproduction of organisms BEST FITTED to their environment 
C. Only the largest animals survive 
D. Strongest always kill the weakest 
   B — “Fitness” = ability to survive AND produce fertile offspring, not just physical strength. 
4. Any inherited trait that helps an organism survive and reproduce in its environment is called: 
A. Adaptation 
B. Variation 
C. Fossil 
D. Isolation 
   A — Example: thick fur in polar bears, long neck in giraffes. 
5. The natural differences in traits between individuals of the same species (e.g., different beak sizes in finches) is called: 
A. Selection 
B. Heredity 
C. Variation 
D. Isolation 
   C — Variation must already exist in a population for natural selection to act on it. 
6. For evolution to happen, useful traits must be able to be passed from parents to offspring. This is called: 
A. Isolation 
B. Variation 
C. Adaptation 
D. Heredity / Inheritance 
   D — Traits only affect evolution if they are genetic and can be inherited. 
7. Preserved remains, traces, or impressions of ancient organisms found in rock layers are called: 
A. Endemic species 
B. Fossils 
C. Adaptations 
D. Homologous structures 
   B — Examples: bones, shells, footprints, leaf imprints trapped in sedimentary rock. 
8. Body parts of different species that have SIMILAR BONE STRUCTURE but different functions (e.g., human arm, whale 
flipper, bat wing) are: 
A. Vestigial structures 
B. Fossils 
C. Homologous structures 
D. Analogous structures 
   C — Same basic plan = inherited from a common ancestor. 
9. A body part that has lost most or all of its original function through evolution (e.g., human appendix, tailbone) is: 
A. Analogous 
B. Adaptation 
C. Homologous 
D. Vestigial structure 
   D — It is reduced in size; remains as evidence of an ancestor that used it fully. 
10. The study of where different species live on Earth and why they are found there is: 
A. Genetics 
B. Comparative anatomy 
C. Paleontology 
D. Biogeography 
   D — Explains why islands often have unique species found nowhere else. 
11. The peppered moth in England changed from mostly light to mostly dark during the Industrial Revolution because tree 
trunks turned black with soot. This is a famous example of: 
A. Biogeography 
B. Artificial selection 
C. Natural selection in action 
D. Vestigial formation 
   C — Dark moths survived predation by birds better; they reproduced more and became common. 
12. A river changes course and permanently splits one population of beetles into two groups that never meet again. This is: 
A. Natural selection 
B. Artificial selection 
C. Reproductive isolation 
D. Geographic isolation 
   D — Physical barrier (river, mountain, ocean) separates populations; first step to forming new species. 
13. Bird wing and insect wing have the SAME FUNCTION (flying) but completely different internal structure. They are: 
A. Vestigial structures 
B. Homologous structures 
C. Fossils 
D. Analogous structures 
   D — Same job, different origin = evolved independently, NOT from a common flying ancestor. 
14. Why is isolation important in forming NEW species (speciation)? 
A. It creates fossils faster 
B. It increases mutation rate instantly 
C. It stops gene flow between groups, letting them evolve differently over time 
D. It makes organisms weaker 
   C — Without contact, separated populations accumulate different traits until they can no longer interbreed. 
15. Fossils found in DEEPER / older rock layers are generally: 
A. Simpler and more different from living species today 
B. Only large mammals 
C. Identical to modern organisms 
D. More complex than modern life 
   A — Fossil record clearly shows simple life first, then gradual change to more complex forms over time. 
16. Which is the BEST evolutionary explanation for giraffes'' long necks? 
A. Long-necked variants survived better, reproduced more, and passed the trait on 
B. A random mutation made all necks long in one generation 
C. They stretched to reach high leaves and passed stretched necks to babies 
D. All giraffes chose to grow longer necks 
   A — Variation existed first; natural selection favored longer necks over many generations. 
17. Farmers choosing only the largest, sweetest mangoes to plant next season is: 
A. Geographic isolation 
B. Artificial selection 
C. Vestigial selection 
D. Natural selection 
   B — Humans, not nature, select which traits get passed on. 
18. Early embryos of fish, chicken, pig, and human look very similar. This evidence of common ancestry comes from: 
A. DNA sequencing only 
B. Comparative embryology 
C. Fossil record 
D. Biogeography 
   B — Shared early developmental stages = inherited from a shared vertebrate ancestor. 
19. Two groups of frogs live in the same pond but mate at different months of the year and never interbreed. This is: 
A. Geographic isolation 
B. Analogous breeding 
C. Reproductive isolation 
D. Artificial selection 
   C — No physical barrier, but differences in behavior/time prevent mating; they are now separate species. 
20. The Philippine Eagle is found only in the Philippines and nowhere else on Earth. It is called: 
A. An endemic species 
B. An artificial species 
C. A vestigial species 
D. A fossil species 
   A — Biogeography: islands and isolated countries evolve many unique endemic species. 
21. Which is the CORRECT sequence of events for a new species to form (speciation)? 
A. Isolation → New species → Variation → Selection 
B. New species → Variation → Isolation → Selection 
C. Variation → Geographic Isolation → Natural Selection → Reproductive Isolation → New species 
D. Selection → Variation → Isolation → New species 
   C — Variation must exist first; separation stops gene flow; selection makes groups different until they can no longer 
interbreed. 
22. Why is natural selection considered the PRIMARY mechanism of evolution, not mutation, genetic drift, or chance alone? 
A. It was the first mechanism discovered 
B. It is the only mechanism that CONSISTENTLY produces ADAPTATIONS matched to the environment 
C. It is the only mechanism that changes traits 
D. It works instantly in one generation 
   B — Other mechanisms exist, but only natural selection reliably builds useful, environment-matched traits over time. 
23. Modern whales have tiny, unused pelvic (hip) bones buried deep inside their bodies. This vestigial structure is strong 
evidence that: 
A. Whales evolved from fish directly 
B. The pelvic bone has always been useless 
C. Whales are still evolving legs today 
D. Whales evolved from 4-legged land-dwelling mammals that moved back to the sea 
   D — Fossil series confirms this: walking whale → semi-aquatic → fully aquatic modern whale. 
24. Someone says: “Evolution is just a theory, so it’s just a guess.” The CORRECT scientific response is: 
A. In science, “theory” means a well-tested explanation supported by massive, repeated evidence from many fields 
B. Evolution is only a hypothesis 
C. Theories become laws once proven; evolution is almost a law 
D. True, it has no evidence yet 
   A — Scientific theory ≠ casual “guess”; it is the highest, most reliable level of scientific explanation. 
25. Fossils of the same extinct reptile Mesosaurus are found only in eastern South America and western Africa. This, plus 
matching coastlines, strongly supports: 
A. It evolved independently on both continents 
B. Continental drift / Pangaea: these continents were once joined together 
C. The species swam across the Atlantic Ocean 
D. Fossils were carried by humans 
   B — Key biogeography evidence: landmasses split and carried their resident species with them. 
26. Which of the following is NOT a required condition for natural selection to occur? 
A. Traits acquired during an organism''s life (e.g., bigger muscles from exercise) are passed to offspring 
B. Variation exists in the population 
C. Traits are heritable 
D. More offspring are born than can survive 
   A — This was Lamarck''s WRONG idea; only genetic/inherited traits, not acquired ones, are passed on. 
27. Homologous structures (e.g., forelimbs of vertebrates) are strong evidence of common ancestry mainly because: 
A. They perform exactly the same function 
B. They appear only in fossil species 
C. They share the same unique bone arrangement inherited from a shared ancestor, modified for different jobs 
D. They look identical externally 
   C — Same basic plan, different uses = descent with modification from one ancestor. 
28. A severe 10-year drought hits an island; all small, soft seeds die, leaving only large, hard seeds. Over generations, what 
will natural selection do to the island’s finch population? 
A. All finches will instantly grow larger beaks in one year 
B. Average beak size will become LARGER, thicker, and stronger 
C. Average beak size will get smaller and weaker 
D. Beak size will not change at all 
   B — Birds with larger, stronger beaks survive and reproduce; the trait becomes more common over generations. 
29. If two separated populations are NOT geographically isolated and individuals keep moving/mating between them: 
A. Mutations stop occurring 
B. Natural selection cannot happen at all 
C. Gene flow continues; they will NOT diverge into separate species 
D. They will definitely become separate species 
   C — Constant mixing keeps their gene pools similar; isolation is required for populations to split into new species. 
30. Which combination of evidence gives the STRONGEST , most reliable support for evolution by common descent? 
A. Only DNA similarity alone 
B. Only embryology alone 
C. Fossil record + homologous structures + DNA/protein similarity + biogeography, all agreeing 
D. Only fossil record alone 
   C — Multiple independent lines of evidence all converging on the same conclusion is what makes evolution one of the 
most strongly supported theories in all of science.Term', true),
('b0000000-0000-0000-0000-000000000201', 1, 'questions in every pretest topic, this will be rephrased and randomized each playthrough) The maximum number of individuals an ecosystem can support long-term without exhausting its resources is called:', 'Population density', 'Carrying capacity', 'Birth rate', 'Death rate', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Any factor that prevents a population from growing larger is called a:', 'Limiting factor', 'Density factor', 'Growth factor', 'Carrying factor', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which is NOT a common limiting factor for most animal populations?', 'Clean water', 'Shelter or space', 'Body color of individuals', 'Adequate food', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'When a population grows rapidly with no limiting factors, it forms a:', 'Flat line', 'S-shaped curve', 'Wavy line', 'J-shaped curve (exponential growth)', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'As a population approaches its carrying capacity, its growth rate:', 'Slows down and approaches zero', 'Speeds up', 'Becomes infinite', 'Stays exactly the same', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'The S-shaped population growth pattern is called:', 'Boom-and-bust growth', 'Exponential growth', 'Logistic growth', 'Negative growth', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'A lack of available mates in a small population will:', 'Cause exponential growth', 'Limit population growth', 'Increase carrying capacity', 'Have no effect', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'In a logistic growth curve, the flat portion at the top represents:', 'Rapid growth', 'Population crash', 'Exponential phase', 'Carrying capacity (stable population size)', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'A drought causes most plants in a grassland to die, leading to a decline in rabbit numbers. The drought is a:', 'Limiting factor', 'Growth factor', 'Carrying capacity increase', 'Mate factor', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Population density refers to:', 'Birth rate minus death rate', 'Carrying capacity', 'Number of individuals per unit area or volume', 'Total number of individuals only', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'A forest originally supports 500 deer. After a typhoon destroys much of the habitat, the carrying capacity will most likely:', 'Double to 1000', 'Stay the same', 'Decrease', 'Become unlimited', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which is an example of a density-dependent limiting factor?', 'Disease or food shortage', 'Typhoon', 'Earthquake', 'Volcanic eruption', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which is a density-independent limiting factor?', 'Predation', 'Competition for mates', 'Parasitism', 'Super typhoon', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why does population growth slow as it nears carrying capacity?', 'Carrying capacity keeps increasing', 'Limiting factors disappear', 'All organisms stop reproducing', 'Competition for resources becomes stronger', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Rats increase in a rice field, followed by an increase in snakes that feed on them. Snake predation is a:', 'Biotic limiting factor', 'Carrying capacity increaser', 'Abiotic factor', 'Growth promoter', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'In nature, what usually happens after exponential growth?', 'It continues forever', 'Limiting factors slow growth or cause a population crash', 'Carrying capacity disappears', 'Resources become unlimited', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'If a population is below carrying capacity, it will usually:', 'Go extinct', 'Stay exactly the same', 'Increase toward carrying capacity', 'Decrease rapidly', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'A landfill destroys most of a frog''s breeding pond. Which limiting factor is affected the most?', 'Water', 'Food', 'Mates', 'Shelter or breeding space', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which pair consists of abiotic limiting factors?', 'Water availability and temperature extremes', 'Predators and parasites', 'Competition and disease', 'Food supply and mates', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'The current growth of the human population most closely follows which pattern?', 'Stable S-curve', 'Rising J-curve or early logistic growth', 'Rapid decline', 'Zero growth', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'What is the correct sequence of logistic growth?', 'Stable → Fast → Slow', 'Crash → Fast → Stable', 'Slow → Fast → Slowing → Stable at carrying capacity', 'Stable → Crash → Fast', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'If a population exceeds its carrying capacity, what is most likely to happen?', 'Growth continues rapidly', 'Carrying capacity permanently increases', 'A population crash occurs because of resource shortages', 'Nothing changes', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'A lake can support 1,000 tilapia, but 1,200 are introduced. What will most likely happen?', 'The carrying capacity becomes 1,200', 'All survive', 'Exponential growth continues', 'Many die until the population returns near carrying capacity', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why are mates considered a limiting factor in small isolated populations?', 'Individuals have difficulty finding mates, reducing reproduction', 'Mates increase carrying capacity', 'Food competition increases', 'Males always fight', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'What is the main difference between density-dependent and density-independent limiting factors?', 'Independent factors are always living things', 'Density-dependent effects become stronger as population density increases', 'Density-dependent factors never cause extinction', 'They have exactly the same effects', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which situation best illustrates a population slowing as it approaches carrying capacity?', 'A volcano kills most birds', 'A new species grows without limits', 'Mouse population: 100 → 180 → 210 → 215 → 212', 'Disease wipes out rabbits', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'How does competition affect populations near carrying capacity?', 'It increases resources', 'It removes predators', 'It automatically raises carrying capacity', 'Fewer individuals survive and reproduce because resources are limited', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Protecting both food sources and nesting sites for the Philippine Eagle helps because:', 'Carrying capacity depends on all essential resources', 'Eagles do not need mates', 'Only food matters', 'Carrying capacity never changes', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why can''t exponential population growth continue forever?', 'Death rates always decrease', 'Resources are limited in every ecosystem', 'Carrying capacity increases endlessly', 'Birth rates suddenly stop', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'and randomized each playthrough) Biotechnology is best defined as:', 'Only genetic engineering', 'Growing plants only', 'Using living organisms or biological processes to make useful products', 'Only laboratory work', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Traditional food biotechnology mainly depends on:', 'Fermentation by microorganisms', 'Freezing', 'Canning', 'Boiling', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Nata de coco is produced by fermenting coconut water with:', 'Mold', 'Yeast', 'Acetobacter xylinum', 'Lactic acid bacteria', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Vinegar is produced when alcohol is converted into:', 'Citric acid', 'Acetic acid', 'Hydrochloric acid', 'Lactic acid', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Cheese, yogurt, and pickles are made using bacteria that produce:', 'Lactic acid', 'Oxygen', 'Alcohol', 'Acetic acid', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Soy sauce is traditionally made from:', 'Coconut milk', 'Rice only', 'Fruit juice', 'Soybeans, grains, mold, and bacteria', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'GMOs are organisms whose ____ has been altered in a laboratory.', 'Cell size', 'DNA or genetic material', 'Food value only', 'Color only', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'In Vitro Fertilization (IVF) takes place:', 'Outside the body before implantation', 'Without sperm and egg', 'Inside the body', 'With one parent only', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'One benefit of pest-resistant GMO crops is:', 'They never spoil', 'Need more water', 'Less pesticide use and higher yield', 'Better taste', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Which is an ethical concern related to IVF?', 'It always causes disease', 'It always succeeds', 'It produces only identical twins', 'Issues involving embryos, cost, and fairness', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Which list contains only traditional fermented foods?', 'Cheese, soy sauce, vinegar, nata de coco, and yogurt', 'Bt corn', 'Modern medicines', 'Insulin and vaccines', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Baker''s yeast helps bread rise by producing:', 'Oxygen', 'Acetic acid', 'Carbon dioxide and alcohol', 'Lactic acid', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Golden Rice was developed to provide more:', 'Iron', 'Beta-carotene (Vitamin A precursor)', 'Protein', 'Vitamin C', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'One environmental concern about Bt corn is:', 'Pests may become resistant and non-target insects may be affected', 'It stops photosynthesis', 'It requires much more water', 'It kills all nearby plants', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'One concern about GMOs for Filipino farmers is:', 'They are always poisonous', 'They grow only in cold climates', 'Patented seeds may increase farming costs', 'They always taste worse', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Most modern insulin is produced by:', 'Blood donations', 'Bacteria carrying the human insulin gene', 'Chemical synthesis only', 'Pig pancreas only', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Which pairing is correct?', 'Vinegar – Acetic acid bacteria', 'Bread – Mold', 'Yogurt – Yeast only', 'Nata de coco – Lactobacillus', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Fermentation is considered ancient biotechnology because:', 'It requires modern laboratories', 'It uses DNA editing', 'It is only for modern foods', 'It was practiced long before microbes were understood', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Cloning produces offspring that are:', 'Genetically identical to one parent', 'Always stronger', 'Unable to reproduce', 'Genetically unique', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'A major ethical issue in gene editing with CRISPR is:', 'It only works on plants', 'Unintended effects and designer baby concerns', 'It cures nothing', 'It is completely safe', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'What is the correct sequence in traditional vinegar production?', 'Alcohol → Sugar', 'Lactic acid → Alcohol', 'Sugar → Yeast → Alcohol → Bacteria → Acetic acid', 'Sugar → Acid directly', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Nata de coco is formed from:', 'Milk protein', 'Yeast foam', 'Bacterial cellulose', 'Boiled coconut water', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'The Cartagena Protocol focuses on:', 'Cheese making', 'Human cloning', 'IVF regulations', 'Safe handling and trade of genetically modified organisms', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'An environmental benefit of approved GMO crops is:', 'Reduced use of chemical pesticides and fertilizer runoff', 'They replace all wild plants', 'They grow only in one season', 'They require more fertilizer', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'One economic concern about IVF is:', 'It always causes infertility', 'High cost limits access for many families', 'It always produces boys', 'It is always dangerous', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Fermentation helps preserve food because it:', 'Dries food completely', 'Uses only salt', 'Produces acids or alcohol that slow spoilage microorganisms', 'Heats food', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Bt corn contains a gene that:', 'Makes the plant glow', 'Eliminates the need for water', 'Makes corn sweeter', 'Produces a protein harmful to certain insect pests', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Traditional and modern biotechnology differ because:', 'Traditional uses selection and fermentation, while modern changes DNA directly', 'Traditional never uses microbes', 'Modern is always safer', 'Only modern biotechnology produces food', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'One ethical trade-off in IVF is:', 'Success is guaranteed', 'There is no cost involved', 'Extra embryos may be frozen or discarded', 'There are no risks', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000202', 1, 'Compared with traditional breeding, modern biotechnology:', 'Is only used in rich countries', 'Changes specific genes directly', 'Cannot improve crop yield', 'Uses no science 
  
##', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, 'and randomized each playthrough) 1. Theory that Earth''s outer shell moves in slabs:', 'Earthquake theory', 'Plate Tectonics', 'Continental drift', 'Seafloor spreading 
 B — Plate tectonics unifies how plates move and interact. 
2. The rigid moving slabs are called:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Fault blocks', 'Asthenosphere', 'Mantle plumes', 'Tectonic / lithospheric plates 
 D — The lithosphere is broken into moving plates. 
3. Plates move at about the speed of:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'A runner', 'Fingernails growing', 'A car', 'A jet 
 B — Typical speed is a few centimeters per year. 
4. Modern tool to measure plate motion precisely:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Thermometer', 'GPS satellites', 'Compass', 'Barometer 
 B — GPS tracks position to millimeters over time. 
5. Plates moving apart:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Subduction', 'Transform', 'Divergent', 'Convergent 
 C — Divergent boundaries create new crust. 
6. Plates colliding:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Divergent', 'Ridge', 'Transform', 'Convergent 
 D — Convergent boundaries destroy or thicken crust. 
7. Plates sliding past each other:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Trench', 'Convergent', 'Transform fault', 'Divergent 
 C — Transform boundaries have no creation or destruction of crust. 
8. Soft flowing layer under plates:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Crust', 'Core', 'Asthenosphere', 'Lithosphere 
 C — The asthenosphere allows plates to move. 
9. One plate sinking under another:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Spreading', 'Faulting', 'Subduction', 'Rifting 
 C — Dense oceanic plate sinks into the mantle. 
10. Main fault system in the Philippines:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'East African Rift', 'San Andreas', 'Philippine Fault System', 'Marikina Fault only 
 C — It runs the length of the archipelago. 
11. Continent-continent collision forms:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Tall non-volcanic mountains', 'Island arcs', 'Trenches', 'Volcanoes 
 A — No subduction means no melting for magma. 
12. Ocean-continent collision produces:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Mid-ocean ridge', 'Trench + continental volcanic arc', 'Rift valley', 'Transform fault 
 B — Subduction melts rock to feed volcanoes on land. 
13. The Philippines sits between:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Nazca and South American Plates', 'Indian and African Plates', 'Philippine Sea Plate and Eurasian Plate', 'Pacific and North American Plates 
 C — Interaction of these plates forms our geology. 
14. Many Philippine volcanoes and trenches exist because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'No plate motion', 'Several plates are subducting around us', 'We are on a hot spot only', 'Plates are moving apart 
 B — Multiple subduction zones ring the country. 
15. Transform boundaries commonly have:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Strong shallow earthquakes', 'Trenches', 'Volcanoes', 'New crust 
 A — Friction builds then slips in quakes; no melting. 
16. Himalayas formed when:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Indian Plate collided with Eurasian Plate', 'Plates moved apart', 'Ocean plate melted', 'Plates slid sideways 
 A — Two continents crumpled together. 
17. Andes Mountains formed from:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Rifting', 'Continent-continent push', 'Hot spot', 'Nazca Plate subducting under South America 
 D — Ocean plate diving under the continent. 
18. Main driver of plate motion:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Wind', 'Earth''s spin', 'Mantle convection currents', 'Moon pull 
 C — Heat rising and sinking moves the plates. 
19. Subduction leads to:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'No change', 'Melting, magma, volcanoes, folded mountains', 'Only erosion', 'Rifting 
 B — Sinking rock heats, melts, and rises. 
20. New seafloor is created at:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Faults', 'Volcanoes', 'Trenches', 'Mid-ocean ridges / divergent boundaries 
 D — Magma rises, cools, and adds new crust. 
21. Plate moving 7 cm/year for 50 million years travels:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', '700 km', '350 km', '3500 km', '7000 km 
 C — 7 cm × 50,000,000 = 3,500 km. 
22. Why is GPS better than older methods?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Precise, continuous, global', 'Works only on land', 'Needs no power', 'Cheaper only 
 A — It gives accurate real-time motion data. 
23. Mariana and Philippine Trenches are:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Hot spots', 'Rift valleys', 'Transform features', 'Subduction trenches 
 D — They mark where plates sink. 
24. Correct match for the Philippines:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Divergent → Mayon', 'Transform → Taal', 'Convergent → Mayon Volcano + Manila Trench', 'Hot spot → Manila Trench 
 C — Both come from subduction at convergent boundaries. 
25. No volcanoes at the Himalayas because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'No dense ocean plate to sink and melt', 'No earthquakes', 'Too dry', 'Too cold 
 A — Continental rock is too light to subduct. 
26. Asthenosphere is:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Rigid metal', 'Cold brittle rock', 'Hot solid rock that flows slowly', 'Liquid rock 
 C — It is solid but ductile over millions of years. 
27. Trenches on both sides of the Philippines mean:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'No plate motion', 'Plates are pulling apart', 'We are squeezed between subduction zones', 'Only earthquakes 
 C — The archipelago sits in a collision zone. 
28. Philippine Fault System is a:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Divergent rift', 'Left-lateral transform fault', 'Hot spot', 'Subduction zone 
 B — Blocks slide past each other horizontally. 
29. Ocean-ocean subduction makes ______; ocean-continent makes ______:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Mountains / plains', 'No trench / no trench', 'Volcanic island arc / continental volcanic arc', 'Rift / ridge 
 C — One makes islands, the other land mountains. 
30. Origin of the Philippines:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000203', 1, '', 'Ocean floor uplifted all at once', 'Meteor impact', 'Merged small volcanic island arcs', 'One continent split 
 C — Pieces of crust collided and stuck together. 
  
##', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, 'and randomized each playthrough) 1. Climate is the long-term average of:', 'Weather', 'Climate', 'Season', 'Forecast 
 A — Climate describes average weather conditions over many years. 
2. Which term refers to the increase in Earth''s average temperature?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Ice age', 'Coriolis effect', 'Global warming', 'Cooling 
 C — It is the long-term rise in global air and ocean temperatures. 
3. Climate change includes:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Only hotter summers', 'Changes in rainfall, sea level, and temperature', 'Daily weather changes only', 'Air pollution only 
 B — Climate change involves many long-term environmental changes. 
4. Gases that trap heat in Earth''s atmosphere are called:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Noble gases', 'Nitrogen gases', 'Ozone gases', 'Greenhouse gases 
 D — These gases help keep heat near Earth''s surface. 
5. The main greenhouse gas released by human activities is:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Nitrogen', 'Argon', 'Carbon dioxide (CO₂)', 'Ozone 
 C — Burning fossil fuels releases large amounts of CO₂. 
6. The natural greenhouse effect is important because it:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Makes Earth too hot', 'Keeps Earth warm enough for life', 'Causes storms', 'Freezes the planet 
 B — Without it, Earth would be too cold to support life. 
7. The enhanced greenhouse effect happens when:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Less heat is trapped', 'Extra greenhouse gases trap more heat', 'Heat escapes faster', 'Earth''s atmosphere disappears 
 B — Human activities strengthen the natural greenhouse effect. 
8. Melting glaciers and ice sheets directly cause:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Lower sea level', 'Less rainfall', 'Sea level rise', 'Cooler oceans 
 C — Melted land ice adds more water to the oceans. 
9. Ice core records show that modern CO₂ levels are:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Lower than before', 'About the same as always', 'Slightly lower than natural levels', 'Higher than at any time in the last 800,000 years 
 D — Today''s CO₂ levels are far above natural historical levels. 
10. Besides melting ice, sea level rises because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Oceans become saltier', 'Warm water expands', 'More rain falls into the ocean', 'Winds push water upward 
 B — Heated water occupies more space. 
11. Which group contains major greenhouse gases?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Oxygen, nitrogen, helium', 'CO₂, methane, nitrous oxide, CFCs, water vapor', 'Hydrogen, helium, argon', 'Dust and smoke 
 B — These gases absorb and re-emit heat. 
12. Which human activities produce large amounts of methane?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Volcanoes only', 'Cars only', 'Cattle, rice fields, landfills, and gas leaks', 'Oceans only 
 C — Agriculture and waste are major methane sources. 
13. CFCs are harmful because they:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Cool the atmosphere', 'Trap heat and damage the ozone layer', 'Occur naturally in large amounts', 'Remove greenhouse gases 
 B — They are powerful greenhouse gases and ozone-depleting chemicals. 
14. Which is strong evidence of climate change?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'One unusually hot day', 'Rising global temperatures and shrinking glaciers', 'A rainy afternoon', 'One powerful typhoon 
 B — Multiple long-term observations confirm climate change. 
15. Deforestation increases global warming because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Trees release more oxygen', 'Forests release stored carbon and absorb less CO₂', 'It creates more rainfall', 'It lowers Earth''s temperature 
 B — Trees store carbon and remove CO₂ from the atmosphere. 
16. Which is NOT considered evidence of climate change?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'One hot day', 'Retreating glaciers', 'Rising sea level', 'Earlier flowering of plants 
 A — Single weather events do not represent climate. 
17. Which sequence correctly explains human-caused global warming?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'More trees → More warming', 'Burning fossil fuels → More CO₂ → Stronger greenhouse effect → Warming', 'Less sunlight → Warming', 'More clouds → Cooling 
 B — Human emissions increase greenhouse gases, causing warming. 
18. Why will Earth continue warming even if emissions stop immediately?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Volcanoes become stronger', 'CO₂ remains in the atmosphere for centuries and oceans store heat', 'The Sun keeps getting hotter', 'Winds trap heat permanently 
 B — Past emissions continue affecting the climate. 
19. The largest human source of CO₂ emissions is:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Volcanoes', 'Burning coal, oil, and natural gas', 'Oceans', 'Animals 
 B — Fossil fuel combustion is the biggest contributor. 
20. Scientists know extra atmospheric CO₂ comes mainly from fossil fuels because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Carbon isotope evidence matches fossil fuels', 'Volcanoes release the same amount', 'The atmosphere is heavier', 'Ocean temperatures prove it 
 A — Carbon isotope signatures identify fossil fuel emissions. 
21. The difference between the natural and enhanced greenhouse effect is that:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Both are caused by humans', 'Natural warming supports life, while enhanced warming is caused by extra greenhouse gases', 'Natural warming is harmful', 'Enhanced warming cools Earth 
 B — Human activities increase the natural greenhouse effect. 
22. Arctic ice-albedo feedback means:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'More ice absorbs more heat', 'Less ice exposes darker water, causing more warming and melting', 'Ice cools the atmosphere permanently', 'There is no effect on temperature 
 B — This positive feedback speeds up Arctic warming. 
23. Even a 1°C increase in global temperature is important because it:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Causes almost no changes', 'Increases heatwaves, floods, and stronger storms', 'Only affects polar regions', 'Makes oceans colder 
 B — Small global averages can produce major regional impacts. 
24. Which chain best explains stronger typhoons in the Philippines?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'More CO₂ → Less rainfall', 'More greenhouse gases → Warmer oceans → Stronger and wetter typhoons', 'Hotter weather → Fewer storms', 'Cooler oceans → Stronger storms 
 B — Warm ocean water provides more energy for tropical cyclones. 
25. Why is the Arctic warming faster than most other places?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'It receives more sunlight', 'Ice-albedo feedback accelerates warming', 'Stronger winds increase temperature', 'More people live there 
 B — Melting ice exposes darker surfaces that absorb more heat. 
26. Why is the statement "Climate changed naturally before, so today''s change is natural" incorrect?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Climate has never changed naturally', 'Natural factors cannot explain today''s rapid warming; human emissions do', 'Earth is always warming', 'Ice ages never happened 
 B — The speed and cause of current warming match human activities. 
27. Ocean acidification happens because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Overfishing lowers pH', 'CO₂ dissolves in seawater, forming carbonic acid', 'Warm water becomes acidic by itself', 'Pollution alone causes acidity 
 B — Carbonic acid lowers ocean pH and harms marine life. 
28. Which is a major climate impact already observed in the Philippines?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Colder temperatures every year', 'Rising sea levels, stronger typhoons, longer dry seasons, and heavier rains', 'Less rainfall everywhere', 'No noticeable changes 
 B — These are documented climate-related impacts. 
29. Why isn''t water vapor considered the main cause of modern climate change?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'It does not trap heat', 'It increases after warming begins, acting as a feedback rather than the original cause', 'It is disappearing from the atmosphere', 'It only exists inside clouds 
 B — CO₂ triggers warming; water vapor amplifies it. 
30. Ice core records show that atmospheric CO₂ and global temperature:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000204', 1, '', 'Have no relationship', 'Closely rise and fall together, with today''s CO₂ much higher than past levels', 'Always move in opposite directions', 'Change randomly 
 B — Ice core evidence strongly supports the greenhouse effect. 
##', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'be rephrased and randomized each playthrough) ENSO stands for:', 'Weather System', 'El Niño Southern Oscillation', 'Ocean Current', 'Wind Pattern', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'El Niño refers to:', 'Unusually warm eastern and central Pacific Ocean', 'No wind', 'Cool Pacific waters', 'Rain everywhere', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'La Niña is characterized by:', 'No change', 'Global drought', 'Unusually cool eastern Pacific Ocean', 'Warm Pacific waters', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'ENSO develops mainly in the:', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Tropical Pacific Ocean', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'The normal winds that blow from east to west across the Pacific are called:', 'Trade winds', 'Monsoons', 'Westerlies', 'Jet streams', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'El Niño usually brings which condition to the Philippines?', 'More typhoons', 'Hotter weather and less rainfall', 'Cooler temperatures', 'Flooding', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'La Niña commonly causes:', 'No storms', 'Drought', 'Above-normal rainfall and flooding', 'Hotter weather', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'The "Southern Oscillation" refers to the:', 'Ocean temperature', 'Sea level', 'Ocean waves', 'Air pressure changes across the Pacific', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Most ENSO events last about:', '9–12 months, sometimes up to 2 years', 'One week', 'Forever', 'Ten years', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'PAGASA declares an ENSO event when:', 'Farmers observe unusual weather', 'One hot day occurs', 'Ocean and atmospheric conditions meet standards for several months', 'News agencies announce it', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'During El Niño, the trade winds:', 'Become stronger', 'Weaken or sometimes reverse direction', 'Stay the same', 'Disappear permanently', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'During El Niño, the warm pool of ocean water:', 'Moves north', 'Sinks', 'Shifts eastward across the Pacific', 'Stays near Asia', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'The Philippines usually experiences fewer typhoons during El Niño because:', 'Storms form farther east and stronger wind shear weakens them', 'Winds completely stop', 'The ocean becomes too cold', 'There is no evaporation', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'During La Niña, more typhoons affect the Philippines because:', 'Less moisture is available', 'Ocean temperatures decrease', 'There is less heat', 'Warm water remains near the Philippines with weaker wind shear', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which sector is most affected by El Niño?', 'Rain-fed agriculture such as rice and corn farming', 'Manufacturing', 'Factories', 'Urban businesses', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which combination is commonly associated with El Niño?', 'More rainfall', 'Drought, crop losses, and possible power shortages', 'Cooler temperatures', 'Flooding everywhere', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'La Niña often results in:', 'Water shortage', 'Less wind', 'Heavy rainfall, floods, and landslides', 'Drought', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'ENSO affects countries differently because:', 'It is completely random', 'It affects only the Pacific Ocean', 'It changes global wind and rainfall patterns', 'There is no scientific reason', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why is monitoring ENSO important?', 'It helps communities prepare for possible disasters', 'It changes the weather', 'It has no practical use', 'It is only for scientists', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Neutral ENSO conditions mean:', 'Always dry weather', 'Climate conditions remain close to average', 'Always wet weather', 'No weather occurs', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Walker Circulation is:', 'A large east-west circulation of air across the Pacific', 'An ocean current', 'A wave pattern', 'A type of wind', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why does El Niño often cause floods in the Americas but drought in the Philippines?', 'Mountains block rainfall', 'The Philippines is too far away', 'Rainfall shifts eastward with the warm ocean water', 'It happens randomly', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Climate change may affect ENSO by making:', 'Only La Niña occur', 'Extreme ENSO events more frequent or intense', 'ENSO disappear', 'ENSO weaker', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which sequence correctly describes El Niño?', 'Cooler water → more storms', 'No change occurs', 'Weak trade winds → warm water shifts east → rainfall moves away → drought', 'Stronger winds → more rainfall', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Metro Manila may experience water shortages during El Niño because:', 'Reservoirs receive less rainfall', 'There are no rivers', 'People always waste water', 'Pipe leaks are the only cause', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Which statement correctly describes typhoon tracks?', 'Typhoons always follow the same path', 'El Niño often shifts storms away, while La Niña increases Philippine landfalls', 'ENSO has no effect', 'Storms always hit the Visayas', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'The 2015–2016 Super El Niño caused:', 'A cooler-than-normal year', 'Better harvests', 'Severe drought, extreme heat, and major crop losses', 'Widespread flooding', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'ENSO affects the Philippine monsoon because:', 'El Niño weakens Habagat, while La Niña strengthens it', 'Monsoons stop completely', 'Only Amihan changes', 'There is no effect', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why do ENSO impacts differ from one event to another?', 'PAGASA changes its rules', 'Only temperature matters', 'Event strength, timing, location, and climate change all influence the effects', 'It is completely random', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'Why is it important for students to understand ENSO?', 'It is only needed for examinations', 'It influences food, water, electricity, and public safety', 'It only affects farmers', 'It has no effect on daily life', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, 'topic, this will be rephrased and randomized each playthrough) 1. Actions that reduce or prevent greenhouse gas emissions are called:', 'Conservation', 'Mitigation', 'Restoration', 'Adaptation 
 B — Mitigation focuses on reducing the causes of climate change. 
2. The process of adjusting to the effects of climate change is known as:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Prevention', 'Adaptation', 'Reduction', 'Mitigation 
 B — Adaptation helps people and ecosystems cope with climate impacts. 
3. Which renewable energy source uses heat from beneath Earth''s surface?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Solar', 'Geothermal', 'Wind', 'Hydropower 
 B — Geothermal energy comes from underground heat. 
4. Electricity generated from moving water is called:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Biomass', 'Hydropower', 'Solar energy', 'Geothermal 
 B — Rivers and dams generate hydropower. 
5. Which renewable energy source converts sunlight directly into electricity?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Coal', 'Solar energy', 'Wind energy', 'Hydropower 
 B — Solar panels capture energy from sunlight. 
6. The largest source of greenhouse gas emissions in the Philippines comes from:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Forests', 'Burning coal, oil, and natural gas for electricity and transportation', 'Agriculture', 'Waste disposal 
 B — Fossil fuels are the country''s primary source of emissions. 
7. Which is the BEST way for individuals to reduce transportation emissions?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Use private vehicles more often', 'Walk, bike, or use public transportation', 'Travel by airplane frequently', 'Buy more plastic products 
 B — Reducing private vehicle use lowers emissions. 
8. What do the "3 Rs" stand for?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Repair, Replace, Remove', 'Read, Write, Repeat', 'Reduce, Reuse, Recycle', 'Run, Rest, Recover 
 C — Reducing waste comes first, followed by reusing and recycling. 
9. Trees help reduce climate change by:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Blocking sunlight only', 'Absorbing and storing carbon dioxide (carbon sequestration)', 'Producing oxygen only', 'Cooling the air without storing carbon 
 B — Forests remove CO₂ from the atmosphere and store it. 
10. Which is a common impact of climate change in the Philippines?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Colder oceans', 'Stronger typhoons, rising sea levels, longer droughts, and hotter days', 'More fish populations', 'Longer harvest seasons 
 B — These impacts are already being observed. 
11. Which of the following is a renewable energy resource found in the Philippines?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Coal and oil only', 'Geothermal, hydro, solar, wind, biomass, and ocean energy', 'Coal only', 'Oil only 
 B — The Philippines has abundant renewable energy resources. 
12. Renewable energy helps reduce climate change because it:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Produces little or no greenhouse gases', 'Is cheaper in every situation', 'Uses more fuel efficiently', 'Makes electricity faster 
 A — Renewable energy emits very little CO₂ during operation. 
13. Rising sea levels can cause coastal communities to experience:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'More beaches', 'Saltwater intrusion, erosion, flooding, and stronger storm surges', 'Cooler seawater', 'No significant effects 
 B — Higher sea levels worsen coastal hazards. 
14. Saving electricity helps fight climate change because:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'It reduces the amount of fuel burned for power generation', 'It only lowers electricity bills', 'It reduces the need for electrical wires', 'It has no effect on emissions 
 A — Lower electricity demand means fewer fossil fuels are burned. 
15. Which household action has the greatest impact on reducing carbon emissions?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Recycling alone', 'Using energy-efficient appliances, conserving electricity, and installing solar panels', 'Buying less plastic only', 'Driving less once a month 
 B — Reducing home energy use significantly lowers emissions. 
16. Composting organic waste helps reduce climate change because it:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Makes soil darker', 'Prevents methane production in landfills and reduces the need for synthetic fertilizers', 'Saves water only', 'Produces more oxygen 
 B — Composting lowers methane emissions from waste. 
17. Republic Act No. 9513, also known as the Renewable Energy Act, aims to:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Ban renewable energy development', 'Promote renewable energy and reduce dependence on imported fossil fuels', 'Increase coal consumption', 'Eliminate hydropower projects 
 B — The law supports clean and sustainable energy. 
18. Climate change affects agriculture by causing:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'More predictable seasons', 'Unpredictable weather that reduces crop yields and affects food prices', 'Faster crop growth everywhere', 'Fewer agricultural pests 
 B — Changing weather patterns make farming more difficult. 
19. Mangrove forests are important because they:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Beautify coastlines only', 'Store blue carbon and protect coastal communities from storms', 'Block fishing boats', 'Slow waves only 
 B — Mangroves provide both climate mitigation and adaptation benefits. 
20. The National Renewable Energy Program (NREP) aims to achieve renewable energy shares of:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', '100% immediately', '35% by 2030 and 50% by 2040', '0% renewable energy', 'No renewable energy targets 
 B — These are the Philippine government''s renewable energy goals. 
21. Which statement correctly distinguishes mitigation from adaptation?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'They mean the same thing', 'Mitigation reduces emissions, while adaptation adjusts to climate impacts', 'Both are only government responsibilities', 'Adaptation prevents greenhouse gas emissions 
 B — One addresses the cause; the other manages the effects. 
22. Geothermal energy is especially important in the Philippines because it:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Is available only for export', 'Provides reliable 24-hour electricity using volcanic heat resources', 'Has no installation cost', 'Exists equally in every country 
 B — The Philippines is rich in geothermal resources due to its volcanic activity. 
23. Why is climate adaptation still necessary even if emissions are reduced?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Because mitigation does not work', 'Because some climate change is already unavoidable due to past emissions', 'Because laws require it', 'There is no specific reason 
 B — Existing greenhouse gases will continue affecting the climate. 
24. Renewable energy benefits the economy by:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Increasing dependence on imported fuels', 'Creating jobs, reducing fuel imports, and stabilizing energy prices', 'Slowing economic growth', 'Requiring permanent government subsidies 
 B — Renewable energy supports both economic and environmental goals. 
25. Which action contributes to BOTH climate mitigation and adaptation?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Turning off lights only', 'Planting native trees, building green roofs, and harvesting rainwater', 'Driving less only', 'Using fewer plastic bags only 
 B — These actions reduce emissions while helping communities adapt. 
26. The Philippines has renewable energy potential that is:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Very limited', 'Greater than the country''s current electricity demand', 'Enough only for rural communities', 'Smaller than coal resources 
 B — The country has abundant renewable energy resources. 
27. Climate justice recognizes that:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Every country contributes equally to climate change', 'Countries with lower emissions often suffer the greatest climate impacts and deserve support', 'Only developed countries should act', 'Climate change affects everyone equally 
 B — It focuses on fairness between those causing and experiencing climate impacts. 
28. Why do individual daily choices matter in addressing climate change?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Individual actions have no effect', 'Many small actions together can reduce emissions and influence businesses and governments', 'They only matter in school activities', 'Governments are the only ones responsible 
 B — Collective individual actions create significant change. 
29. One of the biggest challenges to expanding renewable energy in the Philippines is:', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'Lack of sunlight and wind', 'Existing coal contracts, slow permit processes, and limited power grid capacity', 'Renewable energy being too inexpensive', 'Complete public opposition to renewables 
 B — Infrastructure and policy barriers slow renewable energy growth. 
30. Why is sustainability important for young people today?', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000201', 1, '', 'It only matters for school examinations', 'Today''s environmental decisions will shape future safety, livelihoods, and quality of life', 'It is only the responsibility of adults', 'It has no personal impact 
 B — The future effects of climate change will be experienced by today''s younger generations.', 'D', 'Option D is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'Any object thrown, kicked, or launched into the air and acted on only by gravity and air resistance is called a:', 'Linear object', 'Stationary body', 'Circular object 
 D. Projectile  
 
2. The curved path a projectile follows through the air is its: 
 
 A. Trajectory  
 B. Radius 
 C. Slope', 'Axis', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'The two independent motions that combine to make projectile motion are:', 'Up and down only 
 B. Constant horizontal motion + accelerated vertical free-fall motion  
 C. Left and right only 
 D. Fast and slow motion 
 
4. If you kick a football with the same force, which angle will make it go the farthest horizontal distance 
(maximum range) on flat ground? 
 
 A. 75° 
 B. 45°  
 C. 15° 
 D. 30° 
 
5. If you want a basketball shot to go as high as possible into the air, you should release it at an angle closest to: 
 
 A. 45° 
 B. 90° (straight up)  
 C. 30° 
 D. 0° (horizontal) 
 
6. If you throw a ball horizontally and drop another identical ball from the same height at the same time, which 
hits the ground first? 
 
 A. Thrown ball hits first', 'Dropped ball hits first 
 C. Both hit at exactly the same time  
 D. Depends on color 
 
7. The horizontal distance a projectile travels from launch to landing is its: 
 
 A. Trajectory 
 B. Range', 'Height', 'Velocity', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'The maximum vertical distance the projectile reaches above launch level is its: * *A. Maximum height* ✅ * B. Trajectory * C. Range * D. Angle 9. If you shoot two basketballs at the same angle, the one thrown with more speed will have:', 'Same range and height', 'Less height only', 'Shorter range only 
 D. Both longer range and greater height  
 
10. When air resistance is ignored, the only force acting on a projectile after release is: 
 
 A. Wind forward 
 B. Magnetism 
 C. Gravity (pulling downward)', 'Your hand', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'A sepak takraw player kicks the ball at 30°, another kicks at the same speed at 60°. Their ranges will be:', '60° goes twice as far', '30° goes farther', 'Both fall at the same spot as 45° 
 D. Almost exactly equal (complementary angles)  
 
12. Between the same two complementary kicks above, which one reaches a higher maximum height? 
 
 A. Same height 
 B. 60° kick  
 C. Neither rises', '30° kick', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'Why does a basketball player use a high arc (large angle) when shooting from far away? * *A. To give the ball more time in the air to reach the hoop and enter the ring from above* ✅ * B. To use less force * C. To avoid gravity * D. To make it go faster 14. If you kick a football at 20° and another at 70° with the same speed, which has the shortest time of flight?', 'Same time 
 B. 20° kick  
 C. 70° kick 
 D. Both stay forever 
 
15. A projectile''s horizontal velocity component (ignoring air resistance) during flight: 
 
 A. Becomes zero at the top', 'Decreases due to gravity 
 C. Stays exactly constant  
 D. Increases due to gravity 
 
16. A projectile''s vertical velocity component at the exact top of its arc is: 
 
 A. Maximum upward 
 B. Equal to launch speed', 'Maximum downward 
 D. Zero (momentarily stops going up)  
 
17. In real life (with air resistance), a real football''s actual range compared to the ideal physics prediction will be: 
 
 A. Slightly shorter  
 B. Exactly the same 
 C. Longer', 'Twice as far', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'A long jumper wants maximum range. What combination should they aim for?', 'Very low angle only 
 B. Fast run-up + launch angle near 45°  
 C. Jump straight up 
 D. Very high angle only 
 
19. If you double the launch speed of a projectile at 45°, its range becomes approximately: 
 
 A. Same', '2× longer 
 C. 4× longer  
 D. 8× longer 
 
20. Two identical stones are thrown: A at 10 m/s, 45°; B at 20 m/s, 45°. Which statement is true? 
 
 A. Same flight time 
 B. B goes 4× farther, about 4× higher, and about 2× longer in the air', 'Same range', 'Same maximum height', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'Which is the correct full relationship among the four projectile variables?', 'Mass of the object is the biggest factor 
 B. Range and height depend on both launch speed and launch angle through horizontal and vertical velocity 
components  
 C. Only speed matters 
 D. Only angle matters 
 
22. At what point in a projectile''s full flight is its total speed slowest? 
 
 A. Same speed everywhere 
 B. At the very peak (top of the trajectory)  
 C. Right after launch 
 D. Right before landing 
 
23. A basketball is released and lands at the same height. At what two points in its path is its speed exactly equal? 
 
 A. Launch vs. top', 'Never equal 
 C. Any two points at the same height (e.g., halfway up and halfway down)  
 D. Top vs. landing 
 
24. Why do professional archers aim slightly above the target even at short distances? 
 
 A. To make it go faster 
 B. Wind always blows up 
 C. Gravity pulls the arrow downward during flight, so they must compensate for the drop  
 D. Tradition 
 
25. If you launch from ground level, which pair of angles will give the same range but very different heights and 
flight times? 
 
 A. 10° and 20° 
 B. 40° and 50°', '25° and 65° 
 D. Both B and C  
 
26. A boy kicks a ball horizontally off a 10 m cliff while another drops an identical ball from the same height at 
the same instant. Which hits first? 
 
 A. Kicked ball first 
 B. Both hit the ground at exactly the same time  
 C. Kicked ball never lands', 'Dropped ball first', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000301', 1, 'For a fixed launch speed, as angle increases from 0° → 45° → 90°, how do range and height change?', 'Both always decrease', 'Range constant; height rises 
 C. Range rises to a maximum at 45° then falls; height keeps increasing to 90°  
 D. Both always increase 
 
28. The only reason 45° gives maximum range on flat ground is: 
 
 A. Air resistance is zero only at 45° 
 B. Gravity is strongest there 
 C. It perfectly balances time of flight and horizontal speed so their product is maximized  
 D. It is the middle number 
 
29. In a projectile investigation using a marble launcher, a student keeps the angle fixed at 45° and increases 
compression (speed) each trial. They will observe: 
 
 A. Range stays the same 
 B. Height stays the same', 'Range increases linearly 
 D. Range increases roughly as the square of the compression distance  
 
30. Which everyday action is NOT an example of projectile motion? 
 
 A. Driving a car in a straight flat road at constant speed  
 B. Throwing a frisbee (ignoring lift) 
 C. Kicking a penalty', 'Shooting a three-pointer', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'Momentum is defined mathematically as:', 'Mass × acceleration 
 B. Mass × velocity (p = m × v)  
 C. Force × distance 
 D. Weight × height 
 
2. Momentum describes in physics what we mean in everyday life when we say: 
 
 A. An object is hot', 'An object is bright 
 C. A moving object is hard to stop  
 D. An object is heavy 
 
3. Which has more momentum: a slow truck or a fast bullet? 
 
 A. Always the truck 
 B. Depends on BOTH mass AND velocity of each', 'Always the bullet', 'They always have equal momentum', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'A collision where objects bounce off perfectly with no kinetic energy lost is called:', 'Inelastic', 'Explosion 
 C. Elastic  
 D. Plastic 
 
5. A collision where objects stick together or deform, losing kinetic energy to heat and sound, is called: 
 
 A. Perfect rebound 
 B. Inelastic', 'Conservative', 'Elastic', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'The Law of Conservation of Momentum says that if no outside force acts, total momentum before collision equals:', 'Zero always', 'Double before', 'Half before 
 D. Total momentum after collision  
 
7. To change an object''s momentum, you must apply: 
 
 A. A net force acting for some amount of time  
 B. Heat 
 C. Only mass', 'Only light', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'Seatbelts, airbags, and crumple zones all reduce injury mainly by:', 'Making the car lighter', 'Increasing force 
 C. Increasing the stopping time, lowering the average force  
 D. Stopping instantly 
 
9. If two identical jeepneys move at different speeds, the faster one has: 
 
 A. Same momentum 
 B. More momentum', 'Zero momentum', 'Less momentum', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'When a moving billiard ball hits a stationary identical ball head-on and stops, the target ball:', 'Explodes 
 B. Moves away with almost exactly the original ball''s speed  
 C. Also stays still 
 D. Moves twice as fast 
 
11. Which is the best everyday example of an almost elastic collision? 
 
 A. Two train cars coupling together 
 B. Two billiard balls colliding on a table  
 C. Car hitting a wall 
 D. A ball of clay hitting the floor 
 
12. Which is the best everyday example of a perfectly inelastic collision? 
 
 A. Two train cars bump and lock together moving as one', 'Marbles colliding', 'Superball bouncing', 'Tennis ball on a racket', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'A 2000-kg jeepney and a 200-kg motorcycle both move at 10 m/s. Which is harder to stop?', 'Equally hard', 'Motorcycle 
 C. Jeepney (10× more momentum)  
 D. Neither moves 
 
14. A fast lightweight boxer''s punch can still hurt a much heavier opponent because: 
 
 A. Gravity increases 
 B. Only mass matters', 'Mass doesn''t matter 
 D. High velocity gives the fist large momentum  
 
15. Why is falling on a soft mattress less painful than falling on concrete from the same height? 
 
 A. Concrete is colder 
 B. The mattress reduces your mass 
 C. The mattress increases stopping time, reducing force', 'Gravity is weaker on the mattress', 'C', 'Option C is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'When a cannon fires a cannonball forward, the cannon kicks backward. This is explained by:', 'Gravity 
 B. Conservation of momentum  
 C. Elastic collision 
 D. Magic 
 
17. In a car crash, crumple zones at the front help mainly by: 
 
 A. Looking nice 
 B. Making the passenger cabin stop over a longer time  
 C. Reducing car mass 
 D. Making the car faster 
 
18. Airbags work together with seatbelts because: 
 
 A. Seatbelts hold you while airbags spread the force and increase stopping time', 'Airbags alone stop you instantly', 'They look good', 'Seatbelts are useless alone', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'Two identical balls move at equal speed toward each other, collide, and bounce back at the same speed. This collision is:', 'Explosive 
 B. Very nearly elastic  
 C. Impossible 
 D. Perfectly inelastic 
 
20. If you want to maximize the change in momentum of a kicked football, you should: 
 
 A. Tap it softly', 'Use a very light foot', 'Kick perpendicular to the motion 
 D. Apply the largest possible force for the longest possible time  
 
21. Which correctly explains why momentum depends on BOTH mass and velocity? 
 
 A. A heavy slow object or a light fast object can both be equally hard to stop  
 B. Teacher said so 
 C. Mass cancels velocity', 'Only mass matters in collisions', 'A', 'Option A is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'In any collision—elastic or inelastic—which quantity is ALWAYS conserved?', 'Shape', 'Speed 
 C. Total linear momentum of the isolated system  
 D. Kinetic energy 
 
23. A 1-kg clay blob moving at 5 m/s hits and sticks to a 4-kg stationary block. Afterward the combined mass 
moves at: 
 
 A. 0 m/s 
 B. 5 m/s 
 C. 1 m/s  
 D. 2.5 m/s 
 
24. The main physics reason airbags reduce fatalities so dramatically is: 
 
 A. They block glass 
 B. They increase stopping time, reducing impact force', 'They cushion visually', 'They keep you awake', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'When you catch a fast raw egg without breaking it, you pull your hand backward while catching. This works because:', 'Gravity reverses', 'It increases the final velocity 
 C. It extends the contact time, reducing the average force  
 D. It reduces the egg''s mass 
 
26. Two cars of equal mass and speed collide head-on and stop. Compared with one car hitting a wall at the same 
speed, the force on each driver is: 
 
 A. Essentially identical  
 B. Half', 'Double', 'Zero', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'Which correctly ranks the stopping force on an identical passenger from LOWEST to HIGHEST?', 'Dashboard → Airbag → Seatbelt', 'All equal 
 C. Airbag + Seatbelt → Seatbelt only → Dashboard/Windshield  
 D. Wall → Airbag + Seatbelt → Seatbelt only 
 
28. In a student investigation with marbles of different masses rolled at different speeds, the pattern that will 
emerge is: 
 
 A. Only mass matters 
 B. Higher mass × higher speed produces greater momentum and greater impact', 'Only speed affects impact', 'No pattern', 'B', 'Option B is the correct answer.', true),
('b0000000-0000-0000-0000-000000000302', 1, 'A firefighter turns on a powerful hose and feels it push backward strongly. This is a direct result of:', 'Water being heavy', 'Friction', 'Air pressure 
 D. Conservation of momentum  
 
30. The key difference between elastic and inelastic collisions is: 
 
 A. Momentum is conserved only in elastic collisions 
 B. Total kinetic energy is conserved only in elastic collisions; momentum is conserved in both  
 C. Inelastic collisions have no momentum', 'There are no forces in elastic collisions', 'C', 'Option C is the correct answer.', true);
