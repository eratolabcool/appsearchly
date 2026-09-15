# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AppSearchly** - AI 应用导航与搜索发现平台。采集（Product Hunt / GitHub / HN）+ 用户提交 + 人工/自动审核 → Postgres → SEO 驱动的工具目录。目标是**每周约 2 小时人工维护的自动化运营**。

<directory>
src/ - 源代码（SvelteKit 2 + Svelte 5 + TypeScript + Tailwind 4）
  ├── routes/ - 页面路由与 API 端点（/tools/[slug] 规范路由、/blog、/admin 三页、/api/*）
  ├── lib/server/ - 服务端核心：db（Hyperdrive+pg）、data-access（DB 优先回退 JSON）、acquisition（采集管道）、articles（AI 文章）、cron（定时编排）、notify（飞书通知）
  ├── lib/connectors/ - 外部数据源连接器（github/hackernews/producthunt/rss）
  ├── lib/server/repositories/ - Postgres 仓储层（tool-repository、tool-entity-repository、admin-submission-repository）
  ├── components/ - UI 组件
  └── services/ - 提交质检、限频、Turnstile
db/migrations/ - Postgres 迁移（幂等，IF NOT EXISTS 协议）
scripts/ - 运维脚本与测试协议（test-*.mjs = node:assert + tsx + 真 Postgres）
data/ - legacy JSON 数据（apps.json/categories.json，仅作 DB 不可用时的回退）
</directory>

<config>
wrangler.jsonc - Cloudflare Workers 开发配置（worker 名 appsearchly-dev，禁止用生产名，防本地 deploy 覆盖生产）
scripts/render-production-config.mjs - 生成生产 wrangler 配置（secrets/vars 契约）
scripts/write-worker-entry.mjs - 生成 worker-entry.mjs（生成文件，勿直接改）
scripts/check-runtime-config.mjs - 运行时配置审计（CI 强制）
svelte.config.js - SvelteKit + adapter-cloudflare
package.json - 依赖与脚本
</config>

## Technology Stack

- **Frontend**: SvelteKit 2 + Svelte 5 + TypeScript 5 + Tailwind 4
- **Runtime**: Cloudflare Workers（nodejs_compat），SSR（prerender=false 为主）
- **Database**: Postgres via Hyperdrive（pg 驱动）；DB 不可用时公共读回退 data/*.json
- **AI**: Workers AI `[ai]` binding（文章生成）；AI_EXTRACTOR_ENDPOINT（采集抽取，可选）
- **通知**: 飞书机器人 webhook（LARK_WEBHOOK_URL secret）

## 核心架构

### 自动化运营流水线（每周 2 小时维护的核心）

1. **每日 cron `0 0 * * *`**：runDailyCron = runDiscovery（采集→爬官网→抽取→质量分→入 tool_import_queue）→ autoApproveImports（quality_score ≥ AUTO_APPROVE_MIN_SCORE 且无重复 → 复用 approveImport 自动发布）→ pipelineMetrics → 飞书日报。
2. **每周 cron `30 0 * * 1`**：runWeeklyArticleCron = Workers AI 生成「Top N 分类工具」榜单草稿（body 为结构化 JSON，防幻觉 slug 校验）→ articles 表（draft）→ 飞书提醒。
3. **人工审核（每周 2 小时花在这）**：/admin/pipeline 清低分 pending；/admin/articles 审核发布文章草稿；/admin/submissions 审用户提交。
4. **sitemap.xml**：SSR 动态生成（prerender=false），运行时查 DB 全部 published 工具。

### 阈值配置（wrangler vars）

`AUTO_APPROVE_MIN_SCORE=85`、`PENDING_ALERT_THRESHOLD=20`、`AUTO_APPROVE_MAX_PER_DAY=50`、`ARTICLE_MODEL=@cf/meta/llama-3.1-8b-instruct`、`ARTICLE_TOP_N=10`

### Secrets（wrangler secret put）

`LARK_WEBHOOK_URL`（必需，飞书机器人）、`ADMIN_API_TOKEN`（≥32 位）、`TURNSTILE_SECRET_KEY`；可选 `AI_EXTRACTOR_ENDPOINT` / `AI_EXTRACTOR_API_KEY`

## Development Commands

```bash
npm run dev           # 开发服务器
npm run build         # 构建（会重新生成 worker-entry.mjs）
npm run check         # svelte-check 类型检查
npm run check:runtime # 运行时配置审计
npm run db:migrate    # Postgres 迁移（幂等，需 DATABASE_URL）
npm run test:acquisition      # 采集引擎测试（需 DATABASE_URL）
npm run test:cron-automation  # 自动批准/通知/文章测试（需 DATABASE_URL）
npm run check:docs    # GEB L1/L2/L3 文档一致性
```

本地 cron 冒烟：`wrangler dev --test-scheduled` + `curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"`

## Important Considerations

- **worker-entry.mjs 是生成文件**：改 cron 逻辑必须改 `scripts/write-worker-entry.mjs` 后重新生成
- **CI 契约**：`check-runtime-config.mjs` 精确断言 cron 表达式、required secrets、worker-entry 模板内容，改动需三处同步（wrangler.jsonc / render-production-config.mjs / check-runtime-config.mjs）
- **部署**：GitHub Actions `deploy-cloudflare.yml`（手动 workflow_dispatch）+ 冒烟
- **测试协议**：无 vitest；scripts/test-*.mjs = node:assert + tsx + 真 Postgres（CI 用 Postgres 16 service）+ mockFetch/依赖注入
- **canonical 域名**：统一 www.appsearchly.com（PUBLIC_SITE_URL）
