import type { APIRoute } from 'astro';
import { processPosts } from '../utils/posts';

export const GET: APIRoute = async ({ site }) => {
  const allPostsRaw = await Astro.glob('../content/posts/*.md');
  const posts = processPosts(allPostsRaw);

  const siteUrl = site || 'https://example.com';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${posts
    .map(
      (post) => `  <url>
    <loc>${siteUrl}/post/${post.id}</loc>
    <lastmod>${new Date(post.frontmatter.date).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n')}
  ${Array.from(new Set(posts.map((p) => p.frontmatter.tag)))
    .map(
      (tag) => `  <url>
    <loc>${siteUrl}/tag/${encodeURIComponent(tag)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

