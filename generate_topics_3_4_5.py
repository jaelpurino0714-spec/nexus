"""
generate_topics_3_4_5.py
Generates bespoke SVGs for Topics 3, 4, and 5 (Term 1 True/False Q1-40 each = 120 SVGs)
"""

import os
import xml.etree.ElementTree as ET
from generate_bespoke_term1_tf_svgs import (
    create_svg, OUTPUT_DIR, beaker_graphic, equation_box_graphic,
    balance_scale_graphic, collision_kinetics_graphic, feedback_loop_graphic
)

def generate_topic_3():
    print("Generating Topic 3 (Balancing Chemical Equations Q1-40)...")
    t_id = 3
    items = [
        (1, "REACTANT POSITION: LEFT SIDE OF ARROW",
         balance_scale_graphic("Reactants (Left)", "Products (Right)", 5, 5, True),
         "Starting chemical species are conventionally positioned on the left"),

        (2, "PRODUCT POSITION: RIGHT SIDE OF ARROW",
         equation_box_graphic("Reactants   ───→   Products", "RIGHT SIDE", "Reaction arrow points from reactants directly to produced species"),
         "Newly synthesized products are situated on the right side of the arrow"),

        (3, "STATE SYMBOL: AQUEOUS SOLUTION (aq)",
         beaker_graphic(205, 15, "#6366f1", 45, True, "Solute + Water (aq)"),
         "Symbol (aq) signifies that the chemical substance is dissolved in water"),

        (4, "STATE SYMBOL: SOLID STATE (s)",
         """<g transform="translate(130, 32)">
           <rect x="20" y="15" width="200" height="65" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
           <rect x="40" y="28" width="38" height="38" rx="4" fill="#a5b4fc" stroke="#6366f1" stroke-width="1.5"/>
           <text x="59" y="52" fill="#1e1b4b" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">(s)</text>
           <text x="145" y="45" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="800">Solid State</text>
           <text x="145" y="65" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Rigid Crystal Lattice</text>
         </g>""",
         "Symbol (s) designates a solid precipitate, metal, or crystal lattice"),

        (5, "STATE SYMBOL: GASEOUS STATE (g)",
         """<g transform="translate(130, 32)">
           <rect x="20" y="15" width="200" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
           <circle cx="55" cy="48" r="18" fill="#38bdf8" opacity="0.4"/>
           <text x="55" y="53" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">(g)</text>
           <text x="145" y="45" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="800">Gas Phase</text>
           <text x="145" y="65" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Freely Dispersed Molecules</text>
         </g>""",
         "Symbol (g) indicates a substance existing in the gaseous state"),

        (6, "CONSERVATION LAW: MASS CANNOT BE CREATED",
         balance_scale_graphic("Matter Before", "Matter After", 12, 12, True),
         "Mass is neither created nor destroyed during any chemical transformation"),

        (7, "REACTION DIRECTION VECTOR: YIELDS (→)",
         equation_box_graphic("Reactants   ──────→   Products", "YIELDS / PRODUCES", "Separates reactants from products and establishes transformation direction"),
         "The reaction arrow denotes 'yields' or 'produces' new chemical substances"),

        (8, "ADDITION OPERATOR: PLUS SIGN (+)",
         equation_box_graphic("A   +   B   ──────→   C   +   D", "REACTS WITH", "Connects participating molecules and stoichiometric molar ratios"),
         "The plus sign translates to 'reacts with' on reactant side and 'and' on products"),

        (9, "BALANCED ATOM STOICHIOMETRY",
         balance_scale_graphic("Left: 4 H, 2 O", "Right: 4 H, 2 O", 6, 6, True),
         "A balanced equation maintains equal numbers of each atomic element on both sides"),

        (10, "WATER SYNTHESIS BALANCING",
         equation_box_graphic("2 H₂(g)  +  O₂(g)   →   2 H₂O(l)", "BALANCED", "Left: 4 H, 2 O  |  Right: 4 H, 2 O"),
         "Correct balanced formula for water formation is 2 H₂ + O₂ → 2 H₂O (not H₂ + O)"),

        (11, "STATE SYMBOL: LIQUID STATE (l)",
         beaker_graphic(205, 15, "#38bdf8", 45, False, "Pure Liquid (l)"),
         "Symbol (l) designates a pure liquid phase, such as liquid water (H₂O(l))"),

        (12, "STOICHIOMETRIC COEFFICIENTS",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="50" y="55" fill="#fbbf24" font-family="monospace" font-size="28" font-weight="900">2</text>
           <text x="85" y="53" fill="#ffffff" font-family="monospace" font-size="20" font-weight="900">H₂O</text>
           <text x="160" y="42" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900">COEFFICIENT</text>
           <text x="160" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Multiplies entire unit</text>
         </g>""",
         "Coefficients specify the number of discrete molecules or moles reacting"),

        (13, "CHEMICAL SUBSCRIPTS IN FORMULAS",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="55" y="50" fill="#ffffff" font-family="monospace" font-size="22" font-weight="900">H</text>
           <text x="72" y="58" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="900">2</text>
           <text x="88" y="50" fill="#ffffff" font-family="monospace" font-size="22" font-weight="900">O</text>
           <text x="155" y="42" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="900">SUBSCRIPT</text>
           <text x="155" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Atoms in molecule</text>
         </g>""",
         "Subscripts denote the fixed number of atoms of an element bonded in a molecule"),

        (14, "CARBON DIOXIDE FORMULA ANATOMY",
         """<g transform="translate(120, 32)">
           <rect x="20" y="15" width="200" height="65" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.8"/>
           <text x="75" y="53" fill="#ffffff" font-family="monospace" font-size="22" font-weight="900">C O<tspan fill="#34d399" font-size="17" dy="5">2</tspan></text>
           <text x="155" y="42" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900">1 Carbon</text>
           <text x="155" y="60" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="700">2 Oxygen atoms</text>
         </g>""",
         "Carbon dioxide contains one carbon atom covalently bonded to two oxygens (CO₂)"),

        (15, "SUBSCRIPT IN CaCl₂ MOLECULAR RATIO",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="70" y="53" fill="#ffffff" font-family="monospace" font-size="20" font-weight="900">Ca Cl<tspan fill="#a78bfa" font-size="16" dy="5">2</tspan></text>
           <text x="160" y="42" fill="#a78bfa" font-family="sans-serif" font-size="11" font-weight="900">Subscript '2'</text>
           <text x="160" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="10.5" font-weight="700">Applies to Chlorine only</text>
         </g>""",
         "Subscript 2 in CaCl₂ specifies exactly two chlorine anions per calcium cation"),

        (16, "BALANCING RULE: CHANGE COEFFICIENTS ONLY",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="140" height="60" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="2"/>
           <text x="90" y="38" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">ALLOWED</text>
           <text x="90" y="58" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Change Coefficients (2 H₂O)</text>

           <rect x="180" y="15" width="140" height="60" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="2"/>
           <text x="250" y="38" fill="#ef4444" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">FORBIDDEN</text>
           <text x="250" y="58" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Never Alter Subscripts (H₂O₂)</text>
         </g>""",
         "Only stoichiometric coefficients can be altered; changing subscripts changes identity"),

        (17, "COEFFICIENT IDENTIFICATION: 3 H₂O",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="50" y="54" fill="#fbbf24" font-family="monospace" font-size="28" font-weight="900">3</text>
           <text x="85" y="52" fill="#ffffff" font-family="monospace" font-size="20" font-weight="900">H₂O</text>
           <text x="160" y="42" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900">Leading 3 is Coefficient</text>
           <text x="160" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Represents 3 water units</text>
         </g>""",
         "In 3 H₂O, the leading number 3 is a coefficient, not a subscript"),

        (18, "ALREADY BALANCED REACTION: Ca + Cl₂",
         equation_box_graphic("Ca(s)  +  Cl₂(g)   →   CaCl₂(s)", "BALANCED 1:1", "Reactants: 1 Ca, 2 Cl  =  Products: 1 Ca, 2 Cl"),
         "Ca + Cl₂ → CaCl₂ is naturally balanced with atom counts matching on both sides"),

        (19, "ATOMIC INVENTORY: 2 H₂SO₄",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="55" y="52" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="900">2 H₂SO₄</text>
           <text x="165" y="42" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="900">4 Hydrogen Atoms</text>
           <text x="165" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">2 molecules × 2 H = 4 H</text>
         </g>""",
         "Two sulfuric acid units contain exactly four hydrogen atoms (2 × 2 = 4)"),

        (20, "ATOMIC INVENTORY: 4 Al₂O₃",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#f472b6" stroke-width="1.5"/>
           <text x="55" y="52" fill="#f472b6" font-family="monospace" font-size="18" font-weight="900">4 Al₂O₃</text>
           <text x="165" y="42" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="900">12 Oxygen Atoms</text>
           <text x="165" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">4 units × 3 O = 12 O total</text>
         </g>""",
         "In 4 Al₂O₃, there are 8 aluminum atoms and 12 oxygen atoms total (4 × 3 = 12)"),

        (21, "ATOMIC TALLY IN Mg + 2 HCl",
         equation_box_graphic("Mg  +  2 HCl   →   MgCl₂  +  H₂", "PRODUCT TALLY", "Product side contains exactly two chlorine atoms in MgCl₂"),
         "Subscript 2 in MgCl₂ confirms two chlorine atoms on the product side"),

        (22, "FIRST STEP IN EQUATION BALANCING",
         """<g transform="translate(90, 34)">
           <rect x="20" y="15" width="260" height="60" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="150" y="38" fill="#fbbf24" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">STEP 1: ATOM TALLY INVENTORY</text>
           <text x="150" y="58" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Count atoms of each element on both sides</text>
         </g>""",
         "The essential first step in balancing is taking an accurate atom count on both sides"),

        (23, "PURPOSE OF BALANCING: CONSERVATION OF MASS",
         balance_scale_graphic("Law of Mass Conservation", "Equal Atom Counts", 8, 8, True),
         "Chemical equations are balanced to uphold the fundamental Law of Conservation of Mass"),

        (24, "OPEN VESSEL CONSERVATION DYNAMICS",
         """<g transform="translate(100, 30)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="140" y="40" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">Gas Escapes Open Vessel</text>
           <text x="140" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Mass Conservation Still Holds</text>
         </g>""",
         "Matter remains conserved universally, even if gaseous products escape open systems"),

        (25, "UNBALANCED SKELETON: N₂ + H₂ → NH₃",
         balance_scale_graphic("N₂ + H₂ (2 N, 2 H)", "NH₃ (1 N, 3 H)", 4, 4, False),
         "In skeleton N₂ + H₂ → NH₃, both nitrogen and hydrogen are initially unbalanced"),

        (26, "GLUCOSE MOLECULAR COUNT: 5 C₆H₁₂O₆",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="260" height="65" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.8"/>
           <text x="65" y="52" fill="#34d399" font-family="monospace" font-size="17" font-weight="900">5 C₆H₁₂O₆</text>
           <text x="175" y="42" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="900">30 Carbon Atoms</text>
           <text x="175" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">5 molecules × 6 C = 30 C</text>
         </g>""",
         "Five glucose molecules contain 30 carbon, 60 hydrogen, and 30 oxygen atoms"),

        (27, "CONSEQUENCES OF ALTERING SUBSCRIPTS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">ALTERING SUBSCRIPTS</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Changes Chemical Identity Entirely</text>
         </g>""",
         "Changing subscripts alters chemical formulas, inventing nonexistent substances"),

        (28, "BALANCED FORMATION OF WATER",
         equation_box_graphic("2 H₂(g)  +  O₂(g)   →   2 H₂O(l)", "BALANCED (4 H, 2 O)", "Conservation satisfied across reactants and products"),
         "2 H₂ + O₂ → 2 H₂O correctly and accurately balances water formation"),

        (29, "HABER PROCESS: AMMONIA SYNTHESIS",
         equation_box_graphic("N₂(g)  +  3 H₂(g)   →   2 NH₃(g)", "BALANCED (2 N, 6 H)", "Reactants: 2 N, 6 H  =  Products: 2 N, 6 H"),
         "N₂ + 3 H₂ → 2 NH₃ correctly satisfies conservation of mass"),

        (30, "ALUMINUM OXIDATION BALANCING",
         equation_box_graphic("4 Al(s)  +  3 O₂(g)   →   2 Al₂O₃(s)", "BALANCED (4 Al, 6 O)", "Correct balanced equation requires 4 Al and 3 O₂ to yield 2 Al₂O₃"),
         "4 Al + 3 O₂ → 2 Al₂O₃ correctly balances aluminum and oxygen atoms"),

        (31, "IRON RUSTING / MAGNETITE SYNTHESIS",
         equation_box_graphic("3 Fe(s)  +  4 H₂O(g)   →   Fe₃O₄(s)  +  4 H₂(g)", "BALANCED (3 Fe, 8 H, 4 O)", "Atom counts match across reactants and products"),
         "3 Fe + 4 H₂O → Fe₃O₄ + 4 H₂ strictly obeys conservation of mass"),

        (32, "ETHANE COMBUSTION OXYGEN TALLY",
         equation_box_graphic("2 C₂H₆  +  7 O₂   →   4 CO₂  +  6 H₂O", "14 OXYGEN ATOMS", "Reactant side: 7 O₂ molecules × 2 = 14 oxygen atoms"),
         "In 2 C₂H₆ + 7 O₂, exactly 14 oxygen atoms exist on the reactant side"),

        (33, "MASS STOICHIOMETRY: CARBON + OXYGEN",
         """<g transform="translate(70, 36)">
           <rect x="15" y="15" width="100" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="65" y="45" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">12 g C</text>
           <text x="135" y="47" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="900">+</text>
           <rect x="155" y="15" width="100" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="205" y="45" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">32 g O₂</text>
           <text x="275" y="47" fill="#fbbf24" font-family="sans-serif" font-size="20" font-weight="900">=</text>
           <rect x="295" y="15" width="100" height="50" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="345" y="45" fill="#34d399" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">44 g CO₂</text>
         </g>""",
         "Mass of reactants (12 g + 32 g = 44 g) exactly equals mass of product (44 g CO₂)"),

        (34, "ATOMIC REARRANGEMENT PRINCIPLE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">ATOMIC REARRANGEMENT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Atoms Shuffled, Never Destroyed</text>
         </g>""",
         "Balanced equations demonstrate that atoms are reorganized into new substances"),

        (35, "CHEMICAL IDENTITY INTEGRITY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#ef4444" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">SUBSCRIPTS DEFINE IDENTITY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Altering subscripts changes the compound</text>
         </g>""",
         "Changing subscripts alters chemical formulas, destroying molecular identity"),

        (36, "STATE SYMBOLS IN CONTEXT",
         """<g transform="translate(50, 38)">
           <rect x="15" y="15" width="90" height="50" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="60" y="45" fill="#a78bfa" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">(s) Solid</text>

           <rect x="115" y="15" width="90" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="160" y="45" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">(l) Liquid</text>

           <rect x="215" y="15" width="90" height="50" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="260" y="45" fill="#34d399" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">(g) Gas</text>

           <rect x="315" y="15" width="95" height="50" rx="6" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="362" y="45" fill="#f59e0b" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">(aq) Aqueous</text>
         </g>""",
         "State symbols (s, l, g, aq) communicate crucial physical phases in reactions"),

        (37, "SKELETON EQUATION DEFINITION",
         equation_box_graphic("H₂  +  O₂   ──→   H₂O", "SKELETON EQUATION", "Unbalanced formula equation representing identities without stoichiometric coefficients"),
         "Skeleton equations show reactant/product formulas without balancing coefficients"),

        (38, "COEFFICIENTS AS RELATIVE MOLE RATIOS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">STOICHIOMETRIC RATIOS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Coefficients represent relative molar ratios</text>
         </g>""",
         "Coefficients define macroscopic mole proportions required for stoichiometric reaction"),

        (39, "THERMOCHEMICAL ENTHALPY EQUATION",
         equation_box_graphic("CH₄ + 2 O₂  →  CO₂ + 2 H₂O    ΔH = -890 kJ", "THERMOCHEMICAL", "Specifies stoichiometric enthalpy change alongside balanced chemical species"),
         "Thermochemical equations include explicit enthalpy energy changes (ΔH)"),

        (40, "FINAL ATOM TALLY VERIFICATION",
         balance_scale_graphic("Verified Atom Count", "Conservation Compliance", 10, 10, True),
         "Final balanced equations must be verified via comprehensive atom tally")
    ]

    for q_id, title, xml_art, bottom in items:
        svg_content = create_svg(t_id, q_id, title, xml_art, bottom)
        fpath = os.path.join(OUTPUT_DIR, f"t{t_id}_tf_q{q_id}.svg")
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        try:
            ET.fromstring(svg_content)
        except Exception as e:
            print(f"Error in Topic {t_id} Q{q_id}: {e}")

