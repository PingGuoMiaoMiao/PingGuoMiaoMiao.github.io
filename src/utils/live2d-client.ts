// Live2D 客户端初始化脚本
// 这个文件会被 Vite 正确处理，可以导入 npm 包

// 注意：pixi-live2d-display 需要在 Cubism 2 runtime 加载后才能导入
// 所以我们延迟导入这些模块

// 导出初始化函数
export async function initLive2D() {
  // 首先加载所有必要的 SDK，然后再导入 pixi-live2d-display
  // 检查 WebGL 支持
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl') || testCanvas.getContext('webgl2');
  if (!gl) {
    console.warn('WebGL not supported, Live2D will not work');
    const container = document.getElementById('live2d-container');
    if (container) {
      container.style.display = 'none';
    }
    return;
  }

  console.log('开始加载 Live2D...');

  const container = document.getElementById('live2d-container');
  const canvasEl = document.getElementById('live2d-canvas');
  const toggleBtn = document.getElementById('live2d-toggle');
  
  if (!container || !canvasEl || !toggleBtn) {
    console.error('Live2D 容器元素未找到');
    return;
  }

  // 确保容器可见（防止页面切换时被隐藏）
  container.style.display = 'block';
  container.style.visibility = 'visible';
  container.style.opacity = '1';
  container.classList.remove('hidden');
  console.log('✅ 容器已确保可见');

  // 确保容器跟随页面滚动（优化版本，使用 fixed + transform 避免抖动）
  // 使用 position: fixed 配合 transform，利用 GPU 加速实现平滑滚动
  const baseTop = 150;  // 基础 top 值
  let currentScrollY = 0;
  let targetScrollY = 0;
  
  const updatePosition = () => {
    // 获取当前滚动位置（兼容不同浏览器）
    targetScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // 使用平滑插值，避免突然跳跃
    const diff = targetScrollY - currentScrollY;
    if (Math.abs(diff) > 0.1) {
      // 使用缓动函数，让滚动更平滑
      currentScrollY += diff * 0.3; // 每次更新 30%，实现平滑过渡
      
      // 使用 fixed 定位 + transform，利用 GPU 加速
      container.style.position = 'fixed';
      container.style.top = `${baseTop}px`;
      container.style.right = '20px';
      // 使用 translate3d 启用硬件加速，避免抖动
      container.style.transform = `translate3d(0, ${currentScrollY}px, 0)`;
      
      // 继续动画直到达到目标位置
      requestAnimationFrame(updatePosition);
    } else {
      // 已经到达目标位置，直接设置最终值
      currentScrollY = targetScrollY;
      container.style.position = 'fixed';
      container.style.top = `${baseTop}px`;
      container.style.right = '20px';
      container.style.transform = `translate3d(0, ${currentScrollY}px, 0)`;
    }
  };
  
  // 初始设置
  currentScrollY = window.scrollY || 0;
  targetScrollY = currentScrollY;
  updatePosition();
  
  // 监听滚动事件（使用 requestAnimationFrame 优化性能）
  let scrollRafId: number | null = null;
  let isUpdating = false;
  
  const handleScroll = () => {
    if (!isUpdating) {
      isUpdating = true;
      scrollRafId = requestAnimationFrame(() => {
        updatePosition();
        isUpdating = false;
        scrollRafId = null;
      });
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // 调整模型大小的函数（在模型加载后调用，也用于窗口大小变化）
  let adjustModelSize: (() => void) | null = null;
  
  // 监听窗口大小变化，重新计算位置
  let resizeTimeout: number | null = null;
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
      updatePosition();
      // 如果模型已加载，调整模型大小
      if (adjustModelSize) {
        adjustModelSize();
      }
    }, 150);  // 防抖，150ms
  };
  
  window.addEventListener('resize', handleResize, { passive: true });
  
  console.log('✅ Live2D 滚动跟随已启用');
  
  // 定义调整模型大小的函数（将在模型加载后赋值）
  adjustModelSize = () => {
    if (!app || !model || !container || !canvasEl) return;
    
    try {
      const rect = container.getBoundingClientRect();
      // 兼容所有屏幕尺寸，使用 clamp 确保在合理范围内
      const viewportWidth = window.innerWidth;
      let minWidth = 100;
      let maxWidth = 500;
      let minHeight = 133;
      let maxHeight = 667;
      
      // 根据视口宽度动态调整尺寸范围
      if (viewportWidth <= 280) {
        minWidth = 100; maxWidth = 120;
        minHeight = 133; maxHeight = 160;
      } else if (viewportWidth <= 360) {
        minWidth = 120; maxWidth = 150;
        minHeight = 160; maxHeight = 200;
      } else if (viewportWidth <= 480) {
        minWidth = 150; maxWidth = 180;
        minHeight = 200; maxHeight = 240;
      } else if (viewportWidth <= 600) {
        minWidth = 180; maxWidth = 220;
        minHeight = 240; maxHeight = 293;
      } else if (viewportWidth <= 768) {
        minWidth = 220; maxWidth = 280;
        minHeight = 293; maxHeight = 373;
      } else if (viewportWidth <= 1024) {
        minWidth = 280; maxWidth = 350;
        minHeight = 373; maxHeight = 467;
      } else if (viewportWidth <= 1440) {
        minWidth = 350; maxWidth = 400;
        minHeight = 467; maxHeight = 533;
      } else {
        minWidth = 400; maxWidth = 500;
        minHeight = 533; maxHeight = 667;
      }
      
      const newWidth = Math.max(minWidth, Math.min(maxWidth, rect.width || 400));
      const newHeight = Math.max(minHeight, Math.min(maxHeight, rect.height || 533));
      
      // 更新 canvas 尺寸
      if (canvasEl instanceof HTMLCanvasElement) {
        canvasEl.width = newWidth;
        canvasEl.height = newHeight;
        canvasEl.style.width = newWidth + 'px';
        canvasEl.style.height = newHeight + 'px';
      }
      
      // 更新 PIXI 渲染器尺寸
      app.renderer.resize(newWidth, newHeight);
      
      // 重新计算模型缩放比例（减小缩放比例）
      const baseScale = Math.min(newWidth / 300, newHeight / 400);
      const scale = baseScale * 0.11;  // 从 0.11 减小到 0.08
      model.scale.set(scale, scale);
      
      // 重新居中模型
      model.x = app.screen.width / 2;
      model.y = app.screen.height / 2;
      
      console.log(`📐 模型尺寸已调整: ${newWidth}x${newHeight}, 缩放: ${scale.toFixed(3)}`);
    } catch (e) {
      console.warn('⚠️ 调整模型大小时出错:', e);
    }
  };

  // 确保 canvasEl 是 HTMLCanvasElement
  if (!(canvasEl instanceof HTMLCanvasElement)) {
    console.error('Canvas 元素类型错误');
    return;
  }

  let isVisible = true;
  let app: any = null;
    let model: any = null;
    let originalMotion: any = null;  // 保存原始的 motion 方法
    let motionPriorityRef: any = null; // 保存 MotionPriority 枚举

    const getMotionPriority = () => {
      if (motionPriorityRef && typeof motionPriorityRef === 'object') {
        if (typeof motionPriorityRef.FORCE === 'number') {
          return motionPriorityRef.FORCE;
        }
        if (typeof motionPriorityRef.NORMAL === 'number') {
          return motionPriorityRef.NORMAL;
        }
      }
      // 默认使用 FORCE (3) 优先级以确保动作播放
      return 3; 
    };

    // 切换显示/隐藏（阻止事件冒泡，防止影响其他元素）
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // 阻止事件冒泡，防止触发其他点击事件
    e.preventDefault(); // 阻止默认行为
    isVisible = !isVisible;
    if (isVisible) {
      container.classList.remove('hidden');
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
    } else {
      container.classList.add('hidden');
    }
  });

  // 工具函数
  async function loadCubismSDK() {
    if ((window as any).Live2DCubismCore) {
      console.log('✅ Cubism SDK 已加载');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/cubism-sdk/live2dcubismcore.min.js';
      script.onload = () => {
        console.log('✅ Cubism SDK 核心文件加载完成');
        if ((window as any).Live2DCubismCore) {
          console.log('✅ Cubism SDK 已设置到全局');
        }
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Cubism SDK 核心文件加载失败');
        reject(new Error('Failed to load Cubism SDK'));
      };
      document.head.appendChild(script);
    });
  }

  async function loadCubism2Placeholder() {
    const windowAny = window as any;
    if (windowAny.Live2D && windowAny.Live2DMotion) {
      console.log('✅ Cubism 2 占位符已加载');
      return;
    }

    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = '/cubism-sdk/live2d.min.js';
      script.onload = () => {
        if (windowAny.Live2D && windowAny.Live2DMotion) {
          console.log('✅ Cubism 2 占位符已加载（我们实际使用 Cubism 3/4/5）');
          console.log('✅ Live2DMotion 已定义:', typeof windowAny.Live2DMotion);
          resolve();
        } else {
          console.warn('⚠️ 占位符加载但未完全初始化，手动设置');
          if (!windowAny.Live2D) {
            windowAny.Live2D = { version: '2.1.0', getRuntime: () => null };
          }
          if (!windowAny.Live2DMotion) {
            windowAny.Live2DMotion = function() {};
          }
          resolve();
        }
      };
      script.onerror = () => {
        console.warn('⚠️ Cubism 2 占位符加载失败，手动设置占位符');
        windowAny.Live2D = windowAny.Live2D || {
          version: '2.1.0',
          getRuntime: () => null
        };
        windowAny.Live2DMotion = windowAny.Live2DMotion || function() {};
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // ========== 交互功能模块 ==========
  
  /**
   * 级别 1：基础交互功能
   * 使用 canvas 原生事件，避免 pixi.js 兼容性问题
   */
  function setupBasicInteraction(model: any, canvas: HTMLCanvasElement, app: any) {
    let isPlayingAnimation = false;
    let lastClickTime = 0;
    const clickCooldown = 1000; // 1秒冷却时间，避免频繁触发
    
    // 点击检测（使用 canvas 原生事件）
    canvas.addEventListener('click', (e) => {
      if (!model || isPlayingAnimation) return;
      
      const now = Date.now();
      if (now - lastClickTime < clickCooldown) {
        return; // 冷却中，忽略点击
      }
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 检查点击位置是否在模型区域内（简单矩形检测）
      const modelRect = {
        x: model.x - (model.width || 300) * model.scale.x / 2,
        y: model.y - (model.height || 400) * model.scale.y / 2,
        width: (model.width || 300) * model.scale.x,
        height: (model.height || 400) * model.scale.y
      };
      
      const isInside = x >= modelRect.x && x <= modelRect.x + modelRect.width &&
                       y >= modelRect.y && y <= modelRect.y + modelRect.height;
      
      // 暂时禁用点击动画，只保留眼睛跟踪功能
      // if (isInside) {
      //   // 触发点击动画（不包含 Idle，因为 Idle 应该自动循环）
      //   try {
      //     const motionGroups = ['TapBody', 'Tap']; // 移除 'Idle'
      //     const randomGroup = motionGroups[Math.floor(Math.random() * motionGroups.length)];
      //     
      //     isPlayingAnimation = true;
      //     lastClickTime = now;
      //     
      //     // 播放动画
      //     model.motion(randomGroup, 0);
      //     console.log('✅ 播放动画:', randomGroup);
      //     
      //     // 动画播放完成后重置状态
      //     setTimeout(() => {
      //       isPlayingAnimation = false;
      //     }, 2000);
      //   } catch (motionError) {
      //     isPlayingAnimation = false;
      //     console.log('动画播放失败，可能模型没有该动作组', motionError);
      //   }
      // }
    });
    
    console.log('✅ 基础交互功能已启用（级别 1）');
  }
  
  /**
   * 级别 2：拖拽功能
   * 允许用户拖拽移动模型位置
   */
  function setupDragInteraction(model: any, canvas: HTMLCanvasElement, container: HTMLElement) {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let modelStartX = 0;
    let modelStartY = 0;
    
    // 鼠标按下
    canvas.addEventListener('mousedown', (e) => {
      if (!model || e.button !== 0) return; // 只响应左键
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 检查是否在模型区域内
      const modelRect = {
        x: model.x - (model.width || 300) * model.scale.x / 2,
        y: model.y - (model.height || 400) * model.scale.y / 2,
        width: (model.width || 300) * model.scale.x,
        height: (model.height || 400) * model.scale.y
      };
      
      const isInside = x >= modelRect.x && x <= modelRect.x + modelRect.width &&
                       y >= modelRect.y && y <= modelRect.y + modelRect.height;
      
      if (isInside) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        modelStartX = model.x;
        modelStartY = model.y;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
        
        // 绑定全局事件监听器
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    });
    
    // 鼠标移动（拖拽）
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !model) return;
      
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      
      model.x = modelStartX + deltaX;
      model.y = modelStartY + deltaY;
    };
    
    // 鼠标释放
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'pointer';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
    
    // 鼠标离开画布
    canvas.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'pointer';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    });
    
    console.log('✅ 拖拽功能已启用（级别 2）');
  }
  
  /**
   * 级别 2：双击缩放功能
   * 双击模型可以放大/缩小
   */
  function setupDoubleClickZoom(model: any, canvas: HTMLCanvasElement) {
    let lastClickTime = 0;
    let currentScale = 1;
    const baseScale = Math.min(canvas.width / 300, canvas.height / 400);
    
    canvas.addEventListener('click', (e) => {
      if (!model) return;
      
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;
      
      if (timeSinceLastClick < 300) { // 双击检测（300ms 内）
        // 切换缩放
        currentScale = currentScale === 1 ? 1.5 : 1;
        model.scale.set(baseScale * 0.11 * currentScale, baseScale * 0.11 * currentScale);
        console.log('✅ 缩放切换:', currentScale === 1 ? '正常' : '放大');
      }
      
      lastClickTime = now;
    });
    
    console.log('✅ 双击缩放功能已启用（级别 2）');
  }
  
  /**
   * 级别 1：鼠标悬停效果
   * 鼠标悬停在模型上时触发动画
   */
  function setupHoverEffect(model: any, canvas: HTMLCanvasElement) {
    let isHovering = false;
    
    canvas.addEventListener('mousemove', (e) => {
      if (!model) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 检查是否在模型区域内
      const modelRect = {
        x: model.x - (model.width || 300) * model.scale.x / 2,
        y: model.y - (model.height || 400) * model.scale.y / 2,
        width: (model.width || 300) * model.scale.x,
        height: (model.height || 400) * model.scale.y
      };
      
      const isInside = x >= modelRect.x && x <= modelRect.x + modelRect.width &&
                       y >= modelRect.y && y <= modelRect.y + modelRect.height;
      
      if (isInside && !isHovering) {
        isHovering = true;
        canvas.style.cursor = 'pointer';
        // 可以在这里添加悬停动画
        // try {
        //   model.motion('Tap', 0);
        // } catch (e) {
        //   // 忽略错误
        // }
      } else if (!isInside && isHovering) {
        isHovering = false;
        canvas.style.cursor = 'default';
      }
    });
    
    console.log('✅ 悬停效果已启用（级别 1）');
  }
  
  // ========== 交互功能模块结束 ==========

  /**
   * 眼睛跟踪鼠标位置功能
   * 实现模型眼睛平滑跟随鼠标移动
   */
  function initEyeTracking(model: any, app: any, canvas: HTMLCanvasElement, container: HTMLElement) {
    let targetEyeX = 0;
    let targetEyeY = 0;
    let currentEyeX = 0;
    let currentEyeY = 0;
    let isEnabled = true;
    let foundParams: { x?: number; y?: number } = {};

    const config = {
      // 平滑插值系数（0-1，值越大响应越快）
      lerpFactor: 0.5,  // 增加到 0.5，响应更快更灵敏
      // 最大移动范围（可以超过1.0，让眼睛转动更明显）
      maxMovement: 2.0,  // 增加到 2.0，眼睛转动幅度更大更明显
      // 眼睛参数名称列表（按优先级排序）
      eyeParamNames: [
        // Cubism 3/4/5 标准参数名（最常见）
        'ParamEyeBallX',
        'ParamEyeBallY',
        'ParamAngleX',
        'ParamAngleY',
        // 大写版本
        'PARAM_EYE_BALL_X',
        'PARAM_EYE_BALL_Y',
        'PARAM_ANGLE_X',
        'PARAM_ANGLE_Y',
        // 其他可能的参数名
        'ParamEyeX',
        'ParamEyeY',
        'EyeBallX',
        'EyeBallY',
        'AngleX',
        'AngleY',
        // 眼睛开合（不是跟踪用的，但先列出来）
        'ParamEyeLOpen',
        'ParamEyeROpen',
        'EYE_OPEN_L',
        'EYE_OPEN_R'
      ],
      // 鼠标离开画布时的延迟（毫秒）
      mouseLeaveDelay: 2000,
      // 鼠标离开后是否重置眼睛位置
      resetOnLeave: false
    };

    // 列出所有可用参数（用于调试）
    function listAllParams(coreModel: any) {
      try {
        const paramCount = coreModel.getParameterCount();
        console.log(`📋 模型共有 ${paramCount} 个参数`);
        
        const eyeRelatedParams: string[] = [];
        for (let i = 0; i < paramCount; i++) {
          try {
            const paramId = coreModel.getParameterId(i);
            if (paramId && (
              paramId.toLowerCase().includes('eye') ||
              paramId.toLowerCase().includes('angle') ||
              paramId.toLowerCase().includes('ball') ||
              paramId.toLowerCase().includes('look')
            )) {
              eyeRelatedParams.push(`${i}: ${paramId}`);
            }
          } catch (e) {
            // 忽略单个参数获取错误
          }
        }
        
        if (eyeRelatedParams.length > 0) {
          console.log('👁️ 找到的眼睛相关参数:');
          eyeRelatedParams.forEach(param => console.log(`  - ${param}`));
        } else {
          console.warn('⚠️ 未找到眼睛相关参数，尝试列出前20个参数:');
          for (let i = 0; i < Math.min(20, paramCount); i++) {
            try {
              const paramId = coreModel.getParameterId(i);
              console.log(`  ${i}: ${paramId}`);
            } catch (e) {
              // 忽略错误
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ 无法列出参数:', e);
      }
    }

    // 查找可用的眼睛参数
    function findEyeParams(coreModel: any) {
      if (foundParams.x !== undefined && foundParams.y !== undefined) {
        return foundParams;
      }

      // 首先列出所有参数（调试用）
      listAllParams(coreModel);
          
      // 尝试查找 X 方向参数
          for (let i = 0; i < config.eyeParamNames.length; i += 2) {
            try {
          const paramIndex = coreModel.getParameterIndex(config.eyeParamNames[i]);
          if (paramIndex >= 0) {
            foundParams.x = paramIndex;
            console.log(`✅ 找到眼睛 X 参数: ${config.eyeParamNames[i]} (索引: ${paramIndex})`);
                break;
              }
            } catch (e) {
          // 继续尝试下一个
            }
          }
          
      // 尝试查找 Y 方向参数
          for (let i = 1; i < config.eyeParamNames.length; i += 2) {
            try {
          const paramIndex = coreModel.getParameterIndex(config.eyeParamNames[i]);
          if (paramIndex >= 0) {
            foundParams.y = paramIndex;
            console.log(`✅ 找到眼睛 Y 参数: ${config.eyeParamNames[i]} (索引: ${paramIndex})`);
                break;
              }
            } catch (e) {
          // 继续尝试下一个
            }
      }

      // 如果没找到，尝试通过参数ID搜索
      if (foundParams.x === undefined || foundParams.y === undefined) {
        try {
          const paramCount = coreModel.getParameterCount();
          for (let i = 0; i < paramCount; i++) {
            try {
              const paramId = coreModel.getParameterId(i);
              const paramIdLower = paramId.toLowerCase();
              
              // 查找 X 方向
              if (foundParams.x === undefined && (
                paramIdLower.includes('eyeballx') ||
                paramIdLower.includes('eyex') ||
                paramIdLower.includes('anglex') ||
                (paramIdLower.includes('eye') && paramIdLower.includes('x') && !paramIdLower.includes('open'))
              )) {
                foundParams.x = i;
                console.log(`✅ 通过搜索找到眼睛 X 参数: ${paramId} (索引: ${i})`);
              }
              
              // 查找 Y 方向
              if (foundParams.y === undefined && (
                paramIdLower.includes('eyebally') ||
                paramIdLower.includes('eyey') ||
                paramIdLower.includes('angley') ||
                (paramIdLower.includes('eye') && paramIdLower.includes('y') && !paramIdLower.includes('open'))
              )) {
                foundParams.y = i;
                console.log(`✅ 通过搜索找到眼睛 Y 参数: ${paramId} (索引: ${i})`);
              }
              
              if (foundParams.x !== undefined && foundParams.y !== undefined) {
                break;
          }
        } catch (e) {
              // 继续下一个
            }
          }
        } catch (e) {
          console.warn('⚠️ 搜索参数时出错:', e);
        }
      }

      if (foundParams.x === undefined || foundParams.y === undefined) {
        console.warn('⚠️ 未找到眼睛参数，眼睛跟踪可能无法工作');
        console.warn('💡 提示：请检查控制台输出的参数列表，手动指定参数名称');
      }

      return foundParams;
    }

    // 鼠标移动处理函数
    let debugCounter = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isEnabled || !model || !canvas || !container) return;
      
      const containerRect = container.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // 计算鼠标相对于画布中心的位置（归一化到 -1 到 1）
      const centerX = canvasRect.left + canvasRect.width / 2;
      const centerY = canvasRect.top + canvasRect.height / 2;
      
      // 计算相对位置（相对于画布中心）
      const relativeX = (e.clientX - centerX) / (canvasRect.width / 2);
      const relativeY = (e.clientY - centerY) / (canvasRect.height / 2);
      
      // 计算目标值（应用最大移动幅度，允许超过1.0以获得更大的转动）
      // 注意：Live2D 参数值范围通常是 -1 到 1，但某些模型可能支持更大范围
      const rawTargetX = relativeX * config.maxMovement;
      const rawTargetY = relativeY * config.maxMovement;
      
      // 限制到合理范围（-2 到 2，给更大的转动空间）
      // 如果模型不支持，会自动限制在 -1 到 1
      targetEyeX = Math.max(-2, Math.min(2, rawTargetX));
      
      // Y 轴方向修正：
      // 鼠标在下（relativeY > 0，即 clientY > centerY），眼睛应该往下看
      // 但当前上下是相反的，说明需要取反
      // Live2D 的 Y 参数：可能是负值向下，正值向上（与常规相反）
      // 所以鼠标在下（relativeY > 0）时，需要取反让 targetEyeY < 0，眼睛往下看
      targetEyeY = Math.max(-2, Math.min(2, -rawTargetY));  // Y 轴取反（修正上下相反的问题）
      
      // 每60次鼠标移动输出一次调试信息
      debugCounter++;
      if (debugCounter % 60 === 0) {
        console.log(`🖱️ 鼠标位置: 相对X=${relativeX.toFixed(3)}, 相对Y=${relativeY.toFixed(3)}, 目标X=${targetEyeX.toFixed(3)}, 目标Y=${targetEyeY.toFixed(3)}`);
      }
    };

    // 鼠标离开处理
    let mouseLeaveTimer: number | null = null;
    const handleMouseLeave = () => {
      if (config.resetOnLeave) {
        if (mouseLeaveTimer) {
          clearTimeout(mouseLeaveTimer);
        }
        mouseLeaveTimer = window.setTimeout(() => {
          targetEyeX = 0;
          targetEyeY = 0;
        }, config.mouseLeaveDelay);
      }
    };

    // 监听全局鼠标移动（更精确的跟踪）
    document.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 使用 ticker 平滑更新眼睛位置
    if (app && app.ticker) {
      const tickerCallback = () => {
        if (!isEnabled || !model || !model.internalModel || !model.internalModel.coreModel) return;
        
        try {
          const coreModel = model.internalModel.coreModel;
          
          // 🔑 关键：手动更新 motionManager（确保动作能播放）
          // 注意：如果 pixi-live2d-display 已经处理了更新，这里可能不需要
          // 如果必须手动更新，请确保参数正确：motionManager.update(coreModel, deltaTime)
          /*
          if (model.internalModel.motionManager) {
            const motionManager = model.internalModel.motionManager;
            // 如果 motionManager 有 update 方法，手动调用
            if (motionManager.update && typeof motionManager.update === 'function') {
              try {
                // 获取 ticker 的 deltaTime（如果没有则使用固定值）
                const deltaTime = app.ticker?.deltaTime ? app.ticker.deltaTime / 60.0 : 0.016;
                // 🔑 关键：持续更新 motionManager，这样用户触发的动作才能播放
                // 注意：Cubism 4 需要传入 coreModel
                motionManager.update(coreModel, deltaTime);
              } catch (e) {
                // 忽略更新错误
                if (e instanceof Error && !e.message.includes('getStartTime')) {
                  console.warn('⚠️ motionManager.update 失败:', e);
                }
              }
            }
          }
          */
          
          // 查找眼睛参数（只在第一次查找）
          if (foundParams.x === undefined || foundParams.y === undefined) {
            findEyeParams(coreModel);
          }
          
          // 如果找到了参数，更新眼睛位置
          if (foundParams.x !== undefined && foundParams.y !== undefined) {
            // 平滑插值（使用线性插值实现平滑过渡）
            currentEyeX += (targetEyeX - currentEyeX) * config.lerpFactor;
            currentEyeY += (targetEyeY - currentEyeY) * config.lerpFactor;
            
            // 设置眼睛参数值
            try {
              // 尝试使用更大的值范围以获得更明显的转动
              const finalX = currentEyeX;
              const finalY = currentEyeY;
              
              // 设置参数值（如果模型不支持大范围，SDK 会自动限制）
              coreModel.setParameterValueByIndex(foundParams.x, finalX);
              // Y 轴：如果鼠标在下眼睛往上，说明参数方向反了，需要再次取反
              // 尝试：如果还是反的，可以改为 -finalY
              coreModel.setParameterValueByIndex(foundParams.y, finalY);
              
              // 每60帧输出一次调试信息（约1秒一次）
              if (app.ticker && app.ticker.lastTime % 1000 < 16) {
                console.log(`👁️ 眼睛跟踪: X=${currentEyeX.toFixed(3)}, Y=${currentEyeY.toFixed(3)}, 目标: X=${targetEyeX.toFixed(3)}, Y=${targetEyeY.toFixed(3)}`);
              }
            } catch (e) {
              console.warn('⚠️ 设置眼睛参数时出错:', e);
            }
          } else {
            // 每60帧输出一次警告
            if (app.ticker && app.ticker.lastTime % 1000 < 16) {
              console.warn('⚠️ 眼睛参数未找到，无法跟踪鼠标');
            }
          }
        } catch (e) {
          // 忽略错误，可能是参数不存在或模型未完全加载
          if (e instanceof Error && !e.message.includes('Parameter')) {
            console.warn('⚠️ 眼睛跟踪更新时出错:', e);
        }
        }
      };
      
      app.ticker.add(tickerCallback);
      
      console.log('✅ 眼睛跟随鼠标功能已启用');
      console.log('📊 配置:', {
        lerpFactor: config.lerpFactor,
        maxMovement: config.maxMovement,
        resetOnLeave: config.resetOnLeave
      });
    } else {
      console.warn('⚠️ PIXI Ticker 不可用，眼睛跟踪功能无法启用');
    }

    // 返回控制接口（可选，用于外部控制）
    return {
      enable: () => { isEnabled = true; },
      disable: () => { isEnabled = false; },
      setLerpFactor: (factor: number) => { config.lerpFactor = Math.max(0, Math.min(1, factor)); },
      setMaxMovement: (movement: number) => { config.maxMovement = Math.max(0, Math.min(1, movement)); },
      reset: () => { targetEyeX = 0; targetEyeY = 0; }
    };
  }

  // 加载 Live2D 模型
  async function loadLive2DModel() {
    try {
      console.log('🚀 开始加载 Live2D 资源...');
      const startTime = performance.now();
      
      // 1. 加载 Cubism SDK
      await loadCubismSDK();
      
      // 2. 加载 Cubism 2 占位符（必须在导入 pixi-live2d-display 之前）
      await loadCubism2Placeholder();
      
      // 3. 确保 Cubism 2 runtime 已加载
      const windowAny = window as any;
      if (!windowAny.Live2D || !windowAny.Live2DMotion) {
        console.error('❌ Cubism 2 runtime 未正确加载');
        throw new Error('Cubism 2 runtime is required but not loaded');
      }
      
      // 4. 现在才动态导入 pixi.js 和 pixi-live2d-display
      // 这样可以确保 Cubism 2 runtime 已经存在
      console.log('📦 开始导入 PIXI.js 和 pixi-live2d-display...');
      const [PIXIModule, Live2DModule] = await Promise.all([
        import('pixi.js'),
        import('pixi-live2d-display')
      ]);
      
      const PIXI = PIXIModule.default || PIXIModule;
      const live2DModuleAny = Live2DModule as any;
      const Live2DModelExport =
        live2DModuleAny?.Live2DModel ||
        live2DModuleAny?.default?.Live2DModel ||
        live2DModuleAny?.default;
      if (!Live2DModelExport) {
        throw new Error('无法加载 Live2DModel 模块');
      }
      const Live2DModel = Live2DModelExport;
      motionPriorityRef =
        live2DModuleAny?.MotionPriority ||
        live2DModuleAny?.default?.MotionPriority ||
        motionPriorityRef ||
        { NONE: 0, IDLE: 1, NORMAL: 2, FORCE: 3 };
      
      console.log('✅ PIXI.js 和 pixi-live2d-display 已加载');
      
      // 5. 配置 pixi-live2d-display
      if ((window as any).Live2DCubismCore) {
        const Live2DModelAny = Live2DModel as any;
        if (Live2DModelAny && typeof Live2DModelAny === 'object' && 'coreLibrary' in Live2DModelAny) {
          Live2DModelAny.coreLibrary = (window as any).Live2DCubismCore;
          console.log('✅ 已设置 Cubism SDK 核心库到 Live2DModel');
        }
        if (Live2DModelAny && typeof Live2DModelAny.setup === 'function') {
          try {
            Live2DModelAny.setup({
              coreLibrary: (window as any).Live2DCubismCore
            });
            console.log('✅ 已通过 setup 配置 Cubism SDK');
          } catch (e) {
            console.warn('setup 方法调用失败，继续使用其他方式', e);
          }
        }
      } else {
        console.warn('⚠️ Cubism SDK 未找到，模型可能无法加载');
      }

      // 6. 获取容器尺寸
      if (!container) {
        console.error('容器元素未找到');
        return;
      }
      const rect = container.getBoundingClientRect();
      // 根据视口宽度动态设置默认尺寸
      const viewportWidth = window.innerWidth;
      let defaultWidth = 400;
      let defaultHeight = 533;
      let minSize = 150;
      
      if (viewportWidth <= 480) {
        defaultWidth = 180;
        defaultHeight = 240;
        minSize = 100;
      } else if (viewportWidth <= 768) {
        defaultWidth = 250;
        defaultHeight = 333;
        minSize = 120;
      } else if (viewportWidth <= 1024) {
        defaultWidth = 350;
        defaultHeight = 467;
        minSize = 150;
      }
      
      const width = (rect.width && rect.width > minSize) ? rect.width : defaultWidth;
      const height = (rect.height && rect.height > minSize * 1.33) ? rect.height : defaultHeight;

      console.log('📐 容器尺寸:', { width, height });

      // 7. 初始化 PIXI 应用
      if (!canvasEl || !(canvasEl instanceof HTMLCanvasElement)) {
        console.error('Canvas 元素未找到或类型错误');
        return;
      }
      const canvas = canvasEl;
      canvas.style.display = 'block';
      canvas.style.opacity = '1';
      canvas.style.visibility = 'visible';
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        backgroundAlpha: 0,
        width: width,
        height: height,
        antialias: true,
        powerPreference: 'high-performance',
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      
      console.log('✅ PIXI Application 已初始化');
      
      // 禁用渲染器的交互功能（修复 pixi.js v7 兼容性问题）
      // 注意：不要完全删除事件系统，只需要禁用交互
      if (app.renderer && app.renderer.plugins) {
        try {
          // 禁用旧的 interaction 插件
          if (app.renderer.plugins.interaction) {
            app.renderer.plugins.interaction.autoPreventDefault = false;
          }
        } catch (e) {
          // 忽略错误
        }
      }

      // 禁用 stage 的交互
      if (app.stage) {
        try {
          (app.stage as any).interactive = false;
          if ('eventMode' in app.stage) {
            (app.stage as any).eventMode = 'none';
          }
        } catch (e) {
          // 忽略错误
        }
      }

      // 8. 注册 PIXI Ticker
      if (typeof Live2DModel.registerTicker === 'function') {
        try {
          // 从 Application 实例中获取 Ticker 类
          const testApp = new PIXI.Application({ width: 1, height: 1, autoStart: false });
          let TickerClass: any = null;
            if (testApp.ticker && testApp.ticker.constructor) {
              TickerClass = testApp.ticker.constructor;
            }
          if (!TickerClass && PIXI.Ticker) {
            TickerClass = PIXI.Ticker;
          }
          if (TickerClass) {
            Live2DModel.registerTicker(TickerClass);
            console.log('✅ PIXI Ticker 已注册');
          } else {
            console.warn('⚠️ Ticker 类未找到，跳过注册');
          }
        } catch (e) {
          console.warn('⚠️ registerTicker 失败，继续加载模型', e);
        }
      }

      // 9. 加载模型
      // 使用新的 hiyori_pro_en 模型（包含更多动作定义）
      const modelPath = '/live2d-samples/hiyori_pro_en/runtime/hiyori_pro_t11.model3.json';
      console.log('📦 开始加载 Live2D 模型:', modelPath);
      const modelStartTime = performance.now();
      
      try {
        // 加载模型（pixi-live2d-display 可能会自动播放 Idle 动画）
        // 注意：Live2DModel.from 没有直接禁用自动播放的选项
        // 我们需要在加载后立即停止动画
        model = await Live2DModel.from(modelPath);
        
        // 🔍 检查模型加载后的动作组状态
        if (model && model.internalModel && model.internalModel.motionManager) {
          const motionGroups = model.internalModel.motionManager.motionGroups;
          console.log('🔍 模型加载后的动作组状态:', {
            hasMotionGroups: !!motionGroups,
            groups: motionGroups ? Object.keys(motionGroups) : [],
            groupsDetail: motionGroups ? Object.keys(motionGroups).map(key => ({
              name: key,
              type: Array.isArray(motionGroups[key]) ? 'array' : typeof motionGroups[key],
              length: Array.isArray(motionGroups[key]) ? motionGroups[key].length : Object.keys(motionGroups[key] || {}).length
            })) : []
          });
          
          // 🔍 检查模型对象的基础路径信息
          console.log('🔍 模型路径信息:', {
            modelPath: modelPath,
            hasSettings: !!(model as any).settings,
            settingsUrl: (model as any).settings?.url,
            hasUrl: !!(model as any).url,
            modelUrl: (model as any).url,
            internalModelSettings: (model.internalModel as any)?.settings,
            motionManagerSettings: model.internalModel?.motionManager ? (model.internalModel.motionManager as any).settings : null
          });
        }
        
        // 关键：在模型加载完成的瞬间立即停止所有动画
        // 因为 pixi-live2d-display 可能在加载后立即开始播放 Idle 动画
        if (model && model.motionManager) {
          // 立即停止 motionManager
          if (model.motionManager.stopAll) {
            model.motionManager.stopAll();
          }
          if (model.motionManager.stop) {
            model.motionManager.stop();
          }
          // 禁用自动播放标志
          if (model.motionManager.playing !== undefined) {
            model.motionManager.playing = false;
          }
          // 不禁用 autoUpdate，保持启用以便手动播放的动作能更新
          // if (model.motionManager.autoUpdate !== undefined) {
          //   model.motionManager.autoUpdate = false;
          // }
        }
        const modelLoadTime = performance.now() - modelStartTime;
        console.log(`✅ Live2D 模型加载成功！耗时: ${modelLoadTime.toFixed(2)}ms`);
        
        // 立即停止所有可能的动画（在添加到 stage 之前）
        // 注意：pixi-live2d-display 可能在加载后自动播放 Idle 动画
        try {
          // 方法1: 立即停止动画
          if (model && typeof model.stop === 'function') {
            model.stop();
          }
          if (model && typeof model.stopAll === 'function') {
            model.stopAll();
          }
          
          // 方法2: 停止并禁用 motionManager（关键！）
          if (model && model.motionManager) {
            // 停止所有动画
            if (typeof model.motionManager.stopAll === 'function') {
              model.motionManager.stopAll();
            }
            if (model.motionManager.stop) {
              model.motionManager.stop();
            }
            // 不禁用 autoUpdate，保持启用以便手动播放的动作能更新
            // if (model.motionManager.autoUpdate !== undefined) {
            //   model.motionManager.autoUpdate = false;
            // }
            // 尝试禁用循环播放
            if (model.motionManager.loop !== undefined) {
              model.motionManager.loop = false;
            }
            // 清空当前播放的动画
            if (model.motionManager.currentMotion) {
              model.motionManager.currentMotion = null;
            }
            if (model.motionManager.playing !== undefined) {
              model.motionManager.playing = false;
            }
          }
          
          // 方法3: 保存原始的 motion 方法（不再阻止，允许手动播放）
          if (model && typeof model.motion === 'function') {
            originalMotion = model.motion;
            console.log('✅ 已保存原始 model.motion 方法');
          }
          
          // 方法4: 检查并停止内部动画
          if (model && model.internalModel) {
            if (model.internalModel.stopAllMotions) {
              model.internalModel.stopAllMotions();
            }
            if (model.internalModel.stopMotion) {
              model.internalModel.stopMotion();
            }
          }
          
          console.log('✅ 已执行初始动画停止');
        } catch (e) {
          console.warn('⚠️ 立即停止动画时出错:', e);
        }
        
        // 立即禁用模型的交互功能（在添加到 stage 之前，修复 manager.on 错误）
        try {
          if (model && typeof model === 'object') {
            // 禁用交互
            if ('interactive' in model) {
              (model as any).interactive = false;
            }
            if ('buttonMode' in model) {
              (model as any).buttonMode = false;
            }
            // 禁用事件监听（pixi.js v7）
            if ('eventMode' in model) {
              (model as any).eventMode = 'none';
            }
            // 禁用 registerInteraction（修复 manager.on 错误）
            if ('registerInteraction' in model && typeof (model as any).registerInteraction === 'function') {
              // 覆盖这个方法以避免错误
              try {
                (model as any).registerInteraction = function() {
                  // 空函数，不做任何事情
                };
              } catch (e) {
                // 忽略错误
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ 设置模型交互属性时出错:', e);
      }

        // 确保容器可见（强制设置，防止被其他元素隐藏）
      container.style.display = 'block';
      container.style.opacity = '1';
      container.style.visibility = 'visible';
        container.style.zIndex = '9999';
      container.classList.remove('hidden');
      console.log('✅ 容器已设置为可见');
        
        // 定期检查并确保容器始终可见（防止被其他脚本隐藏）
        const ensureVisible = () => {
          if (isVisible && container) {
            if (container.classList.contains('hidden')) {
              container.classList.remove('hidden');
              console.log('⚠️ 检测到容器被隐藏，已恢复显示');
            }
            if (container.style.display === 'none') {
              container.style.display = 'block';
              console.log('⚠️ 检测到容器 display 被设置为 none，已恢复');
            }
            if (container.style.visibility === 'hidden') {
              container.style.visibility = 'visible';
              console.log('⚠️ 检测到容器 visibility 被设置为 hidden，已恢复');
            }
          }
        };
        
        // 每 2 秒检查一次（防止被其他脚本意外隐藏）
        setInterval(ensureVisible, 2000);
        
        // 10. 在添加到 stage 之前，再次确保停止所有动画
        // 因为添加到 stage 可能会触发某些事件
        try {
          if (model && model.motionManager) {
            model.motionManager.stopAll();
            model.motionManager.stop();
            model.motionManager.playing = false;
            model.motionManager.autoUpdate = false;
          }
        } catch (e) {
          // 忽略错误
        }

      // 10. 添加模型到 stage
      app.stage.addChild(model);
        console.log('✅ 模型已添加到 stage');
        
        // 添加到 stage 后立即再次停止动画（防止 stage 事件触发动画）
        try {
          if (model && model.motionManager) {
            model.motionManager.stopAll();
            model.motionManager.stop();
            model.motionManager.playing = false;
            model.motionManager.autoUpdate = false;
            console.log('✅ 添加到 stage 后已再次停止动画');
          }
        } catch (e) {
          // 忽略错误
        }
        
        // 11. 设置模型位置和大小（减小缩放比例）
      const baseScale = Math.min(width / 300, height / 400);
        const scale = baseScale * 0.08;  // 从 0.11 减小到 0.08
      console.log('📦 计算出的缩放比例:', scale, '基础比例:', baseScale);
      model.scale.set(scale, scale);
      model.anchor.set(0.5, 0.5);
      model.x = app.screen.width / 2;
      model.y = app.screen.height / 2;
      model.visible = true;
      model.alpha = 1;
      
      // 确保模型在 stage 中
      if (!app.stage.children.includes(model)) {
        app.stage.addChild(model);
        console.log('✅ 模型已重新添加到 stage');
      }
      
        // 完全禁用所有动画，只保留眼睛跟踪
        // 使用定时器持续监控并停止动画（防止自动播放）
        const stopAllAnimations = () => {
          try {
            // 方法1: 停止当前播放的动画
            if (model && typeof model.stop === 'function') {
              model.stop();
            }
            if (model && typeof model.stopAll === 'function') {
              model.stopAll();
            }
            
            // 方法2: 停止 motionManager
            if (model && model.motionManager) {
              if (typeof model.motionManager.stopAll === 'function') {
                model.motionManager.stopAll();
              }
              if (model.motionManager.stop) {
                model.motionManager.stop();
              }
              // 尝试禁用 motionManager 的自动播放
              if (model.motionManager.playing) {
                model.motionManager.playing = false;
              }
            }
            
            // 方法3: 停止内部模型的动画
            if (model && model.internalModel) {
              if (model.internalModel.stopAllMotions) {
                model.internalModel.stopAllMotions();
              }
              if (model.internalModel.stopMotion) {
                model.internalModel.stopMotion();
              }
              // 尝试访问 Cubism 核心来停止动画
              if (model.internalModel.coreModel) {
                // 可能需要在 Cubism SDK 层面停止
              }
            }
            
            // 方法4: 检查并停止所有正在播放的动画
            if (model && model._motions) {
              Object.keys(model._motions).forEach(key => {
                try {
                  if (model._motions[key] && model._motions[key].stop) {
                    model._motions[key].stop();
                  }
                } catch (e) {
                  // 忽略单个动画停止错误
                }
      });
            }
          } catch (e) {
            // 忽略错误，继续执行
          }
        };
        
        // 停止初始自动播放的动画（但不阻止手动播放）
        stopAllAnimations();
        console.log('✅ 已停止初始自动播放的动画');
        
        // 🔑 关键：彻底禁用自动播放 - 不删除 Idle 动作组，只阻止自动播放
        // 如果删除 Idle 动作组，可能导致其他动作组也无法正常加载
        // 所以我们只阻止自动播放，但保留动作组以便手动播放
        if (model && model.internalModel) {
          try {
            if (model.internalModel.motionManager) {
              const motionManager = model.internalModel.motionManager;
              const motionGroups = motionManager.motionGroups;
              
              // 🔑 方法1: 不删除 Idle 动作组，只阻止自动播放
              // 这样其他动作组也能正常加载
              if (motionGroups && motionGroups.Idle) {
                console.log('ℹ️ 保留 Idle 动作组（不删除），只阻止自动播放');
                console.log('💡 这样其他动作组也能正常加载');
              } else {
                console.log('ℹ️ Idle 动作组不存在');
              }
              
              // 方法2: 直接禁用 startRandomMotion 方法，阻止自动随机动作播放
              if (motionManager.startRandomMotion && typeof motionManager.startRandomMotion === 'function') {
                const originalStartRandomMotion = motionManager.startRandomMotion.bind(motionManager);
                // 使用标志位，只记录一次日志
                let hasLogged = false;
                motionManager.startRandomMotion = function(...args: any[]) {
                  // 阻止自动随机动作播放，直接返回一个已解决的 Promise
                  // 只在第一次调用时记录日志，避免刷屏
                  if (!hasLogged) {
                    console.log('🚫 startRandomMotion 被阻止（自动播放已禁用，后续调用将静默阻止）');
                    hasLogged = true;
                  }
                  return Promise.resolve(null);
                };
                // 保存原始方法，以便需要时恢复
                (motionManager as any)._originalStartRandomMotion = originalStartRandomMotion;
                console.log('🚫 已禁用 motionManager.startRandomMotion 方法');
              }
              
              // 方法3: 只禁用自动播放，但保持 autoUpdate 启用（这样手动播放的动作才能更新）
              if (motionManager.autoIdle !== undefined) {
                motionManager.autoIdle = false;
              }
              // 不禁用 autoUpdate，否则手动播放的动作不会更新
              // if (motionManager.autoUpdate !== undefined) {
              //   motionManager.autoUpdate = false;
              // }
              // 确保 autoUpdate 是启用的
              if (motionManager.autoUpdate !== undefined) {
                motionManager.autoUpdate = true;
                console.log('✅ motionManager.autoUpdate 已启用（允许手动播放的动作更新）');
              }
            }
            
            // 方法4: 覆盖 model.motion 方法，阻止自动 Idle 播放（但允许手动调用）
            // 注意：我们不再阻止 Idle，因为用户需要通过按钮手动播放 Idle 动作
            // 我们只阻止自动播放，不阻止手动调用
          } catch (e) {
            console.warn('阻止 Idle 动作组失败:', e);
          }
        }
        
        // 同样处理 model.motionManager（如果存在）
        if (model && model.motionManager) {
          try {
            const motionManager = model.motionManager;
            const motionGroups = motionManager.motionGroups;
            
            // 🔑 不删除 Idle 动作组，只阻止自动播放
            // 这样其他动作组也能正常加载
            if (motionGroups && motionGroups.Idle) {
              console.log('ℹ️ 保留 model.motionManager 的 Idle 动作组（不删除），只阻止自动播放');
            }
            
            // 直接禁用 startRandomMotion 方法
            if (motionManager.startRandomMotion && typeof motionManager.startRandomMotion === 'function') {
              const originalStartRandomMotion = motionManager.startRandomMotion.bind(motionManager);
              // 使用标志位，只记录一次日志
              let hasLogged = false;
              motionManager.startRandomMotion = function(...args: any[]) {
                // 只在第一次调用时记录日志，避免刷屏
                if (!hasLogged) {
                  console.log('🚫 model.motionManager.startRandomMotion 被阻止（后续调用将静默阻止）');
                  hasLogged = true;
                }
                return Promise.resolve(null);
              };
              (motionManager as any)._originalStartRandomMotion = originalStartRandomMotion;
              console.log('🚫 已禁用 model.motionManager.startRandomMotion 方法');
            }
            
            // 设置标志
            if (motionManager.autoIdle !== undefined) {
              motionManager.autoIdle = false;
              console.log('🚫 model.motionManager.autoIdle 已设置为 false');
            }
            // 不禁用 autoUpdate，保持启用以便手动播放的动作能更新
            if (motionManager.autoUpdate !== undefined) {
              motionManager.autoUpdate = true;
              console.log('✅ model.motionManager.autoUpdate 已启用（允许手动播放的动作更新）');
            }
          } catch (e) {
            console.warn('处理 model.motionManager 失败:', e);
          }
        }
        
        // 🔑 持续监控并强制停止任何自动播放的动画（但不阻止手动播放的动作）
        // 注意：由于我们已经删除了 Idle 动作组，这个监控主要是作为双重保险
        const animationWatcher = setInterval(() => {
          try {
            // 🔑 关键：首先检查用户触发标志，如果设置了就不做任何停止操作
            const isUserTriggered = (model as any)._userTriggeredMotion === true;
            if (isUserTriggered) {
              // 用户触发的动作，不停止，直接返回（不打印日志，避免干扰）
              return;
            }
            
            // 方法1: 停止 motionManager 的自动播放（但不阻止手动播放）
            if (model && model.motionManager) {
              // 只停止自动播放的动画，不停止手动触发的动画
              // 但先检查是否真的有动作在播放（避免不必要的操作）
              if (model.motionManager.playing || model.motionManager.currentMotion) {
                // 再次确认不是用户触发的（双重检查）
                if (!(model as any)._userTriggeredMotion) {
                  console.log('🚫 检测到自动播放的动画，正在停止...');
                  if (model.motionManager.stopAll && typeof model.motionManager.stopAll === 'function') {
                    model.motionManager.stopAll();
                  }
                  if (model.motionManager.stop && typeof model.motionManager.stop === 'function') {
                    model.motionManager.stop();
                  }
                  // 强制设置为不播放（仅限自动播放）
                  if (model.motionManager.playing !== undefined) {
                    model.motionManager.playing = false;
                  }
                  if (model.motionManager.currentMotion) {
                    model.motionManager.currentMotion = null;
                  }
                  if (model.motionManager.currentGroup) {
                    model.motionManager.currentGroup = null;
                  }
                }
              }
              
              // 确保 autoUpdate 保持启用，以便手动播放的动作能更新
              if (model.motionManager.autoUpdate !== undefined && !model.motionManager.autoUpdate) {
                model.motionManager.autoUpdate = true;
              }
            }
            
            // 方法2: 停止 internalModel 的动画（但不停止用户触发的）
            if (model && model.internalModel) {
              // 🔑 再次检查用户触发标志（双重保险）
              const isUserTriggered2 = (model as any)._userTriggeredMotion === true;
              if (isUserTriggered2) {
                // 用户触发的动作，不停止，直接返回
                return;
              }
              
              // 只停止自动播放的动画
              if (model.internalModel.motionManager) {
                const mm = model.internalModel.motionManager;
                
                // 只有在没有用户触发标志时才停止
                if ((mm.playing || mm.currentMotion) && !(model as any)._userTriggeredMotion) {
                  console.log('🚫 检测到 internalModel 自动播放的动画，正在停止...');
                  if (mm.stopAll) {
                    mm.stopAll();
                  }
                  if (mm.stop) {
                    mm.stop();
                  }
                  if (mm.playing !== undefined) {
                    mm.playing = false;
                  }
                  if (mm.currentMotion) {
                    mm.currentMotion = null;
                  }
                  if (mm.currentGroup) {
                    mm.currentGroup = null;
                  }
                }
              }
              
              // 停止 internalModel 的其他动画方法
              if (model.internalModel.stopAllMotions && typeof model.internalModel.stopAllMotions === 'function') {
                // 只在检测到有动作时停止，且不是用户触发的
                if (model.internalModel.motionManager && model.internalModel.motionManager.playing && !(model as any)._userTriggeredMotion) {
                  model.internalModel.stopAllMotions();
                }
              }
              
              // 确保 internalModel 的 motionManager autoUpdate 保持启用
              if (model.internalModel.motionManager) {
                if (model.internalModel.motionManager.autoUpdate !== undefined && !model.internalModel.motionManager.autoUpdate) {
                  model.internalModel.motionManager.autoUpdate = true;
                }
              }
            }
            
            // 方法3: 使用 model 的方法停止（只在非用户触发时）
            if (model && !(model as any)._userTriggeredMotion) {
              if (model.stop && typeof model.stop === 'function') {
                model.stop();
              }
              if (model.stopAll && typeof model.stopAll === 'function') {
                model.stopAll();
              }
            }
          } catch (e) {
            // 忽略错误
          }
        }, 50); // 每50ms检查一次，更频繁地停止
        
        // 保存 watcher，以便后续清理
        (model as any)._animationWatcher = animationWatcher;
        
        // 保存原始的 motion 方法（如果还没有保存）
        if (model && typeof model.motion === 'function' && !originalMotion) {
          originalMotion = model.motion;
          console.log('✅ 已保存原始 model.motion 方法');
        }
        
        console.log('✅ 模型已准备就绪，可以手动播放动作');
      
        // 禁用模型的交互功能（修复兼容性问题）
      try {
          if (model && typeof model === 'object') {
            // 禁用交互
            if ('interactive' in model) {
              (model as any).interactive = false;
        }
            if ('buttonMode' in model) {
              (model as any).buttonMode = false;
            }
            // 禁用事件监听
            if ('eventMode' in model) {
              (model as any).eventMode = 'none';
        }
          }
          // 禁用 stage 的交互
          if (app && app.stage && typeof app.stage === 'object') {
            if ('interactive' in app.stage) {
              (app.stage as any).interactive = false;
            }
            if ('eventMode' in app.stage) {
              (app.stage as any).eventMode = 'none';
            }
        }
      } catch (e) {
        console.warn('⚠️ 设置交互属性时出错（不影响使用）:', e);
      }
      
        console.log('✅ 模型位置设置完成');
        
        // 强制渲染多次确保显示
        app.render();
        console.log('✅ 已强制渲染一次');
        
        // 确保 ticker 正在运行
        if (app.ticker && !app.ticker.started) {
          app.ticker.start();
          console.log('✅ 已启动 PIXI Ticker');
        }
        
        setTimeout(() => {
          app.render();
          console.log('✅ 延迟渲染完成');
        }, 100);
        
        // 12. 添加眼睛跟随鼠标功能（延迟一点确保模型参数已完全初始化）
      if (canvas && container) {
          setTimeout(() => {
        initEyeTracking(model, app, canvas, container);
          }, 200);
      }

        // 13. 添加交互功能
        // ========== 暂时禁用所有交互和动画，只保留眼睛跟踪 ==========
        // setupBasicInteraction(model, canvas, app);  // 禁用点击动画
        // setupHoverEffect(model, canvas);  // 悬停效果（暂时禁用）
        
        // ========== 级别 2：增强交互（可选，取消注释以启用）==========
        // setupDragInteraction(model, canvas, container);
        // setupDoubleClickZoom(model, canvas);

        // 14. 处理窗口大小变化（使用 ResizeObserver 监听容器大小变化）
      const resizeObserver = new ResizeObserver(() => {
          if (adjustModelSize) {
            adjustModelSize();
        }
      });
      resizeObserver.observe(container);

        // 15. 设置动作播放功能和按钮事件
        setupMotionButtons(model, app);

      const totalTime = performance.now() - startTime;
      console.log(`🎉 Live2D 完全加载完成！总耗时: ${totalTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Live2D 模型加载失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Live2D 初始化失败:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('错误详情:', errorMsg);
    }
  }

  // 确保 DOM 已加载后再初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📦 DOM 已加载，开始初始化 Live2D');
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          loadLive2DModel();
        }, { timeout: 3000 });
      } else {
        setTimeout(() => {
          loadLive2DModel();
        }, 2000);
      }
    });
  } else {
    console.log('📦 DOM 已就绪，开始初始化 Live2D');
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadLive2DModel();
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        loadLive2DModel();
      }, 2000);
    }
  }

  // 设置动作按钮功能
  function setupMotionButtons(model: any, app: any) {
    const motionPanel = document.getElementById('live2d-motion-panel');
    const canvas = document.getElementById('live2d-canvas');
    const motionButtons = document.querySelectorAll('.motion-btn');
    const container = document.getElementById('live2d-container');
    
    console.log('🔍 检查按钮元素:', {
      motionPanel: !!motionPanel,
      canvas: !!canvas,
      container: !!container,
      motionButtonsCount: motionButtons.length,
      motionButtons: Array.from(motionButtons).map(btn => ({
        text: btn.textContent,
        className: btn.className,
        hasDataMotion: (btn as HTMLElement).dataset.motion
      }))
    });
    
    if (!motionPanel || !canvas || !container) {
      console.warn('动作面板、画布或容器元素未找到', { motionPanel, canvas, container });
      return;
    }
    
    if (motionButtons.length === 0) {
      console.error('❌ 未找到动作按钮！');
      // 尝试延迟查找
      setTimeout(() => {
        const retryButtons = document.querySelectorAll('.motion-btn');
        console.log('🔄 重试查找按钮，找到:', retryButtons.length);
        if (retryButtons.length > 0) {
          // 重新设置按钮
          setupMotionButtons(model, app);
        }
      }, 500);
      return;
    }

    // 强制显示面板（用于测试）
    motionPanel.style.display = 'flex';
    motionPanel.style.visibility = 'visible';
    motionPanel.style.opacity = '1';
    motionPanel.style.position = 'fixed';
    motionPanel.style.right = '20px';
    motionPanel.style.top = '200px';
    motionPanel.style.zIndex = '100000';
    motionPanel.classList.add('visible');
    
    // 调试：检查面板初始状态
    console.log('🔍 按钮面板初始状态:', {
      display: window.getComputedStyle(motionPanel).display,
      visibility: window.getComputedStyle(motionPanel).visibility,
      opacity: window.getComputedStyle(motionPanel).opacity,
      zIndex: window.getComputedStyle(motionPanel).zIndex,
      hasVisibleClass: motionPanel.classList.contains('visible'),
      position: window.getComputedStyle(motionPanel).position,
      right: window.getComputedStyle(motionPanel).right,
      top: window.getComputedStyle(motionPanel).top,
      width: window.getComputedStyle(motionPanel).width,
      height: window.getComputedStyle(motionPanel).height
    });

    // 使用简单的标志位和事件委托
    let panelVisible = true;  // 默认显示
    let clickHandled = false;
    
    // 在容器上监听点击事件（事件委托）
    // 注意：使用冒泡阶段，让按钮的点击事件先处理
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // 如果点击的是按钮，不处理，让按钮的点击事件处理
      if (target.classList.contains('motion-btn') || target.closest('.motion-btn')) {
        return;  // 不阻止，让按钮事件正常触发
      }
      
      // 如果点击的是面板内部（但不是按钮），不关闭面板
      if (motionPanel.contains(target) && !target.classList.contains('motion-btn') && !target.closest('.motion-btn')) {
        e.stopPropagation();
        return;
      }
      
      // 如果点击的是 canvas，切换面板
      if (target === canvas || canvas.contains(target)) {
        e.stopPropagation();
        e.preventDefault();
        
        if (!clickHandled) {
          clickHandled = true;
          panelVisible = !panelVisible;
          motionPanel.classList.toggle('visible', panelVisible);
          
          // 强制设置样式，确保可见
          if (panelVisible) {
            motionPanel.style.display = 'flex';
            motionPanel.style.visibility = 'visible';
            motionPanel.style.opacity = '1';
          } else {
            motionPanel.style.display = 'none';
          }
          
          console.log('🎬 动作面板已切换:', panelVisible ? '显示' : '隐藏', {
            hasVisibleClass: motionPanel.classList.contains('visible'),
            computedDisplay: window.getComputedStyle(motionPanel).display,
            computedZIndex: window.getComputedStyle(motionPanel).zIndex
          });
          
          // 200ms 后重置标志位
          setTimeout(() => {
            clickHandled = false;
          }, 200);
        }
        return;
      }
    }, false);  // 使用冒泡阶段，让按钮事件先处理
    
    // 点击页面其他地方关闭面板（使用冒泡阶段，延迟执行）
    document.addEventListener('click', (e) => {
      // 延迟检查，确保容器点击事件先处理
      setTimeout(() => {
        if (panelVisible) {
          const target = e.target as HTMLElement;
          // 如果点击的不是面板、canvas、按钮或容器，则关闭
          if (!motionPanel.contains(target) && 
              target !== canvas && 
              !canvas.contains(target) &&
              !container.contains(target) &&
              !target.classList.contains('motion-btn') &&
              !target.closest('.motion-btn')) {
            panelVisible = false;
            motionPanel.classList.remove('visible');
            console.log('🎬 动作面板已关闭');
          }
        }
      }, 150);
    }, false);  // 使用冒泡阶段
    
    // 确保按钮面板初始可见（用于测试）
    console.log('✅ 动作按钮已设置，点击 canvas 显示/隐藏面板');

    // 播放动作的函数
    const playMotion = async (motionIndex: number) => {
      if (!model || !app) {
        console.error('模型未加载');
        return;
      }

      // 🔑 关键：在开始播放之前立即设置用户触发标志，防止 animationWatcher 停止动作
      (model as any)._userTriggeredMotion = true;
      console.log('✅ 已设置 _userTriggeredMotion = true（在播放动作之前）');

      try {
        // 动作映射表
        const motionMapping: { [key: number]: { group: string; index: number } } = {
          1: { group: 'Idle', index: 0 },
          2: { group: 'Idle', index: 1 },
          3: { group: 'Flick', index: 0 },
          4: { group: 'FlickDown', index: 0 },
          5: { group: 'Idle', index: 2 },
          6: { group: 'FlickUp', index: 0 },
          7: { group: 'Tap', index: 0 },
          8: { group: 'Tap', index: 1 },
          9: { group: 'Tap@Body', index: 0 },
          10: { group: 'Flick@Body', index: 0 }
        };
        
        const mapping = motionMapping[motionIndex];
        if (!mapping) {
          console.warn(`未找到动作 ${motionIndex} 的映射`);
          return;
        }
        
        console.log(`🎬 准备播放动作 ${motionIndex}: ${mapping.group}[${mapping.index}]`);
        
        // 停止当前播放的动作
        console.log('🛑 停止当前动作...');
        
        // 停止 model.motionManager
        if (model.motionManager) {
          if (model.motionManager.stopAll && typeof model.motionManager.stopAll === 'function') {
            model.motionManager.stopAll();
          }
          if (model.motionManager.stop && typeof model.motionManager.stop === 'function') {
            model.motionManager.stop();
          }
          if (model.motionManager.playing !== undefined) {
            model.motionManager.playing = false;
          }
        }
        
        // 停止 internalModel.motionManager（重要！）
        if (model.internalModel && model.internalModel.motionManager) {
          const motionManager = model.internalModel.motionManager;
          if (motionManager.stopAll && typeof motionManager.stopAll === 'function') {
            motionManager.stopAll();
          }
          if (motionManager.stop && typeof motionManager.stop === 'function') {
            motionManager.stop();
          }
          if (motionManager.playing !== undefined) {
            motionManager.playing = false;
          }
          // 清空当前动作
          if (motionManager.currentMotion) {
            motionManager.currentMotion = null;
          }
          if (motionManager.currentGroup) {
            motionManager.currentGroup = null;
          }
        }
        
        // 停止 internalModel 的其他方法
        if (model.internalModel) {
          if (model.internalModel.stopAllMotions && typeof model.internalModel.stopAllMotions === 'function') {
            model.internalModel.stopAllMotions();
          }
          if (model.internalModel.stopMotion && typeof model.internalModel.stopMotion === 'function') {
            model.internalModel.stopMotion();
          }
        }
        
        // 停止 model 的方法
        if (model.stop && typeof model.stop === 'function') model.stop();
        if (model.stopAll && typeof model.stopAll === 'function') model.stopAll();

        // 🔑 关键修复：直接使用 model.motion() 方法，这是最可靠的方式
        let motionSuccess = false;
        
        // 方法1: 使用原始的 model.motion() 方法（如果存在）
        if (originalMotion && typeof originalMotion === 'function') {
          try {
            console.log(`🎬 方法1: 使用原始 model.motion('${mapping.group}', ${mapping.index})...`);
            
            // 🔍 调试：检查模型对象的基础路径信息
            console.log('🔍 模型对象信息:', {
              hasSettings: !!(model as any).settings,
              hasUrl: !!(model as any).url,
              settingsUrl: (model as any).settings?.url,
              modelUrl: (model as any).url,
              internalModel: !!model.internalModel,
              motionManager: !!model.internalModel?.motionManager
            });
            
            // 确保 motionManager 状态正确
            const motionManager = model.internalModel?.motionManager;
            if (motionManager) {
              if (motionManager.autoUpdate !== undefined) {
                motionManager.autoUpdate = true;
              }
              // 🔍 调试：检查 motionManager 的路径相关属性
              console.log('🔍 motionManager 信息:', {
                hasLoadMotion: typeof motionManager.loadMotion === 'function',
                motionGroups: motionManager.motionGroups ? Object.keys(motionManager.motionGroups) : null,
                targetGroup: mapping.group,
                targetGroupExists: motionManager.motionGroups?.[mapping.group] ? '存在' : '不存在',
                targetGroupLength: Array.isArray(motionManager.motionGroups?.[mapping.group]) 
                  ? motionManager.motionGroups[mapping.group].length 
                  : '不是数组'
              });
            }
            
            // 调用原始方法
            const motionPriority = getMotionPriority();
            console.log(`🔄 使用优先级: ${motionPriority}`);
            const result = await originalMotion.call(model, mapping.group, mapping.index, motionPriority);
            console.log(`📋 model.motion() 返回:`, result);
            
            // 等待更长时间让动作加载（特别是对于非 Idle 动作）
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 再次检查 motionGroups 是否被填充
            if (motionManager) {
              const updatedGroupMotions = motionManager.motionGroups?.[mapping.group];
              console.log('🔍 调用后动作组状态:', {
                group: mapping.group,
                isArray: Array.isArray(updatedGroupMotions),
                length: Array.isArray(updatedGroupMotions) ? updatedGroupMotions.length : 'N/A',
                hasIndex: Array.isArray(updatedGroupMotions) && updatedGroupMotions[mapping.index] !== undefined
              });
            }
            
            // 检查状态
            if (motionManager) {
              const state = {
                playing: motionManager.playing,
                currentMotion: motionManager.currentMotion,
                currentGroup: motionManager.currentGroup
              };
              console.log('🔍 播放后状态:', state);
              
              if (motionManager.playing || motionManager.currentMotion) {
                motionSuccess = true;
                console.log(`✅ 动作 ${motionIndex} 已开始播放（通过 model.motion）`);
              } else if (result === true || (result && result !== false)) {
                motionSuccess = true;
                console.log(`✅ 动作 ${motionIndex} 已开始播放（返回值检查通过）`);
              } else {
                // 即使返回 false，也检查 motionGroups 是否被填充
                const updatedGroupMotions = motionManager.motionGroups?.[mapping.group];
                if (updatedGroupMotions && Array.isArray(updatedGroupMotions) && updatedGroupMotions.length > 0) {
                  console.log(`💡 model.motion() 返回 false，但动作组已被填充，尝试手动播放...`);
                  // 这里会在方法2中处理
                }
              }
            }
          } catch (e) {
            console.warn('⚠️ 方法1失败:', e);
            console.error('⚠️ 错误详情:', e);
          }
        }
        
        // 方法2: 如果方法1失败，尝试从 motionGroups 获取并直接使用 startMotion
        let motionData: any = null; // 在外部定义，以便在多个地方使用
        if (!motionSuccess && model.internalModel?.motionManager) {
          try {
            console.log('🎬 方法2: 从 motionGroups 获取动作并直接播放...');
            const motionManager = model.internalModel.motionManager;
            const motionGroups = motionManager.motionGroups;
            
            // 调试：打印所有可用的动作组
            if (motionGroups) {
              console.log('📋 可用的动作组:', Object.keys(motionGroups));
              console.log('📋 目标动作组:', mapping.group, '索引:', mapping.index);
            } else {
              console.warn('⚠️ motionGroups 不存在');
            }
            
            if (motionGroups && motionGroups[mapping.group]) {
              const groupMotions = motionGroups[mapping.group];
              
              // 调试：打印动作组的详细结构
              console.log(`🔍 动作组 ${mapping.group} 的详细结构:`, {
                type: Array.isArray(groupMotions) ? 'array' : typeof groupMotions,
                isArray: Array.isArray(groupMotions),
                length: Array.isArray(groupMotions) ? groupMotions.length : (groupMotions ? Object.keys(groupMotions).length : 0),
                keys: Array.isArray(groupMotions) ? `[0..${groupMotions.length - 1}]` : (groupMotions ? Object.keys(groupMotions) : []),
                targetIndex: mapping.index,
                hasIndex: Array.isArray(groupMotions) ? (groupMotions[mapping.index] !== undefined) : (groupMotions && groupMotions[mapping.index] !== undefined),
                value: Array.isArray(groupMotions) ? groupMotions[mapping.index] : (groupMotions ? groupMotions[mapping.index] : undefined),
                valueType: Array.isArray(groupMotions) ? (groupMotions[mapping.index]?.constructor?.name) : (groupMotions?.[mapping.index]?.constructor?.name)
              });
              
              motionData = null; // 重置
              
              if (Array.isArray(groupMotions) && mapping.index >= 0 && mapping.index < groupMotions.length) {
                motionData = groupMotions[mapping.index];
                console.log(`📦 从数组获取动作（索引 ${mapping.index}）:`, motionData?.constructor?.name);
              } else if (groupMotions && typeof groupMotions === 'object') {
                // 尝试多种访问方式
                motionData = groupMotions[mapping.index] || groupMotions[String(mapping.index)] || groupMotions[0];
                console.log(`📦 从对象获取动作:`, {
                  direct: groupMotions[mapping.index]?.constructor?.name,
                  string: groupMotions[String(mapping.index)]?.constructor?.name,
                  first: groupMotions[0]?.constructor?.name,
                  final: motionData?.constructor?.name
                });
              }
              
              if (!motionData) {
                console.warn(`⚠️ 在动作组 ${mapping.group} 中未找到索引 ${mapping.index} 的动作`);
                // 尝试打印所有可用的索引
                if (Array.isArray(groupMotions)) {
                  console.log(`📋 动作组 ${mapping.group} 是数组，长度: ${groupMotions.length}`);
                  for (let i = 0; i < groupMotions.length; i++) {
                    console.log(`  [${i}]:`, groupMotions[i]?.constructor?.name || typeof groupMotions[i]);
                  }
                  // 如果数组为空，尝试使用 model.motion() 触发加载
                  if (groupMotions.length === 0) {
                    console.log(`💡 动作组 ${mapping.group} 为空，尝试使用 model.motion() 触发加载...`);
                    try {
                      // 调用 model.motion() 来触发动作加载（即使返回 false）
                      if (originalMotion && typeof originalMotion === 'function') {
                        await originalMotion.call(model, mapping.group, mapping.index, false);
                      } else if (model.motion && typeof model.motion === 'function') {
                        await model.motion(mapping.group, mapping.index, false);
                      }
                      // 等待动作加载完成（可能需要一些时间）
                      console.log(`⏳ 等待动作加载...`);
                      await new Promise(resolve => setTimeout(resolve, 500));
                      // 再次检查 motionGroups
                      const updatedGroupMotions = motionManager.motionGroups?.[mapping.group];
                      if (updatedGroupMotions && Array.isArray(updatedGroupMotions) && updatedGroupMotions.length > 0) {
                        console.log(`✅ 动作已加载！现在有 ${updatedGroupMotions.length} 个动作`);
                        if (mapping.index < updatedGroupMotions.length) {
                          motionData = updatedGroupMotions[mapping.index];
                          console.log(`📦 从加载后的数组获取动作（索引 ${mapping.index}）`);
                        } else if (updatedGroupMotions.length > 0) {
                          motionData = updatedGroupMotions[0];
                          console.log(`💡 索引 ${mapping.index} 超出范围，使用索引 0`);
                        }
                      } else {
                        console.warn(`⚠️ 等待后动作组 ${mapping.group} 仍然为空`);
                      }
                    } catch (loadError) {
                      console.warn(`⚠️ 触发动作加载失败:`, loadError);
                    }
                  } else if (mapping.index >= groupMotions.length) {
                    console.log(`💡 索引 ${mapping.index} 超出范围，尝试使用索引 0`);
                    motionData = groupMotions[0];
                  }
                } else if (groupMotions && typeof groupMotions === 'object') {
                  console.log(`📋 动作组 ${mapping.group} 是对象，键:`, Object.keys(groupMotions));
                  for (const key of Object.keys(groupMotions)) {
                    console.log(`  [${key}]:`, groupMotions[key]?.constructor?.name || typeof groupMotions[key]);
                  }
                  // 尝试使用第一个可用的动作
                  const keys = Object.keys(groupMotions);
                  if (keys.length > 0) {
                    const firstKey = keys[0];
                    console.log(`💡 尝试使用第一个可用动作（键: ${firstKey}）`);
                    motionData = groupMotions[firstKey];
                  } else {
                    // 如果对象也为空，尝试触发加载
                    console.log(`💡 动作组 ${mapping.group} 对象为空，尝试使用 model.motion() 触发加载...`);
                    try {
                      if (originalMotion && typeof originalMotion === 'function') {
                        await originalMotion.call(model, mapping.group, mapping.index, false);
                      } else if (model.motion && typeof model.motion === 'function') {
                        await model.motion(mapping.group, mapping.index, false);
                      }
                      await new Promise(resolve => setTimeout(resolve, 500));
                      const updatedGroupMotions = motionManager.motionGroups?.[mapping.group];
                      if (updatedGroupMotions && Object.keys(updatedGroupMotions).length > 0) {
                        console.log(`✅ 动作已加载！`);
                        const updatedKeys = Object.keys(updatedGroupMotions);
                        motionData = updatedGroupMotions[updatedKeys[0]] || updatedGroupMotions[mapping.index] || updatedGroupMotions[String(mapping.index)];
                      }
                    } catch (loadError) {
                      console.warn(`⚠️ 触发动作加载失败:`, loadError);
                    }
                  }
                }
              }
              
              // 检查 motionData 的类型
              if (motionData) {
                const motionType = motionData.constructor?.name;
                console.log(`📦 找到动作对象，类型: ${motionType}`);
                
                // 如果类型不是 _CubismMotion，可能需要特殊处理
                if (motionType === '_CubismMotion') {
                  console.log('📦 找到 _CubismMotion 对象，尝试播放...');
                  
                  // 重置 motion 状态
                if ((motionData as any)._motionTime !== undefined) {
                  (motionData as any)._motionTime = 0;
                }
                if ((motionData as any).motionTime !== undefined) {
                  (motionData as any).motionTime = 0;
                }
                if ((motionData as any)._isFinished !== undefined) {
                  (motionData as any)._isFinished = false;
                }
                if ((motionData as any).isFinished !== undefined) {
                  (motionData as any).isFinished = false;
                }
                
                // 确保 motionManager 状态正确
                motionManager.autoUpdate = true;
                motionManager.playing = false;
                motionManager.currentMotion = null;
                
                // 尝试使用 startMotion（注意：它可能返回 Promise）
                let startResult = motionManager.startMotion(motionData, false);
                
                // 如果返回 Promise，等待它完成
                if (startResult && typeof startResult.then === 'function') {
                  startResult = await startResult;
                }
                
                console.log('📋 startMotion 返回:', startResult);
                
                // 如果 startMotion 返回 false，可能是因为 motion 已经完成，需要重置
                if (startResult === false) {
                  console.log('⚠️ startMotion 返回 false，尝试重置 motion 并强制播放...');
                  
                  // 重置 motion 的所有时间相关属性
                  if ((motionData as any).getDuration) {
                    const duration = (motionData as any).getDuration();
                    console.log(`📊 Motion 时长: ${duration}秒`);
                  }
                  
                  // 强制重置 motion 时间
                  if ((motionData as any)._motionTime !== undefined) {
                    (motionData as any)._motionTime = 0;
                  }
                  if ((motionData as any).motionTime !== undefined) {
                    (motionData as any).motionTime = 0;
                  }
                  
                  // 重置完成状态
                  if ((motionData as any)._isFinished !== undefined) {
                    (motionData as any)._isFinished = false;
                  }
                  if ((motionData as any).isFinished !== undefined) {
                    (motionData as any).isFinished = false;
                  }
                  
                  // 强制设置 motionManager 状态
                  motionManager.currentMotion = motionData;
                  motionManager.currentGroup = mapping.group;
                  motionManager.playing = true;
                  motionManager.autoUpdate = true;
                  
                  // 立即更新多次，确保动作开始
                  for (let i = 0; i < 3; i++) {
                    if (motionManager.update && typeof motionManager.update === 'function') {
                      try {
                        motionManager.update(model.internalModel.coreModel, 0.016);
                      } catch (e) {
                         console.warn('⚠️ 手动 update 失败:', e);
                      }
                    }
                    await new Promise(resolve => setTimeout(resolve, 16));
                  }
                  
                  // 检查状态
                  await new Promise(resolve => setTimeout(resolve, 50));
                  if (motionManager.playing || motionManager.currentMotion) {
                    motionSuccess = true;
                    console.log(`✅ 动作 ${motionIndex} 已开始播放（通过强制重置和更新）`);
                  }
                } else if (startResult !== false && startResult !== null && startResult !== undefined) {
                  // startMotion 返回成功
                  motionManager.currentMotion = motionData;
                  motionManager.currentGroup = mapping.group;
                  motionManager.playing = true;
                  motionManager.autoUpdate = true;
                  motionSuccess = true;
                  console.log(`✅ 动作 ${motionIndex} 已开始播放（通过 startMotion）`);
                } else {
                  // 即使返回 false/null，也尝试强制设置
                  motionManager.currentMotion = motionData;
                  motionManager.currentGroup = mapping.group;
                  motionManager.playing = true;
                  motionManager.autoUpdate = true;
                  
                  // 立即更新一次
                  if (motionManager.update && typeof motionManager.update === 'function') {
                    try {
                      motionManager.update(model.internalModel.coreModel, 0.016);
                    } catch (e) {
                       console.warn('⚠️ 手动 update 失败:', e);
                    }
                  }
                  
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  if (motionManager.playing || motionManager.currentMotion) {
                    motionSuccess = true;
                    console.log(`✅ 动作 ${motionIndex} 已开始播放（通过强制设置状态）`);
                  }
                }
                } else {
                  console.warn(`⚠️ 动作对象类型不是 _CubismMotion，而是 ${motionType}，无法播放`);
                }
              } else {
                console.warn(`⚠️ 在动作组 ${mapping.group} 中完全找不到任何动作对象`);
                
                // 🔑 方法3: 如果动作组为空，尝试直接使用文件路径加载动作
                console.log(`💡 方法3: 尝试直接使用文件路径加载动作...`);
                try {
                  // 尝试从模型对象获取基础路径
                  let modelBasePath = '/live2d-samples/hiyori_pro_en/runtime';
                  if (model && (model as any).settings) {
                    const settings = (model as any).settings;
                    if (settings.url) {
                      const modelPath = settings.url;
                      modelBasePath = modelPath.substring(0, modelPath.lastIndexOf('/'));
                      console.log(`📁 从模型 settings 获取基础路径: ${modelBasePath}`);
                    }
                  } else if (model && (model as any).url) {
                    const modelPath = (model as any).url;
                    modelBasePath = modelPath.substring(0, modelPath.lastIndexOf('/'));
                    console.log(`📁 从模型 url 获取基础路径: ${modelBasePath}`);
                  } else {
                    // 使用硬编码的路径
                    const modelPath = '/live2d-samples/hiyori_pro_en/runtime/hiyori_pro_t11.model3.json';
                    modelBasePath = modelPath.substring(0, modelPath.lastIndexOf('/'));
                    console.log(`📁 使用默认基础路径: ${modelBasePath}`);
                  }
                  
                  // 根据动作组和索引确定正确的文件名
                  // 从模型 JSON 文件我们知道：
                  // Idle: m01, m02, m05
                  // Flick: m03
                  // FlickDown: m04
                  // FlickUp: m06
                  // Tap: m07, m08
                  // Tap@Body: m09
                  // Flick@Body: m10
                  const motionFileMap: { [key: number]: string } = {
                    1: 'hiyori_m01.motion3.json', // Idle[0]
                    2: 'hiyori_m02.motion3.json', // Idle[1]
                    3: 'hiyori_m03.motion3.json', // Flick[0]
                    4: 'hiyori_m04.motion3.json', // FlickDown[0]
                    5: 'hiyori_m05.motion3.json', // Idle[2]
                    6: 'hiyori_m06.motion3.json', // FlickUp[0]
                    7: 'hiyori_m07.motion3.json', // Tap[0]
                    8: 'hiyori_m08.motion3.json', // Tap[1]
                    9: 'hiyori_m09.motion3.json', // Tap@Body[0]
                    10: 'hiyori_m10.motion3.json' // Flick@Body[0]
                  };
                  
                  const motionFileName = motionFileMap[motionIndex];
                  if (!motionFileName) {
                    console.warn(`⚠️ 未找到动作 ${motionIndex} 的文件名映射`);
                  } else {
                    // 尝试多种路径格式
                    const pathVariants = [
                      `motion/${motionFileName}`, // 相对于模型目录
                      `${modelBasePath}/motion/${motionFileName}`, // 绝对路径
                      motionFileName, // 仅文件名（如果 loadMotion 会自动添加路径）
                    ];
                    
                    console.log(`📁 尝试加载动作文件: ${motionFileName}`);
                    console.log(`📁 基础路径: ${modelBasePath}`);
                    console.log(`📁 尝试的路径变体:`, pathVariants);
                    
                    // 尝试使用 motionManager.loadMotion 加载
                    if (motionManager.loadMotion && typeof motionManager.loadMotion === 'function') {
                      for (const pathVariant of pathVariants) {
                        if (motionData) break; // 如果已经加载成功，跳出循环
                        
                        try {
                          console.log(`🔍 尝试路径: ${pathVariant}`);
                          const loadedMotion = await motionManager.loadMotion(pathVariant);
                          if (loadedMotion) {
                            console.log(`✅ 已从文件加载动作: ${pathVariant}`);
                            motionData = loadedMotion;
                            break; // 成功加载，跳出循环
                          } else {
                            console.warn(`⚠️ loadMotion 返回 null/undefined (路径: ${pathVariant})`);
                          }
                        } catch (loadError) {
                          console.warn(`⚠️ loadMotion 失败 (路径: ${pathVariant}):`, loadError);
                        }
                      }
                    }
                    
                    // 如果 loadMotion 都失败，尝试直接使用 fetch 加载动作 JSON 文件
                    if (!motionData) {
                      console.log(`💡 loadMotion 都失败，尝试使用 fetch 直接加载动作文件...`);
                      try {
                        const motionFileUrl = `${modelBasePath}/motion/${motionFileName}`;
                        console.log(`📥 使用 fetch 加载: ${motionFileUrl}`);
                        
                        const response = await fetch(motionFileUrl);
                        if (response.ok) {
                          const motionJson = await response.json();
                          console.log(`✅ 成功加载动作 JSON 文件`);
                          
                          // 🛠️ 修复: 补全可能缺失的 Meta 数据
                          if (!motionJson.Meta) {
                            motionJson.Meta = {};
                          }
                          if (motionJson.Meta.FadeInTime === undefined) {
                            motionJson.Meta.FadeInTime = 0.5;
                          }
                          if (motionJson.Meta.FadeOutTime === undefined) {
                            motionJson.Meta.FadeOutTime = 0.5;
                          }
                          
                          // 尝试使用 motionManager 的内部方法创建动作对象
                          // 注意：这可能需要访问 pixi-live2d-display 的内部 API
                          if (motionManager.loadMotionFromJson && typeof motionManager.loadMotionFromJson === 'function') {
                            motionData = await motionManager.loadMotionFromJson(motionJson);
                            console.log(`✅ 使用 loadMotionFromJson 创建动作对象`);
                          } else if (motionManager.createMotion && typeof motionManager.createMotion === 'function') {
                            motionData = await motionManager.createMotion(motionJson);
                            console.log(`✅ 使用 createMotion 创建动作对象`);
                          } else {
                            // 如果 motionManager 没有这些方法，尝试使用 model.motion() 并等待更长时间
                            console.log(`💡 motionManager 没有直接创建方法，尝试使用 model.motion() 并等待更长时间...`);
                            const motionPriority = getMotionPriority();
                            if (originalMotion && typeof originalMotion === 'function') {
                              await originalMotion.call(model, mapping.group, mapping.index, motionPriority);
                            } else if (model.motion && typeof model.motion === 'function') {
                              await model.motion(mapping.group, mapping.index, motionPriority);
                            }
                            // 等待更长时间让动作加载
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // 再次检查 motionGroups
                            const updatedGroupMotions = motionManager.motionGroups?.[mapping.group];
                            if (updatedGroupMotions && Array.isArray(updatedGroupMotions) && updatedGroupMotions.length > 0) {
                              console.log(`✅ 动作已加载！现在有 ${updatedGroupMotions.length} 个动作`);
                              if (mapping.index < updatedGroupMotions.length) {
                                motionData = updatedGroupMotions[mapping.index];
                                console.log(`📦 从加载后的数组获取动作（索引 ${mapping.index}）`);
                              } else if (updatedGroupMotions.length > 0) {
                                motionData = updatedGroupMotions[0];
                                console.log(`💡 索引 ${mapping.index} 超出范围，使用索引 0`);
                              }
                            } else {
                              console.warn(`⚠️ 等待后动作组 ${mapping.group} 仍然为空`);
                            }
                          }
                        } else {
                          console.warn(`⚠️ fetch 加载失败: ${response.status} ${response.statusText}`);
                        }
                      } catch (fetchError) {
                        console.warn(`⚠️ fetch 加载动作文件失败:`, fetchError);
                        
                        // 最后的尝试：使用 model.motion() 并等待更长时间
                        try {
                          console.log(`💡 最后尝试：使用 model.motion() 并等待更长时间...`);
                          const motionPriority = getMotionPriority();
                          if (originalMotion && typeof originalMotion === 'function') {
                            await originalMotion.call(model, mapping.group, mapping.index, motionPriority);
                          } else if (model.motion && typeof model.motion === 'function') {
                            await model.motion(mapping.group, mapping.index, motionPriority);
                          }
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          
                          const updatedGroupMotions = motionManager.motionGroups?.[mapping.group];
                          if (updatedGroupMotions && Array.isArray(updatedGroupMotions) && updatedGroupMotions.length > 0) {
                            console.log(`✅ 动作已加载！现在有 ${updatedGroupMotions.length} 个动作`);
                            if (mapping.index < updatedGroupMotions.length) {
                              motionData = updatedGroupMotions[mapping.index];
                            } else if (updatedGroupMotions.length > 0) {
                              motionData = updatedGroupMotions[0];
                            }
                          }
                        } catch (loadError) {
                          console.warn(`⚠️ 使用 model.motion() 加载失败:`, loadError);
                        }
                      }
                    }
                    
                    // 如果成功加载，继续播放流程
                    if (motionData && motionData.constructor?.name === '_CubismMotion') {
                      console.log(`📦 从文件加载的动作对象，类型: ${motionData.constructor?.name}`);
                      // 继续执行播放逻辑（会进入下面的 if (motionData) 分支）
                    }
                  }
                } catch (fileLoadError) {
                  console.warn(`⚠️ 文件加载方法失败:`, fileLoadError);
                }
              }
            } else {
              console.warn(`⚠️ 动作组 ${mapping.group} 不存在于 motionGroups 中`);
            }
          } catch (e) {
            console.warn('⚠️ 方法2失败:', e);
          }
        }
        
        // 🔑 方法2.5: 如果从文件加载了动作，在这里处理播放
        if (!motionSuccess && motionData && motionData.constructor?.name === '_CubismMotion' && model.internalModel?.motionManager) {
          try {
            console.log(`🎬 方法2.5: 播放从文件加载的动作...`);
            const motionManager = model.internalModel.motionManager;
            
            // 重置 motion 状态
            if ((motionData as any)._motionTime !== undefined) {
              (motionData as any)._motionTime = 0;
            }
            if ((motionData as any).motionTime !== undefined) {
              (motionData as any).motionTime = 0;
            }
            if ((motionData as any)._isFinished !== undefined) {
              (motionData as any)._isFinished = false;
            }
            if ((motionData as any).isFinished !== undefined) {
              (motionData as any).isFinished = false;
            }
            
            // 确保 motionManager 状态正确
            motionManager.autoUpdate = true;
            motionManager.playing = false;
            motionManager.currentMotion = null;
            
            // 尝试使用 startMotion
            let startResult = motionManager.startMotion(motionData, false);
            if (startResult && typeof startResult.then === 'function') {
              startResult = await startResult;
            }
            
            console.log('📋 startMotion 返回（文件加载）:', startResult);
            
            // 即使返回 false，也强制设置状态
            motionManager.currentMotion = motionData;
            motionManager.currentGroup = mapping.group;
            motionManager.playing = true;
            motionManager.autoUpdate = true;
            
            // 立即更新多次
            for (let i = 0; i < 3; i++) {
              if (motionManager.update && typeof motionManager.update === 'function') {
                try {
                  motionManager.update(model.internalModel.coreModel, 0.016);
                } catch (e) {
                   console.warn('⚠️ 手动 update 失败:', e);
                }
              }
              await new Promise(resolve => setTimeout(resolve, 16));
            }
            
            await new Promise(resolve => setTimeout(resolve, 50));
            if (motionManager.playing || motionManager.currentMotion) {
              motionSuccess = true;
              console.log(`✅ 动作 ${motionIndex} 已开始播放（通过文件加载）`);
            }
          } catch (e) {
            console.warn('⚠️ 播放从文件加载的动作失败:', e);
          }
        }
        
        if (!motionSuccess) {
          console.error(`❌ 无法播放动作 ${motionIndex}，所有方法都失败`);
        } else {
          // 设置用户触发标志，防止 animationWatcher 停止
          (model as any)._userTriggeredMotion = true;
          
          // 动作播放完成后清除标志（延迟清除）
          setTimeout(() => {
            (model as any)._userTriggeredMotion = false;
          }, 10000); // 10秒后清除标志
        }

        // 更新按钮状态
        motionButtons.forEach((btn, index) => {
          const button = btn as HTMLButtonElement;
          if (index + 1 === motionIndex) {
            button.classList.add('playing');
          } else {
            button.classList.remove('playing');
          }
        });

        // 动作播放完成后移除高亮（根据动作持续时间）
        setTimeout(() => {
          motionButtons.forEach((btn) => {
            (btn as HTMLButtonElement).classList.remove('playing');
          });
        }, 10000); // 10秒后移除高亮

      } catch (error) {
        console.error(`❌ 播放动作 ${motionIndex} 失败:`, error);
      }
    };

    // 为每个按钮添加点击事件
    console.log(`🔘 找到 ${motionButtons.length} 个动作按钮`);
    motionButtons.forEach((btn, index) => {
      const button = btn as HTMLButtonElement;
      const motionIndex = index + 1;
      
      // 移除旧的事件监听器（如果有）
      const newButton = button.cloneNode(true) as HTMLButtonElement;
      button.parentNode?.replaceChild(newButton, button);
      
      // 添加新的点击事件
      newButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log(`🔘 按钮 ${motionIndex} 被点击！`);
        console.log(`🎬 准备播放动作 ${motionIndex}...`);
        playMotion(motionIndex);
      }, true);  // 使用捕获阶段，确保优先处理
      
      // 也添加 mousedown 事件作为备用
      newButton.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        console.log(`🔘 按钮 ${motionIndex} mousedown 事件`);
      });
      
      console.log(`✅ 按钮 ${motionIndex} 事件已绑定`, {
        buttonText: newButton.textContent,
        hasClickHandler: true
      });
    });

    console.log('✅ 动作按钮已设置完成，共', motionButtons.length, '个按钮');
  }
}

// 防止重复执行
if (!(window as any).__LIVE2D_INITIALIZED__) {
  (window as any).__LIVE2D_INITIALIZED__ = true;
  
  // 在 DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLive2D);
  } else {
    initLive2D();
  }
}

