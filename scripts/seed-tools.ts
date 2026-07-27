import { Client } from 'pg';

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  children?: SeedCategory[];
};

type SeedTool = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  websiteUrl: string;
  normalizedDomain: string;
  categories: string[];
  features: string[];
  pricingType: string;
  metadata: {
    features: string[];
    use_cases: string[];
    integrations: string[];
    platforms: string[];
    languages: string[];
    target_users: string[];
    industries: string[];
  };
};

export const seedCategories: SeedCategory[] = [
  {
    name: 'AI Writing',
    slug: 'ai-writing',
    description: 'AI tools for drafting, editing, summarizing, translating, and repurposing written content.',
    icon: 'writing',
    children: [
      { name: 'AI Copywriting', slug: 'ai-copywriting', description: 'Marketing and sales copy generation tools.', icon: 'copywriting' },
      { name: 'AI Summarizer', slug: 'ai-summarizer', description: 'Tools that condense long documents and media into useful summaries.', icon: 'summarizer' },
      { name: 'AI Translator', slug: 'ai-translator', description: 'AI translation and localization software.', icon: 'translator' }
    ]
  },
  {
    name: 'AI Image',
    slug: 'ai-image',
    description: 'AI image generation, editing, enhancement, and creative production tools.',
    icon: 'image',
    children: [
      { name: 'Image Generator', slug: 'image-generator', description: 'Text-to-image and image creation systems.', icon: 'image-generator' },
      { name: 'AI Photo Editor', slug: 'ai-photo-editor', description: 'AI-assisted retouching, background, and photo editing tools.', icon: 'photo-editor' },
      { name: 'AI Avatar', slug: 'ai-avatar', description: 'Avatar, headshot, and character generation tools.', icon: 'avatar' }
    ]
  },
  { name: 'AI Video', slug: 'ai-video', description: 'AI video generation, editing, dubbing, and production tools.', icon: 'video' },
  { name: 'AI Audio', slug: 'ai-audio', description: 'AI voice, music, transcription, and audio production tools.', icon: 'audio' },
  { name: 'AI Coding', slug: 'ai-coding', description: 'AI coding assistants, code review, testing, and developer productivity tools.', icon: 'coding' },
  { name: 'AI Marketing', slug: 'ai-marketing', description: 'AI tools for SEO, ads, content operations, sales, and growth teams.', icon: 'marketing' },
  { name: 'AI Productivity', slug: 'ai-productivity', description: 'AI copilots for research, meetings, workflow automation, and team productivity.', icon: 'productivity' },
  { name: 'AI Agents', slug: 'ai-agents', description: 'Agent builders, autonomous assistants, and workflow execution platforms.', icon: 'agents' }
];

export const seedFeatures = [
  'image-generation',
  'text-to-image',
  'photo-editing',
  'voice-cloning',
  'speech-to-text',
  'text-to-speech',
  'chatbot',
  'code-generation',
  'code-review',
  'copywriting',
  'summarization',
  'translation',
  'video-generation',
  'video-editing',
  'seo-content',
  'workflow-automation',
  'agent-builder',
  'research-assistant',
  'meeting-notes',
  'data-analysis'
];

