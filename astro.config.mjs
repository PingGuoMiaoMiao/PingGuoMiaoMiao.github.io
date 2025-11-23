import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com", // 请替换为你的实际域名
  integrations: [
    preact(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    compress({
      css: true,
      html: {
        removeAttributeQuotes: false,
        caseSensitive: true,
      },
      js: true,
      img: false, // 图片压缩由构建工具处理，避免重复压缩
      svg: true,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  // 支持中文路径
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },
  // 构建优化
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  // 压缩输出
  vite: {
    optimizeDeps: {
      include: ['pixi.js', 'pixi-live2d-display'],
      exclude: [],
    },
    build: {
      cssMinify: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // 保留 console，方便调试
        },
      },
    },
    ssr: {
      noExternal: ['pixi-live2d-display'], // 确保这个包在 SSR 时也被处理
    },
  },
});