generate_topic_3()

# Topic 4 Generator
def generate_topic_4():
    print("Generating Topic 4 (Rates of Reactions Q1-40)...")
    t_id = 4
    items = [
        (1, "REACTION RATE: REACTION VELOCITY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">REACTION RATE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Change in concentration per unit time</text>
         </g>""",
         "Rate measures how quickly reactants are consumed or products are formed"),

        (2, "TEMPERATURE EFFECT ON KINETICS",
         collision_kinetics_graphic(8, False, "Higher Temp = Faster Particle Collisions"),
         "Increasing temperature boosts kinetic energy and reaction velocity"),

        (3, "CATALYTIC ACCELERATION MECHANISM",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 Q 80 15 130 75" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,4"/>
           <path d="M 30 75 Q 80 45 130 75" fill="none" stroke="#10b981" stroke-width="3"/>
           <text x="80" y="25" fill="#f87171" font-family="sans-serif" font-size="10" font-weight="800">Uncatalyzed Ea</text>
           <text x="80" y="55" fill="#34d399" font-family="sans-serif" font-size="10" font-weight="900">Catalyzed Lower Ea</text>
           <text x="210" y="50" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="900">Catalyst Unconsumed</text>
         </g>""",
         "Catalysts accelerate reactions by lowering activation energy barriers"),

        (4, "ENDOTHERMIC HEAT ABSORPTION",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="130" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ENDOTHERMIC (ΔH &gt; 0)</text>
           <text x="130" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Absorbs Thermal Heat from Surroundings</text>
         </g>""",
         "Endothermic reactions absorb heat from surroundings, cooling the environment"),

        (5, "EXOTHERMIC HEAT EVOLUTION",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.8"/>
           <text x="130" y="42" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">EXOTHERMIC (ΔH &lt; 0)</text>
           <text x="130" y="62" fill="#fecdd3" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Releases Heat and Energy Outward</text>
         </g>""",
         "Exothermic reactions release thermal heat energy to their surroundings"),

        (6, "SURFACE AREA IMPACT ON RATE",
         """<g transform="translate(90, 32)">
           <rect x="20" y="20" width="50" height="50" rx="4" fill="#64748b" stroke="#94a3b8" stroke-width="1.5"/>
           <text x="45" y="48" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="800" text-anchor="middle">Solid Chunk</text>
           <text x="100" y="50" fill="#f59e0b" font-family="sans-serif" font-size="18" font-weight="900">→</text>
           <rect x="130" y="20" width="20" height="20" rx="2" fill="#cbd5e1"/>
           <rect x="155" y="20" width="20" height="20" rx="2" fill="#cbd5e1"/>
           <rect x="130" y="45" width="20" height="20" rx="2" fill="#cbd5e1"/>
           <rect x="155" y="45" width="20" height="20" rx="2" fill="#cbd5e1"/>
           <text x="235" y="48" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="800">Powdered = 4× Surface Contact</text>
         </g>""",
         "Greater exposed surface area increases particle collision frequency"),

        (7, "FIRE TRIANGLE ESSENTIALS",
         """<g transform="translate(130, 25)">
           <polygon points="120,15 50,85 190,85" fill="none" stroke="#ef4444" stroke-width="2.5"/>
           <text x="120" y="32" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">OXYGEN</text>
           <text x="75" y="78" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900">HEAT</text>
           <text x="165" y="78" fill="#f97316" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="end">FUEL</text>
         </g>""",
         "Fire triangle consists of fuel, heat, and oxygen (not carbon dioxide)"),

        (8, "LOW TEMPERATURE PRESERVATION: REFRIGERATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">REFRIGERATION (4°C)</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Retards Bacterial Spoilage Reactions</text>
         </g>""",
         "Low temperatures decrease kinetic collision rates, retarding chemical spoilage"),

        (9, "CHEMICAL INHIBITOR ACTION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f472b6" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">INHIBITOR MOLECULES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Slows down or prevents unwanted reactions</text>
         </g>""",
         "Inhibitors decrease chemical reaction rates or prevent reaction pathways"),

        (10, "WOOD COMBUSTION: EXOTHERMIC OXIDATION",
         equation_box_graphic("Cellulose  +  O₂   ──→   CO₂  +  H₂O  +  Flame Energy", "EXOTHERMIC", "Rapid combustion releases light and thermal heat energy"),
         "Burning wood is an exothermic reaction releasing heat to surroundings"),

        (11, "ACTIVATION ENERGY THRESHOLD (Ea)",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 Q 80 15 130 75" fill="none" stroke="#fbbf24" stroke-width="3"/>
           <line x1="30" y1="75" x2="130" y2="75" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
           <line x1="80" y1="15" x2="80" y2="75" stroke="#ef4444" stroke-width="2"/>
           <text x="95" y="45" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="900">Ea</text>
           <text x="180" y="45" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="900">Energy Hurdle</text>
         </g>""",
         "Activation energy is the minimum kinetic energy required to initiate reaction"),

        (12, "EFFECTIVE COLLISION CRITERIA",
         collision_kinetics_graphic(6, False, "Effective Collisions: Proper Energy & Orientation"),
         "Only collisions with adequate kinetic energy and correct orientation yield reaction"),

        (13, "SURFACE AREA ACCELERATION: TABLET POWDER",
         """<g transform="translate(120, 25)">
           """ + beaker_graphic(40, 15, "#0284c7", 45, True, "Powdered Dissolution") + """
           <text x="160" y="55" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="900">Powder Dissolves Faster</text>
         </g>""",
         "Crushing increases exposed surface area, speeding up dissolution dramatically"),

        (14, "CHARCOAL COMBUSTION SURFACE COMPARISON",
         """<g transform="translate(90, 32)">
           <rect x="20" y="20" width="40" height="40" rx="3" fill="#334155" stroke="#475569" stroke-width="1.5"/>
           <text x="40" y="45" fill="#94a3b8" font-family="sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">Lump</text>
           <text x="90" y="45" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">&lt;</text>
           <circle cx="130" cy="30" r="4" fill="#475569"/><circle cx="140" cy="40" r="4" fill="#475569"/><circle cx="150" cy="25" r="4" fill="#475569"/>
           <text x="230" y="45" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="800">Powder Burns Much Faster</text>
         </g>""",
         "Powdered charcoal burns faster than solid charcoal due to greater surface area"),

        (15, "TEMPERATURE RETARDATION: LOWER KINETICS",
         collision_kinetics_graphic(4, False, "Lower Temperature = Sluggish Particles"),
         "Lowering temperature reduces particle velocity and collision frequency"),

        (16, "CaCO₃ PARTICLE SIZE COMPARISON",
         """<g transform="translate(120, 25)">
           """ + beaker_graphic(40, 15, "#fbbf24", 45, True, "Acid + Powder") + """
           <text x="160" y="55" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="900">Powder: Vigorous Effervescence</text>
         </g>""",
         "Powdered CaCO₃ reacts much faster with acid than dense marble chips"),

        (17, "CONCENTRATION GRADIENT COLLISION DYNAMICS",
         collision_kinetics_graphic(12, False, "High Concentration = High Collision Probability"),
         "Higher reactant concentration packs more particles per unit volume"),

        (18, "BIOLOGICAL CATALYSTS: ENZYMES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ENZYMES = BIO-CATALYSTS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Accelerates Cellular Biochemical Reactions</text>
         </g>""",
         "Enzymes are protein catalysts that accelerate biochemical reactions safely"),

        (19, "FIRE EXTINGUISHMENT: COOLING THERMAL HEAT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">WATER ON FLAME</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Cools Fuel Below Ignition Temperature</text>
         </g>""",
         "Water extinguishes fire primarily by cooling fuel below its ignition threshold"),

        (20, "FIRE BLANKET OXYGEN STARVATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">FIRE BLANKET SMOTHER</text>
           <text x="140" y="62" fill="#fef08a" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Cuts Off Oxygen Supply Immediately</text>
         </g>""",
         "Fire blankets extinguish flames by cutting off ambient atmospheric oxygen"),

        (21, "CORROSION BARRIER: PROTECTIVE PAINT",
         """<g transform="translate(110, 32)">
           <rect x="20" y="25" width="130" height="40" rx="3" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
           <rect x="20" y="20" width="130" height="8" rx="2" fill="#3b82f6"/>
           <text x="85" y="50" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">Iron Protected</text>
           <text x="215" y="45" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="900">Paint Blocks H₂O &amp; O₂</text>
         </g>""",
         "Painting provides an impenetrable physical barrier against oxygen and moisture"),

        (22, "OSMOTIC PRESERVATION: FOOD SALTING",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">FOOD SALTING</text>
           <text x="140" y="62" fill="#fef08a" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Dehydrates Microbes (Lowers Water Activity)</text>
         </g>""",
         "Salting draws water out via osmosis, depriving spoilage microbes of moisture"),

        (23, "HERMETIC STERILIZATION: CANNING",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CANNING PRESERVATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Thermal Sterilization &amp; Airtight Seal</text>
         </g>""",
         "Canning relies on high-heat sterilization and hermetic seals (not surface area)"),

        (24, "MECHANICAL AGITATION: STIRRING",
         """<g transform="translate(120, 25)">
           """ + beaker_graphic(40, 15, "#0284c7", 45, True, "Stirring Vortex") + """
           <text x="160" y="55" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="900">Stirring Increases Collision Rate</text>
         </g>""",
         "Agitation / stirring circulates reactants, promoting frequent productive contact"),

        (25, "PHOTOSYNTHESIS ENDOTHERMIC PROFILE",
         equation_box_graphic("Solar Radiant Energy  +  CO₂  +  H₂O   →   Glucose  +  O₂", "ENERGY ABSORBED", "Absorbs solar energy; endothermic biosynthesis"),
         "Photosynthesis is endothermic because it absorbs radiant photon energy"),

        (26, "MAXWELL-BOLTZMANN DUAL EFFECT OF TEMPERATURE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">DUAL TEMPERATURE IMPACT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Higher collision frequency AND fraction exceeding Ea</text>
         </g>""",
         "Higher temp boosts collision count AND greatly multiplies particles exceeding Ea"),

        (27, "CATALYTIC REACTION PATHWAY ENERGETICS",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 Q 80 15 130 75" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3"/>
           <path d="M 30 75 Q 80 45 130 75" fill="none" stroke="#22c55e" stroke-width="3"/>
           <text x="180" y="45" fill="#4ade80" font-family="sans-serif" font-size="11.5" font-weight="900">Lower Energy Barrier</text>
         </g>""",
         "Catalysts provide an alternative mechanism possessing lower activation energy"),

        (28, "PHOTOSYNTHESIS IS NOT EXOTHERMIC",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PHOTOSYNTHESIS = ENDOTHERMIC</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Stores solar energy into covalent sugar bonds</text>
         </g>""",
         "Photosynthesis stores energy (endothermic); cellular respiration releases heat"),

        (29, "RAPID CHEMICAL KINETICS: EXPLOSIONS",
         """<g transform="translate(130, 25)">
           <polygon points="120,10 135,35 165,30 145,55 170,75 135,70 120,95 105,70 70,75 95,55 75,30 105,35" fill="#f59e0b" stroke="#ef4444" stroke-width="2"/>
           <text x="120" y="58" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">BLAST</text>
         </g>""",
         "Explosions exhibit extremely high reaction rates releasing heat and expanding gas"),

        (30, "LIMITING REACTANT DEPLETION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#94a3b8" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">REACTION TERMINATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Reaction halts when limiting reactant is consumed</text>
         </g>""",
         "Chemical reactions stop completely once the limiting reactant is exhausted"),

        (31, "CATALYTIC CONVERTER TOXIN REDUCTION",
         """<g transform="translate(70, 36)">
           <rect x="15" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="67" y="45" fill="#f87171" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">CO, NOx, HC</text>
           <text x="150" y="47" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">──Pt/Rh──→</text>
           <rect x="235" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="287" y="45" fill="#34d399" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">CO₂, N₂, H₂O</text>
         </g>""",
         "Precious metal catalysts in converters turn harmful exhaust into benign gases"),

        (32, "OXYGEN CONCENTRATION IN COMBUSTION",
         equation_box_graphic("Pure O₂ Gas   +   Fuel   ──→   Violent Fast Combustion", "OXYGEN ENRICHED", "Higher O₂ partial pressure dramatically accelerates burning speed"),
         "Enriching oxygen concentration causes combustion reactions to occur far more rapidly"),

        (33, "SACRIFICIAL PROTECTION: GALVANIZING IRON",
         """<g transform="translate(110, 32)">
           <rect x="20" y="25" width="130" height="40" rx="3" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
           <rect x="20" y="20" width="130" height="8" rx="2" fill="#22c55e"/>
           <text x="85" y="50" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">Iron Substrate</text>
           <text x="215" y="45" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="900">Zinc Coating (Zn)</text>
         </g>""",
         "Galvanization coats iron with sacrificial zinc, which oxidizes preferentially"),

        (34, "PHOTOCHEMICAL ACTIVATION BY LIGHT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PHOTOCHEMICAL REACTIONS</text>
           <text x="140" y="62" fill="#fef08a" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Photons supply threshold activation energy</text>
         </g>""",
         "Light intensity dictates reaction velocity in photochemical processes"),

        (35, "PRESSURE IMPACT ON GAS KINETICS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GAS PRESSURE (P ↑)</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Compresses gas volume; increases collision frequency</text>
         </g>""",
         "Increasing gas pressure forces molecules closer together, raising reaction rates"),

        (36, "HETEROGENEOUS CATALYSIS PHASES",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="85" y="38" fill="#c084fc" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Solid Catalyst</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Platinum Metal</text>

           <text x="175" y="47" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="900">≠</text>

           <rect x="200" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="265" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Fluid Reactants</text>
           <text x="265" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Gases / Liquids</text>
         </g>""",
         "Heterogeneous catalysts exist in a distinct physical phase from the reactants"),

        (37, "HOMOGENEOUS CATALYSIS IN SAME PHASE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">HOMOGENEOUS CATALYSIS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Catalyst and reactants occupy identical physical phase</text>
         </g>""",
         "Homogeneous catalysts share the exact same phase (e.g., both aqueous) as reactants"),

        (38, "POTENTIAL ENERGY REACTION PROFILES",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 Q 80 15 130 75" fill="none" stroke="#f59e0b" stroke-width="3"/>
           <text x="80" y="12" fill="#fbbf24" font-family="sans-serif" font-size="10" font-weight="900">Transition State</text>
           <text x="180" y="45" fill="#f8fafc" font-family="sans-serif" font-size="11.5" font-weight="800">Reaction Coordinate Map</text>
         </g>""",
         "Potential energy diagrams map activation hurdles and enthalpy shifts along reactions"),

        (39, "REACTION HALF-LIFE DYNAMICS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">REACTION HALF-LIFE (t₁/₂)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Time needed for 50% reactant consumption</text>
         </g>""",
         "Half-life quantifies the time elapsed for reactant concentration to drop by half"),

        (40, "RATE OPTIMIZATION IN INDUSTRIAL SYNTHESIS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CHEMICAL ENGINEERING</text>
           <text x="140" y="62" fill="#fef08a" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Rate control ensures safe yields and economic viability</text>
         </g>""",
         "Controlling kinetic rates is critical for safe and optimal chemical production")
    ]

    for q_id, title, xml_art, bottom in items:
        svg_content = create_svg(t_id, q_id, title, xml_art, bottom)
        fpath = os.path.join(OUTPUT_DIR, f"t{t_id}_tf_q{q_id}.svg")
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        try:
            ET.fromstring(svg_content)
        except Exception as e:
            print(f"Error in Topic {t_id} Q{q_id}: {e}")

generate_topic_4()

# Topic 5 Generator
def generate_topic_5():
    print("Generating Topic 5 (Homeostasis & Regulation Q1-40)...")
    t_id = 5
    items = [
        (1, "DYNAMIC HOMEOSTASIS DEFINITION",
         feedback_loop_graphic("Stimulus", "Receptor", "Control Center", "Effector", "Set Point"),
         "Homeostasis maintains dynamic equilibrium of the internal physiological state"),

        (2, "DYNAMIC EQUILIBRIUM FLUCTUATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">DYNAMIC EQUILIBRIUM</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Fluctuates within tight tolerance bounds, not rigid</text>
         </g>""",
         "Homeostasis permits controlled physiological oscillations within normal ranges"),

        (3, "DUAL CONTROL: NERVOUS &amp; ENDOCRINE",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Nervous System</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Rapid Electrical Signals</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="235" y="38" fill="#a78bfa" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Endocrine System</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Sustained Hormonal Loops</text>
         </g>""",
         "The nervous and endocrine organ systems coordinate systemic homeostasis"),

        (4, "THERMOREGULATION: SWEATING NEGATIVE FEEDBACK",
         feedback_loop_graphic("Heat Exposure", "Thermoreceptors", "Hypothalamus", "Sweat Glands", "Cooling"),
         "Sweating is a negative feedback cooling response that counters overheating"),

        (5, "PHYSIOLOGICAL SET POINT TARGET",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SET POINT (37.0°C / pH 7.4)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Ideal target value defended by feedback loops</text>
         </g>""",
         "The set point represents the optimal physiological value defended by negative feedback"),

        (6, "RECEPTOR VS EFFECTOR FUNCTION",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Receptors</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Sensory Detectors</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="235" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Effectors</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Carry Out Restorative Acts</text>
         </g>""",
         "Receptors detect internal changes; effectors execute corrective physiological responses"),

        (7, "EFFECTOR EXAMPLES: MUSCLES &amp; GLANDS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOLOGICAL EFFECTORS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Skeletal muscles, smooth muscles, and endocrine glands</text>
         </g>""",
         "Muscles and glandular tissues serve as effectors that restore set point equilibrium"),

        (8, "NEGATIVE FEEDBACK MECHANISM",
         feedback_loop_graphic("Disruption", "Sensors", "Comparator", "Correction", "Restores Set Point"),
         "Negative feedback acts to reverse deviations, restoring the internal set point"),

        (9, "REGULATED PHYSIOLOGICAL PARAMETERS",
         """<g transform="translate(50, 38)">
           <rect x="15" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.5"/>
           <text x="67" y="45" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Core Temp (37°C)</text>

           <rect x="130" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="182" y="45" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Blood pH (7.4)</text>

           <rect x="245" y="15" width="130" height="50" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="310" y="45" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Glucose (90 mg/dL)</text>
         </g>""",
         "Core temperature, blood pH, and glucose concentration are strictly regulated variables"),

        (10, "DEVELOPMENTAL TRAITS VS HOMEOSTATIC SET POINTS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">HUMAN STATURE / HEIGHT</text>
           <text x="140" y="62" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600" text-anchor="middle">Developmental growth curve, not homeostatic set point</text>
         </g>""",
         "Height increases during development and is not a regulated homeostatic variable"),

        (11, "THERMAL CONTROL: THE HYPOTHALAMUS",
         feedback_loop_graphic("Thermal Shift", "Receptors", "Hypothalamus", "Vessels / Sweat", "37°C"),
         "The hypothalamus in the brain serves as the master control center for body temperature"),

        (12, "COLD RESPONSE: VASOCONSTRICTION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">VASOCONSTRICTION</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Dermal blood vessels narrow to conserve core heat</text>
         </g>""",
         "Skin blood vessels constrict in cold conditions to preserve core thermal heat"),

        (13, "CHEMICAL MESSENGERS: HORMONES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ENDOCRINE HORMONES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Circulatory chemical messengers coordinating target tissues</text>
         </g>""",
         "Endocrine glands secrete hormones into the bloodstream to coordinate systemic responses"),

        (14, "GLUCOSE REGULATION: INSULIN &amp; GLUCAGON",
         """<g transform="translate(80, 35)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="85" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Insulin (Beta Cells)</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Lowers Blood Sugar</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
           <text x="235" y="38" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Glucagon (Alpha Cells)</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Raises Blood Sugar</text>
         </g>""",
         "Insulin and glucagon act antagonistically to stabilize blood glucose levels"),

        (15, "HYPERGLYCEMIA RESPONSE: INSULIN RELEASE",
         feedback_loop_graphic("High Glucose", "Beta Cells", "Pancreas", "Insulin Secretion", "Liver Uptake"),
         "When blood sugar rises, pancreatic beta cells secrete insulin, not glucagon"),

        (16, "HYPOGLYCEMIA RESPONSE: GLUCAGON RELEASE",
         feedback_loop_graphic("Low Glucose", "Alpha Cells", "Pancreas", "Glucagon Secretion", "Glycogen Breakdown"),
         "When blood sugar drops, pancreatic alpha cells release glucagon to mobilize glucose"),

        (17, "RENAL OSMOREGULATION: SALT &amp; WATER",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">KIDNEY OSMOREGULATION</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Maintains precise body water, salt, and pH balance</text>
         </g>""",
         "Kidneys filter blood and regulate water and electrolyte reabsorption"),

        (18, "THERMOGENESIS: SHIVERING REFLEX",
         feedback_loop_graphic("Cold Stimulus", "Receptors", "Hypothalamus", "Skeletal Muscles", "Metabolic Heat"),
         "Shivering involves rapid involuntary muscle contractions that generate metabolic heat"),

        (19, "BODY MASS DYNAMICS VS SET POINTS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#94a3b8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BODY WEIGHT DYNAMICS</text>
           <text x="140" y="62" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600" text-anchor="middle">Fluctuates with intake/expenditure; not rigid set point</text>
         </g>""",
         "Body weight fluctuates naturally with caloric balance and is not a strict set point"),

        (20, "OPPOSING ACTIONS OF PANCREATIC HORMONES",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="85" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Insulin ↓</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Glucose → Glycogen</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
           <text x="235" y="38" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Glucagon ↑</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Glycogen → Glucose</text>
         </g>""",
         "Insulin drives glucose into storage, while glucagon stimulates glucose release"),

        (21, "POSITIVE FEEDBACK AMPLIFICATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">POSITIVE FEEDBACK</text>
           <text x="140" y="62" fill="#fecdd3" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Amplifies physiological change until decisive culmination</text>
         </g>""",
         "Positive feedback loops amplify deviations rather than reversing them"),

        (22, "HEMOSTASIS: BLOOD CLOTTING CASCADE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f87171" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PLATELET CASCADE</text>
           <text x="140" y="62" fill="#fecdd3" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Positive feedback cascade until vessel tear is sealed</text>
         </g>""",
         "Blood clotting factors recruit further platelets via positive feedback until sealed"),

        (23, "METABOLIC ENERGY DEMANDS OF HOMEOSTASIS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ACTIVE ATP EXPENDITURE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Cellular transport pumps continuously maintain balance</text>
         </g>""",
         "Homeostasis requires substantial metabolic energy (ATP) to maintain gradients"),

        (24, "ENZYME KINETIC SENSITIVITY TO BLOOD pH",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">BLOOD pH (7.35 - 7.45)</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Deviations denature metabolic enzymes rapidly</text>
         </g>""",
         "Deviations in blood pH disrupt enzyme conformation and catalytic activity"),

        (25, "PULMONARY GAS EXCHANGE DURING EXERCISE",
         feedback_loop_graphic("CO₂ Buildup", "Chemoreceptors", "Medulla Oblongata", "Diaphragm Muscles", "Restores pH"),
         "Breathing rate accelerates during exercise to expel CO₂ and restore blood pH"),

        (26, "ORDER OF HOMEOSTATIC REFLEX ARC",
         feedback_loop_graphic("1. Stimulus", "2. Receptor", "3. Control Center", "4. Effector", "Feedback Arc"),
         "Standard feedback sequence: Stimulus → Receptor → Control Center → Effector"),

        (27, "PARTURITION: OXYTOCIN POSITIVE FEEDBACK",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CHILDBIRTH CONTRACTIONS</text>
           <text x="140" y="62" fill="#fecdd3" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Oxytocin release accelerates contractions (Positive Feedback)</text>
         </g>""",
         "Uterine contractions intensify via oxytocin positive feedback until birth"),

        (28, "PATHOLOGY: HOMEOSTATIC BREAKDOWN",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">HOMEOSTATIC FAILURE</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Uncompensated imbalances result in disease or mortality</text>
         </g>""",
         "Prolonged failure of homeostatic regulation causes clinical disease or death"),

        (29, "WATER RETENTION: ADH HORMONAL LOOP",
         feedback_loop_graphic("Dehydration", "Osmoreceptors", "Hypothalamus", "Nephron Tubules", "Water Retained"),
         "Antidiuretic hormone (ADH) signals kidney nephrons to reabsorb water during dehydration"),

        (30, "BARORECEPTOR REFLEX: ARTERIAL BLOOD PRESSURE",
         feedback_loop_graphic("High BP", "Baroreceptors", "Brainstem", "Heart & Vessels", "Lowers BP"),
         "Baroreceptors in the carotid sinus initiate negative feedback to normalize blood pressure"),

        (31, "DYNAMIC EQUILIBRIUM FLUCTUATION RANGES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">DYNAMIC EQUILIBRIUM</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Internal state fluctuates within defended set-point limits</text>
         </g>""",
         "Dynamic equilibrium represents a stable homeostatic balance with natural minor variance"),

        (32, "DIABETES MELLITUS PATHOLOGY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">DIABETES MELLITUS</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Failure of insulin synthesis or peripheral sensitivity</text>
         </g>""",
         "Diabetes is characterized by dysregulated blood glucose and insulin dysfunction"),

        (33, "CELLULAR MACHINERY STABILITY DEPENDENCY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CELLULAR STABILITY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Organ and cell function requires controlled osmolarity &amp; pH</text>
         </g>""",
         "Proper organ and biochemical enzyme function requires stable physiological bounds"),

        (34, "OSMOREGULATION: WATER &amp; ION EQUILIBRIUM",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">OSMOREGULATION</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Defends balance of water and osmotic solute tonicity</text>
         </g>""",
         "Osmoregulation strictly defends fluid and electrolyte balance in the body"),

        (35, "HEPATIC GLUCOSE BUFFER: THE LIVER",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">LIVER METABOLISM</text>
           <text x="140" y="62" fill="#fef08a" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Stores glycogen and mobilizes glucose on demand</text>
         </g>""",
         "The liver plays a vital role, storing excess glucose as glycogen and releasing it"),

        (36, "PYREXIA: FEVER HYPOTHALAMIC RESET",
         feedback_loop_graphic("Pyrogens / Infection", "Hypothalamus", "Thermal Reset", "Elevated Core Temp", "Fever Defended"),
         "Fever represents an elevated hypothalamic thermal set point to fight infection"),

        (37, "ECTOTHERMIC THERMAL REGULATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ECTOTHERMIC ANIMALS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Rely on external environmental warmth, not internal metabolic heat</text>
         </g>""",
         "Ectotherms regulate body heat primarily through external ambient heat sources"),

        (38, "SIGNAL TRANSDUCTION CASCADES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SIGNAL TRANSDUCTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Receptor binding initiates downstream cellular response cascades</text>
         </g>""",
         "Hormonal and neural homeostatic signals operate through cellular signal transduction"),

        (39, "NEPHRON MICROSCOPIC FUNCTIONAL UNIT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">RENAL NEPHRONS</text>
           <text x="140" y="62" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Filters blood plasma and reabsorbs electrolytes</text>
         </g>""",
         "Nephrons are the microscopic functional units performing renal filtration"),

        (40, "INTEGRATED MULTI-ORGAN HOMEOSTATIC NETWORK",
         feedback_loop_graphic("Cardiovascular", "Renal System", "Nervous System", "Endocrine Glands", "Organism Survival"),
         "Survival depends on integrated communication across multi-organ homeostatic networks")
    ]

    for q_id, title, xml_art, bottom in items:
        svg_content = create_svg(t_id, q_id, title, xml_art, bottom)
        fpath = os.path.join(OUTPUT_DIR, f"t{t_id}_tf_q{q_id}.svg")
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        try:
            ET.fromstring(svg_content)
        except Exception as e:
            print(f"Error in Topic {t_id} Q{q_id}: {e}")

generate_topic_5()
