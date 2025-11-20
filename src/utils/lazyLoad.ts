/**
 * 使用 Intersection Observer 实现图片懒加载
 */
export function initLazyLoad() {
  // 检查浏览器支持
  if (!('IntersectionObserver' in window)) {
    // 降级：直接加载所有图片
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        img.loading = 'eager';
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // 如果图片有 data-src，使用它
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // 移除 loading="lazy" 属性
        img.loading = 'eager';
        
        // 停止观察
        observer.unobserve(img);
      }
    });
  }, {
    // 提前 50px 开始加载
    rootMargin: '50px',
    threshold: 0.01,
  });

  // 观察所有懒加载图片
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

/**
 * 初始化性能优化
 */
export function initPerformanceOptimizations() {
  // 使用 requestIdleCallback 延迟执行非关键任务
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // 预加载下一页可能需要的资源
      const links = document.querySelectorAll('a[href^="/"]');
      const prefetchLinks: string[] = [];
      
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && !prefetchLinks.includes(href) && prefetchLinks.length < 3) {
          prefetchLinks.push(href);
        }
      });

      // 预取前几个链接
      prefetchLinks.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });
    }, { timeout: 2000 });
  }
}

