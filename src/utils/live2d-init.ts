/**
 * Live2D 初始化脚本
 * 从 Live2D.astro 组件中提取的主要逻辑
 */

import { 
  loadCubismSDK, 
  loadCubism2Placeholder, 
  checkWebGLSupport,
  initEyeTracking
} from '../utils/live2d';

/**
 * 初始化 Live2D
 */
export async function initLive2D(): Promise<void> {
  // 检查 WebGL 支持
  if (!checkWebGLSupport()) {
    console.warn('WebGL not supported, Live2D will not work');
    const container = document.getElementById('live2d-container');
    if (container) {
      container.style.display = 'none';
    }
    return;
  }

  console.log('开始加载 Live2D...');

  const container = document.getElementById('live2d-container');
  const canvas = document.getElementById('live2d-canvas') as HTMLCanvasElement | null;
  const toggleBtn = document.getElementById('live2d-toggle');
  
  if (!container || !canvas || !toggleBtn) {
    console.error('Live2D 容器元素未找到');
    return;
  }

  let isVisible = true;
  let app: any = null;
  let model: any = null;

  // 切换显示/隐藏
  toggleBtn.addEventListener('click', () => {
    isVisible = !isVisible;
    if (isVisible) {
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  });

  // 加载 Live2D 模型
  async function loadLive2DModel() {
    try {
      console.log('🚀 开始加载 Live2D 资源...');
      const startTime = performance.now();
      
      // 1. 加载 Cubism SDK
      await loadCubismSDK();
      
      // 2. 加载 Cubism 2 占位符
      await loadCubism2Placeholder();
      
      // 3. 并行加载 pixi.js 和 pixi-live2d-display
      const [PIXIModule, Live2DModule] = await Promise.all([
        import('pixi.js').then((m) => {
          console.log('✅ PIXI.js 模块加载完成');
          console.log('✅ PIXI 模块 keys:', Object.keys(m).slice(0, 10));
          return m;
        }),
        import('pixi-live2d-display').then((m) => {
          console.log('✅ pixi-live2d-display 加载完成');
          return m;
        }).catch((error) => {
          console.error('❌ pixi-live2d-display 加载失败:', error);
          throw error;
        })
      ]);
      
      const PIXI = PIXIModule as any;
      
      if (!PIXI || !PIXI.Application) {
        console.error('❌ PIXI 对象不正确:', PIXI);
        throw new Error('PIXI.Application is not available');
      }
      console.log('✅ PIXI 验证通过，Application 可用');

      const { Live2DModel } = Live2DModule;
      const loadTime = performance.now() - startTime;
      console.log(`⚡ 资源加载完成，耗时: ${loadTime.toFixed(2)}ms`);
      
      // 4. 配置 pixi-live2d-display
      if (window.Live2DCubismCore) {
        const Live2DModelAny = Live2DModel as any;
        if (Live2DModelAny.coreLibrary !== undefined) {
          Live2DModelAny.coreLibrary = window.Live2DCubismCore;
          console.log('✅ 已设置 Cubism SDK 核心库到 Live2DModel');
        }
        if (typeof Live2DModelAny.setup === 'function') {
          try {
            Live2DModelAny.setup({
              coreLibrary: window.Live2DCubismCore
            });
            console.log('✅ 已通过 setup 配置 Cubism SDK');
          } catch (e) {
            console.warn('setup 方法调用失败，继续使用其他方式', e);
          }
        }
      } else {
        console.warn('⚠️ Cubism SDK 未找到，模型可能无法加载');
      }

      // 5. 检查 WebGL 支持
      if (!checkWebGLSupport()) {
        console.warn('WebGL not supported, Live2D will not work');
        showPlaceholder();
        return;
      }

      // 6. 获取容器尺寸
      if (!container) {
        console.error('容器元素不存在');
        return;
      }
      const rect = container.getBoundingClientRect();
      const defaultWidth = 600;
      const defaultHeight = 800;
      const width = (rect.width && rect.width > 200) ? rect.width : defaultWidth;
      const height = (rect.height && rect.height > 200) ? rect.height : defaultHeight;

      console.log('📐 容器尺寸:', { width, height, rectWidth: rect.width, rectHeight: rect.height });

      // 7. 初始化 PIXI 应用
      const canvasEl = canvas as HTMLCanvasElement;
      canvasEl.style.display = 'block';
      canvasEl.style.opacity = '1';
      canvasEl.style.visibility = 'visible';
      canvasEl.width = width;
      canvasEl.height = height;
      canvasEl.style.width = width + 'px';
      canvasEl.style.height = height + 'px';
      
      app = new PIXI.Application({
        view: canvasEl,
        autoStart: true,
        backgroundAlpha: 0,
        width: width,
        height: height,
        antialias: true,
        powerPreference: 'high-performance',
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      
      console.log('✅ PIXI Application 已初始化:', {
        appWidth: app.screen.width,
        appHeight: app.screen.height,
        canvasWidth: canvasEl.width,
        canvasHeight: canvasEl.height
      });
      
      // 禁用渲染器的交互功能
      if (app.renderer && app.renderer.plugins) {
        try {
          if (app.renderer.plugins.interaction) {
            app.renderer.plugins.interaction.autoPreventDefault = false;
          }
        } catch (e) {
          // 忽略错误
        }
      }

      // 8. 设置 WebGL 上下文
      const rendererGl = app.renderer && app.renderer.gl;
      if (rendererGl) {
        rendererGl.pixelStorei(rendererGl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
      }

      // 9. 注册 PIXI Ticker
      if (typeof Live2DModel.registerTicker === 'function') {
        try {
          const TickerClass = PIXI.Ticker;
          if (TickerClass) {
            Live2DModel.registerTicker(TickerClass as any);
            console.log('✅ PIXI Ticker 已注册');
          }
        } catch (e) {
          console.warn('⚠️ registerTicker 失败，继续加载模型', e);
        }
      }

      // 10. 加载模型
      const modelPath = '/live2d-samples/Hiyori/Hiyori.model3.json';
      console.log('📦 开始加载 Live2D 模型:', modelPath);
      const modelStartTime = performance.now();
      
      model = await Live2DModel.from(modelPath);
      
      const modelLoadTime = performance.now() - modelStartTime;
      console.log(`✅ Live2D 模型加载成功！耗时: ${modelLoadTime.toFixed(2)}ms`);

      // 确保容器可见
      if (container) {
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.visibility = 'visible';
        container.classList.remove('hidden');
        console.log('✅ 容器已设置为可见');
      }

      // 11. 添加模型到 stage
      app.stage.addChild(model);
      console.log('✅ 模型已添加到 stage');
      
      // 12. 设置模型位置和大小
      const scale = Math.min(width / 300, height / 400) * 0.11;
      model.scale.set(scale);
      model.anchor.set(0.5, 0.5);
      model.x = app.screen.width / 2;
      model.y = app.screen.height / 2;
      model.visible = true;
      model.alpha = 1;
      
      console.log('✅ 模型位置设置:', {
        x: model.x,
        y: model.y,
        scale: scale,
        screenWidth: app.screen.width,
        screenHeight: app.screen.height
      });
      
      app.render();
      console.log('✅ 已强制渲染一次');
      
      setTimeout(() => {
        app.render();
        console.log('✅ 延迟渲染完成');
      }, 100);
      
      // 禁用模型的交互功能
      try {
        if (model.interactive !== undefined) {
          model.interactive = false;
        }
        if (model.buttonMode !== undefined) {
          model.buttonMode = false;
        }
        if (app.stage.interactive !== undefined) {
          app.stage.interactive = false;
        }
      } catch (e) {
        console.warn('⚠️ 设置交互属性时出错（不影响使用）:', e);
      }
      
      // 13. 添加眼睛跟随鼠标功能
      if (canvas && container) {
        initEyeTracking(model, app, canvas, container);
      }

      // 14. 添加点击交互
      if (canvas) {
        canvas.addEventListener('click', () => {
          if (!model) return;
          try {
            const motionGroups = ['Idle', 'TapBody', 'Tap'];
            const randomGroup = motionGroups[Math.floor(Math.random() * motionGroups.length)];
            model.motion(randomGroup, 0);
            console.log('✅ 播放动画:', randomGroup);
          } catch (motionError) {
            console.log('动画播放失败，可能模型没有该动作组', motionError);
          }
        });
      }

      // 15. 处理窗口大小变化
      const resizeObserver = new ResizeObserver(() => {
        if (app && container) {
          const newRect = container.getBoundingClientRect();
          app.renderer.resize(newRect.width, newRect.height);
          if (model) {
            model.x = app.screen.width / 2;
            model.y = app.screen.height / 2;
          }
        }
      });
      if (container) {
        resizeObserver.observe(container);
      }

      // 16. 处理滚动（保持位置）
      function updatePosition() {
        if (container && app) {
          // 容器使用 absolute 定位，会自动跟随滚动
        }
      }
      window.addEventListener('scroll', updatePosition);
      updatePosition();

      const totalTime = performance.now() - startTime;
      console.log(`🎉 Live2D 完全加载完成！总耗时: ${totalTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Live2D 模型加载失败:', error);
      console.error('错误详情:', (error as Error).message);
      showPlaceholder();
    }
  }

  function showPlaceholder() {
    const canvasEl = document.getElementById('live2d-canvas') as HTMLCanvasElement | null;
    const containerEl = document.getElementById('live2d-container');
    if (!canvasEl || !containerEl) return;
    
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    
    const rect = containerEl.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 800;
    
    canvasEl.width = width;
    canvasEl.height = height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Live2D 模型', width / 2, height / 2 - 20);
    ctx.font = '16px sans-serif';
    ctx.fillText('加载中...', width / 2, height / 2 + 10);
    ctx.fillText('查看控制台了解详情', width / 2, height / 2 + 30);
  }

  // 开始加载
  loadLive2DModel();
}

