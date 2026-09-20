# radar/
> L2 | 父级: ../CLAUDE.md（src/lib/server/）

游戏机会雷达（findly V1 核心 + V2 可用子集的移植）。每日 `0 2 * * *` 由 worker-entry scheduled 与 /api/admin/cron?job=radar 触发；DB-only（radar_games/radar_snapshots/radar_reports/radar_events，迁移 0010）。

成员清单
- pipeline.ts: 编排入口 runRadarCron — 五源并发（settleSource 单源失败降级）→ 首见查询 → 30 天快照历史 → 评分 → upsert 实体+快照+事件 → 日报入库（ON CONFLICT report_date）→ prune（35 天）→ 飞书通知；依赖注入 {fetchImpl, notifier, now}
- score.ts: 评分引擎 scoreGameOpportunities — V1 公式（heat≤35 + growth≤30 + 缺口×8 + 多源10 + seoBonus − 饱和12 + 新鲜度）+ velocity 加成（≤10，快照真数据）；OPPORTUNITY_LIMIT=15、SEO_PROBE_LIMIT=10
- gates.ts: 三重门 evaluateGates — G1 搜索需求（热度+缺口代理）/ G2 生命周期 / G3 SERP → BUILD_NOW/PRE_BUILD/HIGH_PRIORITY/WATCH_7D/IGNORE；velocity 数据不足最高 WATCH_7D
- events.ts: classifyRadarEvents — NEW_GAME/VELOCITY_BREAKOUT/CROSS_PLATFORM/WIKI/GUIDE/TOOL/DATABASE_GAP（7 种可计算事件）
- recommendations.ts: buildRecommendations — 决策+事件+标签 → actions/sections/tools 规则表
- velocity.ts: computeVelocity — 24h/72h/7d/14d/30d 多窗口（baseline 取最近历史点，rank 升榜为正，null ≠ 0）
- normalize.ts: normalizeEntityKey/normalizeTitle/slugifyTitle + parseReleaseDate/daysSince/formatAgeLabel
- report.ts: formatRadarLarkReport — 纯文本飞书日报（top5 + 源健康 + 事件，<4KB）
- types.ts: RadarSignal/RadarOpportunity/SourceHealth/RadarDigest/VelocitySummary/GateSummary 等领域类型
- sources/steam.ts: ISteamChartsService top40 + appdetails 名称补全（5 并发批量）
- sources/roblox.ts: explore-api trending/upcoming + games.roblox.com 批量补全（40/批）
- sources/itch.ts: itch.io RSS 单 fetch（regex 解析）
- sources/cocrea.ts: cocrea.world 公开项目 API 单 fetch
- sources/playhop.ts: playhop.com 热门游戏 API 单 fetch
- sources/seo-gap.ts: analyzeSeoGap — allintitle 启发式 + HEAD 探测 fandom/wiki.gg（3.5s timeout，永不抓正文）

子请求预算：steam 1+8 批、roblox 2、itch/cocrea/playhop 各 1、seo-gap ≤20、Lark 1 → ~35 < 50（CF 免费版上限）。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
