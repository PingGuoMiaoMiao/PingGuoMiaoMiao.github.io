import type { PostFrontmatter } from './markdown';

export interface Post {
  id: string;
  frontmatter: PostFrontmatter;
  url: string;
  content: string;
}

/**
 * 获取所有已发布的文章
 * 在 Astro 页面中使用: const posts = await Astro.glob('../content/posts/*.md');
 */
export function processPosts(posts: any[]): Post[] {
  return posts
    .map((post) => {
      const id = post.file.split('/').pop()?.replace('.md', '') || '';
      return {
        id,
        frontmatter: post.frontmatter as PostFrontmatter,
        url: `/post/${id}`,
        content: post.rawContent(),
      };
    })
    .filter((post) => post.frontmatter.status === 'published')
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime();
      const dateB = new Date(b.frontmatter.date).getTime();
      return dateB - dateA; // 最新的在前
    });
}

/**
 * 根据 ID 获取单篇文章
 */
export function getPostById(posts: Post[], id: string): Post | null {
  return posts.find((post) => post.id === id) || null;
}

/**
 * 根据标签获取文章
 */
export function getPostsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((post) => post.frontmatter.tag === tag);
}

/**
 * 获取所有标签
 */
export function getAllTags(posts: Post[]): string[] {
  const tags = new Set<string>();
  posts.forEach((post) => {
    tags.add(post.frontmatter.tag);
  });
  return Array.from(tags).sort();
}

/**
 * 获取相邻文章（上一篇/下一篇）
 */
export function getAdjacentPosts(
  posts: Post[],
  currentId: string
): { prev: Post | null; next: Post | null } {
  const currentIndex = posts.findIndex((post) => post.id === currentId);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };
}

