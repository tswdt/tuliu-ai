import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并Tailwind CSS类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 格式化金额
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(num);
}

// 生成唯一ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 平台尺寸配置
export const PLATFORM_SIZES = {
  TAOBAO: { width: 800, height: 800, name: "淘宝" },
  TMALL: { width: 800, height: 800, name: "天猫" },
  JD: { width: 800, height: 800, name: "京东" },
  PINDUODUO: { width: 750, height: 1000, name: "拼多多" },
  DOUYIN: { width: 1080, height: 1920, name: "抖音" },
  XIAOHONGSHU: { width: 1080, height: 1440, name: "小红书" },
  AMAZON: { width: 1000, height: 1000, name: "亚马逊" },
  TEMU: { width: 800, height: 800, name: "Temu" },
  CUSTOM: { width: 800, height: 800, name: "自定义" },
};

// 角色权限配置
export const ROLE_PERMISSIONS = {
  GUEST: { maxGenerations: 0, features: ["浏览"] },
  INDIVIDUAL: { maxGenerations: 50, features: ["基础生成", "历史记录"] },
  PROFESSIONAL: { maxGenerations: 500, features: ["高级生成", "批量导出", "API访问"] },
  ENTERPRISE: { maxGenerations: Infinity, features: ["全部功能", "定制化", "技术支持"] },
  ADMIN: { maxGenerations: Infinity, features: ["全部功能", "管理后台"] },
};
