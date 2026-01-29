# Tuliu AI 项目维护手册 (AI-Agent 专用版)

> **重要**: 本文档是为 AI 代理设计的“接管协议”。后续任何 AI 接管本项目时，必须首先完整阅读此协议，以确保架构一致性并最小化 Token 消耗。

## 1. 核心 Mission 与视觉契约
*   **视觉风格**: 完美复刻 Picset AI (深色模式、霓虹光效、玻璃拟态)。
*   **核心功能**: 电商 AI 生图 SaaS，包含“产品图上传 -> 视觉推理 -> 结构化 Prompt -> AI 生图 -> 自动水印 -> 积分扣费”全链路。
*   **首页规范**: 必须包含 **Case Gallery**，展示“原图 vs AI 生成”的对比滑块 (Before/After Slider)。标题需具备极强的视觉冲击力（font-black, text-9xl）。

## 2. 技术栈与基础设施 (Infrastructure)
| 维度 | 强制标准 | 备注 |
| :--- | :--- | :--- |
| **前端框架** | React + Vite + Wouter | 轻量化，严禁引入 Next.js |
| **通讯协议** | tRPC (Type-safe API) | 所有前后端交互必须通过 `server/routers/` |
| **数据库** | Drizzle ORM + MySQL/TiDB | 修改 Schema 必须通过 `drizzle/schema.ts` |
| **服务器** | 腾讯云 6M 带宽服务器 | 确保大图传输不卡顿 |
| **对象存储** | 腾讯云 COS | 用于存储用户上传的原图及生成的电商图 |
| **UI 组件库** | Shadcn UI + Tailwind CSS | 保持 `components/ui/` 的原子化 |

## 3. 多模型策略 (Multi-Model Strategy)
项目采用分层模型架构，以平衡速度、成本与质量：
*   **视觉推理层**: 接入 **混元-t1-vision**。用于识别用户上传的产品图特征（材质、光影、结构）。
*   **提示词工程层**: 
    *   **混元-turbos (快思考模型)**: 用于快速生成基础 Prompt。
    *   **结构化提示词 (Structured Prompting)**: 强制包含 `resolution, product photography, soft studio lighting` 等专业摄影参数。
*   **生图引擎层**: 
    *   **SiliconFlow (Flux.1) API**: 核心生图引擎，支持高质量电商视觉输出。
    *   **ControlNet (Canny/Depth)**: 确保产品形状在生成过程中不走样。
*   **后处理层**:
    *   **briaai/RMBG-1.4 API**: 自动去除原图背景。
    *   **AI 超分放大 (AI Upscaling)**: 接入 SiliconFlow Upscaler 或 Real-ESRGAN，提升详情页清晰度。
*   **3D 扩展**: 预留 **混元 3D 大模型** 接口，用于未来的产品建模需求。

## 4. 核心业务逻辑 (Business Logic)
1.  **Prompt 模板工厂**: 提供 `Quiet Luxury` 等预设模板，用户一键应用高级视觉风格。
2.  **生成模式**:
    *   **标准生成 (Standard Generation)**: 1 积分/张。
    *   **批量生成**: 支持 1-20 张连发，预留用户选择权。
3.  **安全与频率控制**: 后端必须限制接口调用频率 (**Rate Limit**)，防止 API 被恶意刷取。
4.  **图层管理**: 基于 **SVG/Canvas 的图层分离技术**，确保水印与产品图分离，方便 Paid 版用户获取原图。

## 5. 环境变量配置 (Environment Variables)
在 `.env` 文件中必须配置以下核心变量：
*   `SILICONFLOW_API_KEY`: 用于 Flux.1 和 Upscaler。
*   `HUNYUAN_API_KEY`: 用于混元系列模型（Vision/Turbos/3D）。
*   `TENCENT_COS_SECRET_ID/KEY`: 腾讯云存储配置。
*   `SMTP_HOST/USER/PASS`: 邮件 OTP 验证配置。
*   `JWT_SECRET`: Session 加密密钥。

