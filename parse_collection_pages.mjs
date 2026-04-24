import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/collectionPages.json', 'utf-8'));

function parseElementorHTML(html) {
  let cleanHtml = html.replace(/https:\/\/stoneworld\.co\.in/g, '');
  const headings = cleanHtml.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/g) || [];
  const paragraphs = cleanHtml.match(/<p[^>]*>(.*?)<\/p>/g) || [];
  const imageRegex = /<img[^>]+src="([^">]+)"/g;
  let images = [];
  let match;
  while ((match = imageRegex.exec(cleanHtml)) !== null) {
    if (!match[1].includes('data:image')) {
      images.push(match[1]);
    }
  }
  images = [...new Set(images)];
  
  return {
    headings: headings.map(h => h.replace(/<[^>]*>/g, '').trim()).filter(h => h),
    paragraphs: paragraphs.map(p => p.replace(/<[^>]*>/g, '').trim()).filter(p => p),
    images
  };
}

const parsedData = {};
for (const slug in data) {
  parsedData[slug] = {
    title: data[slug].title,
    ...parseElementorHTML(data[slug].content)
  };
}

fs.writeFileSync('src/data/collectionPagesParsed.json', JSON.stringify(parsedData, null, 2));
console.log("Collection pages parsed.");
