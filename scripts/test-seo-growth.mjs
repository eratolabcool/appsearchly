import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assessCategoryIndexability, assessToolIndexability, comparisonPath } from '../src/lib/server/seo/content.ts';

const strongTool = {
  description: 'A sufficiently detailed AI software description that explains the product, audience, workflows, and primary benefits for buyers.',
  categories: [{ id: 'c1', name: 'Writing', slug: 'writing', icon: null }],
  features: [{ id: 'f1', name: 'Generation', slug: 'generation' }],
  alternatives: [{}, {}]
};
assert.equal(assessToolIndexability(strongTool).indexable, true);
assert.equal(assessToolIndexability({ ...strongTool, description: 'Too short' }).indexable, false);
assert.equal(assessCategoryIndexability(3, 'A useful category description with enough detail for search visitors.').indexable, true);
assert.equal(assessCategoryIndexability(2, 'A useful category description with enough detail for search visitors.').indexable, false);
assert.equal(comparisonPath({ slug: 'alpha' }, { slug: 'beta' }), '/compare/alpha-vs-beta');

for (const path of [
  'src/routes/alternatives/[slug]/+page.server.ts',
  'src/routes/alternatives/[slug]/+page.svelte',
  'src/routes/compare/[comparison]/+page.server.ts',
  'src/routes/compare/[comparison]/+page.svelte',
  'src/routes/sitemap.xml/+server.ts',
  'src/routes/robots.txt/+server.ts'
]) assert.equal(fs.existsSync(path), true, `${path} must exist`);

const alternativesPage = fs.readFileSync('src/routes/alternatives/[slug]/+page.svelte', 'utf8');
const comparisonPage = fs.readFileSync('src/routes/compare/[comparison]/+page.svelte', 'utf8');
assert.match(alternativesPage, /noindex,follow/);
assert.match(alternativesPage, /ItemList/);
assert.match(comparisonPage, /SoftwareApplication/);
assert.match(comparisonPage, /noindex,follow/);
console.log('SEO growth regression contracts passed');
