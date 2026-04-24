import fs from 'fs';

async function go() {
  console.log("Fetching all pages...");
  let allPages = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://stoneworld.co.in/wp-json/wp/v2/pages?per_page=100&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    if (data.length === 0) break;
    allPages = allPages.concat(data);
    page++;
  }
  
  const collectionAreas = [
    'antique-boat-wood-claddings', 'bamboo-wash-basins', 'brick-claddings',
    'cnc-carved-stone-designs', 'gemstones', 'glazed-ceramic-jaalis',
    'gold-leafing-on-stones', 'granite-stone', 'hand-crafted-stone-murals',
    'hand-cut-carpet-mosaics', 'natural-stone-claddings', 'raw-ceramic-jaalis',
    'slate-murals', 'stone-artefacts', 'stone-inlays', 'stone-jaalies',
    'stone-veneers', 'wall-floor-highlighters', 'wash-basins'
  ];
  
  const pageData = {};
  
  allPages.forEach(p => {
    if (collectionAreas.includes(p.slug)) {
      pageData[p.slug] = {
        title: p.title.rendered,
        content: p.content.rendered,
        slug: p.slug
      };
    }
  });
  
  fs.writeFileSync('src/data/collectionPages.json', JSON.stringify(pageData, null, 2));
  console.log("Saved " + Object.keys(pageData).length + " collection pages.");
}
go();
