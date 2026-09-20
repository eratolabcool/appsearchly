# src/lib/
> L2 | 父级: /CLAUDE.md

成员清单 (共享库，核心在 server/ 子模块)

server/ - 服务端核心子模块（db / data-access / acquisition / articles / cron / notify / repositories），见 src/lib/server/ 职责清单
connectors/ - 外部数据源连接器（github / hackernews / producthunt / rss），统一 fetchTools 接口，支持 fetchImpl 注入
stores/ - 客户端状态（admin token、i18n、modal、theme）
types.ts - 全局 TypeScript 类型定义

server/ 关键成员
- server/db.ts - pg Client + Hyperdrive 连接层，withDatabase/queryRows/probeDatabase
- server/data-access.ts - 统一读层：DB 优先，回退 data/*.json（ToolCardDisplay 等展示类型在此）
- server/acquisition/pipeline.ts - 采集编排：runDiscovery / listImports / approveImport / rejectImport / autoApproveImports（质量分自动批准；聚合站域名黑名单永不自动发布；23505 唯一冲突降级为重复拒绝）
- server/acquisition/quality.ts - 质量分 0-100（websiteAvailable/description/logo/category/features/pricing）
- server/acquisition/dedupe.ts - 域名精确匹配 + 名字 Jaccard ≥0.82 判重
- server/acquisition/crawler.ts / extractor.ts - 官网爬取与数据抽取
- server/articles.ts - AI 文章数据层（draft/published、结构化 JSON body、防幻觉水合）
- server/article-generator.ts - Workers AI 榜单生成（aiRun 注入、失败重试 1 次）
- server/cron.ts - 定时编排层：runDailyCron（采集+自动批准+飞书日报，失败也发降级报告）、runWeeklyArticleCron
- server/notify.ts - 飞书 webhook 通知（createLarkNotifier/formatDailyReport，永不抛）
- server/guides.ts - 硬编码 5 篇 guide（文章兜底渲染源）
- server/repositories/ - Postgres 仓储：tool-repository（createPublishedTool/slugify/generateUniqueSlug，发布时同步写 categories+tool_categories 关联保证分类页可见）、tool-entity-repository、admin-submission-repository
- server/admin-auth.ts - Bearer ADMIN_API_TOKEN 恒时比较
- server/submission-pipeline.ts - 用户提交管道（Turnstile/黑名单/限频）

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
