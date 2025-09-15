# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **ImagePrompt.He** - an image-to-prompt generator built on the Saasfly SaaS boilerplate. It's a Next.js 14 monorepo with TypeScript, featuring internationalization (i18n), authentication, and AI-powered image processing capabilities.

## Key Development Commands

### Core Development
```bash
# Install dependencies (uses Bun as package manager)
bun install

# Start development server
bun run dev:web

# Alternative development server (with specific port)
cd /Users/zhaohe/Documents/workspace/img-prompt/apps/nextjs && PORT=3000 bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Code Quality
```bash
# Run all checks (lint, typecheck, format)
bun run lint
bun run typecheck
bun run format:fix

# Check dependency version consistency
bun run check-deps
```

### Database
```bash
# Push database schema (requires .env.local with POSTGRES_URL)
bun db:push
```

## Architecture Overview

### Monorepo Structure
- **`apps/nextjs/`** - Main Next.js application with App Router
- **`packages/`** - Shared packages (api, auth, db, ui, stripe, common)
- **`tooling/`** - Shared configurations (eslint, prettier, tailwind, typescript)

### Key Technologies
- **Next.js 14** with App Router and Server Components
- **TypeScript** with strict configuration
- **Tailwind CSS** for styling
- **tRPC** for type-safe API routes
- **NextAuth.js** for authentication (migrated from Clerk)
- **PostgreSQL** with Kysely query builder
- **i18n** with support for EN, ZH, JA, KO
- **Coze API** for AI-powered image-to-prompt generation

### Environment Configuration
- **`apps/nextjs/src/env.mjs`** - Environment variables validation with Zod
- **`.env.local`** - Local environment variables (copy from .env.example)
- **Required env vars**: POSTGRES_URL, NEXTAUTH_SECRET, GITHUB_CLIENT_ID/SECRET, STRIPE_API_KEY, COZE_ACCESS_TOKEN

## Core Application Structure

### App Router Structure
```
apps/nextjs/src/app/[lang]/
├── (auth)/           # Authentication pages (login, register)
├── (dashboard)/      # User dashboard and billing
├── (docs)/           # Documentation pages
├── (editor)/         # Editor functionality
├── (marketing)/     # Marketing pages including homepage
├── (tools)/          # Tool pages including image-to-prompt
└── admin/           # Admin dashboard
```

### Image-to-Prompt Feature
The core feature is located in `apps/nextjs/src/app/[lang]/(tools)/image-to-prompt/`:

**Key Components:**
- `page.tsx` - Main page with server-side metadata
- `client.tsx` - Client component managing state and UI
- `components/` - Feature-specific components:
  - `image-upload-section.tsx` - File upload with drag-and-drop
  - `image-preview-section.tsx` - Image preview
  - `model-selection.tsx` - AI model selection (General, Flux, Midjourney, Stable Diffusion)
  - `prompt-generator.tsx` - Prompt generation controls

**API Routes:**
- `/api/coze/upload` - File upload to Coze platform
- `/api/coze/workflow` - Coze workflow execution for prompt generation

### Authentication System
- **NextAuth.js** with GitHub OAuth and Email Magic Link providers
- **KyselyAdapter** for database integration
- **tRPC context** handles authentication via JWT tokens
- **Public routes**: Tools accessible without login, admin requires authentication

### Database Schema
- **PostgreSQL** with Prisma schema management
- **User management** via NextAuth.js
- **Subscription handling** with Stripe integration

## Development Guidelines

### Component Development
- Use **server components** by default for better performance
- **Client components** only when interactivity is needed
- Import components from `@saasfly/ui` package for consistency
- Follow existing component patterns and naming conventions

### Internationalization
- Content in `apps/nextjs/src/config/dictionaries/` (en.json, zh.json, ja.json, ko.json)
- Use `getDictionary(lang)` function for content access
- Dictionary structure: nested objects for feature organization
- ImagePrompt content under `dict.imageprompt` namespace

### Styling
- **Tailwind CSS** with custom config in `tooling/tailwind-config/`
- **UI components** from `@saasfly/ui` package
- **Color scheme**: Purple-based theme for brand consistency
- **Responsive design**: Mobile-first with breakpoints

### API Development
- **tRPC** for internal type-safe APIs
- **Next.js API routes** for external integrations (Coze)
- **Environment validation** using `@t3-oss/env-nextjs`
- **Error handling** with proper HTTP status codes

### State Management
- **Zustand** for client-side state
- **React Query** for server state and caching
- **Local state** with useState for component-specific data

## Important Implementation Notes

### Coze API Integration
- **File upload**: `/api/coze/upload` → `https://api.coze.cn/v1/files/upload`
- **Workflow execution**: `/api/coze/workflow` → `https://api.coze.cn/v1/workflow/run`
- **Authentication**: Bearer token from `COZE_ACCESS_TOKEN` env var
- **Parameters**: Model selection maps to promptType (Normal, Flux, Midjourney, StableDiffusion)

### File Upload Validation
- **Supported formats**: PNG, JPG, WEBP
- **Max size**: 5MB
- **Validation**: Client-side + server-side checks

### Admin Dashboard
- **Access**: `/admin/dashboard` (requires ADMIN_EMAIL env var)
- **Features**: Static pages only (alpha stage)
- **Security**: Email-based access control

## Testing and Deployment

### Testing Commands
```bash
# Run type checking
bun run typecheck

# Run linting
bun run lint

# Check dependency consistency
bun run check-deps
```

### Deployment
- **Vercel** configuration in `vercel.json`
- **Build command**: `turbo run build --filter=@saasfly/nextjs`
- **Install command**: `bun install`
- **Output directory**: `apps/nextjs/.next`

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Set up PostgreSQL database connection
3. Configure authentication providers (GitHub, Email)
4. Set up Stripe keys for payments
5. Configure Coze API access token

## Key Files to Understand

- **`turbo.json`** - Build pipeline and workspace configuration
- **`apps/nextjs/src/env.mjs`** - Environment variables schema
- **`packages/auth/nextauth.ts`** - Authentication configuration
- **`packages/api/src/trpc.ts`** - tRPC context and setup
- **`apps/nextjs/src/middleware.ts`** - Route protection and i18n
- **`packages/db/prisma/schema.prisma`** - Database schema definition