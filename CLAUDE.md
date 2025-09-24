# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是 **ImagePrompt.He** - 一个基于 Saasfly SaaS 样板构建的图像到提示词生成器。这是一个使用 TypeScript 的 Next.js 14 单体仓库，具有国际化（i18n）、身份验证和 AI 驱动的图像处理功能。

## 重要提示

**请使用中文进行所有交流和输出**

## 关键开发命令

### 核心开发
```bash
# 安装依赖（使用 Bun 作为包管理器）
bun install

# 启动开发服务器
bun run dev:web

# 备用开发服务器（指定端口）
cd /Users/zhaohe/Documents/workspace/img-prompt/apps/nextjs && PORT=3000 bun run dev

# 构建生产版本
bun run build

# 启动生产服务器
bun run start
```

### 代码质量
```bash
# 运行所有检查（lint, typecheck, format）
bun run lint
bun run typecheck
bun run format:fix

# 检查依赖版本一致性
bun run check-deps
```

### 数据库
```bash
# 推送数据库架构（需要 .env.local 中的 POSTGRES_URL）
bun db:push
```

## 架构概述

### 单体仓库结构
- **`apps/nextjs/`** - 使用 App Router 的主要 Next.js 应用程序
- **`packages/`** - 共享包（api, auth, db, ui, stripe, common）
- **`tooling/`** - 共享配置（eslint, prettier, tailwind, typescript）

### 核心技术
- **Next.js 14** 使用 App Router 和 Server Components
- **TypeScript** 严格配置
- **Tailwind CSS** 用于样式
- **tRPC** 用于类型安全的 API 路由
- **NextAuth.js** 用于身份验证（从 Clerk 迁移）
- **PostgreSQL** 使用 Kysely 查询构建器
- **i18n** 支持 EN, ZH, JA, KO
- **Coze API** 用于 AI 驱动的图像到提示词生成

### 环境配置
- **`apps/nextjs/src/env.mjs`** - 使用 Zod 进行环境变量验证
- **`.env.local`** - 本地环境变量（从 .env.example 复制）
- **必需的环境变量**: POSTGRES_URL, NEXTAUTH_SECRET, GITHUB_CLIENT_ID/SECRET, STRIPE_API_KEY, COZE_ACCESS_TOKEN

## 核心应用程序结构

### App Router 结构
```
apps/nextjs/src/app/[lang]/
├── (auth)/           # 身份验证页面（登录、注册）
├── (dashboard)/      # 用户仪表板和计费
├── (docs)/           # 文档页面
├── (editor)/         # 编辑器功能
├── (marketing)/     # 营销页面包括主页
├── (tools)/          # 工具页面包括图像到提示词
└── admin/           # 管理员仪表板
```

### 图像到提示词功能
核心功能位于 `apps/nextjs/src/app/[lang]/(tools)/image-to-prompt/`：

**关键组件：**
- `page.tsx` - 带有服务器端元数据的主页面
- `client.tsx` - 管理状态和 UI 的客户端组件
- `components/` - 功能特定组件：
  - `image-upload-section.tsx` - 拖放文件上传
  - `image-preview-section.tsx` - 图像预览
  - `model-selection.tsx` - AI 模型选择（通用、Flux、Midjourney、Stable Diffusion）
  - `prompt-generator.tsx` - 提示词生成控件

**API 路由：**
- `/api/coze/upload` - 文件上传到 Coze 平台
- `/api/coze/workflow` - Coze 工作流执行用于提示词生成

### 身份验证系统
- **NextAuth.js** 使用 GitHub OAuth 和电子邮件魔法链接提供程序
- **KyselyAdapter** 用于数据库集成
- **tRPC 上下文** 通过 JWT 令牌处理身份验证
- **公共路由**: 工具无需登录即可访问，管理员需要身份验证

### 数据库架构
- **PostgreSQL** 使用 Prisma 架构管理
- **用户管理** 通过 NextAuth.js
- **订阅处理** 与 Stripe 集成

## 开发指南

### 组件开发
- 默认使用 **服务器组件** 以获得更好的性能
- 仅在需要交互性时使用 **客户端组件**
- 从 `@saasfly/ui` 包导入组件以保持一致性
- 遵循现有的组件模式和命名约定

### 国际化
- 内容位于 `apps/nextjs/src/config/dictionaries/` (en.json, zh.json, ja.json, ko.json)
- 使用 `getDictionary(lang)` 函数访问内容
- 字典结构：用于功能组织的嵌套对象
- ImagePrompt 内容位于 `dict.imageprompt` 命名空间下

### 样式
- **Tailwind CSS** 使用 `tooling/tailwind-config/` 中的自定义配置
- **UI 组件** 来自 `@saasfly/ui` 包
- **配色方案**: 基于紫色的主题以保持品牌一致性
- **响应式设计**: 移动优先，具有断点

### API 开发
- **tRPC** 用于内部类型安全的 API
- **Next.js API 路由** 用于外部集成（Coze）
- 使用 `@t3-oss/env-nextjs` 进行 **环境验证**
- 使用适当的 HTTP 状态代码进行 **错误处理**

### 状态管理
- **Zustand** 用于客户端状态
- **React Query** 用于服务器状态和缓存
- **本地状态** 使用 useState 处理组件特定数据

## 重要实现说明

### Coze API 集成
- **文件上传**: `/api/coze/upload` → `https://api.coze.cn/v1/files/upload`
- **工作流执行**: `/api/coze/workflow` → `https://api.coze.cn/v1/workflow/run`
- **身份验证**: 来自 `COZE_ACCESS_TOKEN` 环境变量的 Bearer 令牌
- **参数**: 模型选择映射到 promptType（通用、Flux、Midjourney、Stable Diffusion）

### 文件上传验证
- **支持的格式**: PNG, JPG, WEBP
- **最大大小**: 5MB
- **验证**: 客户端 + 服务器端检查

### 管理员仪表板
- **访问**: `/admin/dashboard`（需要 ADMIN_EMAIL 环境变量）
- **功能**: 仅静态页面（alpha 阶段）
- **安全性**: 基于电子邮件的访问控制

## 测试和部署

### 测试命令
```bash
# 运行类型检查
bun run typecheck

# 运行代码检查
bun run lint

# 检查依赖一致性
bun run check-deps
```

### 部署
- **Vercel** 配置在 `vercel.json` 中
- **构建命令**: `turbo run build --filter=@saasfly/nextjs`
- **安装命令**: `bun install`
- **输出目录**: `apps/nextjs/.next`

### 环境设置
1. 将 `.env.example` 复制到 `.env.local`
2. 设置 PostgreSQL 数据库连接
3. 配置身份验证提供程序（GitHub、电子邮件）
4. 设置支付密钥用于 Stripe
5. 配置 Coze API 访问令牌

## 需要理解的关键文件

- **`turbo.json`** - 构建管道和工作区配置
- **`apps/nextjs/src/env.mjs`** - 环境变量架构
- **`packages/auth/nextauth.ts`** - 身份验证配置
- **`packages/api/src/trpc.ts`** - tRPC 上下文和设置
- **`apps/nextjs/src/middleware.ts`** - 路由保护和国际化
- **`packages/db/prisma/schema.prisma`** - 数据库架构定义