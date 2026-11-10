"""
generate_topics_6_7_8.py
Generates bespoke SVGs for Topics 6, 7, and 8 (Term 1 True/False Q1-40 each = 120 SVGs)
"""

import os
import xml.etree.ElementTree as ET
from generate_bespoke_term1_tf_svgs import (
    create_svg, OUTPUT_DIR, strata_evolution_graphic, energy_pyramid_graphic,
    punnett_square_graphic, dna_helix_graphic, equation_box_graphic, beaker_graphic
)

def generate_topic_6():
    print("Generating Topic 6 (Evolution & Natural Selection Q1-40)...")
    t_id = 6
    items = [
        (1, "POPULATION ALLELE FREQUENCY SHIFTS OVER TIME",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOLOGICAL EVOLUTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Gradual shifts in inherited traits across generations</text>
         </g>""",
         "Populations evolve across generations through shifting allele frequencies"),

        (2, "POPULATION VS INDIVIDUAL EVOLUTION",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="85" y="38" fill="#ef4444" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Individuals</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Develop in Lifetime</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="235" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Populations</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Evolve Over Time</text>
         </g>""",
         "Individuals develop during their lifespans; biological populations evolve"),

        (3, "DARWINIAN NATURAL SELECTION MECHANISM",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CHARLES DARWIN (1859)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Origin of Species: Natural Selection</text>
         </g>""",
         "Darwin proposed natural selection as the driving mechanism of evolutionary change"),

        (4, "MENDELIAN GENETICS VS DARWINIAN EVOLUTION",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.5"/>
           <text x="85" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Gregor Mendel</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Father of Genetics</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
           <text x="235" y="38" fill="#c084fc" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Charles Darwin</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Natural Selection</text>
         </g>""",
         "Mendel pioneered heredity laws; Darwin discovered natural selection"),

        (5, "ENVIRONMENTAL ADAPTIVE ADVANTAGE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">DIFFERENTIAL REPRODUCTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Favorable adaptive traits enhance survival and fecundity</text>
         </g>""",
         "Natural selection favors individuals possessing traits best suited to local ecology"),

        (6, "EVOLUTIONARY FITNESS DEFINITION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">EVOLUTIONARY FITNESS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Measured by viable offspring passed to next generation</text>
         </g>""",
         "Biological fitness is determined by reproductive success, not physical strength"),

        (7, "INHERITED ADAPTATIONS FOR SURVIVAL",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ADAPTATIONS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Morphological, physiological, or behavioral advantages</text>
         </g>""",
         "An adaptation is an inherited feature enhancing an organism's survival probability"),

        (8, "GENETIC VARIATION WITHIN SPECIES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GENOTYPIC VARIATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Differences in DNA alleles among same-species individuals</text>
         </g>""",
         "Variation describes phenotypic and genetic trait diversity among population members"),

        (9, "HERITABLE TRAIT TRANSMISSION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">HEREDITY IN EVOLUTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Useful adaptive genes are transmitted to progeny</text>
         </g>""",
         "Inheritance allows advantageous adaptive alleles to proliferate over generations"),

        (10, "FOSSIL RECORD EVIDENCE OF ANCIENT LIFE",
         strata_evolution_graphic("Trilobites in Limestone", "Ammonites in Shale", "Dinosaur Remains in Sandstone"),
         "Fossils provide direct historical evidence documenting ancient transitional life forms"),

        (11, "HOMOLOGOUS ANATOMICAL STRUCTURES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">HOMOLOGOUS STRUCTURES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Common ancestral origin; divergent specialized functions</text>
         </g>""",
         "Homologous structures share common ancestral origin, even if functions diverge"),

        (12, "TETRAPOD LIMB HOMOLOGY (ARM, FLIPPER, WING)",
         """<g transform="translate(50, 38)">
           <rect x="15" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="67" y="45" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Human Arm</text>

           <rect x="130" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="182" y="45" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Whale Flipper</text>

           <rect x="245" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="297" y="45" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Bat Wing</text>
         </g>""",
         "Shared skeletal architecture (humerus, radius, ulna) confirms common tetrapod descent"),

        (13, "VESTIGIAL ANATOMICAL REMNANTS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">VESTIGIAL ORGANS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Evolutionary remnants that have lost original ancestral function</text>
         </g>""",
         "Vestigial structures are anatomical remnants with reduced or obsolete functionality"),

        (14, "BIOGEOGRAPHY: GEOGRAPHICAL SPECIES SPREAD",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOGEOGRAPHY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Spatial distribution of extinct and extant species</text>
         </g>""",
         "Biogeography studies geographic species distributions shaped by continental drift"),

        (15, "INDUSTRIAL MELANISM: PEPPERED MOTH",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#f8fafc" stroke-width="1.5"/>
           <text x="85" y="38" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Light Lichen Tree</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Favors Pale Moth</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#334155" stroke-width="1.5"/>
           <text x="235" y="38" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Soot Covered Tree</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Favors Dark Melanic</text>
         </g>""",
         "Predation pressure shifted moth camouflage frequencies in industrial England"),

        (16, "ARTIFICIAL SELECTION VIA HUMAN BREEDING",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ARTIFICIAL SELECTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Human breeders select preferred agricultural/domestic traits</text>
         </g>""",
         "Artificial selection is driven by deliberate human selective breeding, not nature"),

        (17, "ALLOPATRIC SPECIATION: GEOGRAPHIC BARRIERS",
         """<g transform="translate(80, 32)">
           <rect x="20" y="15" width="100" height="55" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="70" y="45" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Population A</text>

           <path d="M 140 10 L 155 75" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
           <text x="148" y="88" fill="#38bdf8" font-family="sans-serif" font-size="9" font-weight="800" text-anchor="middle">River Barrier</text>

           <rect x="180" y="15" width="100" height="55" rx="6" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="230" y="45" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Population B</text>
         </g>""",
         "Physical barriers halt gene flow between isolated populations, driving divergence"),

        (18, "ANALOGOUS WINGS: BIRD VS INSECT",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.5"/>
           <text x="85" y="38" fill="#f472b6" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Bird Wing</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Bony Endoskeleton</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.5"/>
           <text x="235" y="38" fill="#f472b6" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Insect Wing</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Chitinous Membrane</text>
         </g>""",
         "Bird and insect wings are analogous structures sharing aerodynamic function, not origin"),

        (19, "ANALOGOUS STRUCTURES DEFINITION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f472b6" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ANALOGOUS STRUCTURES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Similar functional roles evolved via convergent adaptation</text>
         </g>""",
         "Analogous features share functions through convergent evolution without common descent"),

        (20, "REPRODUCTIVE ISOLATION &amp; SPECIATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ISOLATION SPECIATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Halting interbreeding allows independent evolutionary trajectories</text>
         </g>""",
         "Reproductive isolation enables diverging populations to develop into separate species"),

        (21, "LAW OF STRATIGRAPHIC SUPERPOSITION",
         strata_evolution_graphic("Shallow Strata (Youngest)", "Intermediate Strata", "Deep Rock Layers (Oldest Fossils)"),
         "Sedimentary rock superposition dictates that deeper undisturbed strata contain older fossils"),

        (22, "DARWINIAN SELECTION VS LAMARCKIAN INHERITANCE",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="85" y="38" fill="#ef4444" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Lamarckism (False)</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Stretching neck in life</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="235" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Darwinism (True)</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Inherited neck variants</text>
         </g>""",
         "Long necks evolved because long-necked variants had higher survival and reproduction"),

        (23, "AGRICULTURAL ARTIFICIAL SELECTION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CROP SELECTIVE BREEDING</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Humans selectively propagate plants with desirable harvest traits</text>
         </g>""",
         "Selective crop and livestock propagation is a classic demonstration of artificial selection"),

        (24, "COMPARATIVE VERTEBRATE EMBRYOLOGY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">EMBRYONIC HOMOLOGIES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Pharyngeal pouches and post-anal tails in early vertebrate embryos</text>
         </g>""",
         "Similar early developmental stages in vertebrate embryos reflect shared common ancestry"),

        (25, "BEHAVIORAL &amp; TEMPORAL ISOLATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SYMPATRIC ISOLATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Mating rituals and differing breeding seasons prevent gene flow</text>
         </g>""",
         "Reproductive isolation encompasses behavioral, mechanical, and temporal barriers"),

        (26, "RESTRICTED GEOGRAPHIC SPECIES: ENDEMIC",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ENDEMIC SPECIES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Unique species natively restricted to one geographic region</text>
         </g>""",
         "Species indigenous exclusively to a defined island or region are designated endemic"),

        (27, "CHRONOLOGY OF SPECIATION STAGES",
         """<g transform="translate(45, 36)">
           <rect x="10" y="15" width="85" height="45" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="52" y="42" fill="#c084fc" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">Variation</text>

           <text x="107" y="44" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="900">→</text>

           <rect x="125" y="15" width="85" height="45" rx="6" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="167" y="42" fill="#38bdf8" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">Isolation</text>

           <text x="222" y="44" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="900">→</text>

           <rect x="240" y="15" width="85" height="45" rx="6" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="282" y="42" fill="#fbbf24" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">Selection</text>

           <text x="337" y="44" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="900">→</text>

           <rect x="355" y="15" width="95" height="45" rx="6" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="402" y="42" fill="#34d399" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">New Species</text>
         </g>""",
         "Speciation path: Genetic Variation → Isolation → Selection → Divergence into New Species"),

        (28, "MUTATION AS RAW MATERIAL FOR SELECTION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">MUTATION &amp; SELECTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Mutations supply random variations; selection filters fitness</text>
         </g>""",
         "Mutations generate variation randomly; natural selection drives adaptive evolution"),

        (29, "CETACEAN TERRESTRIAL ANCESTRY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">WHALE PELVIC BONES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Vestigial hindlimb remnants reveal terrestrial ancestor origin</text>
         </g>""",
         "Vestigial pelvic bones in modern whales provide evidence of four-legged land ancestors"),

        (30, "SCIENTIFIC THEORY AS EVIDENCED FRAMEWORK",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SCIENTIFIC THEORY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Extensively validated explanation supported by vast empirical data</text>
         </g>""",
         "In science, a theory is a rigorous, thoroughly tested explanatory framework, not a guess"),

        (31, "MOLECULAR HOMOLOGY: DNA SEQUENCE COMPARISONS",
         dna_helix_graphic("DNA Nucleotide Alignment Confirms Common Descent"),
         "Comparative molecular genomics provides conclusive proof of evolutionary relatedness"),

        (32, "STOCHASTIC MECHANISM: GENETIC DRIFT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GENETIC DRIFT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Chance fluctuations in allele frequency, prominent in small gene pools</text>
         </g>""",
         "Genetic drift causes random shifts in allele frequencies through stochastic events"),

        (33, "POPULATION BOTTLENECK DIVERSITY REDUCTION",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Large Gene Pool</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Diverse Alleles</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="235" y="38" fill="#ef4444" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Bottleneck Survivors</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Severely Reduced Diversity</text>
         </g>""",
         "Catastrophic population crashes (bottlenecks) severely deplete genetic variability"),

        (34, "FOUNDER EFFECT IN ISOLATED COLONIES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">FOUNDER EFFECT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Small pioneer colonizers carry a limited subset of ancestral alleles</text>
         </g>""",
         "Founder effect occurs when small pioneer groups establish isolated populations"),

        (35, "RECIPROCAL ADAPTATION: COEVOLUTION",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.5"/>
           <text x="85" y="38" fill="#f472b6" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Angiosperm Flowers</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Nectar &amp; Petal Shape</text>

           <text x="160" y="48" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">⇌</text>

           <rect x="180" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="245" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Insect Pollinators</text>
           <text x="245" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Specialized Proboscis</text>
         </g>""",
         "Coevolution describes reciprocal evolutionary adaptations between interacting species"),

        (36, "PUNCTUATED EQUILIBRIUM VS GRADUALISM",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PUNCTUATED EQUILIBRIUM</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Long periods of stasis interrupted by episodic bursts of rapid change</text>
         </g>""",
         "Punctuated equilibrium features rapid evolutionary bursts separated by stasis periods"),

        (37, "MASS EXTINCTION &amp; ADAPTIVE RADIATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f87171" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ADAPTIVE RADIATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Mass extinctions open ecological niches for explosive lineage diversification</text>
         </g>""",
         "Extinctions vacate ecological niches, driving rapid adaptive radiation of survivors"),

        (38, "CONVERGENT EVOLUTION UNDER SIMILAR PRESSURES",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Shark (Fish)</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Streamlined Torpedo Body</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="235" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Dolphin (Mammal)</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Convergent Aquatic Shape</text>
         </g>""",
         "Convergent evolution produces analogous traits in distantly related lineages"),

        (39, "DIVERGENT EVOLUTION FROM COMMON ANCESTOR",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">DIVERGENT EVOLUTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Related lineages diversify into distinct specialized phenotypes</text>
         </g>""",
         "Divergent evolution occurs when related populations adapt into distinct descendent species"),

        (40, "MODERN SYNTHESIS: MENDEL + DARWIN",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">MODERN EVOLUTIONARY SYNTHESIS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Unifies Mendelian molecular genetics with Darwinian natural selection</text>
         </g>""",
         "Modern evolutionary synthesis unifies population genetics with natural selection")
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

generate_topic_6()

# Topic 7 Generator
def generate_topic_7():
    print("Generating Topic 7 (Biodiversity & Ecosystems Q1-40)...")
    t_id = 7
    items = [
        (1, "ECOSYSTEM DUALITY: BIOTIC &amp; ABIOTIC",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="85" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Biotic Factors</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Flora, Fauna, Fungi</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="235" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Abiotic Factors</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Water, Soil, Sun, Air</text>
         </g>""",
         "An ecosystem comprises living biotic communities interacting with abiotic environments"),

        (2, "LIVING ORGANISMS ARE BIOTIC",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOTIC COMPONENTS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Plants, animals, and microbes are living biotic factors</text>
         </g>""",
         "Plants and animals are living biotic organisms, not non-living abiotic factors"),

        (3, "THREE HIERARCHIES OF BIODIVERSITY",
         """<g transform="translate(50, 38)">
           <rect x="15" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.5"/>
           <text x="67" y="45" fill="#2dd4bf" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Genetic Diversity</text>

           <rect x="130" y="15" width="105" height="50" rx="6" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.5"/>
           <text x="182" y="45" fill="#2dd4bf" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Species Richness</text>

           <rect x="245" y="15" width="115" height="50" rx="6" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.5"/>
           <text x="302" y="45" fill="#2dd4bf" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Ecosystem Variety</text>
         </g>""",
         "Biodiversity encompasses genetic variability, species richness, and ecological habitats"),

        (4, "AUTOTROPHS: PRIMARY PRODUCERS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.8"/>
           <text x="140" y="42" fill="#4ade80" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">AUTOTROPHIC PRODUCERS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Plants &amp; algae synthesize organic food via photosynthesis</text>
         </g>""",
         "Primary producers synthesize organic chemical energy from sunlight and CO₂"),

        (5, "HERBIVORES AS PRIMARY CONSUMERS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">HERBIVORES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Primary consumers feeding directly on autotrophic vegetation</text>
         </g>""",
         "Herbivores function as primary consumers occupying the second trophic tier"),

        (6, "DECOMPOSER NUTRIENT RECYCLING",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SAPROTROPHS &amp; DECOMPOSERS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Fungi and bacteria recycle mineral nutrients into soil</text>
         </g>""",
         "Decomposers break down dead biomass, returning vital inorganic nutrients to soil"),

        (7, "DIRECTIONAL ENERGY FLOW DYNAMICS",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
           <text x="85" y="38" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Energy Flow</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">One-Way Flow (Lost as Heat)</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="235" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Nutrient Flow</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Cycles Indefinitely in Web</text>
         </g>""",
         "Energy flows unidirectionally and dissipates as metabolic heat; nutrients cycle"),

        (8, "10% TROPHIC ENERGY EFFICIENCY RULE",
         energy_pyramid_graphic("Producers (10,000 J)", "Primary Consumers (1,000 J)", "Secondary (100 J)", "Apex (10 J)"),
         "Only approximately 10% of energy transfers between successive trophic tiers"),

        (9, "INTERCONNECTED FOOD WEBS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#2dd4bf" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ECOLOGICAL FOOD WEBS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Complex interconnected feeding networks conferring resilience</text>
         </g>""",
         "Food webs depict intricate multifaceted trophic interactions across an ecosystem"),

        (10, "CARRYING CAPACITY THRESHOLD (K)",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 Q 80 75 120 40 Q 160 15 220 15" fill="none" stroke="#2dd4bf" stroke-width="3"/>
           <line x1="30" y1="15" x2="220" y2="15" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4,4"/>
           <text x="180" y="32" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900">Carrying Capacity (K)</text>
         </g>""",
         "Carrying capacity (K) represents the maximum sustainable population size"),

        (11, "SYMBIOSIS: MUTUALISM (+/+)",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.5"/>
           <text x="85" y="38" fill="#4ade80" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Species A (+)</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Gains Benefit</text>

           <text x="160" y="48" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">&amp;</text>

           <rect x="180" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.5"/>
           <text x="245" y="38" fill="#4ade80" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Species B (+)</text>
           <text x="245" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Gains Benefit</text>
         </g>""",
         "Mutualism is an obligate or facultative symbiosis where both partners benefit (+/+)"),

        (12, "SYMBIOSIS: PARASITISM (+/-)",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.5"/>
           <text x="85" y="38" fill="#4ade80" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Parasite (+)</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Derives Nutrients</text>

           <text x="160" y="48" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">&amp;</text>

           <rect x="180" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
           <text x="245" y="38" fill="#f87171" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Host (-)</text>
           <text x="245" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Suffers Harm</text>
         </g>""",
         "Parasitism benefits the parasite while exploiting and harming the host organism (+/-)"),

        (13, "SYMBIOSIS: COMMENSALISM (+/0)",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.5"/>
           <text x="85" y="38" fill="#4ade80" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Beneficiary (+)</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Remora / Barnacle</text>

           <text x="160" y="48" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">&amp;</text>

           <rect x="180" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#94a3b8" stroke-width="1.5"/>
           <text x="245" y="38" fill="#cbd5e1" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Host (0)</text>
           <text x="245" y="56" fill="#94a3b8" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Unaffected Neutral</text>
         </g>""",
         "Commensalism benefits one species while leaving the host partner unaffected (+/0)"),

        (14, "KEYSTONE SPECIES TOP-DOWN REGULATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">KEYSTONE ARCHITECTURE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Exerts disproportionately large control over community balance</text>
         </g>""",
         "Keystone species (e.g., sea otters, wolves) exert disproportionate ecological control"),

        (15, "PRIMARY SUCCESSION ON BARE ROCK",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PRIMARY SUCCESSION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Initiates on barren volcanic rock where no soil exists</text>
         </g>""",
         "Primary succession begins on sterile substrates (e.g. lava rock) devoid of topsoil"),

        (16, "SECONDARY SUCCESSION AFTER DISTURBANCE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SECONDARY SUCCESSION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Re-colonization occurs following fires/floods where soil remains</text>
         </g>""",
         "Secondary succession reestablishes communities where intact topsoil persists"),

        (17, "PIONEER SPECIES: LICHENS &amp; MOSSES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PIONEER COLONIZERS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Lichens weather bare mineral rock into primordial soil</text>
         </g>""",
         "Pioneer species are initial barren-rock colonizers, not climax community members"),

        (18, "INVASIVE SPECIES ECOLOGICAL DISRUPTION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">INVASIVE SPECIES</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Outcompetes native taxa, disrupting local food web dynamics</text>
         </g>""",
         "Invasive non-native species displace native flora and fauna through competitive pressure"),

        (19, "BIOLOGICAL CARBON CYCLE EXCHANGE",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#22c55e" stroke-width="1.5"/>
           <text x="85" y="38" fill="#4ade80" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Photosynthesis</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Fixes CO₂ into Sugars</text>

           <text x="160" y="48" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">⇄</text>

           <rect x="180" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="245" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle">Cell Respiration</text>
           <text x="245" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Releases CO₂ to Air</text>
         </g>""",
         "Photosynthesis and cellular respiration drive biological carbon exchange in nature"),

        (20, "NITROGEN FIXATION BY MICROBES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOLOGICAL N₂ FIXATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Rhizobium bacteria convert atmospheric N₂ into bioavailable NH₄⁺</text>
         </g>""",
         "Atmospheric N₂ gas cannot be used directly by plants without bacterial nitrogen fixation"),

        (21, "TROPHIC BIOMAGNIFICATION OF TOXINS",
         energy_pyramid_graphic("Water (0.000003 ppm)", "Zooplankton (0.04 ppm)", "Small Fish (0.5 ppm)", "Apex Bird (25 ppm DDT)"),
         "Lipophilic persistent toxins concentrate to lethal doses at higher trophic tiers"),

        (22, "HABITAT FRAGMENTATION DISRUPTION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">HABITAT FRAGMENTATION</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Isolates breeding populations and blocks wildlife migration</text>
         </g>""",
         "Dividing continuous habitat patches isolates populations and disrupts migration"),

        (23, "EUTROPHICATION &amp; ALGAL BLOOMS",
         """<g transform="translate(120, 25)">
           """ + beaker_graphic(40, 15, "#15803d", 50, False, "Algal Bloom (Eutrophic)") + """
           <text x="160" y="55" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="900">Hypoxic Dead Zone (O₂ ↓)</text>
         </g>""",
         "Nutrient runoff (nitrogen/phosphorus) causes algal blooms that deplete dissolved oxygen"),

        (24, "ECOLOGICAL NICHE DEFINITION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#2dd4bf" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ECOLOGICAL NICHE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">The functional role, resource utilization, and habitat of a species</text>
         </g>""",
         "An ecological niche defines the complete environmental and trophic role of an organism"),

        (25, "COMPETITIVE EXCLUSION PRINCIPLE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f472b6" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GAUSE'S PRINCIPLE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Two species competing for identical resources cannot stably coexist</text>
         </g>""",
         "Competitive exclusion states that two species cannot indefinitely occupy identical niches"),

        (26, "BIOMES DEFINED BY CLIMATIC REGIMES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">TERRESTRIAL BIOMES</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Characterized by regional patterns of temperature and precipitation</text>
         </g>""",
         "Major global biomes (tundra, rainforest, desert) are governed by climatic patterns"),

        (27, "ACID PRECIPITATION FORMATION",
         equation_box_graphic("SO₂  +  NOₓ   +   H₂O(vapor)   ──→   H₂SO₄  +  HNO₃ (Acid Rain)", "ACID PRECIPITATION", "Industrial smokestack emissions acidify atmospheric precipitation"),
         "Sulfur dioxide and nitrogen oxides react with water vapor producing acid precipitation"),

        (28, "STRATOSPHERIC OZONE UV SHIELD",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">OZONE LAYER (O₃)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Stratospheric shield absorbing harmful ultraviolet-B/C radiation</text>
         </g>""",
         "The stratospheric ozone layer filters harmful UV radiation from reaching Earth's surface"),

        (29, "HABITABLE PLANETARY GREENHOUSE EFFECT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">NATURAL GREENHOUSE EFFECT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Traps thermal heat, keeping Earth's average temperature at a habitable +15°C</text>
         </g>""",
         "The natural greenhouse effect maintains planetary warmth essential for liquid water"),

        (30, "DEFORESTATION &amp; ATMOSPHERIC CO₂",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">DEFORESTATION IMPACT</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Clearing forests eliminates carbon sinks, elevating atmospheric CO₂</text>
         </g>""",
         "Felling forests destroys carbon sinks, accelerating atmospheric CO₂ accumulation"),

        (31, "SUSTAINABLE RESOURCE MANAGEMENT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SUSTAINABILITY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Meeting current needs without compromising future planetary resources</text>
         </g>""",
         "Sustainability ensures resource consumption remains within Earth's regenerative capacity"),

        (32, "CONSERVATION BIOLOGY OBJECTIVES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#2dd4bf" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CONSERVATION BIOLOGY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Dedicated to safeguarding taxa, habitats, and ecological integrity</text>
         </g>""",
         "Conservation biology formulates strategies to protect biodiversity and restore ecosystems"),

        (33, "BIODIVERSITY FOSTERS ECOSYSTEM RESILIENCE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ECOLOGICAL RESILIENCE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">High species diversity increases capacity to absorb environmental shocks</text>
         </g>""",
         "High biodiversity enhances an ecosystem's capacity to withstand and recover from stress"),

        (34, "BIOINDICATOR SPECIES SENSITIVITY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOINDICATOR ORGANISMS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Sensitive species (lichens, amphibians) reveal ecological health status</text>
         </g>""",
         "Bioindicator taxa signal pollutant presence or environmental degradation early"),

        (35, "RESOURCE CONSTRAINTS ON EXPONENTIAL GROWTH",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f87171" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">EXPONENTIAL J-CURVE LIMITS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Resource scarcity and environmental resistance halt indefinite growth</text>
         </g>""",
         "Infinite exponential growth cannot persist in nature due to finite carrying capacities"),

        (36, "LOGISTIC GROWTH MODEL (S-CURVE)",
         """<g transform="translate(100, 32)">
           <path d="M 30 75 Q 80 75 120 45 Q 160 20 220 20" fill="none" stroke="#2dd4bf" stroke-width="3"/>
           <line x1="30" y1="20" x2="220" y2="20" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
           <text x="175" y="38" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="800">Carrying Capacity (K)</text>
         </g>""",
         "Logistic growth produces an S-shaped curve leveling off smoothly at carrying capacity"),

        (37, "PREDATOR-PREY COUPLED OSCILLATIONS",
         """<g transform="translate(80, 35)">
           <path d="M 20 60 Q 60 10 100 60 Q 140 10 180 60 Q 220 10 260 60" fill="none" stroke="#22c55e" stroke-width="2.5"/>
           <path d="M 40 70 Q 80 30 120 70 Q 160 30 200 70 Q 240 30 280 70" fill="none" stroke="#ef4444" stroke-width="2.5"/>
           <text x="140" y="85" fill="#f8fafc" font-family="sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Hare (Prey) vs Lynx (Predator)</text>
         </g>""",
         "Predator-prey numbers exhibit coupled cyclical oscillations across time"),

        (38, "GLOBAL ECOLOGICAL FOOTPRINT METRICS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ECOLOGICAL FOOTPRINT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Quantifies human biophysical resource consumption vs biocapacity</text>
         </g>""",
         "Ecological footprints quantify resource consumption demand against planetary biocapacity"),

        (39, "ACTIVE ECOLOGICAL RESTORATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">HABITAT RESTORATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Active ecological intervention recovering degraded ecosystems</text>
         </g>""",
         "Ecological restoration assists the recovery of degraded, damaged, or destroyed ecosystems"),

        (40, "BIOSPHERIC ENVIRONMENTAL ETHICS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#14b8a6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#2dd4bf" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOSPHERE STEWARDSHIP</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Ethical responsibility to maintain ecological balance for all life</text>
         </g>""",
         "Environmental ethics guide human responsibility and moral stewardship of Earth")
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

generate_topic_7()

# Topic 8 Generator
def generate_topic_8():
    print("Generating Topic 8 (Heredity & Genetics Q1-40)...")
    t_id = 8
    items = [
        (1, "GENETICS: SCIENCE OF HEREDITY",
         dna_helix_graphic("Transmission of Traits Across Generations"),
         "Genetics is the scientific study of heredity and inherited variation in organisms"),

        (2, "GENE AS A POLYPEPTIDE CODE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GENE LOCUS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Specific DNA nucleotide sequence encoding a functional protein</text>
         </g>""",
         "A gene is a discrete segment of DNA that encodes instructions for a protein"),

        (3, "ALLELES: ALTERNATIVE GENE FORMS",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">Allele 'B'</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Dominant Variant</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="235" y="38" fill="#a78bfa" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">Allele 'b'</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Recessive Variant</text>
         </g>""",
         "Alleles represent alternative nucleotide sequences of the same gene locus"),

        (4, "GENOTYPE VS PHENOTYPE DISTINCTION",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Genotype</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Genetic Alleles (Bb)</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#34d399" stroke-width="1.5"/>
           <text x="235" y="38" fill="#34d399" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">Phenotype</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Observable Trait (Brown)</text>
         </g>""",
         "Genotype is the underlying genetic allele code; phenotype is the expressed physical trait"),

        (5, "HOMOZYGOUS ALLELIC STATE",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">AA</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Homozygous Dominant</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.5"/>
           <text x="235" y="38" fill="#a78bfa" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">aa</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Homozygous Recessive</text>
         </g>""",
         "Homozygous individuals carry two identical alleles for a specific gene"),

        (6, "HETEROZYGOUS ALLELIC COMBINATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="80" y="52" fill="#fbbf24" font-family="monospace" font-size="24" font-weight="900">Aa</text>
           <text x="175" y="42" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="900">HETEROZYGOUS</text>
           <text x="175" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="10.5" font-weight="600">Two non-identical alleles</text>
         </g>""",
         "Heterozygous organisms possess two different alleles for a trait (e.g. Aa)"),

        (7, "DOMINANT OVER RECESSIVE EXPRESSION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="80" y="52" fill="#34d399" font-family="monospace" font-size="24" font-weight="900">Bb</text>
           <text x="175" y="42" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="900">DOMINANT EXPRESSED</text>
           <text x="175" y="60" fill="#cbd5e1" font-family="sans-serif" font-size="10.5" font-weight="600">'B' masks recessive 'b'</text>
         </g>""",
         "Dominant alleles fully express their phenotype, masking recessive alleles in heterozygotes"),

        (8, "PUNNETT SQUARE PROBABILITY MODEL",
         punnett_square_graphic("B", "b", "B", "b", "BB", "Bb", "Bb", "bb"),
         "Punnett squares calculate statistical genotype and phenotype probabilities in crosses"),

        (9, "MENDEL'S CLASSIC PEA INHERITANCE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GREGOR MENDEL (1866)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Laws of Segregation &amp; Independent Assortment</text>
         </g>""",
         "Gregor Mendel established foundational laws of inheritance through Pisum sativum crosses"),

        (10, "MENDEL'S LAW OF SEGREGATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">LAW OF SEGREGATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Allele pairs separate so each gamete carries only one allele</text>
         </g>""",
         "Allele pairs separate during meiosis: each gamete receives only one allele per locus"),

        (11, "MENDEL'S LAW OF INDEPENDENT ASSORTMENT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">INDEPENDENT ASSORTMENT</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Unlinked gene pairs sort independently into gametes</text>
         </g>""",
         "Genes located on different chromosomes assort independently of one another"),

        (12, "WATSON-CRICK DNA DOUBLE HELIX",
         dna_helix_graphic("Antiparallel Double Helix (1953)"),
         "Watson and Crick deduced the antiparallel double-helix architecture of DNA"),

        (13, "NUCLEOTIDE BIOCHEMICAL ARCHITECTURE",
         """<g transform="translate(60, 36)">
           <circle cx="50" cy="45" r="22" fill="#fbbf24"/>
           <text x="50" y="50" fill="#713f12" font-family="sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">Phosphate</text>

           <line x1="72" y1="45" x2="105" y2="45" stroke="#94a3b8" stroke-width="2"/>

           <polygon points="135,25 165,35 155,65 115,65 105,35" fill="#38bdf8"/>
           <text x="135" y="52" fill="#082f49" font-family="sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">Sugar</text>

           <line x1="165" y1="45" x2="200" y2="45" stroke="#94a3b8" stroke-width="2"/>

           <rect x="200" y="25" width="80" height="40" rx="4" fill="#a855f7"/>
           <text x="240" y="50" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="middle">Nitrogen Base</text>
         </g>""",
         "A nucleotide consists of a phosphate group, deoxyribose sugar, and nitrogenous base"),

        (14, "CHARGAFF'S COMPLEMENTARY BASE PAIRING",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">A  ═  T</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">2 Hydrogen Bonds</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.5"/>
           <text x="235" y="38" fill="#f43f5e" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">G  ≡  C</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">3 Hydrogen Bonds</text>
         </g>""",
         "In DNA, Adenine pairs with Thymine (A-T), and Guanine pairs with Cytosine (G-C)"),

        (15, "URACIL SUBSTITUTION IN RNA",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="85" y="38" fill="#38bdf8" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">DNA Base</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">Thymine (T)</text>

           <text x="160" y="48" fill="#fbbf24" font-family="sans-serif" font-size="18" font-weight="900">→</text>

           <rect x="180" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
           <text x="245" y="38" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">RNA Base</text>
           <text x="245" y="56" fill="#cbd5e1" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">Uracil (U)</text>
         </g>""",
         "RNA transcripts replace thymine with the pyrimidine base uracil (pairs with adenine)"),

        (16, "NUCLEAR TRANSCRIPTION (DNA → mRNA)",
         equation_box_graphic("DNA Template Strand   ──RNA Polymerase──→   mRNA Transcript", "TRANSCRIPTION", "Synthesized inside the cell nucleus prior to nuclear export"),
         "Transcription synthesizes messenger RNA (mRNA) from a DNA gene template"),

        (17, "RIBOSOMAL TRANSLATION (mRNA → POLYPEPTIDE)",
         equation_box_graphic("mRNA Codons  +  tRNA Anticodons   ──Ribosome──→   Polypeptide Chain", "TRANSLATION", "Ribosomes translate 3-base codons into precise amino acid sequences"),
         "Translation synthesizes protein polypeptide chains at ribosomes using mRNA codes"),

        (18, "GENETIC POINT &amp; FRAMESHIFT MUTATIONS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f43f5e" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GENE MUTATION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Permanent alteration in the DNA nucleotide sequence</text>
         </g>""",
         "Mutations are permanent sequence changes that generate novel genetic alleles"),

        (19, "CODOMINANCE: FULL DUAL EXPRESSION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CODOMINANCE (AB BLOOD)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Both alleles expressed simultaneously without blending</text>
         </g>""",
         "Codominance fully expresses both distinct phenotypes (e.g. Type AB blood antigens)"),

        (20, "INCOMPLETE DOMINANCE: PHENOTYPIC BLEND",
         """<g transform="translate(70, 36)">
           <circle cx="50" cy="45" r="20" fill="#ef4444"/>
           <text x="50" y="50" fill="#ffffff" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">Red</text>

           <text x="100" y="50" fill="#fbbf24" font-family="sans-serif" font-size="20" font-weight="900">+</text>

           <circle cx="150" cy="45" r="20" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
           <text x="150" y="50" fill="#1e1b4b" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">White</text>

           <text x="200" y="50" fill="#fbbf24" font-family="sans-serif" font-size="20" font-weight="900">→</text>

           <circle cx="260" cy="45" r="20" fill="#f472b6"/>
           <text x="260" y="50" fill="#ffffff" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle">Pink</text>
         </g>""",
         "Incomplete dominance yields an intermediate blended phenotype (e.g. pink flowers)"),

        (21, "POLYGENIC INHERITANCE: MULTI-LOCUS TRAITS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">POLYGENIC INHERITANCE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Continuous traits (skin tone, height) governed by multiple genes</text>
         </g>""",
         "Polygenic traits result from the additive interaction of multiple gene loci"),

        (22, "HUMAN SOMATIC CHROMOSOME COMPLEMENT",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">46 CHROMOSOMES (2n)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">23 Homologous Pairs in somatic diploid cells</text>
         </g>""",
         "Human somatic cells normally contain 46 chromosomes (23 homologous pairs)"),

        (23, "HUMAN SEX CHROMOSOMES (XY VS XX)",
         """<g transform="translate(90, 32)">
           <rect x="20" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#f43f5e" stroke-width="1.5"/>
           <text x="85" y="38" fill="#f43f5e" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">XX</text>
           <text x="85" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Biological Female</text>

           <rect x="170" y="15" width="130" height="55" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
           <text x="235" y="38" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="900" text-anchor="middle">XY</text>
           <text x="235" y="56" fill="#cbd5e1" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">Biological Male</text>
         </g>""",
         "Human biological males inherit XY sex chromosomes; biological females inherit XX"),

        (24, "FAMILIAL PEDIGREE LINEAGE CHARTS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">PEDIGREE ANALYSIS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Maps phenotypic inheritance patterns across family generations</text>
         </g>""",
         "Pedigrees track family inheritance patterns, identifying autosomal/sex-linked traits"),

        (25, "KARYOTYPE CHROMOSOMAL PROFILES",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">KARYOTYPING</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Organized display of chromosome pairs to detect aneuploidies</text>
         </g>""",
         "Karyotyping profiles complete chromosome sets to detect structural or numerical anomalies"),

        (26, "MITOTIC CELL DIVISION DYNAMICS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">SOMATIC MITOSIS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Produces 2 genetically identical diploid daughter cells</text>
         </g>""",
         "Mitosis generates two identical diploid cells (meiosis produces four unique gametes)"),

        (27, "MEIOTIC REDUCTION DIVISION (2n → n)",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">MEIOTIC REDUCTION</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Halves chromosome number to yield haploid sperm / egg cells</text>
         </g>""",
         "Meiosis halves the somatic chromosome number to produce haploid gametes (n = 23)"),

        (28, "GENETIC RECOMBINATION VIA CROSSING OVER",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.8"/>
           <text x="140" y="42" fill="#f472b6" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">CHIASMATA CROSSING OVER</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Homologous chromosomes exchange segments during Prophase I</text>
         </g>""",
         "Crossing over exchanges genetic segments between non-sister chromatids, boosting variation"),

        (29, "SOMATIC CELL NUCLEAR TRANSFER: CLONING",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">ORGANISMAL CLONING</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Yields genetically identical offspring sharing the donor genome</text>
         </g>""",
         "Cloning produces genetically identical offspring, possessing identical donor genomes"),

        (30, "RECOMBINANT DNA TECHNOLOGY",
         equation_box_graphic("Host Plasmid Vector  +  Foreign Target Gene   ──Ligase──→   Recombinant DNA", "GENE SPLICING", "Combines genetic sequences from distinct biological organisms"),
         "Recombinant DNA fuses genetic material from multiple sources for biotechnology"),

        (31, "EPIGENETICS: CHROMATIN MODIFICATIONS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">EPIGENETICS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">DNA methylation alters gene expression without changing base sequences</text>
         </g>""",
         "Epigenetics modulates gene expression without altering underlying DNA base sequences"),

        (32, "SEX-LINKED GENE INHERITANCE",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#a78bfa" stroke-width="1.8"/>
           <text x="140" y="42" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">X-LINKED INHERITANCE</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Genes located on sex chromosomes show distinct sexual inheritance</text>
         </g>""",
         "Sex-linked traits reside on sex chromosomes (X or Y), exhibiting sex-biased transmission"),

        (33, "HEMOPHILIA: X-LINKED RECESSIVE PATHOLOGY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fef2f2" font-family="sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">HEMOPHILIA</text>
           <text x="140" y="62" fill="#fca5a5" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">X-linked recessive deficiency in blood clotting Factor VIII/IX</text>
         </g>""",
         "Hemophilia is an X-linked recessive disorder impairing blood clotting cascaded"),

        (34, "TRISOMY 21: DOWN SYNDROME",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1.8"/>
           <text x="140" y="42" fill="#a78bfa" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">TRISOMY 21 (47, +21)</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Three copies of chromosome 21 resulting from meiotic nondisjunction</text>
         </g>""",
         "Down syndrome results from nondisjunction yielding three chromosome 21 copies"),

        (35, "GEL ELECTROPHORESIS MOLECULAR SEPARATION",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
           <line x1="50" y1="35" x2="50" y2="60" stroke="#38bdf8" stroke-width="4"/>
           <line x1="100" y1="35" x2="100" y2="60" stroke="#a78bfa" stroke-width="4"/>
           <line x1="160" y1="35" x2="160" y2="60" stroke="#f472b6" stroke-width="4"/>
           <text x="190" y="52" fill="#ffffff" font-family="sans-serif" font-size="10.5" font-weight="800">Size Migration</text>
         </g>""",
         "Gel electrophoresis separates negatively charged DNA fragments by molecular base-pair size"),

        (36, "POLYMERASE CHAIN REACTION (PCR)",
         equation_box_graphic("Trace Target DNA   ──Denature / Anneal / Extend──→   Billion Fold Amplification", "PCR AMPLIFICATION", "Thermophilic Taq polymerase drives exponential DNA synthesis"),
         "PCR exponentially amplifies minute quantities of target DNA into millions of copies"),

        (37, "TRANSGENIC GENETICALLY MODIFIED ORGANISMS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#10b981" stroke-width="1.8"/>
           <text x="140" y="42" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">TRANSGENIC GMOs</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Engineered organisms containing inserted foreign genetic material</text>
         </g>""",
         "Genetically modified organisms possess stably integrated foreign transgenes"),

        (38, "THERAPEUTIC GENE DELIVERY",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.8"/>
           <text x="140" y="42" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">GENE THERAPY</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Delivers functional genes to replace or correct defective disease alleles</text>
         </g>""",
         "Gene therapy delivers functional genes into cells to treat or cure genetic diseases"),

        (39, "BIOETHICAL GOVERNANCE OF GENOMICS",
         """<g transform="translate(100, 32)">
           <rect x="20" y="15" width="240" height="65" rx="8" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.8"/>
           <text x="140" y="42" fill="#fbbf24" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">BIOETHICAL FRAMEWORKS</text>
           <text x="140" y="62" fill="#f8fafc" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">Ensures genetic modification obeys safety, equity, and moral standards</text>
         </g>""",
         "Genetic engineering raises critical bioethical questions regarding human stewardship"),

        (40, "THE HUMAN GENOME PROJECT (HGP)",
         dna_helix_graphic("3.2 Billion Base Pairs Sequenced (1990 - 2003)"),
         "The Human Genome Project successfully mapped all 3 billion nucleotide base pairs")
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

generate_topic_8()
