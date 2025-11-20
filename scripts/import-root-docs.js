import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const postsDir = path.join(__dirname, '../src/content/posts');

// 要导入的文件列表
const filesToImport = [
  'DEVELOPMENT.md',
  'DNS入门.md',
  'N + 1查询问题.md',
  '什么是互联网.md',
  '算法.md'
];

// 确保 posts 目录存在
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// 计算阅读时间（基于字数）
function calculateReadingTime(content) {
  const wordsPerMinute = 200; // 中文约 200 字/分钟
  const wordCount = content.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// 从内容中提取标题（查找第一个 # 标题）
function extractTitleFromContent(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^#+\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

// 从文件名提取标题（去除扩展名）
function extractTitleFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

// 根据文件名推断标签
function inferTag(filename) {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('dns') || lowerFilename.includes('互联网')) {
    return '网络';
  }
  if (lowerFilename.includes('算法') || lowerFilename.includes('k-means') || lowerFilename.includes('kmeans')) {
    return '算法';
  }
  if (lowerFilename.includes('查询') || lowerFilename.includes('数据库')) {
    return '后端';
  }
  if (lowerFilename.includes('development') || lowerFilename.includes('开发')) {
    return '开发';
  }
  
  return '学习笔记';
}

// 获取下一个可用的文章 ID
function getNextPostId() {
  const files = fs.readdirSync(postsDir);
  const ids = files
    .filter(f => f.endsWith('.md'))
    .map(f => parseInt(f.replace('.md', '')))
    .filter(id => !isNaN(id));
  
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
}

// 处理单个 Markdown 文件
function processMarkdownFile(filePath, filename) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 提取标题
  let title = extractTitleFromContent(content);
  if (!title) {
    title = extractTitleFromFilename(filename);
  }
  
  // 提取标签
  const tag = inferTag(filename);
  
  // 计算阅读时间
  const readingTime = calculateReadingTime(content);
  
  // 提取摘要（前 100 个字符，去除 Markdown 格式）
  let summary = content
    .replace(/^#+\s+/gm, '') // 移除标题标记
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接格式，保留文本
    .replace(/\*\*/g, '') // 移除粗体标记
    .replace(/\*/g, '') // 移除斜体标记
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除行内代码
    .replace(/\n/g, ' ') // 替换换行符为空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
    .substring(0, 100);
  
  if (summary.length === 100) {
    summary += '...';
  }
  
  // 清理 summary，移除可能导致 YAML 错误的字符
  summary = summary
    .replace(/"/g, "'") // 将双引号替换为单引号
    .replace(/\n/g, ' ') // 替换换行符为空格
    .replace(/\r/g, '') // 移除回车符
    .replace(/[^\x20-\x7E\u4e00-\u9fa5]/g, '') // 移除可能导致问题的特殊字符，保留中文和基本 ASCII
    .trim();
  
  // 如果 summary 太长，截断
  if (summary.length > 150) {
    summary = summary.substring(0, 147) + '...';
  }
  
  // 获取文件修改时间作为日期
  const stats = fs.statSync(filePath);
  const date = stats.mtime.toISOString().split('T')[0];
  
  // 转义标题中的引号（使用单引号）
  const escapedTitle = title.replace(/'/g, "''").replace(/"/g, "'");
  
  // 生成 frontmatter
  const frontmatter = `---
title: "${escapedTitle}"
tag: "${tag}"
date: "${date}"
summary: "${summary}"
status: "published"
readingTime: ${readingTime}
---

`;
  
  // 移除内容中已有的 frontmatter（如果有）
  let bodyContent = content;
  if (bodyContent.startsWith('---')) {
    const endIndex = bodyContent.indexOf('---', 3);
    if (endIndex !== -1) {
      bodyContent = bodyContent.substring(endIndex + 3).trim();
    }
  }
  
  // 如果内容没有标题，添加一个
  if (!bodyContent.match(/^#+\s+/)) {
    bodyContent = `# ${title}\n\n${bodyContent}`;
  }
  
  return frontmatter + bodyContent;
}

// 主函数
function main() {
  console.log('开始导入根目录下的文档...');
  
  let nextId = getNextPostId();
  const imported = [];
  
  for (const filename of filesToImport) {
    const filePath = path.join(rootDir, filename);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ 文件不存在: ${filename}`);
      continue;
    }
    
    try {
      const processedContent = processMarkdownFile(filePath, filename);
      const newFileName = `${nextId}.md`;
      const newFilePath = path.join(postsDir, newFileName);
      
      fs.writeFileSync(newFilePath, processedContent, 'utf-8');
      console.log(`✓ 导入: ${filename} -> ${newFileName}`);
      
      imported.push({
        original: filename,
        new: newFileName,
      });
      
      nextId++;
    } catch (error) {
      console.error(`✗ 错误处理 ${filename}:`, error.message);
    }
  }
  
  console.log(`\n完成! 成功导入 ${imported.length} 篇文章`);
  console.log('\n导入的文件列表:');
  imported.forEach(({ original, new: newFile }) => {
    console.log(`  ${original} -> ${newFile}`);
  });
}

main();

