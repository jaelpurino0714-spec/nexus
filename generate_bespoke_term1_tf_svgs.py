"""
generate_bespoke_term1_tf_svgs.py
Generates 320 bespoke, scientifically accurate, non-repeating SVG illustrations for Term 1 True/False.
"""

import os
import json
import xml.etree.ElementTree as ET

OUTPUT_DIR = "web_simulator/assets/illustrations/term1_tf"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TOPIC_CONFIGS = {
    1: {"name": "TOPIC 1: PHYSICAL &amp; CHEMICAL CHANGES", "badge": "EXPERIMENT", "color": "#06b6d4", "sec": "#38bdf8"},
    2: {"name": "TOPIC 2: ACIDS, BASES &amp; SALTS", "badge": "ACID-BASE", "color": "#ec4899", "sec": "#f472b6"},
    3: {"name": "TOPIC 3: BALANCING CHEMICAL EQUATIONS", "badge": "EQUATIONS", "color": "#6366f1", "sec": "#818cf8"},
    4: {"name": "TOPIC 4: RATES OF CHEMICAL REACTIONS", "badge": "KINETICS", "color": "#f59e0b", "sec": "#fbbf24"},
    5: {"name": "TOPIC 5: HOMEOSTASIS AND REGULATION", "badge": "REGULATION", "color": "#10b981", "sec": "#34d399"},
    6: {"name": "TOPIC 6: EVOLUTION AND NATURAL SELECTION", "badge": "EVOLUTION", "color": "#a855f7", "sec": "#c084fc"},
    7: {"name": "TOPIC 7: BIODIVERSITY AND ECOSYSTEMS", "badge": "ECOLOGY", "color": "#14b8a6", "sec": "#2dd4bf"},
    8: {"name": "TOPIC 8: HEREDITY AND GENETICS", "badge": "GENETICS", "color": "#8b5cf6", "sec": "#a78bfa"}
}

def escape_xml(text):
    if not text:
        return ""
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")

