# Appsearchly.org 技术实施指南

## 1. 项目架构建议

### 1.1 技术栈推荐
```json
{
  "frontend": {
    "framework": "Next.js 14",
    "styling": "Tailwind CSS + Headless UI",
    "state_management": "Zustand",
    "search": "Algolia React InstantSearch",
    "analytics": "Vercel Analytics + Hotjar"
  },
  "backend": {
    "framework": "Node.js + Express",
    "database": "PostgreSQL + Redis (缓存)",
    "search_engine": "Elasticsearch",
    "cdn": "Cloudinary (图片)"
  },
  "deployment": {
    "hosting": "Vercel",
    "database": "Supabase",
    "monitoring": "Sentry"
  }
}
```

### 1.2 项目结构
```
appsearchly/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── (main)/
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── search/
│   │   │   ├── category/
│   │   │   └── app/[slug]/
│   │   ├── api/               # API路由
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # 基础UI组件
│   │   ├── search/
│   │   ├── app-card/
│   │   ├── navigation/
│   │   └── layout/
│   ├── lib/
│   │   ├── db/
│   │   ├── utils/
│   │   ├── validations/
│   │   └── constants/
│   ├── hooks/
│   ├── stores/
│   └── types/
├── public/
├── docs/
└── scripts/
```

## 2. 核心功能实现

### 2.1 高级搜索组件
```typescript
// src/components/search/AdvancedSearch.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchFilters } from '@/types/search';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    price: 'all',
    rating: 0,
    platform: 'all',
    sortBy: 'relevance'
  });

  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.price !== 'all') params.set('price', filters.price);
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.platform !== 'all') params.set('platform', filters.platform);
    params.set('sort', filters.sortBy);

    router.push(`/search?${params.toString()}`);
    onSearch(filters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 搜索输入框 */}
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="搜索应用..."
            value={filters.query}
            onChange={(e) => setFilters({...filters, query: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 分类选择器 */}
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">所有分类</option>
          <option value="games">游戏</option>
          <option value="productivity">生产力</option>
          <option value="social">社交</option>
          <option value="education">教育</option>
        </select>

        {/* 价格筛选 */}
        <select
          value={filters.price}
          onChange={(e) => setFilters({...filters, price: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">所有价格</option>
          <option value="free">免费</option>
          <option value="paid">付费</option>
          <option value="freemium">免费增值</option>
        </select>

        {/* 评分筛选 */}
        <div className="flex items-center space-x-2">
          <span>最低评分:</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
            className="flex-1"
          />
          <span>{filters.rating}</span>
        </div>

        {/* 平台筛选 */}
        <select
          value={filters.platform}
          onChange={(e) => setFilters({...filters, platform: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">所有平台</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="web">Web</option>
        </select>

        {/* 排序选择 */}
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="relevance">相关性</option>
          <option value="rating">评分</option>
          <option value="downloads">下载量</option>
          <option value="updated">更新时间</option>
        </select>

        {/* 搜索按钮 */}
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>
  );
}
```

