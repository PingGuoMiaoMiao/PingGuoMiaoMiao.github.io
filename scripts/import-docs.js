import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docDir = path.join(__dirname, '../doc');
const postsDir = path.join(__dirname, '../src/content/posts');

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

// 从文件名提取标题（去除扩展名和特殊字符）
function extractTitleFromFilename(filename) {
  // 移除 .md 扩展名
  let title = filename.replace(/\.md$/, '');
  // 移除 emoji 和特殊字符，保留中文、英文、数字
  title = title.replace(/[📘🧩]/g, '').trim();
  // 如果包含书名号，提取书名号内的内容
  const bookMatch = title.match(/《(.+?)》/);
  if (bookMatch) {
    return bookMatch[1];
  }
  return title;
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

// 从文件路径推断标签
function inferTag(filePath) {
  const pathParts = filePath.split(path.sep);
  
  // 检查是否在子目录中
  if (pathParts.includes('Java自我学习总结文档')) {
    return 'Java';
  }
  if (pathParts.includes('后端知识总结')) {
    return '后端';
  }
  
  // 根据文件名推断
  const filename = path.basename(filePath, '.md');
  if (filename.includes('算法') || filename.includes('数据结构')) {
    return '算法';
  }
  if (filename.includes('Java')) {
    return 'Java';
  }
  if (filename.includes('异步') || filename.includes('web') || filename.includes('项目')) {
    return '前端';
  }
  if (filename.includes('OpenHarmony') || filename.includes('moonbit')) {
    return '嵌入式';
  }
  if (filename.includes('设计') || filename.includes('AI') || filename.includes('智能')) {
    return '设计';
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
function processMarkdownFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 提取标题
  let title = extractTitleFromContent(content);
  if (!title) {
    title = extractTitleFromFilename(path.basename(filePath));
  }
  
  // 提取标签
  const tag = inferTag(relativePath);
  
  // 计算阅读时间
  const readingTime = calculateReadingTime(content);
  
  // 提取摘要（前 100 个字符，去除 Markdown 格式）
  let summary = content
    .replace(/^#+\s+/gm, '') // 移除标题标记
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接格式，保留文本
    .replace(/\*\*/g, '') // 移除粗体标记
    .replace(/\*/g, '') // 移除斜体标记
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
  
  // 生成 frontmatter（使用单引号避免转义问题）
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

// 递归读取所有 Markdown 文件
function getAllMarkdownFiles(dir, baseDir = dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      // 跳过 doc.assets 目录
      if (entry.name !== 'doc.assets') {
        getAllMarkdownFiles(fullPath, baseDir, files);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({ fullPath, relativePath });
    }
  }
  
  return files;
}

// 主函数
function main() {
  console.log('开始导入文档...');
  
  if (!fs.existsSync(docDir)) {
    console.error(`错误: ${docDir} 目录不存在`);
    process.exit(1);
  }
  
  const markdownFiles = getAllMarkdownFiles(docDir);
  console.log(`找到 ${markdownFiles.length} 个 Markdown 文件`);
  
  let nextId = getNextPostId();
  const imported = [];
  
  for (const { fullPath, relativePath } of markdownFiles) {
    try {
      const processedContent = processMarkdownFile(fullPath, relativePath);
      const newFileName = `${nextId}.md`;
      const newFilePath = path.join(postsDir, newFileName);
      
      fs.writeFileSync(newFilePath, processedContent, 'utf-8');
      console.log(`✓ 导入: ${relativePath} -> ${newFileName}`);
      
      imported.push({
        original: relativePath,
        new: newFileName,
      });
      
      nextId++;
    } catch (error) {
      console.error(`✗ 错误处理 ${relativePath}:`, error.message);
    }
  }
  
  console.log(`\n完成! 成功导入 ${imported.length} 篇文章`);
  console.log('\n导入的文件列表:');
  imported.forEach(({ original, new: newFile }) => {
    console.log(`  ${original} -> ${newFile}`);
  });
}

main();

