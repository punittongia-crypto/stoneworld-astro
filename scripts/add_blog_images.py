#!/usr/bin/env python3
"""
Add featured images to all blog post frontmatter using WordPress media API data.
Run from the stoneworld-astro directory.
"""
import re
import os
import glob

blog_dir = 'src/content/blog'

# Slug → image URL mapping from WordPress REST API
SLUG_TO_IMAGE = {
    "marble-pillar-for-mandir-design": "https://stoneworld.co.in/wp-content/uploads/2026/01/Marble-Pillar-for-Mandir.jpg",
    "banswara-white-marble-mandir-vs-vietnam-marble-mandir": "https://stoneworld.co.in/wp-content/uploads/2026/01/Banswara-White-Marble-Mandir-vs-Vietnam-Marble-Mandir.jpg",
    "marble-wall-mural": "https://stoneworld.co.in/wp-content/uploads/2026/01/ChatGPT-Image-Jan-15-2026-03_34_04-PM_11zon.jpg",
    "5-stone-table-tops-you-can-use-as-a-dining-table": "https://stoneworld.co.in/wp-content/uploads/2025/03/Blog-Banner-for-Website-Content-2.jpg",
    "sandstone-wall-mural": "https://stoneworld.co.in/wp-content/uploads/2026/01/ChatGPT-Image-Jan-7-2026-12_18_56-PM.jpg",
    "roman-stone-wall-design": "https://stoneworld.co.in/wp-content/uploads/2025/12/ChatGPT-Image-Dec-29-2025-02_27_11-PM-e1768195556839.jpg",
    "natural-stone-carving-for-luxury-interiors": "https://stoneworld.co.in/wp-content/uploads/2025/12/Natural-Stone-Carving-For-Luxury-Interior-1.jpg",
    "vietnam-white-marble-mandir": "https://stoneworld.co.in/wp-content/uploads/2025/12/processed-image-19.jpg",
    "natural-stone-cladding-for-living-room": "https://stoneworld.co.in/wp-content/uploads/2025/12/ChatGPT-Image-Jan-12-2026-11_56_51-AM_11zon.jpg",
    "lime-stone-wall-cladding": "https://stoneworld.co.in/wp-content/uploads/2025/11/processed-image-4.jpg",
    "slate-stone-wall-cladding": "https://stoneworld.co.in/wp-content/uploads/2025/11/processed-image.jpg",
    "sandstone-wall-cladding": "https://stoneworld.co.in/wp-content/uploads/2025/11/ChatGPT-Image-Nov-13-2025-10_34_05-AM.jpg",
    "wall-stone-cladding-designs": "https://stoneworld.co.in/wp-content/uploads/2025/11/ChatGPT-Image-Nov-12-2025-10_49_07-AM.jpg",
    "indoor-natural-stone-flooring": "https://stoneworld.co.in/wp-content/uploads/2025/10/Gemini_Generated_Image_kscrdykscrdykscr_11zon.png",
    "natural-stone-outdoor-flooring": "https://stoneworld.co.in/wp-content/uploads/2025/10/Gemini_Generated_Image_asnmzoasnmzoasnm_11zon.png",
    "marble-stone-flooring": "https://stoneworld.co.in/wp-content/uploads/2025/10/Gemini_Generated_Image_8hapx48hapx48hap_11zon.png",
    "natural-stone-tiles-for-floor": "https://stoneworld.co.in/wp-content/uploads/2025/10/Gemini_Generated_Image_5dlatu5dlatu5dla_11zon.png",
    "granite-stone-flooring": "https://stoneworld.co.in/wp-content/uploads/2025/09/Granite-Stone-Flooring_11zon.jpg",
    "stone-flooring-for-kitchen": "https://stoneworld.co.in/wp-content/uploads/2025/09/ChatGPT-Image-Sep-19-2025-11_52_32-AM_11zon.jpg",
    "stone-flooring-for-bathroom": "https://stoneworld.co.in/wp-content/uploads/2025/09/ChatGPT-Image-Sep-17-2025-01_14_19-PM_11zon.jpg",
    "which-type-of-mandir-is-good-for-home": "https://stoneworld.co.in/wp-content/uploads/2025/09/Serene-Temple-Deities-in-Stone-1_11zon.png",
    "which-stone-is-best-for-pooja-room-granite-or-marble": "https://stoneworld.co.in/wp-content/uploads/2025/09/Granite-vs-Marble_-Pooja-Room-final_11zon.png",
    "white-marble-mandir-for-home": "https://stoneworld.co.in/wp-content/uploads/2025/09/Elegante-Mandir-de-Marmol-Blanco-final-1.png",
    "stone-temple-design-for-home": "https://stoneworld.co.in/wp-content/uploads/2025/09/Elegant-White-Marble-Mandir-Desi-final_11zon.png",
    "6-ways-to-include-marble-in-your-home-decor": "https://stoneworld.co.in/wp-content/uploads/2025/03/6_Ways_to_Include_Marble_in_your_Home_Decor.webp",
    "back-to-nature-6-amazing-features-of-terracotta": "https://stoneworld.co.in/wp-content/uploads/2025/03/IMG-20220602-WA0020-1.webp",
    "5-top-trends-in-decorating-your-home-with-natural-stones": "https://stoneworld.co.in/wp-content/uploads/2025/03/5_Top_Trends_in_Decorating_your_Home_with_Natural_Stones.webp",
    "dry-v-s-wet-cladding-which-one-to-choose-for-your-stone-decor": "https://stoneworld.co.in/wp-content/uploads/2025/08/ChatGPT-Image-Aug-22-2025-01_06_04-PM_11zon.jpg",
    "5-benefits-of-stone-flooring-in-your-home": "https://stoneworld.co.in/wp-content/uploads/2025/03/5_Benefits_of_Stone_Flooring_in_your_Home.webp",
    "top-6-trends-to-reflecting-luxury-in-your-home-semi-precious-stones-in-interiors": "https://stoneworld.co.in/wp-content/uploads/2025/03/ChatGPT-Image-Aug-22-2025-11_01_16-AM_11zon.jpg",
    "lets-choose-between-limestone-vs-sandstone-which-natural-stone-you-should-include-in-your-home-design": "https://stoneworld.co.in/wp-content/uploads/2025/08/ChatGPT-Image-Aug-22-2025-11_21_50-AM_11zon.webp",
    "gemstone-the-epitome-of-luxury-and-beauty": "https://stoneworld.co.in/wp-content/uploads/2025/08/ChatGPT-Image-Aug-22-2025-11_45_05-AM_11zon.png",
    "4-natural-stones-you-can-incorporate-into-your-faux-fireplace": "https://stoneworld.co.in/wp-content/uploads/2025/08/Natural-Stone-for-Fireplace.webp",
    "6-popular-interior-trends-for-your-mandir": "https://stoneworld.co.in/wp-content/uploads/2025/08/ChatGPT-Image-Aug-21-2025-11_36_18-AM_11zon.jpg",
    "6-tops-trends-to-follow-to-keep-your-interiors-warm-and-welcoming": "https://stoneworld.co.in/wp-content/uploads/2025/03/ChatGPT-Image-Aug-21-2025-03_00_07-PM_11zon.jpg",
    "6-interior-designing-trends-that-designers-always-appreciate": "https://stoneworld.co.in/wp-content/uploads/2025/08/6-Timeless-Interior-Design-Trends-Loved-By-Experts.webp",
    "6-landscaping-friendly-stones-to-make-your-garden-beautifu": "https://stoneworld.co.in/wp-content/uploads/2025/08/Best-Stones-for-Landscaping.webp",
    "5-natural-stones-that-are-preferred-by-architects-for-wall-cladding": "https://stoneworld.co.in/wp-content/uploads/2025/08/Natural-stones-for-wall-cladding.webp",
    "5-semi-precious-stones-that-can-amp-up-your-interior-game": "https://stoneworld.co.in/wp-content/uploads/2025/08/ChatGPT-Image-Aug-21-2025-02_11_01-PM_11zon.jpg",
    "gold-leafing-the-art-of-adding-luxury-to-home-interiors": "https://stoneworld.co.in/wp-content/uploads/2025/08/gold-leafing.webp",
    "five-limestones-options-you-should-consider-while-remodelling-your-home": "https://stoneworld.co.in/wp-content/uploads/2025/03/WhatsApp_Image_2022-12-08_at_16.54.43_2.webp",
    "5-budget-interiors-to-adopt-for-your-dining-area": "https://stoneworld.co.in/wp-content/uploads/2025/08/Blog-Banner-for-Website-Content-3_11zon.jpg",
    "why-bamboo-basins-will-be-the-next-big-thing-in-home-decor": "https://stoneworld.co.in/wp-content/uploads/2025/03/WhatsApp_Image_2022-12-08_at_16.54.42.webp",
    "exterior-stone-cladding-texture": "https://stoneworld.co.in/wp-content/uploads/2025/08/Blog-Banner-for-Website-Content_11zon.png",
    "6-reasons-why-stonelam-tiles-are-the-perfect-fit-for-your-home": "https://stoneworld.co.in/wp-content/uploads/2025/03/Blog-Banner-for-Website-Content-1_11zon.jpg",
    "natural-stones-for-wall-cladding": "https://stoneworld.co.in/wp-content/uploads/2025/08/Copy-of-Red-Simple-Travel-Blog-Banner-12_11zon.jpg",
    "5-trending-interiors-to-opt-for-this-fall-season": "https://stoneworld.co.in/wp-content/uploads/2025/08/Blog-Banner-for-Website-Content.jpg",
    "modern-interior-wall-cladding-designs": "https://stoneworld.co.in/wp-content/uploads/2025/08/Copy-of-Red-Simple-Travel-Blog-Banner-7.jpg",
    "interior-brick-wall-cladding": "https://stoneworld.co.in/wp-content/uploads/2025/08/Copy-of-Red-Simple-Travel-Blog-Banner-5.jpg",
    "garden-designs-with-stones": "https://stoneworld.co.in/wp-content/uploads/2025/07/Red-Simple-Travel-Blog-Banner-1_11zon.png",
    "stone-name-plate-design": "https://stoneworld.co.in/wp-content/uploads/2025/06/Stone-Name-Plate-Designs.jpg",
    "marble-pooja-room-designs-ideas": "https://stoneworld.co.in/wp-content/uploads/2025/09/Elegante-Mandir-de-Marmol-Blanco-final-1.png",
    "top-natural-stone-flooring-ideas": "https://stoneworld.co.in/wp-content/uploads/2025/07/unnamed_11zon.png",
    "modern-marble-floor-border-design": "https://stoneworld.co.in/wp-content/uploads/2025/10/Gemini_Generated_Image_8hapx48hapx48hap_11zon.png",
    "5-stonelam-3mm-tiles-design-ideas": "https://stoneworld.co.in/wp-content/uploads/2025/03/Blog-Banner-for-Website-Content-1_11zon.jpg",
    "water-fountain-for-home-vastu": "https://stoneworld.co.in/wp-content/uploads/2025/03/ce578b340050198f67fb8a3f4a7df390.webp",
    "which-buddha-statue-is-good-for-home": "https://stoneworld.co.in/wp-content/uploads/2025/03/adbb40ac8c22e4015a999d735295a20e.jpg",
}