### 2.2 应用卡片组件
```typescript
// src/components/app-card/AppCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon, DownloadIcon, HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { App } from '@/types/app';

interface AppCardProps {
  app: App;
  isFavorite?: boolean;
  onFavoriteToggle?: (appId: string) => void;
}

export function AppCard({ app, isFavorite, onFavoriteToggle }: AppCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(app.id);
  };

  return (
    <Link href={`/app/${app.slug}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* 应用图标 */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleFavoriteClick}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {isFavorite ? (
                <HeartIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartOutlineIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-center h-full">
            <Image
              src={app.icon}
              alt={app.name}
              width={80}
              height={80}
              className="rounded-2xl shadow-lg group-hover:scale-110 transition-transform"
            />
          </div>
        </div>

        {/* 应用信息 */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {app.name}
            </h3>
            {app.price > 0 && (
              <span className="text-sm font-medium text-green-600">
                ${app.price}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {app.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">{app.rating}</span>
              <span className="text-gray-400">({app.reviewCount})</span>
            </div>

            <div className="flex items-center space-x-1 text-gray-500">
              <DownloadIcon className="h-4 w-4" />
              <span>{formatDownloadCount(app.downloads)}</span>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="flex flex-wrap gap-1 mt-3">
            {app.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDownloadCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
```

### 2.3 搜索结果页面
```typescript
// src/app/search/page.tsx
import { SearchParams } from '@/types/search';
import { searchApps } from '@/lib/api/search';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { AppGrid } from '@/components/app-grid/AppGrid';
import { Pagination } from '@/components/ui/Pagination';
import { NoResults } from '@/components/search/NoResults';

interface SearchPageProps {
  searchParams: SearchParams;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;

  const searchResult = await searchApps({
    query: searchParams.q || '',
    category: searchParams.category,
    price: searchParams.price,
    rating: parseFloat(searchParams.rating || '0'),
    platform: searchParams.platform,
    sortBy: searchParams.sortBy || 'relevance',
    page,
    limit
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            搜索应用
          </h1>
          {searchParams.q && (
            <p className="mt-2 text-gray-600">
              搜索 "{searchParams.q}" 的结果
            </p>
          )}
        </div>

        {/* 高级搜索 */}
        <div className="mb-8">
          <AdvancedSearch onSearch={(filters) => {
            // 处理搜索逻辑
          }} />
        </div>

        {/* 搜索结果统计 */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            找到 {searchResult.total} 个应用
          </p>

          {/* 排序选项 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">排序:</span>
            <select
              defaultValue={searchParams.sortBy || 'relevance'}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="relevance">相关性</option>
              <option value="rating">评分</option>
              <option value="downloads">下载量</option>
              <option value="updated">更新时间</option>
            </select>
          </div>
        </div>

        {/* 搜索结果 */}
        {searchResult.apps.length > 0 ? (
          <>
            <AppGrid apps={searchResult.apps} />

            {/* 分页 */}
            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(searchResult.total / limit)}
                baseUrl="/search"
                queryParams={searchParams}
              />
            </div>
          </>
        ) : (
          <NoResults query={searchParams.q} />
        )}
      </div>
    </div>
  );
}
```

## 3. 性能优化实现

### 3.1 图片优化组件
```typescript
// src/components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={cn(
        "bg-gray-200 flex items-center justify-center",
        className
      )}>
        <span className="text-gray-500 text-sm">图片加载失败</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"
        )}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
```

### 3.2 虚拟滚动实现
```typescript
// src/components/ui/VirtualScroll.tsx
import { useRef, useEffect, useState, useMemo } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const totalHeight = items.length * itemHeight;

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      setScrollTop(scrollElement.scrollTop);
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      className="virtual-scroll-container"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 4. SEO优化实现

### 4.1 动态元数据生成
```typescript
// src/lib/seo/metadata.ts
import { Metadata } from 'next';
import { App, Category } from '@/types/app';

export function generateAppMetadata(app: App): Metadata {
  return {
    title: `${app.name} - ${app.description.substring(0, 60)} | Appsearchly`,
    description: app.description,
    keywords: [app.name, ...app.categories, 'app', 'download'].join(', '),
    openGraph: {
      title: app.name,
      description: app.description,
      images: [
        {
          url: app.icon,
          width: 512,
          height: 512,
          alt: `${app.name} icon`
        },
        {
          url: app.screenshots[0],
          width: 1280,
          height: 720,
          alt: `${app.name} screenshot`
        }
      ],
      type: 'website',
      locale: 'zh_CN'
    },
    twitter: {
      card: 'summary_large_image',
      title: app.name,
      description: app.description,
      images: [app.icon]
    },
    alternates: {
      canonical: `https://appsearchly.org/app/${app.slug}`
    },
    other: {
      'application-name': app.name,
      'apple-mobile-web-app-title': app.name,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#3B82F6',
      'theme-color': '#3B82F6'
    }
  };
}

export function generateCategoryMetadata(category: Category): Metadata {
  return {
    title: `${category.name} 应用 - 发现最好的${category.name}应用 | Appsearchly`,
    description: `浏览和下载最好的${category.name}应用。我们精心挑选了${category.appCount}个高质量的${category.name}应用。`,
    keywords: [category.name, 'apps', 'download', 'best'].join(', '),
    openGraph: {
      title: `${category.name} 应用`,
      description: `发现最好的${category.name}应用`,
      type: 'website'
    }
  };
}
```

### 4.2 结构化数据生成
```typescript
// src/lib/seo/structured-data.ts
import { App } from '@/types/app';

export function generateAppStructuredData(app: App) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.description,
    applicationCategory: app.categories[0],
    operatingSystem: app.platform,
    offers: app.price > 0 ? {
      '@type': 'Offer',
      price: app.price,
      priceCurrency: 'USD'
    } : {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: app.rating,
      ratingCount: app.reviewCount
    },
    author: {
      '@type': 'Organization',
      name: app.developer
    },
    image: app.icon,
    downloadUrl: app.downloadUrl,
    datePublished: app.releaseDate,
    dateModified: app.lastUpdate,
    softwareVersion: app.version,
    fileSize: app.size
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  };
}
```

## 5. 数据库设计

### 5.1 应用数据模型
```sql
-- 应用表
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  icon_url VARCHAR(500) NOT NULL,
  screenshots TEXT[],
  developer_id UUID REFERENCES developers(id),
  platform VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  size VARCHAR(50),
  version VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  featured BOOLEAN DEFAULT FALSE,
  release_date DATE,
  last_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  app_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 应用分类关联表
