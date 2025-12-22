# Appsearchly.org 网站维护管理指南

## 📋 目录
1. [应用管理功能](#应用管理功能)
2. [数据库存储方案](#数据库存储方案)
3. [付费展示功能](#付费展示功能)
4. [管理员后台系统](#管理员后台系统)
5. [日常维护流程](#日常维护流程)
6. [技术架构升级](#技术架构升级)

---

## 🎯 应用管理功能

### 1. 应用状态管理

#### 应用状态类型
```typescript
enum AppStatus {
  PENDING = 'pending',        // 待审核
  APPROVED = 'approved',      // 已批准
  REJECTED = 'rejected',      // 已拒绝
  FEATURED = 'featured',      // 精选推荐
  SPONSORED = 'sponsored',    // 赞助推广
  ARCHIVED = 'archived',      // 已下架
  UNDER_REVIEW = 'under_review' // 审核中
}
```

#### 应用数据结构
```typescript
interface AppData {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  icon: string;
  screenshots: string[];
  developerName: string;
  developerEmail: string;
  websiteUrl: string;
  downloadUrl?: string;
  platforms: ('ios' | 'android' | 'web' | 'desktop')[];
  pricingModel: 'free' | 'freemium' | 'paid' | 'subscription';
  price?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  tags: string[];
  status: AppStatus;
  submittedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  featuredUntil?: string;
  sponsoredUntil?: string;
  lastUpdated: string;
  version: string;
  size?: string;
  requirements?: string;
  privacyPolicy: string;
  termsOfService: string;
  supportEmail: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  seo: {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
  };
  analytics?: {
    views: number;
    clicks: number;
    conversions: number;
  };
  paymentInfo?: {
    isPaid: boolean;
    paymentType: 'one-time' | 'monthly' | 'yearly';
    amount: number;
    startDate: string;
    endDate: string;
    features: string[];
  };
}
```

### 2. 排名管理

#### 排名算法
```typescript
interface RankingFactors {
  downloadWeight: number;    // 下载量权重
  ratingWeight: number;      // 评分权重
  reviewWeight: number;      // 评论数量权重
  recencyWeight: number;     // 新鲜度权重
  featuredBonus: number;     // 精选奖励
  sponsoredBonus: number;    // 赞助奖励
  engagementWeight: number;  // 用户参与度权重
}
```

#### 排名计算
```typescript
function calculateAppRanking(app: AppData, factors: RankingFactors): number {
  const baseScore =
    (app.downloads * factors.downloadWeight) +
    (app.rating * app.reviewCount * factors.ratingWeight) +
    (app.reviewCount * factors.reviewWeight) +
    (getRecencyScore(app.submittedAt) * factors.recencyWeight);

  const bonus =
    (app.status === 'featured' ? factors.featuredBonus : 0) +
    (app.status === 'sponsored' ? factors.sponsoredBonus : 0);

  return baseScore + bonus;
}
```

---

## 💾 数据库存储方案

### 当前存储分析
**现状**: 使用全局内存存储 (`global.submittedApps`)
- ❌ 服务器重启后数据丢失
- ❌ 无法持久化存储
- ❌ 不支持多实例部署
- ❌ 没有数据备份和恢复

### 推荐数据库升级方案

#### 方案1: SQLite (适合中小型网站)
```sql
-- 应用表
CREATE TABLE apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  icon TEXT,
  screenshots JSON,
  developer_name TEXT,
  developer_email TEXT,
  website_url TEXT,
  platforms JSON,
  pricing_model TEXT,
  price DECIMAL,
  currency TEXT,
  rating DECIMAL,
  review_count INTEGER,
  downloads INTEGER DEFAULT 0,
  tags JSON,
  status TEXT DEFAULT 'pending',
  submitted_at DATETIME,
  reviewed_at DATETIME,
  published_at DATETIME,
  featured_until DATETIME,
  sponsored_until DATETIME,
  last_updated DATETIME,
  version TEXT,
  size TEXT,
  requirements TEXT,
  privacy_policy TEXT,
  terms_of_service TEXT,
  support_email TEXT,
  social_links JSON,
  seo_slug TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords JSON,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_type TEXT,
  payment_amount DECIMAL,
  payment_start_date DATETIME,
  payment_end_date DATETIME,
  payment_features JSON
);

-- 用户评价表
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT,
  user_name TEXT,
  user_email TEXT,
  rating INTEGER,
  title TEXT,
  content TEXT,
  verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (app_id) REFERENCES apps(id)
);

-- 下载统计表
CREATE TABLE download_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  downloaded_at DATETIME,
  FOREIGN KEY (app_id) REFERENCES apps(id)
);
```

#### 方案2: PostgreSQL (适合大型网站)
```sql
-- 更强大的PostgreSQL方案，支持全文搜索和JSON操作
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 应用表 (PostgreSQL版本)
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  description_vector tsvector,
  category TEXT,
  subcategory TEXT,
  icon TEXT,
  screenshots JSONB,
  developer_name TEXT,
  developer_email TEXT,
  website_url TEXT,
  platforms TEXT[],
  pricing_model TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  tags TEXT[],
  status app_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  sponsored_until TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  version TEXT,
  size TEXT,
  requirements TEXT,
  privacy_policy TEXT,
  terms_of_service TEXT,
  support_email TEXT,
  social_links JSONB,
  seo_slug TEXT UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_type TEXT,
  payment_amount DECIMAL(10,2),
  payment_start_date TIMESTAMPTZ,
  payment_end_date TIMESTAMPTZ,
  payment_features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建全文搜索索引
CREATE INDEX apps_description_vector_idx ON apps USING GIN(description_vector);
CREATE INDEX apps_category_idx ON apps(category);
CREATE INDEX apps_status_idx ON apps(status);
CREATE INDEX apps_featured_idx ON apps(featured_until) WHERE featured_until > NOW();
CREATE INDEX apps_sponsored_idx ON apps(sponsored_until) WHERE sponsored_until > NOW();

-- 自动更新搜索向量
CREATE OR REPLACE FUNCTION update_app_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.description_vector := to_tsvector('english', unaccent(NEW.name || ' ' || NEW.description || ' ' || array_to_string(NEW.tags, ' ')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_search_vector_update
  BEFORE INSERT OR UPDATE ON apps
  FOR EACH ROW EXECUTE FUNCTION update_app_search_vector();
```

### 数据库连接配置
```typescript
// src/lib/database.ts
import Database from 'better-sqlite3';
// import { Pool } from 'pg'; // PostgreSQL版本

export interface Database {
  getApp(id: string): Promise<AppData | null>;
  getApps(filters: AppFilters): Promise<AppData[]>;
  createApp(app: Partial<AppData>): Promise<AppData>;
  updateApp(id: string, updates: Partial<AppData>): Promise<AppData>;
  deleteApp(id: string): Promise<boolean>;
  searchApps(query: string): Promise<AppData[]>;
  getFeaturedApps(): Promise<AppData[]>;
  getSponsoredApps(): Promise<AppData[]>;
}

// SQLite实现
export class SQLiteDatabase implements Database {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // 执行上面提到的SQLite CREATE TABLE语句
  }

  async createApp(app: Partial<AppData>): Promise<AppData> {
    const stmt = this.db.prepare(`
      INSERT INTO apps (${Object.keys(app).join(', ')})
      VALUES (${Object.keys(app).map(() => '?').join(', ')})
    `);

    const result = stmt.run(...Object.values(app));
    return this.getApp(result.lastInsertRowid.toString());
  }

  // 其他方法实现...
}
```

---

## 💰 付费展示功能

### 1. 付费展示类型

#### 免费展示
- **基础展示**: 应用于所有approved应用
- **标准排名**: 基于下载量、评分等自然排名

#### 付费展示选项
```typescript
interface PaidFeatures {
  // 精选推荐 (Featured Placement)
  featured: {
    duration: number;        // 天数
    price: number;          // 价格
    placement: 'top' | 'sidebar' | 'category-top';
    benefits: string[];
  };

  // 赞助推广 (Sponsored Promotion)
  sponsored: {
    duration: number;        // 天数
    price: number;          // 价格
    priority: number;       // 排名优先级 (1-10)
    benefits: string[];
  };

  // 分类置顶 (Category Top Placement)
  categoryFeatured: {
    categories: string[];
    duration: number;        // 天数
    price: number;          // 价格
    benefits: string[];
  };

  // 高亮展示 (Highlight Badge)
  highlight: {
    badge: 'new' | 'updated' | 'trending' | 'editor-choice';
    duration: number;
    price: number;
  };
}
```

### 2. 价格体系
```typescript
const PRICING_PLANS = {
  featured: {
    week: 99,      // 美元/周
    month: 349,    // 美元/月
    quarter: 899,  // 美元/季度
    year: 2999     // 美元/年
  },
  sponsored: {
    week: 149,
    month: 499,
    quarter: 1299,
    year: 4499
  },
  categoryFeatured: {
    week: 79,
    month: 249,
    quarter: 649,
    year: 2299
  },
  highlight: {
    week: 29,
    month: 89,
    quarter: 229,
    year: 799
  }
};
```

### 3. 付费流程
```typescript
// 付费订阅流程
async function processPaidPromotion(appId: string, promotion: {
  type: 'featured' | 'sponsored' | 'categoryFeatured' | 'highlight';
  duration: number;
  paymentMethod: string;
}) {
  // 1. 创建付费记录
  const payment = await createPayment({
    appId,
    type: promotion.type,
    duration: promotion.duration,
    amount: calculatePrice(promotion),
    status: 'pending'
  });

  // 2. 处理支付 (集成Stripe/PayPal)
  const paymentResult = await processPayment(payment);

  if (paymentResult.success) {
    // 3. 激活付费功能
    await activatePromotion(appId, promotion);

    // 4. 更新应用状态
    await updateApp(appId, {
      [`is_${promotion.type}`]: true,
      [`${promotion.type}_until`]: new Date(Date.now() + promotion.duration * 24 * 60 * 60 * 1000)
    });
  }

  return paymentResult;
}
```

---

## 👨‍💼 管理员后台系统

### 1. 后台页面结构
```
src/routes/admin/
├── +page.svelte                 # 后台首页/仪表板
├── apps/
│   ├── +page.svelte            # 应用列表管理
│   ├── [id]/
│   │   ├── +page.svelte        # 应用详情
│   │   ├── edit/+page.svelte   # 编辑应用
│   │   └── analytics/+page.svelte # 应用分析
│   └── submit/+page.svelte     # 应用提交管理
├── payments/
│   ├── +page.svelte            # 付费管理
│   ├── [id]/
│   │   ├── +page.svelte        # 支付详情
│   │   └── refund/+page.svelte # 退款处理
├── analytics/
│   ├── +page.svelte            # 网站分析
│   ├── apps/+page.svelte       # 应用分析
│   └── revenue/+page.svelte    # 收入分析
├── settings/
│   ├── +page.svelte            # 系统设置
│   ├── pricing/+page.svelte    # 价格设置
│   └── categories/+page.svelte # 分类管理
└── users/
    ├── +page.svelte            # 用户管理
    └── [id]/
        └── +page.svelte        # 用户详情
```

### 2. 管理员认证
```typescript
// src/lib/auth.ts
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'support';
  permissions: string[];
  lastLogin: Date;
}

// 中间件保护
export async function requireAdminAuth(event: RequestEvent) {
  const session = await event.locals.session;
  if (!session?.user || !session.user.isAdmin) {
    throw redirect(302, '/admin/login');
  }
  return session.user;
}
```

### 3. 后台仪表板组件
```svelte
<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import StatsCard from '$lib/components/admin/StatsCard.svelte';
  import AppList from '$lib/components/admin/AppList.svelte';
  import PaymentOverview from '$lib/components/admin/PaymentOverview.svelte';

  let stats = {
    totalApps: 0,
    pendingApps: 0,
    approvedApps: 0,
    revenue: 0,
    activePromotions: 0,
    weeklyGrowth: 0
  };

  let recentApps = [];
  let recentPayments = [];

  onMount(async () => {
    // 加载统计数据
    stats = await fetch('/api/admin/dashboard/stats').then(r => r.json());
    recentApps = await fetch('/api/admin/apps/recent').then(r => r.json());
    recentPayments = await fetch('/api/admin/payments/recent').then(r => r.json());
  });
</script>

<div class="admin-dashboard">
  <h1>Admin Dashboard</h1>

  <!-- 统计卡片 -->
  <div class="stats-grid">
    <StatsCard title="Total Apps" value={stats.totalApps} icon="📱" />
    <StatsCard title="Pending Review" value={stats.pendingApps} icon="⏳" />
    <StatsCard title="Approved Apps" value={stats.approvedApps} icon="✅" />
    <StatsCard title="Monthly Revenue" value={`$${stats.revenue}`} icon="💰" />
    <StatsCard title="Active Promotions" value={stats.activePromotions} icon="⭐" />
    <StatsCard title="Weekly Growth" value={`${stats.weeklyGrowth}%`} icon="📈" />
  </div>

  <!-- 最近提交的应用 -->
  <div class="recent-section">
    <h2>Recent Submissions</h2>
    <AppList apps={recentApps} />
  </div>

  <!-- 最近支付 -->
  <div class="payment-section">
    <h2>Recent Payments</h2>
    <PaymentOverview payments={recentPayments} />
  </div>
</div>
```

### 4. 应用管理页面
```svelte
<!-- src/routes/admin/apps/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import DataTable from '$lib/components/admin/DataTable.svelte';
  import AppFilters from '$lib/components/admin/AppFilters.svelte';

  let apps = [];
  let filters = {
    status: 'all',
    category: 'all',
    search: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc'
  };

  async function loadApps() {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/apps?${params}`);
    apps = await response.json();
  }

  async function bulkAction(action: string, appIds: string[]) {
    await fetch('/api/admin/apps/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, appIds })
    });
    await loadApps();
  }
</script>

<div class="apps-management">
  <h1>Apps Management</h1>

  <!-- 筛选器 -->
  <AppFilters bind={filters} on:change={loadApps} />

  <!-- 批量操作 -->
  <div class="bulk-actions">
    <button on:click={() => bulkAction('approve', selectedApps)}>
      Approve Selected
    </button>
    <button on:click={() => bulkAction('reject', selectedApps)}>
      Reject Selected
    </button>
    <button on:click={() => bulkAction('feature', selectedApps)}>
      Make Featured
    </button>
  </div>

  <!-- 数据表格 -->
  <DataTable
    data={apps}
    columns={[
      { key: 'name', label: 'App Name', sortable: true },
      { key: 'category', label: 'Category', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'submittedAt', label: 'Submitted', sortable: true },
      { key: 'rating', label: 'Rating', sortable: true },
      { key: 'actions', label: 'Actions' }
    ]}
    on:sort={loadApps}
  />
</div>
```

---

## 🔄 日常维护流程

### 1. 应用审核流程
```typescript
// 应用审核工作流
export class AppReviewWorkflow {
  async reviewApp(appId: string, action: 'approve' | 'reject' | 'request_changes', notes?: string) {
    const app = await this.getApp(appId);

    switch (action) {
      case 'approve':
        await this.approveApp(app, notes);
        break;
      case 'reject':
        await this.rejectApp(app, notes);
        break;
      case 'request_changes':
        await this.requestChanges(app, notes);
        break;
    }
  }

  private async approveApp(app: AppData, notes?: string) {
    // 1. 更新应用状态
    await updateApp(app.id, {
      status: 'approved',
      reviewedAt: new Date(),
      publishedAt: new Date(),
      adminNotes: notes
    });

    // 2. 通知开发者
    await this.sendNotification(app.developerEmail, 'approved', app);

    // 3. 更新SEO和搜索索引
    await this.updateSearchIndex(app);

    // 4. 记录审核日志
    await this.logReviewAction(app.id, 'approved', notes);
  }
}
```

### 2. 定期维护任务
```typescript
// 定期任务调度
export class ScheduledTasks {
  // 每日任务
  @Cron('0 2 * * *') // 每天凌晨2点
  async dailyTasks() {
    await this.updateAppRankings();        // 更新应用排名
    await this.checkExpiringPromotions();  // 检查过期的付费推广
    await this.generateDailyReports();    // 生成日报
    await this.cleanupOldLogs();          // 清理旧日志
  }

  // 每周任务
  @Cron('0 3 * * 1') // 每周一凌晨3点
  async weeklyTasks() {
    await this.updateCategoryStats();     // 更新分类统计
    await this.optimizeDatabase();        // 数据库优化
    await this.sendWeeklyReports();       // 发送周报
    await this.backupDatabase();          // 数据库备份
  }

  // 每月任务
  @Cron('0 4 1 * *') // 每月1号凌晨4点
  async monthlyTasks() {
    await this.analyticsReporting();      // 分析报告
    await this.updateSEO();               // SEO优化
    await this.performanceAudit();        // 性能审计
    await this.securityCheck();           // 安全检查
  }
}
```

### 3. 监控和警报
```typescript
// 系统监控
export class SystemMonitoring {
  async checkSystemHealth() {
    const health = {
      database: await this.checkDatabase(),
      apis: await this.checkAPIs(),
      performance: await this.checkPerformance(),
      security: await this.checkSecurity(),
      uptime: await this.checkUptime()
    };

    if (!health.isHealthy) {
      await this.sendAlert(health);
    }

    return health;
  }

  private async checkDatabase() {
    // 检查数据库连接、查询性能等
  }

  private async checkAPIs() {
    // 检查所有API端点的响应时间和可用性
  }

  private async checkPerformance() {
    // 检查页面加载时间、资源大小等
  }
}
```

---

## 🚀 技术架构升级

### 1. 渐进式数据库升级路径

#### 阶段1: 数据持久化 (1-2周)
```typescript
// 添加文件系统存储
export class FileStorage implements Database {
  private dataFile = './data/apps.json';

  async save() {
    await fs.writeFile(this.dataFile, JSON.stringify(this.apps, null, 2));
  }

  async load() {
    if (await fs.pathExists(this.dataFile)) {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      this.apps = JSON.parse(data);
    }
  }
}
```

#### 阶段2: SQLite集成 (2-3周)
```typescript
// 集成SQLite数据库
import { SQLiteDatabase } from './database/sqlite';

// 在vite.config.ts中配置
export default defineConfig({
  define: {
    __DATABASE_TYPE__: JSON.stringify('sqlite'),
    __DATABASE_PATH__: JSON.stringify('./data/appsearchly.db')
  }
});
```

#### 阶段3: PostgreSQL迁移 (4-6周)
```typescript
// 生产级数据库
import { PostgreSQLDatabase } from './database/postgresql';

// 数据迁移脚本
export async function migrateToPostgreSQL() {
  const sqliteData = await exportSQLiteData();
  await importToPostgreSQL(sqliteData);
}
```

### 2. 微服务架构
```typescript
// 拆分为独立的服务
services/
├── app-service/          # 应用管理服务
├── user-service/         # 用户管理服务
├── payment-service/      # 支付处理服务
├── analytics-service/    # 分析统计服务
├── notification-service/ # 通知服务
└── search-service/       # 搜索服务
```

### 3. 容器化部署
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 联系和支持

如有任何问题或需要进一步的技术支持，请随时联系：

- **技术支持**: tech@appsearchly.org
- **商务合作**: business@appsearchly.org
- **bug报告**: bugs@appsearchly.org

---

*最后更新: 2025年11月15日*