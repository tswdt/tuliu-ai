import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 校验 ID 格式，防止路径穿越攻击
 */
export function validateId(id: string): boolean {
  // 只允许字母、数字、下划线、短横线
  return /^[a-zA-Z0-9_-]+$/.test(id);
}