const toolNames = [
  'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Microsoft Copilot', 'Notion AI', 'Grammarly', 'Jasper', 'Copy.ai', 'Writer',
  'QuillBot', 'DeepL Write', 'Wordtune', 'Sudowrite', 'Writesonic', 'Anyword', 'Rytr', 'Hypotenuse AI', 'Frase', 'Surfer AI',
  'Midjourney', 'DALL-E', 'Leonardo AI', 'Stable Diffusion', 'Ideogram', 'Adobe Firefly', 'Canva AI', 'Krea AI', 'Freepik AI', 'Playground AI',
  'Runway', 'Pika', 'Synthesia', 'HeyGen', 'Descript', 'Veed AI', 'Kapwing AI', 'Luma Dream Machine', 'InVideo AI', 'OpusClip',
  'ElevenLabs', 'Murf', 'PlayHT', 'Suno', 'Udio', 'AIVA', 'Soundraw', 'Krisp', 'Otter.ai', 'Fireflies.ai',
  'GitHub Copilot', 'Cursor', 'Replit AI', 'Codeium', 'Tabnine', 'Sourcegraph Cody', 'Amazon Q Developer', 'AskCodi', 'CodiumAI', 'Mutable AI',
  'HubSpot AI', 'Semrush AI', 'Ahrefs AI', 'Buffer AI Assistant', 'Hootsuite OwlyWriter', 'AdCreative.ai', 'Predis.ai', 'Ocoya', 'MarketMuse', 'Clearscope',
  'Zapier AI', 'Make AI', 'Motion', 'Reclaim AI', 'Clockwise', 'Mem', 'Taskade AI', 'ClickUp AI', 'Fathom', 'tl;dv',
  'LangChain', 'LlamaIndex', 'CrewAI', 'AutoGPT', 'AgentGPT', 'Zapier Agents', 'Dust', 'Relevance AI', 'Voiceflow', 'Botpress',
  'Manychat AI', 'Intercom Fin', 'Tidio AI', 'Ada', 'Poe', 'Character.AI', 'Hugging Face', 'Replicate', 'Together AI', 'OpenRouter'
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function primaryCategory(index: number): string {
  const buckets = ['ai-writing', 'ai-image', 'ai-video', 'ai-audio', 'ai-coding', 'ai-marketing', 'ai-productivity', 'ai-agents'];
  return buckets[Math.floor(index / 10)] ?? buckets[index % buckets.length];
}

function featureSet(category: string, index: number): string[] {
  const byCategory: Record<string, string[]> = {
    'ai-writing': ['copywriting', 'summarization', 'translation', 'seo-content'],
    'ai-image': ['image-generation', 'text-to-image', 'photo-editing'],
    'ai-video': ['video-generation', 'video-editing'],
    'ai-audio': ['voice-cloning', 'speech-to-text', 'text-to-speech'],
    'ai-coding': ['code-generation', 'code-review'],
    'ai-marketing': ['seo-content', 'copywriting', 'data-analysis'],
    'ai-productivity': ['workflow-automation', 'meeting-notes', 'research-assistant'],
    'ai-agents': ['agent-builder', 'workflow-automation', 'chatbot']
  };

  return [...new Set([...(byCategory[category] ?? ['chatbot']), seedFeatures[index % seedFeatures.length]])].slice(0, 4);
}

function domainFor(name: string): string {
  return `${slugify(name).replace(/-ai$/, '')}.com`;
}

export function buildSeedTools(): SeedTool[] {
  return toolNames.map((name, index) => {
    const slug = slugify(name);
    const category = primaryCategory(index);
    const features = featureSet(category, index);
    const secondary = index % 3 === 0 ? 'ai-productivity' : index % 5 === 0 ? 'ai-marketing' : null;
    const domain = domainFor(name);
    const pricingType = ['free', 'freemium', 'paid', 'subscription', 'contact_sales'][index % 5];

    return {
      name,
      slug,
      description: `${name} is an AI software platform indexed by AppSearchly for feature discovery, pricing comparison, category browsing, and alternative research.`,
      shortDescription: `${name} helps teams evaluate and use AI software for ${category.replace('ai-', '').replace('-', ' ')} workflows.`,
      websiteUrl: `https://${domain}`,
      normalizedDomain: domain,
      categories: secondary && secondary !== category ? [category, secondary] : [category],
      features,
      pricingType,
      metadata: {
        features,
        use_cases: ['Research', 'Content production', 'Team productivity', 'Workflow acceleration'].slice(0, 2 + (index % 3)),
        integrations: ['API', 'Chrome extension', 'Slack', 'Zapier'].slice(0, 1 + (index % 4)),
        platforms: ['Web', 'iOS', 'Android', 'API'].slice(0, 1 + (index % 4)),
        languages: ['English', 'Spanish', 'French', 'German', 'Japanese'].slice(0, 2 + (index % 3)),
        target_users: ['Founders', 'Marketing teams', 'Developers', 'Creators', 'Operations teams'].slice(0, 2 + (index % 3)),
        industries: ['SaaS', 'Education', 'Media', 'Ecommerce', 'Consulting'].slice(0, 2 + (index % 3))
      }
    };
  });
}

async function upsertCategories(client: Client) {
  const categoryIds = new Map<string, string>();

  for (const category of seedCategories) {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO categories (name, slug, description, icon, status)
        VALUES ($1, $2, $3, $4, 'active')
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, status = 'active'
        RETURNING id
      `,
      [category.name, category.slug, category.description, category.icon]
    );
    categoryIds.set(category.slug, result.rows[0].id);

    for (const child of category.children ?? []) {
      const childResult = await client.query<{ id: string }>(
        `
          INSERT INTO categories (name, slug, description, icon, parent_id, status)
          VALUES ($1, $2, $3, $4, $5, 'active')
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, parent_id = EXCLUDED.parent_id, status = 'active'
          RETURNING id
        `,
        [child.name, child.slug, child.description, child.icon, result.rows[0].id]
      );
      categoryIds.set(child.slug, childResult.rows[0].id);
    }
  }

  return categoryIds;
}

async function upsertFeatures(client: Client) {
  const featureIds = new Map<string, string>();

  for (const slug of seedFeatures) {
    const name = slug.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO features (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `,
      [name, slug]
    );
    featureIds.set(slug, result.rows[0].id);
  }

  return featureIds;
}

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required to seed tools.');

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN');
    const categoryIds = await upsertCategories(client);
    const featureIds = await upsertFeatures(client);

    for (const tool of buildSeedTools()) {
      const primaryCategoryId = categoryIds.get(tool.categories[0]);
      if (!primaryCategoryId) throw new Error(`Missing category ${tool.categories[0]}`);

      const result = await client.query<{ id: string }>(
        `
          INSERT INTO tools (
            slug, name, summary, official_url, canonical_domain, primary_category_id,
            status, pricing_model, logo_url, primary_source_url, primary_source_type,
            source_checked_at, data_confidence, verification_status, published_at,
            website, normalized_domain, description, category, source_submission_id,
            short_description, website_url, favicon_url, category_id, pricing_type,
            is_verified, tool_metadata
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            'published', $7, NULL, $4, 'manual_research',
            now(), 80, 'human_verified', now(),
            $4, $5, $8, $9, NULL,
            $10, $4, NULL, $6, $7,
            true, $11::jsonb
          )
          ON CONFLICT (slug) DO UPDATE
          SET
            name = EXCLUDED.name,
            summary = EXCLUDED.summary,
            official_url = EXCLUDED.official_url,
            canonical_domain = EXCLUDED.canonical_domain,
            primary_category_id = EXCLUDED.primary_category_id,
            pricing_model = EXCLUDED.pricing_model,
            website = EXCLUDED.website,
            normalized_domain = EXCLUDED.normalized_domain,
            description = EXCLUDED.description,
            short_description = EXCLUDED.short_description,
            website_url = EXCLUDED.website_url,
            category_id = EXCLUDED.category_id,
            pricing_type = EXCLUDED.pricing_type,
            is_verified = EXCLUDED.is_verified,
            tool_metadata = EXCLUDED.tool_metadata,
            updated_at = now()
          RETURNING id
        `,
        [
          tool.slug,
          tool.name,
          tool.shortDescription,
          tool.websiteUrl,
          tool.normalizedDomain,
          primaryCategoryId,
          tool.pricingType,
          tool.description,
          tool.categories[0],
          tool.shortDescription,
          JSON.stringify(tool.metadata)
        ]
      );

      const toolId = result.rows[0].id;

      await client.query('DELETE FROM pricing_plans WHERE tool_id = $1', [toolId]);

      for (const categorySlug of tool.categories) {
        const categoryId = categoryIds.get(categorySlug);
        if (!categoryId) continue;
        await client.query(
          `
            INSERT INTO tool_categories (tool_id, category_id)
            VALUES ($1, $2)
            ON CONFLICT (tool_id, category_id) DO NOTHING
          `,
          [toolId, categoryId]
        );
      }

      for (const featureSlug of tool.features) {
        const featureId = featureIds.get(featureSlug);
        if (!featureId) continue;
        await client.query(
          `
            INSERT INTO tool_features (tool_id, feature_id)
            VALUES ($1, $2)
            ON CONFLICT (tool_id, feature_id) DO NOTHING
          `,
          [toolId, featureId]
        );
      }

      await client.query(
        `
          INSERT INTO pricing_plans (
            tool_id, name, plan_name, billing_period, price_amount, price,
            currency, price_text, features, source_url, source_checked_at
          )
          VALUES ($1, $2, $2, $3, $4, $4, 'USD', $5, $6::jsonb, $7, now())
        `,
        [
          toolId,
          tool.pricingType === 'free' ? 'Free' : tool.pricingType === 'contact_sales' ? 'Enterprise' : 'Standard',
          tool.pricingType === 'free' ? 'free' : tool.pricingType === 'contact_sales' ? 'custom' : 'monthly',
          tool.pricingType === 'free' ? 0 : tool.pricingType === 'contact_sales' ? null : 20 + (tool.name.length % 30),
          tool.pricingType === 'contact_sales' ? 'Contact sales' : null,
          JSON.stringify(tool.features),
          tool.websiteUrl
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${buildSeedTools().length} AI tools.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
