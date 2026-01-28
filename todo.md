# Tuliu AI - 项目 TODO

## Phase 1: 项目初始化与环境配置
- [x] 初始化 Next.js 14 + Prisma + SQLite 项目
- [x] 配置环境变量 (.env)：SiliconFlow API、邮件服务、数据库
- [x] 安装核心依赖：sharp、nodemailer、openai

## Phase 2: 数据库设计与 Prisma Schema 配置
- [x] 设计 User 表（email, credits, role, OTP 相关字段）
- [x] 设计 OTPRecord 表（邮箱、验证码、过期时间）
- [x] 设计 Transaction 表（用户、积分变化、类型、时间戳）
- [x] 设计 GeneratedImage 表（用户、原始 prompt、生成图片 URL、尺寸、积分消耗）
- [x] 运行 pnpm db:push 推送数据库迁移

## Phase 3: 构建赛博朋克首页视觉层（Hero + Case Gallery）
- [x] 设计赛博朋克色彩系统（深黑、霓虹粉、电子青色）
- [x] 创建 Navbar 组件（Logo、Pricing、Login）
- [x] 创建 Hero Section（主标题、副标题、CTA 按钮）
- [x] 创建 Case Gallery 组件（瀑布流/轮播图）
- [x] 实现 Before/After 滑块对比效果
- [x] 添加高质量占位图（4-6 组电商案例）
- [x] 应用霓虹光效和玻璃拟态样式

## Phase 4: 实现邮箱验证码登录系统
- [x] 创建 OTP 发送接口（/api/trpc/auth.sendOtp）
- [x] 创建 OTP 验证接口（/api/trpc/auth.verifyOtp）
- [x] 创建登录表单页面（邮箱输入 → OTP 输入）
- [x] 集成 nodemailer 发送验证码邮件
- [x] 实现会话管理和 JWT 认证

## Phase 5: 开发 AI 翻译与生图核心引擎
- [x] 创建 SiliconFlow API 客户端
- [x] 实现中文 → 英文 Prompt 翻译接口（调用 Qwen）
- [x] 实现 AI 生图接口（调用 flux-pro/flux-dev）
- [x] 处理生成过程中的错误和超时

## Phase 6: 实现水印处理与积分交易系统
- [x] 实现 sharp 水印处理引擎
- [x] Trial 版规则：720p + 中央半透明「Tuliu Preview」水印
- [x] Paid 版规则：返回无水印原图
- [x] 实现分级扣费逻辑（Trial/Standard/HD/Ultra）
- [x] 使用 Prisma.$transaction 保证扣费原子性
- [x] 实现补差价升级功能

## Phase 7: 构建用户 Dashboard 与管理后台
- [ ] 创建 Dashboard 页面（左侧参数栏、中间画布）
- [ ] 实现空白状态快捷入口（点击案例一键填入 Prompt）
- [ ] 创建 /admin 管理后台（仅 admin 访问）
- [ ] 实现数据看板（用户数、GMV）
- [ ] 实现用户列表（手动充值、封号）

## Phase 8: 邮件通知系统与全流程集成
- [x] 注册时发送欢迎邮件（包含初始积分信息）
- [x] 积分不足时发送提醒邮件
- [ ] 升级套餐时发送确认邮件
- [ ] 向管理员发送用户注册通知
- [ ] 向管理员发送 GMV 统计邮件

## Phase 9: 全流程测试与优化部署
- [ ] 编写 vitest 单元测试（OTP、支付、生图）
- [ ] 集成测试（登录 → 生图 → 扣费全流程）
- [ ] 性能优化（缓存、CDN、图片压缩）
- [ ] 安全审计（SQL 注入、XSS、CSRF）
- [ ] 部署到生产环境

## 已完成功能
- 赛博朋克首页设计和视觉效果
- 邮箱验证码登录系统
- AI 翻译和生图服务集成
- 水印处理引擎
- 积分交易系统架构
- 邮件通知服务

## 待实现功能
- 用户 Dashboard
- 管理后台
- 单元测试
- 性能优化