files = glob.glob(f'{blog_dir}/*.md')
updated = 0
skipped = 0
not_found = []

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find frontmatter block (between first pair of ---)
    # The frontmatter ends at second ---
    parts = content.split('---', 2)
    if len(parts) < 3:
        print(f"No frontmatter found: {filepath}")
        continue
    
    fm = parts[1]  # frontmatter text
    rest = parts[2]  # rest of file
    
    # Skip if already has image
    if re.search(r'^image:', fm, re.MULTILINE):
        skipped += 1
        continue
    
    # Extract slug - handles both quoted and unquoted values
    slug_match = re.search(r'^slug:\s*"?([^"\n]+)"?', fm, re.MULTILINE)
    if not slug_match:
        print(f"No slug found: {filepath}")
        continue
    
    slug = slug_match.group(1).strip().strip('"').strip("'")
    
    # Find matching image
    image_url = SLUG_TO_IMAGE.get(slug)
    if not image_url:
        not_found.append(slug)
        continue
    
    # Insert image field after the slug line
    new_fm = re.sub(
        r'(^slug:.*$)',
        f'\\1\nimage: "{image_url}"',
        fm,
        flags=re.MULTILINE,
        count=1
    )
    
    new_content = f'---{new_fm}---{rest}'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    updated += 1
    print(f"✓ {slug}")

print(f"\nDone: {updated} updated, {skipped} already had image")
if not_found:
    print(f"\nNo image found for {len(not_found)} slugs:")
    for s in not_found:
        print(f"  - '{s}'")
