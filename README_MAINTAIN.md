# Tuliu AI 项目维护手册 (AI-Agent 专用版)

> **重要**: 本文档是为 AI 代理设计的“接管协议”。后续任何 AI 接管本项目时，必须首先完整阅读此协议，以确保架构一致性并最小化 Token 消耗。

## 1. 核心 Mission 与视觉契约
*   **视觉风格**: 完美复刻 Picset AI (深色模式、霓虹光效、玻璃拟态)。
*   **核心功能**: 电商 AI 生图 SaaS，包含“中文 Prompt 翻译 -> 生图 -> 自动水印 -> 积分扣费”全链路。
*   **首页规范**: 必须包含 **Case Gallery**，展示“原图 vs AI 生成”的对比滑块 (Before/After Slider)。

## 2. 技术栈边界 (禁止擅自更改)
| 维度 | 强制标准 | 备注 |
| :--- | :--- | :--- |
| **前端框架** | React + Vite + Wouter | 轻量化，严禁引入 Next.js (除非重构要求) |
| **通讯协议** | tRPC (Type-safe API) | 所有前后端交互必须通过 `server/routers/` |
| **数据库** | Drizzle ORM + MySQL/TiDB | 修改 Schema 必须通过 `drizzle/schema.ts` |
| **UI 组件库** | Shadcn UI + Tailwind CSS | 保持 `components/ui/` 的原子化 |
| **核心库** | Sharp (水印), Nodemailer (邮件) | 严禁引入同类竞争库 |

## 3. 环境变量与多模型策略 (Environment)
项目依赖以下环境变量，接管后请立即检查 `.env`:
*   **SiliconFlow**: `SILICONFLOW_API_KEY` (支持 Flux.1, Qwen 翻译, Upscaler)。
*   **邮件服务**: `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST` (用于 OTP 验证)。
*   **多模型逻辑**:
    *   **翻译**: 调用 SiliconFlow (Qwen) 将中文转为英文 Prompt。
    *   **生图**: 调用 SiliconFlow (Flux-pro/dev)。
    *   **视觉推理**: 接入混元-t1-vision (用于复杂场景理解)。

## 4. 六层商业架构执行准则
1.  **Client**: 首页必须体现“高质量电商案例”。Dashboard 需提供“一键尝试案例”入口。
2.  **Gateway**: 严格执行 **邮箱验证码 (OTP)** 登录。禁止绕过验证直接操作数据库。
3.  **Strategy**: 后端翻译引擎必须带有 System Prompt 优化，确保生成的英文 Prompt 符合 Flux.1 偏好。
4.  **Execution**: 
    *   **Trial 版**: 强制 720p + "Tuliu Preview" 水印。
    *   **Paid 版**: 原图返回。
5.  **Commerce (积分系统)**:
    *   `Standard (1pt)`, `HD (2pts)`, `Ultra (4pts)`。
    *   扣费操作必须包裹在数据库事务中。
6.  **Admin**: `/admin` 路由用于用户管理、手动充值与 GMV 监控。

## 5. 开发者避坑指南 (减少积分消耗)
*   **Invalid URL 修复**: `client/src/const.ts` 已包含环境变量容错逻辑，修改时请勿移除 `try-catch`。
*   **Drizzle 流程**: 修改 `schema.ts` 后，必须运行 `pnpm drizzle-kit generate`。
*   **API 路径**: 后端入口在 `server/_core/index.ts`，路由分发在 `server/routers/`。

---
**维护记录**:
- 2026-01-29: 初始化接管，修复环境变量报错，重构认证逻辑为 Email OTP，建立本手册。 (By Manus AI)
