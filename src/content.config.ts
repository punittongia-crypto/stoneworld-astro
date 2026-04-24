import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string().optional(),
    description: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'pages': pagesCollection,
  'blog': blogCollection,
};
