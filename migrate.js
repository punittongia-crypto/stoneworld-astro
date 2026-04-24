import fs from 'fs';
import path from 'path';

const WP_URL = 'https://stoneworld.co.in';

async function fetchAll(endpoint) {
  let allData = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(`${WP_URL}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}`);
    if (!response.ok) {
        console.error(`Failed to fetch ${endpoint} page ${page}`);
        break;
    }
    
    const data = await response.json();
    allData = allData.concat(data);

    const totalPagesHeader = response.headers.get('x-wp-totalpages');
    if (totalPagesHeader) {
      totalPages = parseInt(totalPagesHeader, 10);
    }
    page++;
  }
  return allData;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateMarkdown(item) {
  let content = `---
title: "${item.title.rendered.replace(/"/g, '\\"')}"
slug: "${item.slug}"
date: "${item.date}"
`;
  
  if (item.yoast_head_json) {
    if (item.yoast_head_json.description) {
        content += `description: "${item.yoast_head_json.description.replace(/"/g, '\\"')}"\n`;
    }
  }

  content += `---\n\n`;
  content += item.content.rendered;
  return content;
}

async function run() {
  console.log('Starting migration from WordPress...');
  
  const pages = await fetchAll('pages');
  console.log(`Fetched ${pages.length} pages.`);
  
  const posts = await fetchAll('posts');
  console.log(`Fetched ${posts.length} posts.`);

  const contentDir = path.join(process.cwd(), 'src', 'content');
  const pagesDir = path.join(contentDir, 'pages');
  const postsDir = path.join(contentDir, 'blog');

  ensureDir(pagesDir);
  ensureDir(postsDir);

  for (const page of pages) {
    const md = generateMarkdown(page);
    fs.writeFileSync(path.join(pagesDir, `${page.slug}.md`), md);
  }
  console.log('Saved pages to src/content/pages');

  for (const post of posts) {
    const md = generateMarkdown(post);
    fs.writeFileSync(path.join(postsDir, `${post.slug}.md`), md);
  }
  console.log('Saved posts to src/content/blog');
  
  console.log('Migration complete!');
}

run().catch(console.error);
