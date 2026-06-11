import fs from 'fs';
import path from 'path';

const sourceRoot = 'C:/Users/chen/Desktop/02_学习资料/practice笔记';
const postsDir = path.resolve('src/content/posts');

function walkMarkdownFiles(dir, baseDir = dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (entry.name === '.obsidian') {
        continue;
      }
      walkMarkdownFiles(fullPath, baseDir, results);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      results.push({ fullPath, relativePath });
    }
  }

  return results;
}

function getNextPostId() {
  const files = fs.readdirSync(postsDir);
  const maxId = files
    .filter((name) => /^\d+\.md$/.test(name))
    .map((name) => Number.parseInt(name.replace('.md', ''), 10))
    .reduce((acc, id) => Math.max(acc, id), 0);

  return maxId + 1;
}

function stripFrontmatter(content) {
  if (!content.startsWith('---')) {
    return content.trim();
  }

  const end = content.indexOf('\n---', 3);
  if (end === -1) {
    return content.trim();
  }

  return content.slice(end + 4).trim();
}

function extractTitle(content, fallbackName) {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      return match[1].trim();
    }
  }
  return fallbackName.replace(/\.md$/i, '').trim();
}

function inferTag(relativePath, title) {
  const probe = `${relativePath} ${title}`.toLowerCase();
  if (/算法|kmeans|k-means|opencv/.test(probe)) return '算法';
  if (/java|spring|后端|数据库/.test(probe)) return '后端';
  if (/vue|react|前端|css|javascript|typescript/.test(probe)) return '前端';
  if (/ai|提示词|模型|langchain|copilot/.test(probe)) return 'AI';
  return '学习笔记';
}

function calcReadingTime(content) {
  const count = content.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(count / 200));
}

function buildSummary(content) {
  const clean = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const summary = clean.slice(0, 150);
  return summary.length < clean.length ? `${summary}...` : summary;
}

function ensureHeading(body, title) {
  if (/^#{1,6}\s+/.test(body)) {
    return body;
  }
  return `# ${title}\n\n${body}`;
}

function formatDate(filePath) {
  const mtime = fs.statSync(filePath).mtime;
  return mtime.toISOString().slice(0, 10);
}

function toFrontmatter({ title, tag, date, summary, readingTime }) {
  const safeTitle = title.replace(/"/g, "'");
  const safeSummary = summary.replace(/"/g, "'");

  return `---\ntitle: "${safeTitle}"\ntag: "${tag}"\ndate: "${date}"\nsummary: "${safeSummary}"\nstatus: "published"\nreadingTime: ${readingTime}\n---\n\n`;
}

function main() {
  if (!fs.existsSync(sourceRoot)) {
    console.error(`源目录不存在: ${sourceRoot}`);
    process.exit(1);
  }

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const markdownFiles = walkMarkdownFiles(sourceRoot)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'zh-Hans-CN', { numeric: true }));

  let nextId = getNextPostId();
  let importedCount = 0;

  for (const file of markdownFiles) {
    const raw = fs.readFileSync(file.fullPath, 'utf-8');
    const bodyNoFrontmatter = stripFrontmatter(raw);
    const title = extractTitle(bodyNoFrontmatter, path.basename(file.fullPath));
    const body = ensureHeading(bodyNoFrontmatter, title);
    const tag = inferTag(file.relativePath, title);
    const summary = buildSummary(bodyNoFrontmatter);
    const readingTime = calcReadingTime(bodyNoFrontmatter);
    const date = formatDate(file.fullPath);

    const frontmatter = toFrontmatter({ title, tag, date, summary, readingTime });
    const targetPath = path.join(postsDir, `${nextId}.md`);

    fs.writeFileSync(targetPath, frontmatter + body + '\n', 'utf-8');
    console.log(`✓ ${file.relativePath} -> ${nextId}.md`);

    importedCount += 1;
    nextId += 1;
  }

  console.log(`\n完成，成功导入 ${importedCount} 篇。`);
}

main();
