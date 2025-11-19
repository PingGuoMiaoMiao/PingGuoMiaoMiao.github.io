import rss from '@astrojs/rss';
import { processPosts } from '../utils/posts';

export async function GET(context) {
  const allPostsRaw = import.meta.glob('../content/posts/*.md', { eager: true });
  const posts = processPosts(
    Object.entries(allPostsRaw).map(([path, module]) => {
      const post = module;
      return {
        file: path,
        frontmatter: post.frontmatter,
        rawContent: () => post.rawContent(),
      };
    })
  );

  return rss({
    title: '苹果喵喵Blog',
    description: '一个基于 Astro 的博客',
    site: context.site || 'https://example.com',
    items: posts.map((post) => ({
      title: post.frontmatter.title,
      description: post.frontmatter.summary || post.frontmatter.title,
      pubDate: new Date(post.frontmatter.date),
      link: `/post/${post.id}`,
      customData: `<tag>${post.frontmatter.tag}</tag>`,
    })),
    customData: '<language>zh-CN</language>',
  });
}
