# 图流 AI — 智能电商摄影平台

AI 驱动的电商产品图处理平台：一键完成背景移除与场景重绘，生成高质量产品主图，零服务器带宽压力。

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) + TypeScript |
| UI 组件 | Tailwind CSS + Shadcn UI |
| 对象存储 | 腾讯云 COS |
| AI 视觉分析 | Tencent Hunyuan Vision |
| 智能抠图 | Bria Matting API |
| 场景重绘 | SiliconFlow Flux Fill |

## 架构概述

**Serverless First，COS 作为状态层，无数据库。**

- 所有图片及任务状态均存储于腾讯云 COS，服务器本身无状态
- 媒体文件通过预签名 URL 由浏览器直传 COS，**零媒体流量**经过本地服务器（适配 6Mbps 带宽限制）
- 任务状态以 JSON 文件形式存于 COS，支持水平扩展

## AI Pipeline

```
用户上传图片（直传 COS）
       ↓
视觉分析：Hunyuan Vision 理解产品内容
       ↓
智能抠图：Bria Matting API 精准移除背景
       ↓
场景重绘：Flux Fill 生成电商风格背景
       ↓
结果图片上传至 COS，返回公开 URL
```

## 快速开始

### 1. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local，填入各项 API 密钥（详见 .env.example 注释）
```

### 2. 安装依赖并启动

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## Docker 部署

```bash
# 构建镜像（已内置 NODE_OPTIONS='--max-old-space-size=3072'）
docker build -t tuliu-ai .

# 运行容器，挂载环境变量文件
docker run -p 3000:3000 --env-file .env.local tuliu-ai
```

## 目录结构

```
├── app/                  # Next.js App Router 路由与页面
│   ├── api/              # API Routes（presign、ai-process 等）
│   └── page.tsx          # 主页面
├── components/           # 可复用 UI 组件
├── lib/
│   ├── auth.ts           # JWT 身份验证
│   ├── env.ts            # 环境变量 Zod 校验
│   └── services/
│       ├── cos.ts        # 腾讯云 COS 统一封装
│       └── ...           # 其他 AI 服务封装
├── server/               # 自定义 Next.js 服务器
├── scripts/              # 开发工具脚本（不含于 Docker 构建）
├── Dockerfile
├── .dockerignore
└── .env.example
```

## 生产约束

| 资源 | 规格 |
|------|------|
| 服务器 | 2 vCPU / 4 GB RAM |
| 带宽 | 6 Mbps（媒体文件不经过服务器） |
| 内存限制 | `NODE_OPTIONS='--max-old-space-size=3072'` |
