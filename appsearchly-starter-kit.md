# Appsearchly.org 项目启动包

## 🚀 快速开始

### 项目初始化命令
```bash
# 创建项目目录
mkdir appsearchly-redesign
cd appsearchly-redesign

# 初始化Next.js项目
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# 安装必要依赖
npm install @next/bundle-analyzer @headlessui/react @heroicons/react
npm install algoliasearch instantsearch.js react-instantsearch
npm install @supabase/supabase-js @vercel/analytics
npm install @sentry/nextjs react-hook-form zod
npm install framer-motion lucide-react

# 开发依赖
npm install -D @types/node prettier eslint-config-prettier
```

## 📁 项目结构模板

```
appsearchly/
├── .env.local                    # 环境变量
├── .gitignore
├── next.config.js               # Next.js配置
├── tailwind.config.js           # Tailwind配置
├── tsconfig.json               # TypeScript配置
├── package.json
├── README.md
├── src/
│   ├── app/                    # App Router
│   │   ├── (main)/            # 主要页面组
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── layout.tsx     # 主布局
│   │   │   ├── search/        # 搜索页面
│   │   │   │   └── page.tsx
│   │   │   ├── category/      # 分类页面
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── app/           # 应用详情
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── layout.tsx
│   │   │   ├── submit/        # 提交应用
│   │   │   │   └── page.tsx
│   │   │   ├── blog/          # 博客
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── about/         # 关于页面
│   │   │   │   └── page.tsx
│   │   │   └── legal/         # 法律页面
│   │   │       ├── privacy/
│   │   │       └── terms/
│   │   ├── api/               # API路由
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── apps/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   └── analytics/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx         # 根布局
│   │   ├── robots.ts          # SEO配置
│   │   └── sitemap.ts         # 站点地图
│   ├── components/            # 组件
│   │   ├── ui/               # 基础UI组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── loading.tsx
│   │   │   └── index.ts
│   │   ├── layout/           # 布局组件
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── breadcrumb.tsx
│   │   ├── search/           # 搜索组件
│   │   │   ├── search-bar.tsx
│   │   │   ├── advanced-search.tsx
│   │   │   ├── search-results.tsx
│   │   │   ├── search-filters.tsx
│   │   │   └── no-results.tsx
│   │   ├── app-card/         # 应用卡片
│   │   │   ├── app-card.tsx
│   │   │   ├── app-icon.tsx
│   │   │   ├── app-rating.tsx
│   │   │   └── app-actions.tsx
│   │   ├── app-detail/       # 应用详情
│   │   │   ├── app-header.tsx
│   │   │   ├── app-info.tsx
│   │   │   ├── app-screenshots.tsx
│   │   │   ├── app-reviews.tsx
│   │   │   └── related-apps.tsx
│   │   ├── forms/            # 表单组件
│   │   │   ├── app-submit-form.tsx
│   │   │   ├── contact-form.tsx
│   │   │   └── review-form.tsx
│   │   └── common/           # 通用组件
│   │       ├── hero.tsx
│   │       ├── featured-apps.tsx
│   │       ├── category-grid.tsx
│   │       ├── newsletter.tsx
│   │       └── social-share.tsx
│   ├── lib/                 # 工具库
│   │   ├── db/             # 数据库
│   │   │   ├── connection.ts
│   │   │   ├── queries.ts
│   │   │   └── schema.sql
│   │   ├── utils/          # 工具函数
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── seo/            # SEO相关
│   │   │   ├── metadata.ts
│   │   │   ├── structured-data.ts
│   │   │   └── sitemap.ts
│   │   ├── cache/          # 缓存
│   │   │   ├── redis.ts
│   │   │   └── memory.ts
│   │   └── monitoring/     # 监控
│   │       ├── sentry.ts
│   │       ├── analytics.ts
│   │       └── performance.ts
│   ├── hooks/              # 自定义Hooks
│   │   ├── use-search.ts
│   │   ├── use-favorites.ts
│   │   ├── use-pagination.ts
│   │   └── use-debounce.ts
│   ├── stores/             # 状态管理
│   │   ├── search-store.ts
│   │   ├── user-store.ts
│   │   └── app-store.ts
│   ├── types/              # TypeScript类型
│   │   ├── app.ts
│   │   ├── search.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── styles/             # 样式文件
│   │   ├── globals.css
│   │   └── components.css
│   └── middleware.ts       # 中间件
├── public/                 # 静态资源
│   ├── icons/
│   ├── images/
│   └── favicon.ico
├── docs/                   # 文档
│   ├── api.md
│   ├── deployment.md
│   └── contributing.md
├── tests/                  # 测试文件
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   └── utils/
├── scripts/                # 脚本
│   ├── build.sh
│   ├── deploy.sh
│   └── seed-db.ts
└── .github/               # GitHub配置
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

## 🎯 核心配置文件

### Next.js配置 (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'cdn.appsearchly.org'],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Tailwind CSS配置 (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 环境变量模板 (.env.local)
```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/appsearchly"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# 搜索服务
ALGOLIA_APP_ID="your-app-id"
ALGOLIA_SEARCH_API_KEY="your-search-api-key"
ALGOLIA_ADMIN_API_KEY="your-admin-api-key"

