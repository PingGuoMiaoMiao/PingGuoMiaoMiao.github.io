/**
 * Live2D 工具函数
 * 用于加载和管理 Live2D 模型
 */

/**
 * 加载 Cubism SDK 核心文件
 */
export async function loadCubismSDK(): Promise<void> {
  if (window.Live2DCubismCore) {
    console.log('✅ Cubism SDK 已加载');
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/cubism-sdk/live2dcubismcore.min.js';
    script.onload = () => {
      console.log('✅ Cubism SDK 核心文件加载完成');
      if (window.Live2DCubismCore) {
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

/**
 * 加载 Cubism 2 占位符文件
 */
export async function loadCubism2Placeholder(): Promise<void> {
  const windowAny = window as any;
  if (windowAny.Live2D && windowAny.Live2DMotion) {
    console.log('✅ Cubism 2 占位符已加载');
    return;
  }

  return new Promise((resolve) => {
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

/**
 * 检查 WebGL 支持
 */
export function checkWebGLSupport(): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  return !!gl;
}

/**
 * 眼睛跟随鼠标的配置
 */
export interface EyeTrackingConfig {
  lerpFactor: number; // 插值系数，值越小越平滑
  maxMovement: number; // 最大移动幅度
  eyeParamNames: string[]; // 眼睛参数名称列表
}

/**
 * 默认眼睛跟踪配置
 */
export const DEFAULT_EYE_CONFIG: EyeTrackingConfig = {
  lerpFactor: 0.1,
  maxMovement: 0.5,
  eyeParamNames: [
    'ParamAngleX',
    'ParamAngleY',
    'ParamEyeBallX',
    'ParamEyeBallY',
    'PARAM_ANGLE_X',
    'PARAM_ANGLE_Y',
    'PARAM_EYE_BALL_X',
    'PARAM_EYE_BALL_Y'
  ]
};

/**
 * 初始化眼睛跟随鼠标功能
 */
export function initEyeTracking(
  model: any,
  app: any,
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  config: EyeTrackingConfig = DEFAULT_EYE_CONFIG
): void {
  let targetEyeX = 0;
  let targetEyeY = 0;
  let currentEyeX = 0;
  let currentEyeY = 0;

  // 监听全局鼠标移动
  document.addEventListener('mousemove', (e) => {
    if (!model || !canvas || !container) return;
    
    const containerRect = container.getBoundingClientRect();
    // 计算鼠标相对于容器的位置（归一化到 -1 到 1）
    const relativeX = (e.clientX - containerRect.left - containerRect.width / 2) / (containerRect.width / 2);
    const relativeY = (e.clientY - containerRect.top - containerRect.height / 2) / (containerRect.height / 2);
    
    // 限制范围并设置目标值
    targetEyeX = Math.max(-1, Math.min(1, relativeX * config.maxMovement));
    targetEyeY = Math.max(-1, Math.min(1, relativeY * config.maxMovement));
  });

  // 使用 ticker 平滑更新眼睛位置
  if (app && app.ticker) {
    app.ticker.add(() => {
      if (!model || !model.internalModel || !model.internalModel.coreModel) return;
      
      try {
        // 平滑插值
        currentEyeX += (targetEyeX - currentEyeX) * config.lerpFactor;
        currentEyeY += (targetEyeY - currentEyeY) * config.lerpFactor;
        
        const coreModel = model.internalModel.coreModel;
        
        // 尝试设置 X 方向
        for (let i = 0; i < config.eyeParamNames.length; i += 2) {
          try {
            const paramIndexX = coreModel.getParameterIndex(config.eyeParamNames[i]);
            if (paramIndexX >= 0) {
              coreModel.setParameterValueByIndex(paramIndexX, currentEyeX);
              break;
            }
          } catch (e) {
            // 参数不存在，继续尝试下一个
          }
        }
        
        // 尝试设置 Y 方向
        for (let i = 1; i < config.eyeParamNames.length; i += 2) {
          try {
            const paramIndexY = coreModel.getParameterIndex(config.eyeParamNames[i]);
            if (paramIndexY >= 0) {
              coreModel.setParameterValueByIndex(paramIndexY, currentEyeY);
              break;
            }
          } catch (e) {
            // 参数不存在，继续尝试下一个
          }
        }
      } catch (e) {
        // 忽略错误，可能是参数不存在
      }
    });
    
    console.log('✅ 眼睛跟随鼠标功能已启用');
  }
}