CREATE TABLE app_categories (
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (app_id, category_id)
);

-- 开发者表
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  website VARCHAR(500),
  email VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户收藏表
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- 搜索日志表（用于分析）
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query VARCHAR(500) NOT NULL,
  filters JSONB,
  results_count INTEGER,
  clicked_app_id UUID REFERENCES apps(id),
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_platform ON apps(platform);
CREATE INDEX idx_apps_rating ON apps(rating DESC);
CREATE INDEX idx_apps_featured ON apps(featured);
CREATE INDEX idx_apps_download_count ON apps(download_count DESC);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_search_logs_query ON search_logs(query);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
```

## 6. API设计

### 6.1 搜索API
```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchApps } from '@/lib/db/queries';
import { validateSearchQuery } from '@/lib/validations/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      price: searchParams.get('price') || 'all',
      rating: parseFloat(searchParams.get('rating') || '0'),
      platform: searchParams.get('platform') || 'all',
      sortBy: searchParams.get('sort') || 'relevance',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    };

    // 验证查询参数
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors },
        { status: 400 }
      );
    }

    // 执行搜索
    const result = await searchApps(query);

    // 记录搜索日志
    await logSearch(query, result.total, request);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '搜索服务暂时不可用' },
      { status: 500 }
    );
  }
}
```

### 6.2 应用详情API
```typescript
// src/app/api/apps/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAppBySlug, incrementAppViews } from '@/lib/db/queries';
import { cache } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // 尝试从缓存获取
    const cacheKey = `app:${slug}`;
    let app = await cache.get(cacheKey);

    if (!app) {
      // 从数据库获取
      app = await getAppBySlug(slug);

      if (!app) {
        return NextResponse.json(
          { error: '应用不存在' },
          { status: 404 }
        );
      }

      // 缓存5分钟
      await cache.set(cacheKey, app, 300);
    }

    // 异步增加浏览量
    incrementAppViews(app.id).catch(console.error);

    return NextResponse.json(app);
  } catch (error) {
    console.error('App detail API error:', error);
    return NextResponse.json(
      { error: '获取应用信息失败' },
      { status: 500 }
    );
  }
}
```

## 7. 部署和监控

### 7.1 Docker配置
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 7.2 监控配置
```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // 过滤敏感信息
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('password')) {
            return null;
          }
        }
        return event;
      }
    });
  }
}
```

### 7.3 性能监控
```typescript
// src/lib/monitoring/performance.ts
export function reportWebVitals(metric: any) {
  // 发送到分析服务
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }).catch(console.error);
  }

  // 开发环境输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
}
```

## 8. 测试策略

### 8.1 单元测试示例
```typescript
// __tests__/components/AppCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AppCard } from '@/components/app-card/AppCard';
import { mockApp } from '@/__mocks__/app';

describe('AppCard', () => {
  it('renders app information correctly', () => {
    render(<AppCard app={mockApp} />);

    expect(screen.getByText(mockApp.name)).toBeInTheDocument();
    expect(screen.getByText(mockApp.description)).toBeInTheDocument();
    expect(screen.getByText(mockApp.rating.toString())).toBeInTheDocument();
  });

  it('handles favorite toggle', () => {
    const onFavoriteToggle = jest.fn();
    render(
      <AppCard
        app={mockApp}
        isFavorite={false}
        onFavoriteToggle={onFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByRole('button');
    fireEvent.click(favoriteButton);

    expect(onFavoriteToggle).toHaveBeenCalledWith(mockApp.id);
  });
});
```

### 8.2 端到端测试
```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('search functionality', async ({ page }) => {
  await page.goto('/');

  // 输入搜索关键词
  await page.fill('[data-testid="search-input"]', 'productivity');
  await page.click('[data-testid="search-button"]');

  // 验证搜索结果页面
  await expect(page).toHaveURL(/\/search/);
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

  // 验证搜索结果
  const results = page.locator('[data-testid="app-card"]');
  await expect(results.first()).toBeVisible();

  // 测试筛选功能
  await page.selectOption('[data-testid="category-filter"]', 'productivity');
  await expect(results).toHaveCountGreaterThan(0);
});
```

这个实施指南提供了详细的技术实现方案，包括代码示例、数据库设计、API规范和测试策略。建议按照模块逐步实施，并确保每个阶段都有充分的测试和监控。