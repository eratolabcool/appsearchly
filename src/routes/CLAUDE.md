# src/routes/
> L2 | 父级: /CLAUDE.md

成员清单 (16+ 路由模块)

首页与发现
- +page.svelte / +page.server.ts - 首页（搜索优先 + 分类宫格 + Trending），SSR 数据驱动
- trending/+page.svelte / +page.server.ts - 趋势工具页（trending/popular/latest 排序）

搜索与详情
- search/+page.svelte / +page.server.ts - 搜索页（URL 驱动过滤：q/category/pricing/sort）
- tools/[slug]/+page.svelte / +page.server.ts - 工具详情页（规范路由）
- tool/[slug]/+page.server.ts - 遗留路由，301 → /tools/[slug]
- app/[slug]/+page.server.ts - 遗留路由，301 → /tools/[slug]

分类与浏览
- categories/+page.svelte / +page.server.ts - 分类索引页
- category/[slug]/+page.svelte / +page.server.ts - 分类详情页（子分类 chips 导航）

内容与指南
- blog/+page.svelte / +page.server.ts - AI 工具榜单指南列表
- blog/[slug]/+page.svelte / +page.server.ts - 榜单文章页（数据驱动）
- reviews/+page.svelte / +page.server.ts - Top Rated AI Tools（真实评分数据）
- alternatives/+page.svelte / +page.server.ts - 热门工具替代品（同分类真实工具）

提交与互动
- submit/+page.svelte / +page.server.ts - 提交工具表单（Turnstile 保护）
- submit-app/+page.server.ts - 遗留路由，301 → /submit

信息与法律
- about/+page.svelte - 关于页面
- contact/+page.svelte - 联系表单
- terms/+page.svelte - 服务条款
- privacy/+page.svelte - 隐私政策
- affiliate-disclosure/+page.svelte - 联盟披露声明

API 端点
- api/search - 搜索 API（走统一数据层，DB/JSON 双模式）
- api/tools - 工具列表 API
- api/tools/[slug] - 工具详情 API
- api/category/[slug] - 分类 API
- api/featured-apps - 热门工具 API（真实数据）
- api/trending-apps - 趋势工具 API（真实数据）
- api/submissions / api/submit-app - 提交管道
- api/health - 健康检查
- api/internal/data-parity - 数据一致性校验
- api/admin/imports/[id]/approve - 采集队列审批（ADMIN_API_TOKEN）
- api/admin/articles - 文章列表（GET）；api/admin/articles/[id] - 删除（DELETE）；api/admin/articles/[id]/publish - 发布（POST）

Admin 页面
- admin/pipeline - 采集管道看板（approve/reject、discovery 手动触发）
- admin/submissions - 用户提交审核
- admin/tools - 工具管理
- admin/articles - AI 文章草稿审核（Publish/Delete）

数据访问
- 所有公共读操作经 $lib/server/data-access（有 Hyperdrive 走 Postgres，否则回退 data/*.json）

SEO
- sitemap.xml/+server.ts - SSR 动态站点地图（prerender=false），运行时查 DB 列出全部 published 工具，DB 不可用降级仅静态路径
- robots.txt - 爬虫规则

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
