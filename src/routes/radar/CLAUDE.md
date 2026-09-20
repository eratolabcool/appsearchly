# radar/
> L2 | 父级: ../CLAUDE.md

游戏机会雷达前台页（DB-only，无 JSON 回退；DB 不可用/未运行渲染空态；prerender=false）

成员清单
- +page.server.ts: hub 数据层 — 最新 radar_reports 行 + top5 radar_games（is_opportunity 按 score DESC）
- +page.svelte: hub 页 — 日报摘要（状态/源健康/opportunity_count）+ top5 机会卡（score/decision 徽章/velocity/平台/缺口）
- display.ts: RadarGameDisplay/RadarReportDisplay 展示类型 + DECISION_LABELS/DECISION_BADGES（两页共用）
- games/+page.server.ts: 完整榜单数据层 — top 50 radar_games
- games/+page.svelte: 完整榜单页 — score、decision chip、三重门徽章、SEO 缺失资产 chips、thesis

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
