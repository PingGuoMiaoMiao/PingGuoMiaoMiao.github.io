import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

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
});