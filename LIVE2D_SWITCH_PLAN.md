# Live2D 库切换方案

## 📊 两种方案对比

### 方案 A：继续使用 pixi-live2d-display（当前）
**优点：**
- ✅ 更灵活，可以完全自定义
- ✅ 支持更多高级功能
- ✅ 与 PIXI.js 深度集成
- ✅ 性能更好

**缺点：**
- ❌ 需要手动控制动画
- ❌ 禁用自动播放比较复杂
- ❌ 配置较复杂

### 方案 B：切换到 L2Dwidget（参考项目的方法）
**优点：**
- ✅ 配置简单，一行代码即可
- ✅ 内置眼睛跟踪功能
- ✅ 可以轻松禁用动画（`mobile.motion: false`）
- ✅ 使用简单，适合快速集成

**缺点：**
- ❌ 功能相对基础
- ❌ 自定义能力有限
- ❌ 需要下载 L2Dwidget 库文件

---

## 🚀 方案 B：切换到 L2Dwidget 的步骤

### 步骤 1：下载 L2Dwidget 库

从参考项目或官方源获取 `L2Dwidget` 库文件，放到 `public/live2dw/lib/` 目录。

### 步骤 2：修改 Live2D.astro 组件

```astro
---
// 使用 L2Dwidget 替代 pixi-live2d-display
---

<div id="live2d-container" class="live2d-container">
  <div id="live2d-widget"></div>
  <div class="live2d-controls">
    <button id="live2d-toggle" class="live2d-toggle" aria-label="切换显示">👁️</button>
  </div>
</div>

<style>
  .live2d-container {
    position: absolute;
    top: 150px;
    right: 20px;
    width: 600px;
    height: 800px;
    z-index: 1000;
  }

  #live2d-widget {
    width: 100%;
    height: 100%;
  }

  /* ... 其他样式保持不变 ... */
</style>

<script is:inline>
  // 加载 L2Dwidget 库
  (function() {
    const script = document.createElement('script');
    script.src = '/live2dw/lib/L2Dwidget.min.js';
    script.onload = function() {
      // 初始化 L2Dwidget
      if (typeof L2Dwidget !== 'undefined') {
        L2Dwidget.init({
          model: {
            jsonPath: '/live2d-samples/Hiyori/Hiyori.model3.json',
            scale: 1,
            hHeadPos: 0.5,
            vHeadPos: 0.618
          },
          display: {
            superSample: 2,
            width: 600,
            height: 800,
            position: 'right',
            hOffset: 0,
            vOffset: -20
          },
          mobile: {
            show: true,
            scale: 0.5,
            motion: false  // 🔑 关键：禁用自动播放动画
          },
          react: {
            opacityDefault: 0.9,
            opacityOnHover: 0.3
          },
          log: false,
          pluginJsPath: 'lib/',
          pluginModelPath: 'assets/',
          pluginRootPath: 'live2dw/',
          tagMode: false
        });
        
        console.log('✅ L2Dwidget 已初始化（动画已禁用）');
      }
    };
    document.head.appendChild(script);
  })();
</script>
```

### 步骤 3：下载 L2Dwidget 库文件

需要从参考项目或官方源下载：
- `L2Dwidget.min.js`
- 相关的依赖文件

---

## 💡 推荐方案

**建议继续使用 pixi-live2d-display**，因为：
1. 你已经投入了很多工作
2. 功能更强大，未来扩展性更好
3. 眼睛跟踪功能已经实现

**但如果你想要更简单的方案**，可以切换到 L2Dwidget。

---

## 🔧 如果继续使用 pixi-live2d-display

我们可以尝试更彻底的方法来禁用动画：
1. 修改模型文件，临时移除 Idle 动画组
2. 在 Cubism SDK 层面禁用动画
3. 使用更频繁的监控和强制停止

