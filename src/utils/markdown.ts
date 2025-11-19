import type { ComponentInstance } from 'astro';

export interface PostFrontmatter {
  title: string;
  tag: string;
  date: string;
  cover?: string;
  summary?: string;
  status: 'published' | 'draft';
  readingTime: number;
}

export interface ComponentReference {
  componentName: string;
  startLine: number;
  endLine: number;
  raw: string;
}

/**
 * 解析 Markdown 内容中的组件引用
 * 格式: @ComponentName.astro (start-end)
 */
export function parseComponentReferences(content: string): ComponentReference[] {
  const regex = /@(\w+(?:\.\w+)?)\.astro\s*\((\d+)-(\d+)\)/g;
  const references: ComponentReference[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    references.push({
      componentName: match[1],
      startLine: parseInt(match[2], 10),
      endLine: parseInt(match[3], 10),
      raw: match[0],
    });
  }

  return references;
}

/**
 * 将 Markdown 内容中的组件引用替换为占位符
 */
export function replaceComponentReferences(
  content: string,
  references: ComponentReference[]
): { content: string; placeholders: Map<string, ComponentReference> } {
  const placeholders = new Map<string, ComponentReference>();
  let processedContent = content;

  references.forEach((ref, index) => {
    const placeholder = `<!-- COMPONENT_PLACEHOLDER_${index} -->`;
    placeholders.set(placeholder, ref);
    processedContent = processedContent.replace(ref.raw, placeholder);
  });

  return { content: processedContent, placeholders };
}

/**
 * 动态加载组件
 */
export async function loadComponent(
  componentName: string
): Promise<ComponentInstance | null> {
  try {
    // 尝试从 components 目录加载
    const component = await import(
      `../components/${componentName}.astro`
    );
    return component.default;
  } catch (error) {
    console.warn(`无法加载组件: ${componentName}`, error);
    return null;
  }
}

/**
 * 计算阅读时间（基于字数）
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 中文约 200 字/分钟
  const wordCount = content.replace(/\s/g, '').length;
  return Math.ceil(wordCount / wordsPerMinute);
}

