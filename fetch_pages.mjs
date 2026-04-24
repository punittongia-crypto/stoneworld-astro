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
  
  const appAreas = [
    'facade', 'fireplace', 'floor', 'landscape', 'lift-cladding', 'stone-mandir', 
    'stone-name-plate', 'parking', 'partition-wall', 'staircase', 'stone-artefacts', 
    'swimming-pool-deck', 'wash-basin', 'water-body', 'bar-counter', 'bathroom', 
    'boundary-wall', 'ceiling-design', 'centre-table-top', 'courtyard', 'dining-table', 
    'double-height-wall', 'drawing-room'
  ];
  
  const pageData = {};
  
  allPages.forEach(p => {
    if (appAreas.includes(p.slug)) {
      pageData[p.slug] = {
        title: p.title.rendered,
        content: p.content.rendered,
        slug: p.slug
      };
    }
  });
  
  fs.writeFileSync('src/data/appPages.json', JSON.stringify(pageData, null, 2));
  console.log("Saved " + Object.keys(pageData).length + " pages.");
}
go();
