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

## 6. 核心要素与跨平台迁移指南

为了确保项目能够顺利在不同账号或平台间迁移，请务必关注以下核心要素：

### 关键环境变量配置
在任何新环境下，必须在 `.env` 文件中配置以下变量：
- `DATABASE_URL`: MySQL 数据库连接字符串。
- `JWT_SECRET`: 用于生成登录 Session 的密钥。
- `OAUTH_SERVER_URL`: (可选) 对接外部 OAuth 服务。
- `SMTP_HOST/USER/PASS`: 用于发送真实验证码邮件。

### 数据库迁移
项目使用 Drizzle ORM。在新环境部署时：
1. 确保 MySQL 数据库已创建。
2. 运行 `pnpm drizzle-kit push` 同步表结构。

### 登录系统调试 (开发模式)
- 在开发环境下，系统会自动在控制台打印 `[DEV] OTP for user@example.com: XXXXXX`。
- 即使邮件发送失败，也可以通过控制台获取验证码完成登录测试。

### 图片生成与上传功能
- **AI 生图**: 对接了 AI 翻译和生图接口。
- **产品图上传**: 支持用户上传原图，后台预留了对接大模型处理电商详情页的接口。
- **批量生成**: 用户可选择生成 1-20 张图片，系统会自动循环处理。

### 视觉规范
- **字体**: 标题使用 `font-extrabold`，Hero 区域字体大小设为 `text-6xl` 到 `text-8xl`。
- **风格**: 赛博朋克霓虹风格，使用 `neon-glow` 和 `glass-effect` 类名。

## 7. 本地开发与预览 (Local Development & Previewing)

为了在本地环境运行、测试和预览 Tuliu AI 项目，请遵循以下步骤。

| 步骤 | 命令 / 操作 | 详细说明 |
| :--- | :--- | :--- |
| 1. **安装依赖** | `pnpm install` | 安装所有必需的前端和后端依赖项。 |
| 2. **配置环境** | 创建 `.env` 文件 | 填入数据库、API 密钥和邮件服务等环境变量。 |
| 3. **启动数据库** | `sudo systemctl start mysql` | 确保本地 MySQL 服务正在运行。 |
| 4. **数据库迁移** | `pnpm drizzle-kit push` | 同步表结构到本地数据库。 |
| 5. **启动开发服务器** | `pnpm dev` | 同时启动 Vite 前端和后端 tRPC 服务。 |
| 6. **访问预览** | `http://localhost:3000` | 打开浏览器访问预览地址。 |

> **重要提示**: 预览确认无误后，再提交代码或同步到仓库。