# 分析和监控
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"
SENTRY_DSN="https://your-sentry-dsn"

# 邮件服务
RESEND_API_KEY="your-resend-api-key"

# 文件上传
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# 应用配置
NEXT_PUBLIC_SITE_URL="https://appsearchly.org"
NEXT_PUBLIC_APP_NAME="Appsearchly"
NEXT_PUBLIC_APP_DESCRIPTION="发现最好的应用"

# 安全
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://appsearchly.org"
```

## 🎨 设计系统模板

### 颜色系统
```css
/* src/styles/tokens.css */
:root {
  /* 主色调 */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;

  /* 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;

  /* 语义色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* 间距 */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* 字体 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

### 基础组件模板
```typescript
// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          loading && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

## 📊 数据库架构

### PostgreSQL表结构
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
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  price DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  size VARCHAR(50),
  version VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
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

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 搜索日志表
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

## 🔧 实用工具函数

```typescript
// src/lib/utils/helpers.ts
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDownloadCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
```

## 📋 开发工作流

### Git工作流配置
```bash
# 初始化Git仓库
git init
git branch -M main

# 创建开发分支
git checkout -b develop

# 功能分支命名规范
# feature/search-improvement
# feature/app-card-redesign
# bugfix/mobile-navigation
# hotfix/critical-security-patch

# 提交信息格式
# feat: 添加高级搜索功能
# fix: 修复移动端导航菜单问题
# docs: 更新API文档
# style: 优化应用卡片样式
# refactor: 重构搜索组件
# test: 添加搜索功能单元测试
```

### GitHub Actions工作流
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Lint
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📚 推荐学习资源

### 技术文档
- [Next.js 13+ Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

### 设计资源
- [Tailwind UI](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/)
- [Heroicons](https://heroicons.com/)
- [Figma App Design Resources](https://www.figma.com/community)

### 性能优化
- [Web.dev](https://web.dev/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)

### SEO和营销
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Google Analytics Documentation](https://developers.google.com/analytics)

---

## 🎯 快速启动检查清单

### 项目设置（第1天）
- [ ] 创建Next.js项目
- [ ] 配置Tailwind CSS
- [ ] 设置TypeScript
- [ ] 配置ESLint和Prettier
- [ ] 设置Git仓库

### 基础开发（第1周）
- [ ] 创建基础布局组件
- [ ] 实现导航和页脚
- [ ] 创建应用卡片组件
- [ ] 设置数据库连接
- [ ] 创建基础API路由

### 核心功能（第2-3周）
- [ ] 实现搜索功能
- [ ] 创建应用详情页面
- [ ] 实现分类浏览
- [ ] 添加用户系统
- [ ] 实现应用提交功能

### 优化和部署（第4周）
- [ ] 性能优化
- [ ] SEO优化
- [ ] 测试和调试
- [ ] 部署到生产环境
- [ ] 设置监控和分析

使用这个启动包，您可以快速开始Appsearchly.org的改进项目。每个组件都经过精心设计，遵循最佳实践，并且可以轻松扩展和定制。