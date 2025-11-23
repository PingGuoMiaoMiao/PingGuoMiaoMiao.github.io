/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Live2D 全局类型声明
declare global {
  interface Window {
    Live2DCubismCore?: any;
    Live2D?: any;
    Live2DMotion?: any;
    Live2DModel?: any;
    Live2DExpression?: any;
    __performanceEventDispatched?: boolean; // 防止重复触发性能检测事件
  }
}

export {};
