# Fix the function definition and recreate
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Wedge
import numpy as np

fig, ax = plt.subplots(figsize=(28, 20))
ax.set_xlim(0, 140)
ax.set_ylim(0, 100)
ax.axis('off')
fig.patch.set_facecolor('#1e293b')
ax.set_facecolor('#1e293b')

# Color definitions
colors = {
    'primary': '#0ea5e9',    # Sky blue
    'secondary': '#8b5cf6',  # Violet
    'accent1': '#f59e0b',    # Amber
    'accent2': '#10b981',    # Emerald
    'accent3': '#ef4444',    # Red
    'accent4': '#ec4899',    # Pink
    'accent5': '#06b6d4',    # Cyan
    'dark': '#0f172a',
    'light': '#f8fafc'
}

def draw_node(ax, x, y, text, color, width=20, height=4, fontsize=9, text_color='white', alpha=0.9):
    """Draw a node box"""
    box = FancyBboxPatch((x - width/2, y - height/2), width, height,
                         boxstyle="round,pad=0.02,rounding_size=0.5",
                         facecolor=color, edgecolor='white', linewidth=2, alpha=alpha)
    ax.add_patch(box)
    
    # Handle multiline text
    lines = text.split('\n')
    line_height = height / (len(lines) + 1)
    start_y = y + (len(lines) - 1) * line_height / 2
    
    for i, line in enumerate(lines):
        weight = 'bold' if i == 0 else 'normal'
        size = fontsize if i == 0 else fontsize - 1
        ax.text(x, start_y - i * line_height * 0.8, line, 
                ha='center', va='center', fontsize=size, 
                color=text_color, fontweight=weight)

def draw_connection(ax, x1, y1, x2, y2, color, width=2):
    """Draw connection line"""
    ax.plot([x1, x2], [y1, y2], color=color, linewidth=width, alpha=0.7, zorder=1)

# ROOT
root_x, root_y = 70, 92
draw_node(ax, root_x, root_y, 'H.O.N.E.S.T.\nHarmonic Oracle for Non-Visual\nEconomic Sensory Translation', 
          colors['primary'], width=35, height=8, fontsize=12)

# LEVEL 1 - Main Branches
level1_y = 78
branches = [
    (20, 'THE PROBLEM', colors['accent3']),
    (50, 'THE SOLUTION', colors['accent2']),
    (90, 'RESEARCH', colors['accent5']),
    (120, 'IMPACT', colors['accent4'])
]

for x, title, color in branches:
    draw_node(ax, x, level1_y, title, color, width=22, height=5, fontsize=11)
    draw_connection(ax, root_x, root_y - 4, x, level1_y + 2.5, color, 3)

# LEVEL 2 - Problem Details (Left)
problem_items = [
    (8, 65, 'Visual Exclusivity\n2.2B vision impaired'),
    (20, 55, 'Neurodivergent Burden\nADHD financial struggles'),
    (32, 45, 'Aging Population\nCognitive load issues'),
    (14, 35, 'Accessibility Gap\n56% images inaccessible')
]
for x, y, text in problem_items:
    draw_node(ax, x, y, text, colors['accent3'], width=16, height=6, fontsize=8, alpha=0.8)
    draw_connection(ax, 20, level1_y - 2.5, x, y + 3, colors['accent3'], 1.5)

# LEVEL 2 - Solution Details (Center-Left)
solution_items = [
    (38, 65, 'Harmonic Audio\nFrequency & amplitude'),
    (50, 55, 'Parametric Haptics\nVibrotactile feedback'),
    (62, 45, 'Chromatic Visuals\nLow-vision optimized'),
    (44, 35, 'Integrity Signals\nEd25519 crypto proof'),
    (56, 25, 'Target Populations:\nBlind • ADHD • Elderly')
]
for x, y, text in solution_items:
    draw_node(ax, x, y, text, colors['accent2'], width=16, height=6, fontsize=8)
    draw_connection(ax, 50, level1_y - 2.5, x, y + 3, colors['accent2'], 1.5)

# LEVEL 2 - Research Details (Center-Right)
research_items = [
    (78, 65, '4 Research Aims\nModel • Load • Access • Trust'),
    (90, 55, 'Methodology\nVisual / Multi / Hybrid'),
    (102, 45, 'Measurements\nEEG • Eye-tracking • GSR'),
    (84, 35, '6-State Encoding\nVolatility • Momentum • Entropy\nCoherence • Direction • Stability'),
    (96, 22, 'Technical Stack\nInput → Process → Output')
]
for x, y, text in research_items:
    draw_node(ax, x, y, text, colors['accent5'], width=18, height=7, fontsize=8)
    draw_connection(ax, 90, level1_y - 2.5, x, y + 3.5, colors['accent5'], 1.5)

# LEVEL 2 - Impact Details (Right)
impact_items = [
    (108, 65, 'Innovation\n4 Breakthrough Areas'),
    (120, 55, 'Immediate Outcomes\nOpen-source toolkit'),
    (132, 45, 'Applications\nFinance • Climate • Medical'),
    (114, 32, 'Long-term Vision\nMultisensory-first design'),
    (126, 20, 'Budget: $1.2M\nPersonnel • Equipment • Travel')
]
for x, y, text in impact_items:
    draw_node(ax, x, y, text, colors['accent4'], width=16, height=7, fontsize=8)
    draw_connection(ax, 120, level1_y - 2.5, x, y + 3.5, colors['accent4'], 1.5)

# Add Team section at bottom
draw_node(ax, 70, 8, 'RESEARCH TEAM: PI (HCI/Neuroscience) • Co-I Justin McCrea (Reality Protocol) • Postdoc (EEG) • Accessibility Consultant', 
          colors['secondary'], width=60, height=5, fontsize=10)
draw_connection(ax, 70, 8 + 2.5, root_x, root_y - 4, colors['secondary'], 2)

# Add decorative elements
# Central research question
ax.text(70, 70, 'Research Question:', ha='center', va='center', fontsize=10, 
        color=colors['accent1'], fontweight='bold', style='italic')
ax.text(70, 67, 'Can structured multisensory encoding reduce cognitive load\nand improve comprehension of economic time-series?', 
        ha='center', va='center', fontsize=9, color='white', style='italic')

# Title
ax.text(70, 97, 'H.O.N.E.S.T. FUNDING PROPOSAL', ha='center', va='center', 
        fontsize=18, color='white', fontweight='bold')
ax.text(70, 94, 'A Research Platform for Multisensory Financial Data Accessibility', 
        ha='center', va='center', fontsize=11, color=colors['primary'])

plt.tight_layout()
plt.savefig('/mnt/kimi/output/honest_mindmap_v2.png', dpi=150, bbox_inches='tight', facecolor='#1e293b')
plt.show()
print("Enhanced mind map saved!")