def create_svg(topic_id, q_id, title_text, visual_elements_xml, bottom_text):
    cfg = TOPIC_CONFIGS[topic_id]
    color = cfg["color"]
    sec = cfg["sec"]
    tname = cfg["name"]
    badge = cfg["badge"]
    grad_id = f"bg_t{topic_id}_tf_{q_id}"
    glow_id = f"glow_t{topic_id}_tf_{q_id}"

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 250" width="100%" height="100%">
  <defs>
    <linearGradient id="{grad_id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c18"/>
      <stop offset="50%" stop-color="#0d1428"/>
      <stop offset="100%" stop-color="#121b36"/>
    </linearGradient>
    <filter id="{glow_id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="540" height="250" rx="16" fill="url(#{grad_id})" stroke="{color}" stroke-width="1.5" stroke-opacity="0.5"/>

  <!-- Subtle Ambient Grid -->
  <g opacity="0.04" stroke="{color}" stroke-width="1">
    <line x1="90" y1="0" x2="90" y2="250"/><line x1="180" y1="0" x2="180" y2="250"/>
    <line x1="270" y1="0" x2="270" y2="250"/><line x1="360" y1="0" x2="360" y2="250"/>
    <line x1="450" y1="0" x2="450" y2="250"/>
    <line x1="0" y1="65" x2="540" y2="65"/><line x1="0" y1="130" x2="540" y2="130"/><line x1="0" y1="195" x2="540" y2="195"/>
  </g>

  <!-- Top Glassmorphism Banner -->
  <rect x="20" y="10" width="500" height="34" rx="10" fill="#1e1b4b" fill-opacity="0.85" stroke="{color}" stroke-width="1.2" stroke-opacity="0.45"/>
  <circle cx="36" cy="27" r="5.5" fill="{color}" filter="url(#{glow_id})"/>
  <text x="50" y="32" fill="{color}" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" letter-spacing="0.5">{tname} • Q{q_id}</text>
  
  <rect x="385" y="15" width="125" height="24" rx="12" fill="{color}"/>
  <text x="447" y="31" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.5">{badge}</text>

  <!-- Main Illustration Artwork Card -->
  <g transform="translate(25, 48)">
    <rect x="0" y="0" width="490" height="185" rx="14" fill="#0f172a" fill-opacity="0.95" stroke="{color}" stroke-width="2"/>
    
    <!-- Title -->
    <text x="245" y="24" fill="{sec}" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="0.5">
      {escape_xml(title_text)}
    </text>

    <!-- Specific Visual Elements -->
    {visual_elements_xml}

    <!-- Bottom Concept Callout -->
    <g transform="translate(25, 142)">
      <rect x="0" y="0" width="440" height="32" rx="8" fill="#1e1b4b" stroke="{sec}" stroke-width="1.2"/>
      <text x="220" y="21" fill="#f8fafc" font-family="'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">
        {escape_xml(bottom_text)}
      </text>
    </g>
  </g>
</svg>"""
    return svg

# Visual Component Helpers
def beaker_graphic(x, y, liquid_color, liquid_height=45, bubbles=True, solute_label=""):
    bubbles_xml = ""
    if bubbles:
        bubbles_xml = f"""
        <circle cx="{x+25}" cy="{y+65}" r="3" fill="#ffffff" opacity="0.6"/>
        <circle cx="{x+45}" cy="{y+55}" r="2" fill="#ffffff" opacity="0.8"/>
        <circle cx="{x+35}" cy="{y+40}" r="2.5" fill="#ffffff" opacity="0.5"/>
        <circle cx="{x+55}" cy="{y+45}" r="3.5" fill="#ffffff" opacity="0.7"/>
        """
    label_xml = f'<text x="{x+40}" y="{y+95}" fill="#94a3b8" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">{escape_xml(solute_label)}</text>' if solute_label else ""
    return f"""
    <g>
      <!-- Beaker Rim & Glass Body -->
      <path d="M {x+5} {y+15} L {x+10} {y+15} L {x+15} {y+80} Q {x+15} {y+85} {x+20} {y+85} L {x+60} {y+85} Q {x+65} {y+85} {x+65} {y+80} L {x+70} {y+15} L {x+75} {y+15}" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <!-- Liquid Fill -->
      <path d="M {x+16} {y+85-liquid_height} L {x+16} {y+80} Q {x+16} {y+84} {x+20} {y+84} L {x+60} {y+84} Q {x+64} {y+84} {x+64} {y+80} L {x+64} {y+85-liquid_height} Z" fill="{liquid_color}" opacity="0.75"/>
      <!-- Meniscus line -->
      <ellipse cx="{x+40}" cy="{y+85-liquid_height}" rx="24" ry="4" fill="{liquid_color}" opacity="0.9"/>
      <!-- Measurement ticks -->
      <line x1="{x+18}" y1="{y+35}" x2="{x+26}" y2="{y+35}" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      <line x1="{x+18}" y1="{y+50}" x2="{x+28}" y2="{y+50}" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      <line x1="{x+18}" y1="{y+65}" x2="{x+26}" y2="{y+65}" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
      {bubbles_xml}
      {label_xml}
    </g>
    """

def test_tube_litmus(x, y, tube_liquid_color, strip_top_color, strip_bottom_color, label=""):
    return f"""
    <g>
      <!-- Test Tube Glass -->
      <rect x="{x+15}" y="{y+15}" width="30" height="65" rx="15" fill="none" stroke="#38bdf8" stroke-width="2"/>
      <path d="M {x+16} {y+40} L {x+16} {y+65} Q {x+16} {y+79} {x+30} {y+79} Q {x+44} {y+79} {x+44} {y+65} L {x+44} {y+40} Z" fill="{tube_liquid_color}" opacity="0.8"/>
      <!-- Litmus Paper Strip Dipping In -->
      <rect x="{x+25}" y="{y+5}" width="10" height="35" rx="2" fill="{strip_top_color}"/>
      <rect x="{x+25}" y="{y+40}" width="10" height="25" rx="2" fill="{strip_bottom_color}"/>
      <text x="{x+30}" y="{y+95}" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">{escape_xml(label)}</text>
    </g>
    """

def ph_spectrum_bar(current_ph=7, pointer_label="Neutral (pH 7)"):
    # pH 0 to 14 mapped to x=60 to x=430 (width=370)
    norm_ph = max(0, min(14, current_ph))
    ptr_x = 60 + int((norm_ph / 14.0) * 370)
    return f"""
    <g transform="translate(0, 38)">
      <defs>
        <linearGradient id="ph_grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="25%" stop-color="#f97316"/>
          <stop offset="50%" stop-color="#22c55e"/>
          <stop offset="75%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
      </defs>
      <!-- Spectrum Bar -->
      <rect x="60" y="30" width="370" height="24" rx="8" fill="url(#ph_grad)" stroke="#1e293b" stroke-width="2"/>
      <!-- Scale Labels -->
      <text x="60" y="22" fill="#ef4444" font-family="sans-serif" font-size="11" font-weight="900">pH 1 (Acid)</text>
      <text x="245" y="22" fill="#22c55e" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">pH 7 (Neutral)</text>
      <text x="430" y="22" fill="#8b5cf6" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="end">pH 14 (Base)</text>
      
      <!-- Pointer Needle -->
      <polygon points="{ptr_x-8},{60} {ptr_x+8},{60} {ptr_x},{52}" fill="#fbbf24"/>
      <rect x="{ptr_x-50}" y="62" width="100" height="22" rx="6" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.2"/>
      <text x="{ptr_x}" y="77" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">{escape_xml(pointer_label)}</text>
    </g>
    """

def equation_box_graphic(eq_str, type_badge="", sub_note=""):
    badge_xml = f"""
    <rect x="330" y="16" width="120" height="24" rx="6" fill="#312e81" stroke="#818cf8" stroke-width="1"/>
    <text x="390" y="32" fill="#a5b4fc" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">{escape_xml(type_badge)}</text>
    """ if type_badge else ""
    return f"""
    <g transform="translate(20, 32)">
      <!-- Equation Main Display -->
      <rect x="0" y="0" width="450" height="96" rx="12" fill="#1e293b" stroke="#6366f1" stroke-width="1.8"/>
      {badge_xml}
      <text x="225" y="58" fill="#ffffff" font-family="'Consolas', 'Courier New', monospace" font-size="21" font-weight="900" text-anchor="middle" letter-spacing="1">
        {escape_xml(eq_str)}
      </text>
      <text x="225" y="82" fill="#94a3b8" font-family="sans-serif" font-size="11.5" font-weight="600" text-anchor="middle">
        {escape_xml(sub_note)}
      </text>
    </g>
    """

def balance_scale_graphic(left_formula, right_formula, left_atoms_count, right_atoms_count, is_balanced=True):
    pivot_x = 245
    beam_y = 52
    angle = 0 if is_balanced else (-8 if left_atoms_count > right_atoms_count else 8)
    status_text = "BALANCED: Atom Counts Equal on Both Sides" if is_balanced else "UNBALANCED: Requires Coefficient Adjustment"
    status_color = "#34d399" if is_balanced else "#f87171"
    return f"""
    <g transform="translate(0, 34)">
      <!-- Scale Fulcrum & Stand -->
      <polygon points="245,45 230,85 260,85" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
      <rect x="215" y="85" width="60" height="10" rx="3" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <!-- Balance Beam -->
      <line x1="80" y1="50" x2="410" y2="50" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
      <!-- Left Pan -->
      <line x1="120" y1="50" x2="90" y2="75" stroke="#64748b" stroke-width="1.5"/>
      <line x1="120" y1="50" x2="150" y2="75" stroke="#64748b" stroke-width="1.5"/>
      <rect x="80" y="75" width="80" height="22" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="120" y="90" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(left_formula)}</text>
      <!-- Right Pan -->
      <line x1="370" y1="50" x2="340" y2="75" stroke="#64748b" stroke-width="1.5"/>
      <line x1="370" y1="50" x2="400" y2="75" stroke="#64748b" stroke-width="1.5"/>
      <rect x="330" y="75" width="80" height="22" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
      <text x="370" y="90" fill="#a78bfa" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(right_formula)}</text>
      <!-- Center Indicator -->
      <text x="245" y="32" fill="{status_color}" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">{status_text}</text>
    </g>
    """

def collision_kinetics_graphic(particles_count=8, has_catalyst=False, temp_label="High Temperature (Kinetic Energy ↑)"):
    return f"""
    <g transform="translate(45, 36)">
      <!-- Reaction Chamber Box -->
      <rect x="0" y="0" width="400" height="92" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="200" y="20" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">{escape_xml(temp_label)}</text>
      <!-- Particles with Motion Vectors -->
      <circle cx="50" cy="50" r="10" fill="#ef4444" opacity="0.85"/>
      <line x1="60" y1="50" x2="95" y2="50" stroke="#fca5a5" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="98,50 90,46 90,54" fill="#fca5a5"/>

      <circle cx="140" cy="50" r="10" fill="#3b82f6" opacity="0.85"/>
      <line x1="130" y1="50" x2="95" y2="50" stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="92,50 100,46 100,54" fill="#93c5fd"/>

      <!-- Collision Flash Star -->
      <circle cx="95" cy="50" r="14" fill="#fbbf24" opacity="0.4"/>
      <polygon points="95,38 98,47 107,50 98,53 95,62 92,53 83,50 92,47" fill="#fef08a"/>

      <!-- Second collision pair -->
      <circle cx="270" cy="45" r="9" fill="#10b981"/>
      <line x1="279" y1="45" x2="310" y2="55" stroke="#6ee7b7" stroke-width="2"/>
      <circle cx="340" cy="65" r="9" fill="#f59e0b"/>
      <line x1="331" y1="65" x2="315" y2="58" stroke="#fcd34d" stroke-width="2"/>

      <rect x="230" y="70" width="160" height="18" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1"/>
      <text x="310" y="83" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Effective Collision Frequency</text>
    </g>
    """

def feedback_loop_graphic(s1="1. STIMULUS", s2="2. RECEPTOR", s3="3. CONTROL CTR", s4="4. EFFECTOR", target="Homeostasis"):
    return f"""
    <g transform="translate(15, 30)">
      <!-- 1. Stimulus -->
      <rect x="15" y="10" width="105" height="36" rx="8" fill="#1e1b4b" stroke="#f472b6" stroke-width="1.5"/>
      <text x="67" y="32" fill="#f472b6" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(s1)}</text>

      <!-- Arrow 1 -> 2 -->
      <line x1="125" y1="28" x2="165" y2="28" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="170,28 160,24 160,32" fill="#f472b6"/>

      <!-- 2. Receptor -->
      <rect x="175" y="10" width="110" height="36" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="230" y="32" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(s2)}</text>

      <!-- Arrow 2 -> 3 -->
      <path d="M 290 28 Q 340 28 340 55" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="340,60 335,50 345,50" fill="#38bdf8"/>

      <!-- 3. Control Center -->
      <rect x="270" y="65" width="140" height="36" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="340" y="87" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(s3)}</text>

      <!-- Arrow 3 -> 4 -->
      <line x1="265" y1="83" x2="225" y2="83" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="220,83 230,79 230,87" fill="#fbbf24"/>

      <!-- 4. Effector -->
      <rect x="105" y="65" width="110" height="36" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
      <text x="160" y="87" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(s4)}</text>

      <!-- Return Loop Arrow 4 back to Stimulus -->
      <path d="M 100 83 Q 50 83 50 50" fill="none" stroke="#34d399" stroke-width="2.5"/>
      <polygon points="50,45 45,55 55,55" fill="#34d399"/>
    </g>
    """

def strata_evolution_graphic(layer1="Cenozoic: Modern Mammals", layer2="Mesozoic: Dinosaur Fossils", layer3="Paleozoic: Trilobite Shells"):
    return f"""
    <g transform="translate(45, 34)">
      <!-- Sedimentary Rock Strata Cross-section -->
      <rect x="0" y="0" width="400" height="30" rx="4" fill="#a16207" opacity="0.8"/>
      <text x="200" y="20" fill="#fef08a" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">Top Layer (Youngest): {escape_xml(layer1)}</text>

      <rect x="0" y="32" width="400" height="30" fill="#78350f" opacity="0.85"/>
      <text x="200" y="52" fill="#fed7aa" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">Middle Strata: {escape_xml(layer2)}</text>

      <rect x="0" y="64" width="400" height="32" rx="4" fill="#451a03" opacity="0.95"/>
      <text x="200" y="84" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="800" text-anchor="middle">Deepest Strata (Oldest): {escape_xml(layer3)}</text>
    </g>
    """

def energy_pyramid_graphic(p1="Producers (10,000 J)", p2="Herbivores (1,000 J)", p3="Secondary (100 J)", p4="Apex (10 J)"):
    return f"""
    <g transform="translate(60, 32)">
      <!-- Apex Tier -->
      <polygon points="185,5 155,28 215,28" fill="#ef4444" stroke="#f87171" stroke-width="1.2"/>
      <text x="185" y="22" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="900" text-anchor="middle">{escape_xml(p4)}</text>

      <!-- 3rd Tier -->
      <polygon points="153,30 217,30 240,54 130,54" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.2"/>
      <text x="185" y="46" fill="#1e1b4b" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="middle">{escape_xml(p3)}</text>

      <!-- 2nd Tier -->
      <polygon points="128,56 242,56 265,78 105,78" fill="#10b981" stroke="#34d399" stroke-width="1.2"/>
      <text x="185" y="71" fill="#064e3b" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">{escape_xml(p2)}</text>

      <!-- Producer Base Tier -->
      <polygon points="103,80 267,80 295,100 75,100" fill="#06b6d4" stroke="#38bdf8" stroke-width="1.2"/>
      <text x="185" y="94" fill="#082f49" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">{escape_xml(p1)}</text>

      <!-- 10% Transfer Rule Callout -->
      <rect x="315" y="35" width="95" height="40" rx="6" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.2"/>
      <text x="362" y="52" fill="#fbbf24" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">10% RULE</text>
      <text x="362" y="67" fill="#cbd5e1" font-family="sans-serif" font-size="9" font-weight="700" text-anchor="middle">90% Lost as Heat</text>
    </g>
    """

def punnett_square_graphic(a1="B", a2="b", a3="B", a4="b", res1="BB", res2="Bb", res3="Bb", res4="bb"):
    return f"""
    <g transform="translate(130, 30)">
      <!-- Parent Alleles -->
      <text x="50" y="16" fill="#f43f5e" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">{escape_xml(a1)}</text>
      <text x="110" y="16" fill="#f43f5e" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">{escape_xml(a2)}</text>
      <text x="8" y="52" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">{escape_xml(a3)}</text>
      <text x="8" y="92" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">{escape_xml(a4)}</text>

      <!-- 2x2 Grid -->
      <rect x="20" y="24" width="60" height="40" rx="4" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="50" y="50" fill="#ffffff" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">{escape_xml(res1)}</text>

      <rect x="80" y="24" width="60" height="40" rx="4" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="110" y="50" fill="#ffffff" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">{escape_xml(res2)}</text>

      <rect x="20" y="64" width="60" height="40" rx="4" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="50" y="90" fill="#ffffff" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">{escape_xml(res3)}</text>

      <rect x="80" y="64" width="60" height="40" rx="4" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="110" y="90" fill="#ffffff" font-family="monospace" font-size="13" font-weight="900" text-anchor="middle">{escape_xml(res4)}</text>

      <!-- Ratio Badge -->
      <rect x="155" y="38" width="100" height="42" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.2"/>
      <text x="205" y="55" fill="#a78bfa" font-family="sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">GENOTYPE RATIO</text>
      <text x="205" y="71" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">1 : 2 : 1</text>
    </g>
    """

def dna_helix_graphic(label="DNA Double Helix (Complementary Base Pairs)"):
    return f"""
    <g transform="translate(60, 32)">
      <!-- DNA Sugar-Phosphate Strands -->
      <path d="M 20 15 Q 90 55 160 15 Q 230 -25 300 15 Q 370 55 440 15" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
      <path d="M 20 65 Q 90 25 160 65 Q 230 105 300 65 Q 370 25 440 65" fill="none" stroke="#f43f5e" stroke-width="3.5"/>

      <!-- Base Pair Rungs -->
      <line x1="50" y1="28" x2="50" y2="52" stroke="#fbbf24" stroke-width="3"/>
      <line x1="90" y1="42" x2="90" y2="38" stroke="#34d399" stroke-width="3"/>
      <line x1="130" y1="28" x2="130" y2="52" stroke="#a855f7" stroke-width="3"/>
      <line x1="170" y1="18" x2="170" y2="62" stroke="#fbbf24" stroke-width="3"/>
      <line x1="210" y1="35" x2="210" y2="45" stroke="#34d399" stroke-width="3"/>
      <line x1="250" y1="20" x2="250" y2="60" stroke="#a855f7" stroke-width="3"/>
      <line x1="290" y1="40" x2="290" y2="40" stroke="#fbbf24" stroke-width="3"/>
      <line x1="330" y1="18" x2="330" y2="62" stroke="#34d399" stroke-width="3"/>
      <line x1="370" y1="35" x2="370" y2="45" stroke="#a855f7" stroke-width="3"/>
      <line x1="410" y1="20" x2="410" y2="60" stroke="#fbbf24" stroke-width="3"/>

      <!-- Base Legend -->
      <rect x="90" y="78" width="240" height="20" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1"/>
      <text x="210" y="92" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">
        Adenine (A) ═ Thymine (T)  |  Guanine (G) ≡ Cytosine (C)
      </text>
    </g>
    """

print("Helper definitions loaded successfully.")

# Topic 1 Generator
def generate_topic_1():
    print("Generating Topic 1 (Physical & Chemical Changes Q1-40)...")
    t_id = 1
    items = [
        (1, "ORGANIC DECOMPOSITION: ROTTING TOMATOES",
         """<g transform="translate(145, 34)">
           <circle cx="60" cy="50" r="36" fill="#dc2626" opacity="0.85"/>
           <ellipse cx="60" cy="80" rx="40" ry="10" fill="#7f1d1d" opacity="0.6"/>
           <path d="M 55 14 Q 58 4 60 2 Q 62 4 65 14" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/>
           <circle cx="125" cy="35" r="4" fill="#a3e635"/>
           <circle cx="140" cy="20" r="3" fill="#a3e635" opacity="0.7"/>
           <circle cx="115" cy="15" r="2.5" fill="#a3e635" opacity="0.5"/>
           <text x="145" y="45" fill="#a3e635" font-family="sans-serif" font-size="11" font-weight="700">Enzymatic Breakdown</text>
         </g>""",
         "Microbial decay forms entirely new molecular products"),
        
        (2, "PHASE TRANSITION: CRUSHING ICE",
         """<g transform="translate(120, 36)">
           <rect x="20" y="20" width="45" height="45" rx="6" fill="#7dd3fc" stroke="#0284c7" stroke-width="2" opacity="0.9"/>
           <text x="42" y="48" fill="#0c4a6e" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">H₂O(s)</text>
           <text x="95" y="48" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="900">→</text>
           <rect x="130" y="25" width="20" height="20" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
           <rect x="155" y="15" width="22" height="22" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
           <rect x="140" y="45" width="25" height="20" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
           <text x="210" y="48" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="700">Crushed Fragments (Same H₂O)</text>
         </g>""",
         "Alters particle size and macroscopic shape only; composition unchanged"),

        (3, "CHEMICAL TRANSFORMATION: BOND REARRANGEMENT",
         """<g transform="translate(60, 35)">
           <circle cx="50" cy="50" r="22" fill="#ef4444"/>
           <text x="50" y="55" fill="#ffffff" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">A-A</text>
           <text x="100" y="55" fill="#94a3b8" font-family="sans-serif" font-size="18" font-weight="900">+</text>
           <circle cx="150" cy="50" r="22" fill="#3b82f6"/>
           <text x="150" y="55" fill="#ffffff" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">B-B</text>
           <text x="200" y="55" fill="#38bdf8" font-family="sans-serif" font-size="22" font-weight="900">→</text>
           <circle cx="260" cy="50" r="22" fill="#a855f7"/>
           <text x="260" y="55" fill="#ffffff" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">A-B</text>
           <circle cx="310" cy="50" r="22" fill="#a855f7"/>
           <text x="310" y="55" fill="#ffffff" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">A-B</text>
         </g>""",
         "Chemical bonds break and reform to yield novel chemical identities"),

        (4, "PHOTOSYNTHESIS BIOCHEMICAL SYNTHESIS",
         equation_box_graphic("6 CO₂ + 6 H₂O  +  Light  →  C₆H₁₂O₆ + 6 O₂", "ENDOTHERMIC", "Chloroplasts convert radiant solar energy into chemical energy"),
         "Biosynthesis reorganizes inorganic molecules into glucose and oxygen"),

        (5, "EFFERVESCENCE: VINEGAR + BAKING SODA",
         beaker_graphic(205, 15, "#38bdf8", 45, True, "CO₂ Bubbles Forming"),
         "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑ (Gas evolution evidence)"),

        (6, "PRECIPITATION: MILK CURDLING",
         beaker_graphic(205, 15, "#f1f5f9", 50, False, "Casein Curd Clumps"),
         "Acidification coagulates casein proteins into an insoluble precipitate"),

        (7, "EXOTHERMIC HYDRATION: QUICKLIME + WATER",
         """<g transform="translate(140, 25)">
           """ + beaker_graphic(40, 10, "#fbbf24", 45, True, "CaO + H₂O") + """
           <!-- Thermometer rising -->
           <rect x="150" y="20" width="16" height="70" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
           <rect x="154" y="35" width="8" height="50" rx="4" fill="#ef4444"/>
           <circle cx="158" cy="85" r="10" fill="#ef4444"/>
           <text x="180" y="45" fill="#f43f5e" font-family="sans-serif" font-size="11" font-weight="900">ΔH &lt; 0 (Exothermic)</text>
         </g>""",
         "CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat (Thermal energy release)"),

        (8, "PHYSICAL ALTERATION: CUTTING PAPER",
         """<g transform="translate(130, 36)">
           <rect x="30" y="15" width="90" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
           <line x1="75" y1="15" x2="75" y2="75" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
           <text x="145" y="50" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="900">→</text>
           <rect x="180" y="15" width="40" height="60" rx="3" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
           <rect x="225" y="15" width="40" height="60" rx="3" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
         </g>""",
         "Shearing cellulose fibers changes dimensions only; no new substance formed"),

        (9, "PRECIPITATE FORMATION FROM CLEAR LIQUIDS",
         """<g transform="translate(120, 20)">
           """ + beaker_graphic(40, 15, "#0284c7", 45, False, "Solution A + B") + """
           <!-- Settling solid particles at bottom -->
           <g transform="translate(40, 15)">
             <ellipse cx="40" cy="80" rx="20" ry="4" fill="#fbbf24"/>
             <circle cx="30" cy="72" r="3" fill="#fbbf24"/>
             <circle cx="45" cy="70" r="3.5" fill="#fbbf24"/>
             <circle cx="38" cy="65" r="2.5" fill="#fbbf24"/>
           </g>
           <text x="140" y="55" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="800">Insoluble Solid (Precipitate ↓)</text>
         </g>""",
         "Chemical reaction produces an insoluble solid settling out of solution"),

        (10, "CHEMICAL EQUATION ANATOMY: REACTANTS VS PRODUCTS",
         """<g transform="translate(35, 36)">
           <rect x="15" y="15" width="165" height="60" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2"/>
           <text x="97" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">REACTANTS</text>
           <text x="97" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Left Side (Starting Species)</text>

           <text x="210" y="52" fill="#f59e0b" font-family="sans-serif" font-size="28" font-weight="900">→</text>

           <rect x="240" y="15" width="165" height="60" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="2"/>
           <text x="322" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PRODUCTS</text>
           <text x="322" y="60" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Right Side (Resulting Species)</text>
         </g>""",
         "Convention dictates starting reactants on left, newly formed products on right"),

        (11, "NEW CHEMICAL IDENTITIES: REACTION PRODUCTS",
         equation_box_graphic("2 H₂(g) + O₂(g)  →  2 H₂O(l)", "PRODUCTS", "Reactant bonds broken; novel intramolecular bonds formed"),
         "Products possess distinct physical and chemical properties from reactants"),

        (12, "STATE SYMBOL: AQUEOUS SOLUTION (aq)",
         beaker_graphic(205, 15, "#0284c7", 45, True, "Solute + H₂O Solvent (aq)"),
         "Symbol (aq) designates solute ions/molecules dissolved in liquid water"),

        (13, "THERMAL CATALYSIS / HEATING NOTATION (Δ)",
         equation_box_graphic("Reactants  ───Δ───→  Products", "HEAT APPLIED", "Delta (Δ) above reaction arrow specifies heat energy input"),
         "Thermal energy supplied from surroundings to drive chemical change"),

        (14, "PRECIPITATE NOTATION: DOWNWARD ARROW (↓)",
         """<g transform="translate(130, 32)">
           <rect x="20" y="15" width="180" height="65" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
           <text x="110" y="45" fill="#ffffff" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">AgCl(s)  ↓</text>
           <text x="110" y="65" fill="#a5b4fc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Solid Precipitate Settling</text>
           <line x1="225" y1="25" x2="225" y2="70" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
           <polygon points="225,78 217,65 233,65" fill="#f43f5e"/>
         </g>""",
         "A downward pointing arrow (↓) denotes an insoluble solid precipitate"),

        (15, "ADDITION NOTATION: PLUS SIGN (+)",
         equation_box_graphic("Substance A   +   Substance B", "REACTS WITH", "Plus sign separates individual reacting or resulting chemical entities"),
         "Signifies 'reacts with' on reactant side and 'and' on product side"),

        (16, "COMBINATION (SYNTHESIS) REACTION MECHANICS",
         equation_box_graphic("A  +  B   →   AB", "SYNTHESIS", "Two or more distinct chemical species unite into a single compound"),
         "Direct combination merges elements or compounds into one complex product"),

        (17, "SALT SYNTHESIS: SODIUM + CHLORINE",
         equation_box_graphic("2 Na(s)  +  Cl₂(g)   →   2 NaCl(s)", "COMBINATION", "Elemental sodium metal oxidizes with chlorine gas to form table salt"),
         "Two pure elements combine into a single ionic compound (Combination)"),

        (18, "THERMAL DECOMPOSITION: CALCIUM CARBONATE",
         equation_box_graphic("CaCO₃(s)   ───Δ───→   CaO(s)  +  CO₂(g)", "DECOMPOSITION", "Limestone breaks down under heat into quicklime and carbon dioxide"),
         "Single complex reactant decomposes into multiple simpler products"),

        (19, "DECOMPOSITION GENERAL FORMULA",
         equation_box_graphic("AB   →   A  +  B", "DECOMPOSITION", "One compound breaks apart into separate constituent elements/compounds"),
         "Standard formula representing chemical decomposition, not combination"),

        (20, "SINGLE DISPLACEMENT REACTION MECHANICS",
         equation_box_graphic("A  +  BC   →   AC  +  B", "SINGLE REPLACEMENT", "Uncombined element A displaces element B from compound BC"),
         "A more reactive free element displaces a less reactive ion in solution"),

        (21, "DOUBLE DISPLACEMENT (METATHESIS) MECHANICS",
         equation_box_graphic("AB  +  CD   →   AD  +  CB", "DOUBLE REPLACEMENT", "Cations and anions mutually exchange pairing partners in aqueous medium"),
         "Two ionic compounds swap partner ions to yield two new compounds"),

        (22, "PRECIPITATION METATHESIS: AgNO₃ + NaCl",
         equation_box_graphic("AgNO₃(aq) + NaCl(aq)  →  AgCl(s)↓ + NaNO₃(aq)", "PRECIPITATION", "Silver ions bind chloride ions to precipitate insoluble AgCl white solid"),
         "Mutual ion exchange results in an insoluble precipitate"),

        (23, "COMBUSTION MECHANICS: OXYGEN OXIDIZER",
         equation_box_graphic("Fuel  +  O₂(g)   →   CO₂(g)  +  H₂O(g)  +  Energy", "COMBUSTION", "Oxygen gas is an obligatory reactant for rapid oxidation with flame"),
         "Rapid exothermic reaction between a fuel and oxidant (molecular oxygen)"),

        (24, "HYDROCARBON COMBUSTION PRODUCTS",
         equation_box_graphic("CₓHᵧ  +  O₂   →   CO₂  +  H₂O", "CLEAN COMBUSTION", "Complete hydrocarbon combustion yields carbon dioxide and water vapor"),
         "Combustion of hydrocarbons produces CO₂ and H₂O, not ionic salts"),

        (25, "NEUTRALIZATION: ACID + BASE",
         equation_box_graphic("Acid  +  Base   →   Salt  +  Water", "NEUTRALIZATION", "HCl(aq) + NaOH(aq)  →  NaCl(aq) + H₂O(l)"),
         "Hydrogen ions and hydroxide ions combine stoichiometrically into neutral water"),

        (26, "NEUTRALIZATION CLASSIFICATION",
         equation_box_graphic("H⁺(aq)  +  OH⁻(aq)   →   H₂O(l)", "IONIC EXCHANGE", "Specialized double displacement (acid-base proton transfer) reaction"),
         "Neutralization is classified under double displacement, not combination"),

        (27, "PHASE TRANSITION: MELTING PARAFFIN WAX",
         """<g transform="translate(130, 36)">
           <rect x="25" y="20" width="55" height="45" rx="6" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
           <text x="52" y="47" fill="#713f12" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Solid Wax</text>
           <text x="110" y="47" fill="#fbbf24" font-family="sans-serif" font-size="20" font-weight="900">→</text>
           <ellipse cx="170" cy="50" rx="35" ry="14" fill="#fef08a" opacity="0.8"/>
           <text x="170" y="54" fill="#713f12" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Liquid Wax</text>
         </g>""",
         "Paraffin molecules retain chemical structure; physical state change is reversible"),

        (28, "AQUEOUS DISSOLUTION: SALT IN WATER",
         """<g transform="translate(120, 20)">
           """ + beaker_graphic(40, 15, "#0284c7", 45, False, "NaCl Solution") + """
           <g transform="translate(140, 35)">
             <circle cx="20" cy="20" r="14" fill="#a855f7"/>
             <text x="20" y="25" fill="#ffffff" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">Na⁺</text>
             <circle cx="65" cy="20" r="18" fill="#10b981"/>
             <text x="65" y="25" fill="#ffffff" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">Cl⁻</text>
             <text x="42" y="55" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Hydrated Ions</text>
           </g>
         </g>""",
         "Dissolution is physical: salt can be completely recovered via water evaporation"),

        (29, "OXIDATION PRODUCT: MAGNESIUM OXIDE",
         equation_box_graphic("2 Mg(s)  +  O₂(g)   →   2 MgO(s)", "OXIDATION", "Magnesium metal combusts with blinding white flame to form MgO powder"),
         "Magnesium oxide appears on the product side (right of the arrow)"),

        (30, "HYDROCARBON COMBUSTION: METHANE FLAME",
         equation_box_graphic("CH₄(g)  +  2 O₂(g)   →   CO₂(g)  +  2 H₂O(g)", "HYDROCARBON FUEL", "Natural gas methane burns in oxygen yielding carbon dioxide and steam"),
         "Defining equation for hydrocarbon combustion releasing thermal energy"),

        (31, "REACTION ARROW CONVENTION (→)",
         """<g transform="translate(70, 42)">
           <rect x="20" y="15" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="70" y="40" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">REACTANTS</text>
           <line x1="135" y1="35" x2="205" y2="35" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>
           <polygon points="212,35 200,28 200,42" fill="#fbbf24"/>
           <text x="170" y="24" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">YIELDS</text>
           <rect x="225" y="15" width="100" height="40" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="275" y="40" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">PRODUCTS</text>
         </g>""",
         "The chemical reaction arrow indicates the direction of transformation ('yields')"),

        (32, "HYDROGEN PEROXIDE DECOMPOSITION",
         equation_box_graphic("2 H₂O₂(aq)   ──MnO₂──→   2 H₂O(l)  +  O₂(g)↑", "DECOMPOSITION", "Hydrogen peroxide molecules break down into water and oxygen gas bubbles"),
         "A single substance splitting into simpler substances is decomposition"),

        (33, "DOUBLE REPLACEMENT: IONIC PARTNER EXCHANGE",
         """<g transform="translate(60, 36)">
           <rect x="15" y="15" width="140" height="50" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="45" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">A⁺B⁻  +  C⁺D⁻</text>
           <text x="180" y="48" fill="#f59e0b" font-family="sans-serif" font-size="22" font-weight="900">→</text>
           <rect x="205" y="15" width="140" height="50" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="275" y="45" fill="#34d399" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">A⁺D⁻  +  C⁺B⁻</text>
         </g>""",
         "Ions exchange partner bonds to form two new ionic species"),

        (34, "ELEMENT COMBINATION: IRON + SULFUR",
         equation_box_graphic("Fe(s)  +  S(s)   ───Δ───→   FeS(s)", "SYNTHESIS", "Elemental iron powder and yellow sulfur powder combine under heat to yield FeS"),
         "Two elemental reactants synthesize one binary compound (Combination)"),

        (35, "GAS EVOLUTION NOTATION: UPWARD ARROW (↑)",
         """<g transform="translate(130, 32)">
           <rect x="20" y="15" width="180" height="65" rx="8" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5"/>
           <text x="110" y="45" fill="#ffffff" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">CO₂(g)  ↑</text>
           <text x="110" y="65" fill="#67e8f9" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Gas Effervescence Escaping</text>
           <line x1="225" y1="70" x2="225" y2="25" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
           <polygon points="225,17 217,30 233,30" fill="#38bdf8"/>
         </g>""",
         "An upward arrow (↑) indicates gas product evolution escaping the liquid"),

        (36, "REDOX MECHANICS: OXIDATION IS LOSS (OIL)",
         """<g transform="translate(100, 36)">
           <rect x="20" y="15" width="120" height="55" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="2"/>
           <text x="80" y="42" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">OXIDATION</text>
           <text x="80" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Loss of Electrons (e⁻)</text>
           <text x="160" y="48" fill="#94a3b8" font-family="sans-serif" font-size="18" font-weight="900">:</text>
           <text x="210" y="48" fill="#ffffff" font-family="monospace" font-size="15" font-weight="900">Fe  →  Fe²⁺ + 2 e⁻</text>
         </g>""",
         "OIL: Oxidation involves loss of valence electrons increasing oxidation state"),

        (37, "REDOX MECHANICS: REDUCTION IS GAIN (RIG)",
         """<g transform="translate(100, 36)">
           <rect x="20" y="15" width="120" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2"/>
           <text x="80" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">REDUCTION</text>
           <text x="80" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Gain of Electrons (e⁻)</text>
           <text x="160" y="48" fill="#94a3b8" font-family="sans-serif" font-size="18" font-weight="900">:</text>
           <text x="210" y="48" fill="#ffffff" font-family="monospace" font-size="15" font-weight="900">Cu²⁺ + 2 e⁻  →  Cu</text>
         </g>""",
         "Reduction involves gaining electrons (or gaining hydrogen atoms)"),

        (38, "METAL OXIDATION: CORROSION / RUSTING",
         """<g transform="translate(110, 32)">
           <rect x="20" y="30" width="120" height="35" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
           <!-- Rust Flake Layer -->
           <path d="M 20 30 Q 50 20 80 30 Q 110 22 140 30 L 140 40 L 20 40 Z" fill="#b45309" opacity="0.9"/>
           <text x="80" y="55" fill="#1e293b" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="middle">Steel / Iron Core</text>
           <text x="175" y="45" fill="#f97316" font-family="sans-serif" font-size="16" font-weight="900">→</text>
           <text x="235" y="42" fill="#ea580c" font-family="monospace" font-size="12.5" font-weight="900">Fe₂O₃ • xH₂O</text>
           <text x="235" y="58" fill="#fdba74" font-family="sans-serif" font-size="10" font-weight="700">Porous Rust Scale</text>
         </g>""",
         "Corrosion oxidizes and degrades structural metallic iron into brittle rust"),

        (39, "ENDOTHERMIC POTENTIAL ENERGY PROFILE",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 L 80 75 Q 120 75 140 25 Q 160 75 220 50 L 270 50" fill="none" stroke="#38bdf8" stroke-width="3"/>
           <line x1="30" y1="75" x2="270" y2="75" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
           <text x="50" y="90" fill="#94a3b8" font-family="sans-serif" font-size="10" font-weight="800">Reactants</text>
           <text x="240" y="40" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="800">Products</text>
           <text x="150" y="18" fill="#fbbf24" font-family="sans-serif" font-size="10" font-weight="900">Ea</text>
           <text x="220" y="65" fill="#34d399" font-family="sans-serif" font-size="10" font-weight="900">+ΔH (Heat Absorbed)</text>
         </g>""",
         "Endothermic processes absorb heat energy from surroundings (ΔH > 0)"),

        (40, "LAW OF CONSERVATION OF MASS",
         balance_scale_graphic("Mass(Reactants)", "Mass(Products)", 10, 10, True),
         "Total mass remains constant before and after any closed chemical reaction")
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

