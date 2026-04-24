import fs from 'fs';

const WP_URL = 'https://stoneworld.co.in';

// All pages we want featured images for
const slugs = [
  'facade','fireplace','floor','landscape','lift-cladding','stone-mandir',
  'stone-name-plate','parking','partition-wall','staircase','stone-artefacts',
  'swimming-pool-deck','wash-basin','water-body','bar-counter','bathroom',
  'boundary-wall','ceiling-design','centre-table-top','courtyard','dining-table',
  'double-height-wall','drawing-room',
  // collections
  'brick-claddings','antique-boat-wood-claddings','cnc-carved-stone-designs',
  'bamboo-wash-basins','gemstones','gold-leafing-on-stones','granite-stone',
  'hand-crafted-stone-murals','hand-cut-carpet-mosaics','natural-stone-claddings',
  'raw-ceramic-jaalis','slate-murals','stone-inlays','stone-jaalies','stone-veneers',
  'wall-floor-highlighters','wash-basins',
];

async function run() {
  const imageMap = {};

  for (const slug of slugs) {
    try {
      const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages?slug=${slug}&_fields=slug,featured_media`);
      const pages = await res.json();
      if (!pages.length || !pages[0].featured_media) continue;
      const mediaId = pages[0].featured_media;
      const mres = await fetch(`${WP_URL}/wp-json/wp/v2/media/${mediaId}?_fields=source_url`);
      const media = await mres.json();
      if (media.source_url) {
        imageMap[slug] = media.source_url;
        console.log(`${slug}: ${media.source_url}`);
      }
    } catch(e) {
      console.warn(`Error for ${slug}: ${e.message}`);
    }
  }

  fs.writeFileSync('./src/data/featuredImages.json', JSON.stringify(imageMap, null, 2));
  console.log('\n✅ Featured images mapped:', Object.keys(imageMap).length, 'pages');
}

run().catch(console.error);
