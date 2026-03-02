# 电商AI详情页生成SaaS平台

一个对标昭然AI、Picset AI的垂直电商场景一站式AI视觉生产SaaS平台，面向国内/跨境电商商家。

## 技术栈

- **框架**: Next.js 15+ App Router
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS
- **UI组件**: Shadcn UI
- **ORM**: Prisma ORM
- **后端服务**: Supabase (Auth/数据库/存储)
- **部署**: Docker + Vercel

## 核心功能

### 1. 用户体系
- 手机号/微信/邮箱注册登录
- 第三方OAuth登录
- 角色权限: 游客/个人版/专业版/企业版/管理员
- 生成次数配额管理

### 2. AI生成核心功能
- 商品图上传 + 商品信息输入
- 4K超清商品主图生成
- 详情页全套图生成
- 多平台尺寸一键适配: 淘宝/天猫/京东/拼多多/抖音/小红书/亚马逊/Temu
- 集成豆包AI绘画/Flux API
- 集成通义千问API生成文案
- 商品瑕疵修复
- 多图主体一致性

### 3. 素材管理
- 云端存储
- 历史记录查看
- 二次编辑
- 批量导出
- 分类管理

### 4. 付费体系
- 新用户注册送免费额度
- 订阅制: 月卡/季卡/年卡
- 按次付费
- 企业定制版
- 微信支付/支付宝/Stripe集成
- 订单管理
- 额度自动扣减
- 续费提醒

### 5. 管理员后台
- 用户管理
- 订单管理
- 套餐配置
- 生成数据统计
- 内容审核
- 系统设置

### 6. 合规安全
- 全流程内容安全审核
- 商用版权声明
- 用户协议/隐私政策
- 接口安全防护
- SQL注入/XSS防护

## 快速开始

### 环境要求

- Node.js 20+
- npm 或 yarn
- PostgreSQL 数据库 (或使用Supabase)

### 1. 克隆项目

```bash
git clone <repository-url>
cd ecommerce-ai-saas
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置:

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容:

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 数据库URL
DATABASE_URL=postgresql://user:password@host:5432/postgres

# AI API配置
DOUBAO_API_KEY=your-doubao-api-key
FLUX_API_KEY=your-flux-api-key
TONGYI_API_KEY=your-tongyi-api-key

# 支付配置
WECHAT_PAY_MCHID=your-wechat-mchid
WECHAT_PAY_API_KEY=your-wechat-api-key
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 3. 安装依赖

```bash
npm install
```

### 4. 初始化数据库

```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库schema
npm run db:push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
.
├── prisma/                 # Prisma数据库模型
│   └── schema.prisma      # 数据库Schema定义
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API路由
│   │   │   ├── generate/ # AI生成API
│   │   │   └── users/    # 用户API
│   │   ├── dashboard/    # 仪表板页面
│   │   ├── login/        # 登录页面
│   │   ├── register/     # 注册页面
│   │   ├── globals.css   # 全局样式
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页
│   ├── components/        # React组件
│   │   └── ui/           # Shadcn UI组件
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── textarea.tsx
│   └── lib/              # 工具库
│       ├── prisma.ts     # Prisma客户端
│       ├── supabase.ts   # Supabase客户端
│       └── utils.ts      # 工具函数
├── .env.example          # 环境变量示例
├── .gitignore            # Git忽略文件
├── docker-compose.yml    # Docker Compose配置
├── Dockerfile            # Docker镜像配置
├── next.config.js        # Next.js配置
├── package.json          # 项目依赖
├── postcss.config.js     # PostCSS配置
├── tailwind.config.ts    # Tailwind CSS配置
└── tsconfig.json         # TypeScript配置
```

## Docker部署

### 使用Docker Compose

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

### 单独构建Docker镜像

```bash
# 构建镜像
docker build -t ecommerce-ai-saas .

# 运行容器
docker run -p 3000:3000 --env-file .env ecommerce-ai-saas
```

## Vercel一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

部署前请确保在Vercel项目设置中配置所有环境变量。

## 开发指南

### 数据库迁移

```bash
# 创建新迁移
npm run db:migrate

# 打开Prisma Studio
npm run db:studio
```

### 添加新的Shadcn UI组件

```bash
npx shadcn-ui@latest add [component-name]
```

### 代码规范

```bash
# 运行ESLint检查
npm run lint

# 类型检查
npx tsc --noEmit
```

## 主要API端点

### 生成相关
- `POST /api/generate` - 创建生成任务
- `GET /api/generate?generationId=xxx` - 获取生成状态

### 用户相关
- `POST /api/users` - 创建用户
- `GET /api/users` - 获取用户列表(管理员)

## 数据库模型

### 主要数据表
- `User` - 用户表
- `Plan` - 套餐配置表
- `Order` - 订单表
- `Subscription` - 订阅表
- `Generation` - AI生成记录表
- `MediaFolder` - 素材分类表
- `MediaItem` - 素材项目表
- `ApiKey` - API密钥表

详细模型定义请查看 `prisma/schema.prisma`。

## 注意事项

1. **Supabase配置**: 需要先在Supabase创建项目并获取相关密钥
2. **AI API**: 需要申请豆包AI、Flux、通义千问的API密钥
3. **支付集成**: 生产环境需要配置微信支付、支付宝、Stripe的正式账号
4. **环境变量**: 生产环境请确保所有敏感信息都存储在环境变量中，不要提交到代码仓库

## 安全建议

1. 定期更新依赖包
2. 启用Supabase的行级安全策略(RLS)
3. 配置适当的CORS策略
4. 使用HTTPS
5. 实施速率限制
6. 定期备份数据库

## 许可证

MIT License

## 联系方式

如有问题，请联系: [your-email@example.com]

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的用户认证系统
- AI图片生成核心功能
- 基础的素材管理
- 响应式设计，支持PC/移动端
