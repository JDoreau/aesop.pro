"""
stamp_owl.py
Reads assets/owl-mark.svg as the single source of truth.
Replaces every inline owl-mark SVG in every HTML page with the master version.
Also ensures the CSS for .owl-body and .owl-eyes is present in each page's <style> block.
"""
import os, re

root = r'C:\Users\dorea\OneDrive\Desktop\CODE\aesop.pro\WEBSITE'

# Read master SVG (single line, no trailing newline)
master_path = os.path.join(root, 'assets', 'owl-mark.svg')
master_svg = open(master_path, encoding='utf-8').read().strip()

# The CSS rules that must be present -- these replace hardcoded fill= attrs
OWL_CSS = """.owl-mark .owl-body { fill: var(--navy); }
  .owl-mark .owl-eyes { fill: var(--twine); }"""

# For footer owls (reversed -- white body, twine eyes on dark bg)
OWL_CSS_REVERSED = """.foot-owl .owl-body { fill: #fff; }
  .foot-owl .owl-eyes { fill: var(--twine); }"""

# Pattern to match any existing inline owl SVG (with class owl-mark OR foot-owl)
SVG_PATTERN = re.compile(
    r'<svg class="(?:owl-mark|foot-owl)"[^>]*>.*?</svg>',
    re.DOTALL
)

def make_footer_owl(master):
    """Return a version with foot-owl class for footer use."""
    return master.replace('class="owl-mark"', 'class="owl-mark foot-owl"')

files = sorted([f for f in os.listdir(root) if f.endswith('.html')])
updated = []
skipped = []

for fname in files:
    path = os.path.join(root, fname)
    txt = open(path, encoding='utf-8').read()

    matches = list(SVG_PATTERN.finditer(txt))
    if not matches:
        skipped.append(fname)
        continue

    new_txt = txt
    replacements = 0
    for m in reversed(matches):  # reverse so offsets stay valid
        existing = m.group(0)
        # Determine context: footer owl vs nav owl
        # Look at 200 chars before the match for footer indicators
        before = txt[max(0, m.start()-200):m.start()].lower()
        is_footer = any(x in before for x in ['footer', 'foot-', 'foot_', 'site-foot'])
        
        if is_footer:
            replacement = make_footer_owl(master_svg)
        else:
            replacement = master_svg
        
        new_txt = new_txt[:m.start()] + replacement + new_txt[m.end():]
        replacements += 1

    # Ensure CSS classes are present -- add after existing owl-mark CSS if found,
    # or inject into the <style> block
    if '.owl-mark' in new_txt and '.owl-body' not in new_txt:
        # Find the owl-mark style rule and append after it
        new_txt = re.sub(
            r'(\.owl-mark\s*\{[^}]*\})',
            r'\1\n  ' + OWL_CSS,
            new_txt,
            count=1
        )
        # If that didn't work, inject before </style>
        if '.owl-body' not in new_txt:
            new_txt = new_txt.replace('</style>', f'  {OWL_CSS}\n</style>', 1)

    # Add foot-owl CSS if page has footer owl
    if 'foot-owl' in new_txt and '.foot-owl .owl-body' not in new_txt:
        new_txt = new_txt.replace('</style>', f'  {OWL_CSS_REVERSED}\n</style>', 1)

    if new_txt != txt:
        open(path, 'w', encoding='utf-8').write(new_txt)
        updated.append(f"{fname} ({replacements} owl{'s' if replacements>1 else ''})")
    else:
        skipped.append(fname + ' (no change needed)')

print(f"Updated ({len(updated)}):")
for f in updated: print(f"  {f}")
print(f"\nSkipped ({len(skipped)}):")
for f in skipped: print(f"  {f}")
