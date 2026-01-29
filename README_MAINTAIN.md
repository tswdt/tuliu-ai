# tuliu-ai 项目维护手册

**作者**: Manus AI
**日期**: 2026年1月29日

本手册旨在记录 tuliu-ai 项目的核心架构、启动流程以及最近一次功能迭代（认证逻辑重构）的关键信息，以便于后续的快速接管和维护。

## 1. 项目概览与技术栈

| 模块 | 技术栈 | 描述 |
| :--- | :--- | :--- |
| **前端** | Vite, React, TypeScript, TailwindCSS, wouter | 基于 Vite 的现代前端架构，使用 wouter 进行路由管理。 |
| **后端** | Node.js, Express, tRPC, TypeScript | 使用 tRPC 实现类型安全的 API，Express 作为底层 HTTP 框架。 |
| **数据库** | Drizzle ORM, MySQL/TiDB | 使用 Drizzle ORM 进行数据库操作，Schema 定义清晰。 |
| **认证** | Email OTP (用户名+密码+邮箱验证码) | 最近一次迭代已将 OAuth 替换为更传统的邮箱验证码登录流程。 |

## 2. 环境初始化与启动

### 2.1. 仓库克隆

请使用提供的 Token 进行克隆，确保包含所有历史记录和分支。

\`\`\`bash
git clone https://ghp_3du4A8G2CYDZwqiMKFsgc1XMWhLT12KyFfO@github.com/tswdt/tuliu-ai.git
cd tuliu-ai
\`\`\`

### 2.2. 依赖安装与启动

项目使用 `pnpm` 进行包管理。

\`\`\`bash
pnpm install
npm run dev
\`\`\`

**注意**:
1.  启动命令 `npm run dev` 会同时启动前端和后端服务。
2.  后端服务默认运行在 `http://localhost:3000`。
3.  前端通过 Vite 代理访问后端 tRPC 接口。

## 3. 核心架构文件

| 模块 | 文件/目录 | 描述 |
| :--- | :--- | :--- |
| **前端入口** | `client/src/App.tsx` | 前端路由配置和主组件。使用 `<Switch>` 和 `<Route>` (wouter)。 |
| **后端路由** | `server/routers/` | 所有 tRPC 路由的定义目录。 |
| **认证路由** | `server/routers/authRouter.ts` | 包含 `sendOtp`, `verifyOtp`, `me`, `logout` 等认证核心逻辑。 |
| **数据库 Schema** | `drizzle/schema.ts` | Drizzle ORM 的表结构定义，包括 `users`, `otpRecords` 等。 |
| **环境变量** | `client/src/const.ts` | 前端环境变量配置和容错处理。 |

## 4. 关键逻辑变更：认证重构

项目已从 **Manus OAuth** 切换到 **邮箱验证码 (Email OTP)** 登录/注册流程。

### 4.1. 流程概览

1.  **发送 OTP**: 用户输入邮箱，调用 `authRouter.sendOtp`。
    *   后端生成 6 位数字 OTP。
    *   OTP 记录在 `otpRecords` 表中，有效期 10 分钟。
    *   通过 `emailService` 发送邮件。
2.  **验证与登录**: 用户输入邮箱和 OTP，调用 `authRouter.verifyOtp`。
    *   后端检查 `otpRecords` 表中是否存在有效的 OTP 记录。
    *   验证成功后，删除 OTP 记录。
    *   根据邮箱在 `users` 表中查找用户，如果不存在则创建新用户（注册）。
    *   设置会话 Cookie (逻辑在 `server/_core/cookies.ts` 和 `server/_core/trpc.ts` 的 `createContext` 中处理)。

### 4.2. 数据库变更

*   **`users` 表**: 字段 `openId` 仍然存在，但现在用于存储 `email-{user.email}` 格式的唯一标识符，以保持与旧架构的兼容性。
*   **`otpRecords` 表**: 新增表，用于存储 `email`, `otp`, `expiresAt`。

## 5. 已知环境坑点与修复

**问题**: 启动后前端报错 `TypeError: Failed to construct 'URL': Invalid URL`。

**原因**: 前端 `client/src/const.ts` 中的 `getLoginUrl` 函数在没有设置 `VITE_OAUTH_PORTAL_URL` 环境变量时，尝试使用 `new URL(undefined + "/app-auth")` 导致构造 URL 失败。

**修复**: 已在 `client/src/const.ts` 中添加容错处理，确保 `oauthPortalUrl` 变量在未定义时回退到 `window.location.origin`，并使用 `try-catch` 块捕获 URL 构造错误。

\`\`\`typescript
// client/src/const.ts (修复后的关键代码)
export const getLoginUrl = () => {
  // 添加容错：如果环境变量未设置，则使用当前页面的 origin
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || window.location.origin;
  const appId = import.meta.env.VITE_APP_ID || "default";
  // ... 其他逻辑

  try {
    const url = new URL(\`${oauthPortalUrl}/app-auth\`);
    // ... 设置 searchParams
    return url.toString();
  } catch (e) {
    console.error("Failed to construct login URL:", e);
    return "#"; // 失败时返回安全链接
  }
};
\`\`\`
