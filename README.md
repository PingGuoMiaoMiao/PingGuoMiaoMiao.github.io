# 🍎 苹果喵喵的博客

> 一个用 Astro 搭建的 Neo Brutalist 风格个人博客 ✨

![Neo Brutalist Blog](https://img.shields.io/badge/Style-Neo%20Brutalist-ff6b6b?style=for-the-badge)
![Astro](https://img.shields.io/badge/Built%20with-Astro-ff5d01?style=for-the-badge&logo=astro)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🌟 关于这个项目

这是一个超酷的个人博客，采用了 **Neo Brutalist** 设计风格（粗边框、大阴影、高对比度，超有态度！）。

主要特性：
- 🎨 **Neo Brutalist 设计** - 大胆、直接、不妥协
- ⚡ **超快性能** - Astro 静态生成，懒加载优化
- 📱 **移动端友好** - 响应式设计，完美适配各种设备
- 🎭 **动画效果** - GSAP 驱动的 Logo 动画
- 🔍 **搜索功能** - 快速找到你想要的内容
- 📝 **Markdown 支持** - 轻松写文章

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

然后打开浏览器访问 `http://localhost:4321` 🎉

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📁 项目结构

```
/
├── public/              # 静态资源（图片、字体等）
├── src/
│   ├── components/      # 组件（Header、Footer、PostCard 等）
│   ├── content/         # 博客文章（Markdown 文件）
│   ├── layouts/         # 页面布局
│   ├── pages/           # 路由页面
│   ├── styles/          # 全局样式
│   └── utils/           # 工具函数
├── scripts/             # 脚本工具
└── package.json
```

## 🎯 主要命令

| 命令 | 说明 |
| :--- | :--- |
| `npm install` | 安装所有依赖 |
| `npm run dev` | 启动开发服务器（热重载） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run astro ...` | 运行 Astro CLI 命令 |

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build) - 超快的静态站点生成器
- **样式**: Neo Brutalist 设计风格
- **动画**: [GSAP](https://greensock.com/gsap/) - 专业动画库
- **Markdown**: 支持 Markdown 写文章
- **部署**: GitHub Pages

## 📝 写文章

文章放在 `src/content/posts/` 目录下，使用 Markdown 格式。

每篇文章需要包含 frontmatter：

```markdown
---
title: "文章标题"
tag: "标签"
date: "2024-01-01"
summary: "文章摘要"
status: "published"
readingTime: 5
---

# 文章内容

这里是你的文章内容...
```

## 🎨 自定义

### 修改主题颜色

编辑 `src/styles/global.css` 中的 CSS 变量：

```css
:root {
  --neo-primary: #f8d347;      /* 主色调 */
  --neo-accent-pink: #ff6b6b;  /* 强调色 */
  --neo-black: #0f0f0f;        /* 黑色 */
  /* ... */
}
```

### 添加新页面

在 `src/pages/` 目录下创建新的 `.astro` 文件即可自动生成路由。

## 📚 了解更多

- [Astro 官方文档](https://docs.astro.build)
- [Neo Brutalist 设计](https://www.interaction-design.org/literature/article/brutalism-in-digital-design)
- [GSAP 文档](https://greensock.com/docs/)

## 📄 许可证

MIT License - 想用就用，想改就改！😎

---

**Made with ❤️ by 苹果喵喵**

有问题？欢迎提 Issue 或 PR！🚀
