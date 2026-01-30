# Tuliu AI 项目维护手册 v2.0 (最终执行版)

**重要提示：** 本文档是项目的最高指导文件。接管本项目的 AI 代理（Agent）必须严格遵守以下技术栈和业务逻辑，严禁擅自更改数据库类型或遗漏核心服务 Key。

---

## 1. 核心 Mission 与视觉契约
* **视觉风格:** 完美复刻 Picset AI (深色模式、霓虹光效、玻璃拟态)。
* **核心功能:** 电商 AI 生图 SaaS 全链路：用户上传 -> **Bria 自动抠图** -> **混元视觉推理** -> **Flux.1 生图** -> **腾讯云存储**。
* **Showcase (首页关键):** 首页必须包含 Case Gallery（瀑布流布局），并针对运动鞋、化妆品案例实现 **"原图 vs AI 生成" 的滑块对比效果 (Before/After Slider)**，体现视觉冲击力。

---

## 2. 技术栈与基础设施 (Infrastructure)
* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Framer Motion.
* **Backend:** Next.js Server Actions.
* **Database (⚠️重要):** **SQLite** (`file:./dev.db`)。
    * *注意：开发环境严禁使用 MySQL，必须使用本地 SQLite 以确保零配置运行。*
* **Core Libs:** `sharp` (水印处理), `nodemailer` (邮件), `openai` (兼容调用 SiliconFlow)。

---

## 3. 多模型与服务策略 (Multi-Model Strategy)
项目采用分层处理架构，必须依次调用以下 API：

1.  **预处理层 (Matting):** 调用 **Bria AI (RMBG-1.4)** 对用户上传的产品图进行高精度自动去背景。
2.  **视觉推理层 (Vision):** 调用 **腾讯混元 (Hunyuan-Vision)** 分析产品材质、光影、角度。
3.  **提示词工程层 (Prompt):** 结合 "Quiet Luxury" 模版和混元分析结果，生成结构化英文 Prompt。
4.  **生图引擎层 (Generation):** 调用 **SiliconFlow (Flux.1)** 生成最终的高清电商图。
5.  **存储层 (Storage):** 生成结果必须上传至 **腾讯云 COS**，返回公网可访问 URL。

---

## 4. 环境变量配置 (.env)
请直接使用以下生产级 Key 配置项目（已包含所有核心服务）：

```env
# --- 1. 核心 AI 服务 ---
# SiliconFlow (用于 Flux.1 生图)
SILICONFLOW_API_KEY="sk-pooxtfkbyuqfiaqgculdierjywrfvcxftecghmnohnatthcl"
BASE_URL="[https://api.siliconflow.cn/v1](https://api.siliconflow.cn/v1)"

# 腾讯混元 (用于视觉推理)
HUNYUAN_API_KEY="sk-Satgb6DLDe2eIDjFBHI32Dv0pScrRRAqIE4DPqi56xdIVO4x"

# Bria AI (用于自动抠图 - 核心必选)
BRIA_API_KEY="907cddeec3074b53a228f13cad0cfb3b"

# --- 2. 存储服务 (腾讯云 COS) ---
COS_SECRET_ID="填入你的腾讯云SecretId"
COS_SECRET_KEY="GI7j7KJ7kAPUVTL1Y482DNKBrLbgZGuQ"
COS_BUCKET="tuliuai-1257218345"
COS_REGION="ap-shanghai"

# --- 3. 邮件服务 (QQ邮箱 OTP) ---
EMAIL_USER="535290454@qq.com"
EMAIL_PASS="vtqqhwkxmkgwbgdh"
EMAIL_HOST="smtp.qq.com"
EMAIL_PORT=465
EMAIL_SECURE=true

# --- 4. 安全配置 ---
# 请自动生成一个随机字符串填入下方
JWT_SECRET=""
​“MAINTENANCE.md 仅作为上下文参考，本次任务中严禁修改该文件。”
