import fs from 'fs';
import path from 'path';

const WP_URL = 'https://stoneworld.co.in';
const WP_BASE = 'https://stoneworld.co.in/wp-content/uploads';

async function fetchAll(endpoint) {
  let allData = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_fields=id,slug,title,source_url,media_details`);
    if (!res.ok) break;
    const data = await res.json();
    allData = allData.concat(data);
    const tp = res.headers.get('x-wp-totalpages');
    if (tp) totalPages = parseInt(tp);
    page++;
  }
  return allData;
}

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) return;
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`  SKIP 404: ${url}`); return; }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buf));
    console.log(`  ✓ ${path.basename(dest)}`);
  } catch(e) {
    console.warn(`  ERROR: ${url} - ${e.message}`);
  }
}

// Key media we need: logos, hero, category thumbnails
const PRIORITY_SLUGS = [
  'stone_world_white_logo', 'cropped-logo-1-1', 'cropped-logo-1', 'logo-1', 'logo',
  'inner-about-bg', 'natural-stone-for-fireplace', 'gold-leafing',
  'stone-name-plate-designs', 'water-body-2',
];

async function run() {
  console.log('Fetching all media from WordPress...');
  const allMedia = await fetchAll('media');
  console.log(`Total media items: ${allMedia.length}`);

  ensureDir('./public/wp-content/uploads');
  ensureDir('./public/images');

  // Download logos first
  const logoURLs = [
    'https://stoneworld.co.in/wp-content/uploads/2025/03/Stone_World_white_logo.webp',
    'https://stoneworld.co.in/wp-content/uploads/2025/03/cropped-logo-1-1.png',
    'https://stoneworld.co.in/wp-content/uploads/2025/03/logo.png',
    'https://stoneworld.co.in/wp-content/uploads/2026/01/inner-about-bg.webp',
  ];

  // Build a map of URLs to local paths
  const urlMap = {};

  console.log('\n--- Downloading logos & key images ---');
  for (const url of logoURLs) {
    const fname = path.basename(url);
    const dest = `./public/images/${fname}`;
    await downloadFile(url, dest);
    urlMap[url] = `/images/${fname}`;
  }

  // Download all other media (preserve wp-content structure for inline img tags)
  console.log('\n--- Downloading all media (wp-content structure) ---');
  for (const item of allMedia) {
    const url = item.source_url;
    if (!url) continue;
    // Extract relative path after /wp-content/uploads/
    const match = url.match(/wp-content\/uploads\/(.+)/);
    if (!match) continue;
    const relativePath = match[1];
    const dest = `./public/wp-content/uploads/${relativePath}`;
    ensureDir(path.dirname(dest));
    await downloadFile(url, dest);
    urlMap[url] = `/wp-content/uploads/${relativePath}`;
  }

  // Save URL map
  fs.writeFileSync('./src/data/mediaMap.json', JSON.stringify(urlMap, null, 2));
  console.log('\n✅ Media download complete!');
  console.log(`   Total files mapped: ${Object.keys(urlMap).length}`);
}

run().catch(console.error);
