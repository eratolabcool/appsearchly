# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AppSearch** - 移动应用搜索发现平台，帮助用户发现、搜索和比较 iOS/macOS 应用。

<directory>
src/ - 源代码目录（SvelteKit + TypeScript）
  ├── components/ - 55个 UI 组件
  ├── routes/ - 16个页面路由
  ├── lib/ - 共享工具库
  ├── services/ - 业务服务层
  ├── config/ - 配置
  ├── constants/ - 常量定义
  ├── context/ - 上下文状态
  └── jet/ - Jet 框架集成
assets/ - 静态资源
static/ - 公开静态文件
shared/ - 共享模块
data/ - 数据文件
api/ - API 路由
build/ - 构建产物
</directory>

<config>
package.json - 依赖和脚本定义
vite-search.config.ts - Vite 构建配置
svelte.config.js - SvelteKit 配置
tsconfig.json - TypeScript 配置
vite.config.ts - Vite 基础配置
vercel.json - Vercel 部署配置
netlify.toml - Netlify 部署配置
.env* - 环境变量
</config>

## Technology Stack

- **Frontend**: SvelteKit 1.27 + Svelte 4 + TypeScript 5
- **Build**: Vite 4 + @sveltejs/adapter-static
- **Styling**: Native CSS + Custom utilities
- **State**: Svelte stores + Context pattern
- **Search**: iTunes API + Custom search index

## Core Architecture

### 页面路由 (16 routes)

1. **首页** (`routes/+page.svelte`) - Hero + Featured + Categories + AI Trending + Testimonials
2. **搜索** (`routes/search/`) - 应用搜索结果页
3. **应用详情** (`routes/app/[id]/`) - 单个应用详情
4. **分类** (`routes/category/`, `routes/categories/`) - 分类浏览
5. **博客** (`routes/blog/`) - 博客文章
6. **工具详情页** (`routes/tool/`) - 工具展示页
7. **关于与法律** (`routes/about/`, `terms/`, `privacy/`, `contact/`, `affiliate-disclosure/`)
8. **提交** (`routes/submit-app/`) - 提交应用
9. **评论** (`routes/reviews/`) - 应用评论
10. **替代品** (`routes/alternatives/`) - 应用替代推荐
11. **API** (`routes/api/`) - 后端 API 端点

### 核心组件

- **Hero** - 首页顶部横幅
- **FeaturedApps** - 精选应用展示
- **Categories** - 分类导航
- **TrendingAI** - AI 工具趋势
- **AppSearch** - 搜索组件
- **AppCard/AppDetail** - 应用卡片和详情
- **AnalyticsDashboard** - 数据分析仪表板
- **AdminLogin** - 管理员认证

### 状态管理

- **stores/** - Svelte stores (i18n, modal, theme)
- **context/** - Context providers (today-card, accessibility)
- **lib/** - 共享工具函数和类型定义

## Development Commands

```bash
npm run dev      # 开发服务器 (vite-search.config.ts)
npm run build    # 构建生产版本
npm run preview  # 预览构建产物
npm run check    # TypeScript 类型检查
npm run lint     # 代码格式化检查
npm run format   # 自动格式化
```

## Important Considerations

- **Search Index**: 使用 `filtered_apps.json` 和 `categorized_apps.json` 作为本地搜索索引
- **iTunes API**: 通过 `routes/api/` 端点与 iTunes API 交互
- **SEO**: 静态生成 + Server-side rendering 混合模式
- **Deployment**: 支持 Vercel 和 Netlify 部署

## File Reference Examples

When referencing files, use the relative path format:
- `src/routes/+page.svelte` - 首页
- `src/components/AppCard.svelte` - 应用卡片组件
- `src/routes/app/[id]/+page.svelte` - 应用详情页路由
- `src/stores/i18n.ts` - 国际化 store