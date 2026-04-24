const fs = require('fs');

async function go() {
  const res = await fetch('https://stoneworld.co.in/wp-json/wp/v2/pages?slug=facade');
  const data = await res.json();
  const html = data[0].content.rendered;
  
  // Extract text elements
  const texts = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g) || [];
  const paragraphs = html.match(/<p[^>]*>(.*?)<\/p>/g) || [];
  const images = html.match(/<img[^>]+src="([^">]+)"/g) || [];
  
  console.log("Title:", data[0].title.rendered);
  console.log("Headings:");
  texts.forEach(t => console.log(t.replace(/<[^>]*>/g, '')));
  console.log("Paragraphs:");
  paragraphs.forEach(p => console.log(p.replace(/<[^>]*>/g, '')));
  console.log("Images:");
  images.forEach(i => console.log(i));
}
go();