## 6. 开发者避坑指南
*   **登录调试**: 开发模式下，OTP 验证码会强制打印在控制台 `[DEV] OTP: XXXXXX`。
*   **数据库同步**: 修改 `schema.ts` 后，必须运行 `pnpm drizzle-kit push`。
*   **字体规范**: 首页标题必须使用 `font-black` 字重，并配合 `tracking-tighter` 和 `leading-none`。

---
**维护记录**:
- 2026-01-29: 整合多模型策略（混元、SiliconFlow）、腾讯云基础设施及结构化提示词工程。 (By Manus AI)

- 2026-01-29 23:00: 完成项目部署和核心功能修复 (By Manus AI)
  - ✅ 配置所有环境变量（AI 服务、COS、邮箱、数据库）
  - ✅ 修复 Session 创建问题（添加 VITE_APP_ID）
  - ✅ 修复图片生成记录 ID 错误（使用 insertId）
  - ✅ 修复 SiliconFlow API 端点（使用 /images/generations）
  - ✅ 添加腾讯云 COS 存储支持
  - ✅ 添加文件上传 API 路由
  - ✅ 测试通过：邮箱登录、图片生成、图片下载
  - ✅ 创建 .env.example 和测试结果文档
  - ✅ 同步代码到 GitHub 仓库

## 7. 已知问题和待办事项

### 已修复的问题
1. ✅ 数据库未配置 - 已安装 MySQL 并初始化数据库
2. ✅ Session 创建失败 - 已添加 VITE_APP_ID 配置
3. ✅ 图片生成记录 ID 错误 - 已修复为使用 insertId
4. ✅ SiliconFlow API 端点错误 - 已更正为正确的端点

### 待优化项
1. ⚠️ 前端文件上传交互 - 后端 API 正常，前端点击事件在自动化环境中可能受限
2. ⚠️ 水印功能 - 需要进一步测试
3. ⚠️ 图片去背景功能 - 需要集成 Bria AI API
4. ⚠️ 批量生成功能 - 需要优化 UI 和后端处理

## 8. 部署说明

### 本地开发环境
1. 克隆仓库：`gh repo clone tswdt/tuliu-ai`
2. 安装依赖：`pnpm install`
3. 配置环境变量：复制 `.env.example` 为 `.env` 并填入真实配置
4. 初始化数据库：`pnpm db:push`
5. 启动开发服务器：`pnpm dev`
6. 访问：http://localhost:3000

### 生产环境部署
1. 确保服务器已安装 Node.js 22+ 和 MySQL
2. 配置环境变量（使用生产环境的 API 密钥）
3. 构建项目：`pnpm build`
4. 启动服务：`pnpm start`
5. 配置反向代理（Nginx）和 SSL 证书

### 测试账号
- 邮箱：newuser@tuliu.ai
- 初始积分：10 分
- 测试 Prompt：红色运动鞋，白色背景

## 9. API 端点说明

### 认证相关
- `POST /api/trpc/auth.sendOTP` - 发送邮箱验证码
- `POST /api/trpc/auth.verifyOTP` - 验证邮箱验证码并登录
- `POST /api/trpc/auth.logout` - 登出

### 图片生成
- `POST /api/trpc/generate.generate` - 生成图片
- `GET /api/trpc/generate.history` - 获取生成历史

### 文件上传
- `POST /api/storage/upload` - 上传文件到腾讯云 COS

## 10. 数据库 Schema

### users 表
- id: 用户 ID
- email: 邮箱
- credits: 积分余额
- createdAt: 创建时间

### otps 表
- id: OTP ID
- email: 邮箱
- code: 验证码
- expiresAt: 过期时间

### generatedImages 表
- id: 图片 ID
- userId: 用户 ID
- promptCn: 中文 Prompt
- promptEn: 英文 Prompt
- imageUrl: 原图 URL
- watermarkedUrl: 水印图 URL
- width: 宽度
- height: 高度
- tier: 等级（trial/standard/hd/ultra）
- creditsUsed: 消耗积分
- status: 状态（pending/success/failed）
- createdAt: 创建时间

### transactions 表
- id: 交易 ID
- userId: 用户 ID
- type: 类型（generate/recharge）
- creditsDelta: 积分变化
- creditsAfter: 变化后积分
- description: 描述
- createdAt: 创建时间
