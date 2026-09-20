-- 回填：将 tools.category 文本列同步进 categories / tool_categories 关联表
-- 背景：createPublishedTool 历史上只写 tools.category 文本，分类页统计与筛选
-- 走 tool_categories 关联表，导致已发布工具在分类下不可见。
-- slug 生成规则与 src/lib/server/repositories/tool-repository.ts 的 slugify 保持一致。

BEGIN;

-- 1) 为 distinct tools.category 补建 categories 行（幂等：slug/name 唯一冲突跳过）
INSERT INTO categories (slug, name)
SELECT DISTINCT
  regexp_replace(regexp_replace(lower(trim(t.category)), '[^a-z0-9]+', '-', 'g'), '^-+|-$', '') AS slug,
  trim(t.category) AS name
FROM tools t
WHERE t.category IS NOT NULL AND trim(t.category) <> ''
ON CONFLICT DO NOTHING;

-- 2) 补建 tool_categories 关联（幂等：复合主键冲突跳过）
INSERT INTO tool_categories (tool_id, category_id)
SELECT DISTINCT
  t.id,
  c.id
FROM tools t
JOIN categories c
  ON c.slug = regexp_replace(regexp_replace(lower(trim(t.category)), '[^a-z0-9]+', '-', 'g'), '^-+|-$', '')
WHERE t.category IS NOT NULL AND trim(t.category) <> ''
ON CONFLICT DO NOTHING;

COMMIT;