generate_topic_1()

# Topic 2 Generator
def generate_topic_2():
    print("Generating Topic 2 (Acids, Bases & Salts Q1-40)...")
    t_id = 2
    items = [
        (1, "ACID PROPERTIES: SOUR TASTE &amp; BLUE LITMUS RED",
         test_tube_litmus(220, 20, "#ef4444", "#3b82f6", "#ef4444", "Blue Litmus → Red"),
         "Acids release H⁺ ions in aqueous solution, turning blue litmus paper red"),

        (2, "BASE PROPERTIES: RED LITMUS TURNS BLUE",
         test_tube_litmus(220, 20, "#3b82f6", "#ef4444", "#3b82f6", "Red Litmus → Blue"),
         "Bases release OH⁻ ions in solution, turning red litmus paper blue"),

        (3, "PURE WATER NEUTRALITY (pH 7.0)",
         ph_spectrum_bar(7, "Neutral (pH 7.0)"),
         "Pure water dissociates into equal concentrations of H⁺ and OH⁻ ([H⁺] = 10⁻⁷ M)"),

        (4, "INDICATOR DYE: PHENOLPHTHALEIN",
         """<g transform="translate(90, 25)">
           """ + test_tube_litmus(40, 10, "#bae6fd", "#e2e8f0", "#e2e8f0", "Acid: Colorless") + """
           """ + test_tube_litmus(200, 10, "#ec4899", "#fbcfe8", "#db2777", "Base: Vivid Pink") + """
         </g>""",
         "Phenolphthalein remains colorless in acidic solutions and turns bright pink in bases"),

        (5, "ARRHENIUS ACID DISSOCIATION",
         equation_box_graphic("HA(aq)  +  H₂O(l)   →   H₃O⁺(aq)  +  A⁻(aq)", "ACID DISSOCIATION", "Acids ionize to yield hydronium / hydrogen ions (H⁺)"),
         "Arrhenius acids increase hydrogen ion [H⁺] concentration in aqueous solution"),

        (6, "ARRHENIUS BASE DISSOCIATION",
         equation_box_graphic("BOH(aq)   ──H₂O──→   B⁺(aq)  +  OH⁻(aq)", "BASE DISSOCIATION", "Bases ionize to release mobile hydroxide ions (OH⁻)"),
         "Arrhenius bases dissociate in water to yield hydroxide ions (OH⁻)"),

        (7, "IONIC SALT: SODIUM CHLORIDE (NaCl)",
         """<g transform="translate(130, 32)">
           <rect x="20" y="15" width="200" height="65" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5"/>
           <circle cx="70" cy="48" r="18" fill="#a855f7"/>
           <text x="70" y="53" fill="#ffffff" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">Na⁺</text>
           <circle cx="120" cy="48" r="22" fill="#10b981"/>
           <text x="120" y="53" fill="#ffffff" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">Cl⁻</text>
           <text x="175" y="53" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="900">NaCl</text>
         </g>""",
         "Common table salt (NaCl) is an ionic crystal lattice produced by strong neutralization"),

        (8, "GASTRIC JUICE: HYDROCHLORIC ACID (HCl)",
         """<g transform="translate(100, 32)">
           <path d="M 60 20 Q 20 50 60 80 Q 90 95 130 80 Q 170 50 140 20 Z" fill="#312e81" stroke="#ec4899" stroke-width="2"/>
           <text x="95" y="55" fill="#f472b6" font-family="monospace" font-size="15" font-weight="900" text-anchor="middle">HCl (pH ~1.5)</text>
           <text x="235" y="45" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="800">Stomach Acid = HCl</text>
           <text x="235" y="65" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Not sulfuric acid (H₂SO₄)</text>
         </g>""",
         "Human gastric juice contains dilute hydrochloric acid (HCl) to aid digestion"),

        (9, "STRONG ALKALI: SODIUM HYDROXIDE (NaOH)",
         equation_box_graphic("NaOH(s)   ──H₂O──→   Na⁺(aq)  +  OH⁻(aq)", "STRONG BASE", "Lye / Caustic Soda dissociates completely in water (pH ~14)"),
         "Sodium hydroxide is a strong, corrosive alkali known commercially as lye"),

        (10, "METHYL ORANGE pH TRANSITION",
         """<g transform="translate(90, 25)">
           """ + test_tube_litmus(40, 10, "#ef4444", "#fca5a5", "#ef4444", "Acid: Red (pH &lt; 3.1)") + """
           """ + test_tube_litmus(200, 10, "#eab308", "#fef08a", "#eab308", "Base: Yellow (pH &gt; 4.4)") + """
         </g>""",
         "Methyl orange indicator exhibits a red hue in acids and turns yellow in bases"),

        (11, "NATURAL INDICATOR: TURMERIC DYE",
         """<g transform="translate(110, 30)">
           <rect x="20" y="20" width="80" height="50" rx="4" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
           <text x="60" y="48" fill="#713f12" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Turmeric (Acid)</text>
           <text x="125" y="50" fill="#f59e0b" font-family="sans-serif" font-size="20" font-weight="900">→</text>
           <rect x="155" y="20" width="80" height="50" rx="4" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5"/>
           <text x="195" y="48" fill="#fef2f2" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">+ Base: Red-Brown</text>
         </g>""",
         "Curcumin in turmeric acts as a natural indicator, shifting color in basic conditions"),

        (12, "NEUTRALITY THRESHOLD (pH = 7.0)",
         ph_spectrum_bar(7, "Strictly Neutral"),
         "A solution with pH 7 is neutral; pH values strictly below 7 are acidic"),

        (13, "DILUTE ACETIC ACID: VINEGAR",
         """<g transform="translate(130, 25)">
           """ + beaker_graphic(40, 15, "#bae6fd", 45, False, "Vinegar") + """
           <g transform="translate(145, 30)">
             <text x="0" y="20" fill="#f472b6" font-family="monospace" font-size="14" font-weight="900">CH₃COOH</text>
             <text x="0" y="40" fill="#cbd5e1" font-family="sans-serif" font-size="11" font-weight="700">Dilute Acetic Acid (~5%)</text>
             <text x="0" y="58" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Imparts sour flavor &amp; aroma</text>
           </g>
         </g>""",
         "Vinegar contains weak acetic acid (ethanoic acid, CH₃COOH)"),

        (14, "MILK OF MAGNESIA: Mg(OH)₂",
         """<g transform="translate(110, 32)">
           <rect x="20" y="15" width="220" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="130" y="42" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">Mg(OH)₂</text>
           <text x="130" y="62" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Magnesium Hydroxide (Antacid)</text>
         </g>""",
         "Milk of magnesia contains magnesium hydroxide, Mg(OH)₂, not sodium hydroxide"),

        (15, "BLUE LITMUS RESPONSE IN ALKALI",
         test_tube_litmus(220, 20, "#3b82f6", "#3b82f6", "#3b82f6", "Blue Remains Blue"),
         "Alkaline basic solutions do not alter the blue coloration of blue litmus paper"),

        (16, "HOUSEHOLD ACIDS: HCl, VINEGAR, CALAMANSI",
         """<g transform="translate(60, 36)">
           <rect x="15" y="15" width="105" height="55" rx="8" fill="#1e1b4b" stroke="#f472b6" stroke-width="1.5"/>
           <text x="67" y="40" fill="#f472b6" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Muriatic Acid</text>
           <text x="67" y="56" fill="#cbd5e1" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">HCl</text>

           <rect x="135" y="15" width="105" height="55" rx="8" fill="#1e1b4b" stroke="#f472b6" stroke-width="1.5"/>
           <text x="187" y="40" fill="#f472b6" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Vinegar</text>
           <text x="187" y="56" fill="#cbd5e1" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">CH₃COOH</text>

           <rect x="255" y="15" width="105" height="55" rx="8" fill="#1e1b4b" stroke="#f472b6" stroke-width="1.5"/>
           <text x="307" y="40" fill="#f472b6" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Calamansi</text>
           <text x="307" y="56" fill="#cbd5e1" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">Citric Acid</text>
         </g>""",
         "Hydrochloric acid, vinegar, and citrus juices all exhibit acidic properties"),

        (17, "HOUSEHOLD BASES: NaOH &amp; BLEACH",
         """<g transform="translate(100, 36)">
           <rect x="25" y="15" width="125" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="87" y="40" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Caustic Soda</text>
           <text x="87" y="56" fill="#cbd5e1" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">NaOH (Base)</text>

           <rect x="175" y="15" width="125" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="237" y="40" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Liquid Bleach</text>
           <text x="237" y="56" fill="#cbd5e1" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">NaOCl (Alkaline)</text>
         </g>""",
         "Sodium hydroxide and sodium hypochlorite bleach function as alkaline bases"),

        (18, "ANTACID ACTION: NEUTRALIZING STOMACH ACID",
         """<g transform="translate(70, 35)">
           <rect x="15" y="15" width="140" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="85" y="38" fill="#f87171" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Excess HCl Acid</text>
           <text x="85" y="55" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Hyperacidity (pH 1)</text>

           <text x="175" y="48" fill="#fbbf24" font-family="sans-serif" font-size="20" font-weight="900">+</text>

           <rect x="200" y="15" width="140" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="270" y="38" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Weak Base Antacid</text>
           <text x="270" y="55" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Mg(OH)₂ / Al(OH)₃</text>
         </g>""",
         "Antacids are mild bases (not acids) that neutralize excess stomach acid safely"),

        (19, "ACIDIC REGION OF pH SCALE (pH = 4.0)",
         ph_spectrum_bar(4, "Acidic (pH 4.0)"),
         "Any solution with a pH value below 7.0 is classified as acidic"),

        (20, "ALKALINE REGION OF pH SCALE (pH = 11.0)",
         ph_spectrum_bar(11, "Basic (pH 11.0)"),
         "Any solution with a pH value above 7.0 is alkaline (basic), not acidic"),

        (21, "COMPARATIVE ACIDITY STRENGTH: pH 1, 3, 6",
         """<g transform="translate(60, 38)">
           <rect x="15" y="15" width="95" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="2"/>
           <text x="62" y="38" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH 1</text>
           <text x="62" y="56" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Strongest Acid</text>

           <rect x="130" y="15" width="95" height="55" rx="8" fill="#1e1b4b" stroke="#f97316" stroke-width="1.5"/>
           <text x="177" y="38" fill="#f97316" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH 3</text>
           <text x="177" y="56" fill="#fed7aa" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Moderate Acid</text>

           <rect x="245" y="15" width="95" height="55" rx="8" fill="#1e1b4b" stroke="#eab308" stroke-width="1.5"/>
           <text x="292" y="38" fill="#eab308" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH 6</text>
           <text x="292" y="56" fill="#fef08a" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Weakest Acid</text>
         </g>""",
         "pH 6 is closest to neutral pH 7, representing the lowest H⁺ concentration"),

        (22, "NEUTRALIZATION REACTION FORMULA",
         equation_box_graphic("Acid  +  Base   →   Salt  +  Water", "NEUTRALIZATION", "HCl(aq) + NaOH(aq)  →  NaCl(aq) + H₂O(l)"),
         "Reaction between stoichiometric acid and base yields an ionic salt and water"),

        (23, "TURMERIC COLOR SHIFT IN BASE",
         """<g transform="translate(120, 32)">
           <rect x="20" y="15" width="190" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
           <text x="115" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">Turmeric + Soap (Base)</text>
           <text x="115" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Turns Deep Reddish-Brown</text>
         </g>""",
         "Turmeric indicator turns from vibrant yellow to deep reddish-brown in bases"),

        (24, "OLFACTORY INDICATORS: ONION &amp; VANILLA",
         """<g transform="translate(100, 36)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="85" y="40" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Onion Extract</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="600" text-anchor="middle">Natural Olfactory</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="235" y="40" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Vanilla Essence</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="600" text-anchor="middle">Natural Olfactory</text>
         </g>""",
         "Onion and vanilla are natural olfactory indicators (change odor in bases)"),

        (25, "TOOTH ENAMEL DEMINERALIZATION THRESHOLD",
         """<g transform="translate(90, 35)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.5"/>
           <text x="85" y="40" fill="#4ade80" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH &gt; 5.5</text>
           <text x="85" y="56" fill="#bbf7d0" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Enamel Intact</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="2"/>
           <text x="235" y="40" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH &lt; 5.5</text>
           <text x="235" y="56" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Enamel Dissolves</text>
         </g>""",
         "Bacterial acids dropping mouth pH below 5.5 cause tooth enamel decay"),

        (26, "BASIC SALT: SODIUM CARBONATE (Na₂CO₃)",
         equation_box_graphic("Na₂CO₃(s) + H₂O(l)  →  2 Na⁺  +  HCO₃⁻  +  OH⁻", "BASIC HYDROLYSIS", "Salt of strong base (NaOH) + weak acid (H₂CO₃) yields alkaline pH (~11)"),
         "Sodium carbonate forms a basic (alkaline) solution in water due to hydrolysis"),

        (27, "ACIDIC SALT: AMMONIUM CHLORIDE (NH₄Cl)",
         equation_box_graphic("NH₄Cl(s)  +  H₂O(l)   →   NH₄⁺  +  Cl⁻", "ACIDIC HYDROLYSIS", "Salt of strong acid (HCl) + weak base (NH₃) yields acidic pH (~5)"),
         "Ammonium chloride forms an acidic aqueous solution due to cation hydrolysis"),

        (28, "ANHYDROUS GAS TEST: DRY HCl ON DRY LITMUS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="180" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="110" y="42" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">Dry HCl(g)</text>
           <text x="110" y="62" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">No H₂O = No H⁺ Dissociation</text>
           <rect x="215" y="25" width="20" height="45" rx="3" fill="#3b82f6"/>
           <text x="245" y="52" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700">Litmus Stays Blue</text>
         </g>""",
         "Dry HCl gas requires moisture to ionize into H⁺; dry litmus remains blue"),

        (29, "LOGARITHMIC pH SCALE (10× FACTOR)",
         """<g transform="translate(80, 35)">
           <rect x="20" y="15" width="80" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="60" y="40" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH 4</text>
           <text x="60" y="56" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">[H⁺] = 10⁻⁴ M</text>

           <text x="135" y="48" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="900">10×</text>

           <rect x="170" y="15" width="80" height="55" rx="8" fill="#1e1b4b" stroke="#f97316" stroke-width="1.5"/>
           <text x="210" y="40" fill="#f97316" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">pH 5</text>
           <text x="210" y="56" fill="#fed7aa" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">[H⁺] = 10⁻⁵ M</text>
         </g>""",
         "Each 1-unit shift on the pH scale represents a tenfold (10×) change in [H⁺]"),

        (30, "pH SCALE ORDER: ACIDIC TO BASIC",
         ph_spectrum_bar(12, "Strong Base (pH 12)"),
         "In order pH 2, 6, 7, 9, 12, pH 12 represents the strongest base (not acid)"),

        (31, "NEUTRAL SALT FORMATION: HCl + NaOH",
         equation_box_graphic("HCl(aq)  +  NaOH(aq)   →   NaCl(aq)  +  H₂O(l)", "pH = 7.0", "Strong acid completely neutralizes strong base yielding neutral salt"),
         "NaCl derived from strong acid and strong base forms a neutral solution"),

        (32, "ELECTROLYTIC CONDUCTIVITY IN SOLUTIONS",
         """<g transform="translate(120, 25)">
           """ + beaker_graphic(40, 15, "#0284c7", 45, True, "Acid / Base") + """
           <!-- Bulb glowing -->
           <circle cx="160" cy="45" r="16" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
           <text x="160" y="50" fill="#713f12" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">💡</text>
           <text x="160" y="80" fill="#fde047" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Circuit Closed</text>
         </g>""",
         "Aqueous acids and bases conduct electric current through mobile free ions"),

        (33, "ACID DILUTION PROTOCOL: ACID TO WATER",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="140" height="60" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="2"/>
           <text x="90" y="38" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">CORRECT METHOD</text>
           <text x="90" y="58" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Pour Acid into Water</text>

           <rect x="180" y="15" width="140" height="60" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="2"/>
           <text x="250" y="38" fill="#ef4444" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">DANGEROUS SPLATTER</text>
           <text x="250" y="58" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Never Water into Acid</text>
         </g>""",
         "Always add acid slowly to water to safely absorb the exothermic heat of dilution"),

        (34, "ORGANIC WEAK ACID: ACETIC ACID",
         """<g transform="translate(130, 25)">
           """ + beaker_graphic(40, 15, "#bae6fd", 45, False, "CH₃COOH") + """
           <g transform="translate(145, 30)">
             <text x="0" y="22" fill="#ec4899" font-family="monospace" font-size="16" font-weight="900">CH₃COOH</text>
             <text x="0" y="44" fill="#cbd5e1" font-family="sans-serif" font-size="11.5" font-weight="700">Weak Carboxylic Acid</text>
             <text x="0" y="62" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Partial Dissociation in Water</text>
           </g>
         </g>""",
         "Acetic acid is the characteristic weak organic acid found in household vinegar"),

        (35, "CARBON DIOXIDE RELEASE FROM BAKING SODA",
         equation_box_graphic("NaHCO₃(s) + H⁺(aq)  →  Na⁺(aq) + H₂O(l) + CO₂(g)↑", "CARBON DIOXIDE", "Acid-carbonate reaction releases carbon dioxide gas, not oxygen"),
         "Baking soda reacts with acids to produce carbon dioxide (CO₂) effervescence"),

        (36, "BUFFER SOLUTION RESISTANCE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="200" height="65" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.8"/>
           <text x="120" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BUFFER SYSTEM</text>
           <text x="120" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Resists Sharp pH Fluctuations</text>
         </g>""",
         "Buffer solutions contain conjugate acid-base pairs that stabilize pH levels"),

        (37, "ALKALIS: WATER-SOLUBLE BASES",
         """<g transform="translate(120, 25)">
           """ + beaker_graphic(40, 15, "#8b5cf6", 45, False, "Alkali Solution") + """
           <g transform="translate(145, 35)">
             <text x="0" y="22" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="900">Soluble Bases = Alkalis</text>
             <text x="0" y="44" fill="#cbd5e1" font-family="sans-serif" font-size="11" font-weight="700">Releases mobile OH⁻ in water</text>
           </g>
         </g>""",
         "All alkalis are bases that dissolve in water, releasing hydroxide ions (OH⁻)"),

        (38, "VOLUMETRIC ACID-BASE TITRATION",
         """<g transform="translate(120, 20)">
           <!-- Burette -->
           <rect x="65" y="10" width="10" height="60" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
           <!-- Conical Flask -->
           <polygon points="50,75 90,75 110,105 30,105" fill="#f43f5e" opacity="0.8" stroke="#be123c" stroke-width="1.5"/>
           <text x="155" y="55" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="900">Neutralization Endpoint</text>
           <text x="155" y="75" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="600">Determines unknown molarity</text>
         </g>""",
         "Titration uses stoichiometric neutralization to quantify unknown concentrations"),

        (39, "NATURAL RAINWATER ACIDITY (pH ~5.6)",
         ph_spectrum_bar(5.6, "Rainwater (pH ~5.6)"),
         "Clean rainwater has a mild natural acidity (pH ~5.6) due to dissolved atmospheric CO₂"),

        (40, "SALT HYDROLYSIS MECHANICS",
         equation_box_graphic("Salt Cation/Anion  +  H₂O   ⇌   Acidic or Basic Solution", "HYDROLYSIS", "Parent acid and base strengths dictate the resultant solution pH"),
         "Hydrolysis of salts in water can yield acidic, basic, or neutral solutions")
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

generate_topic_2()
