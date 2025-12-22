# Appsearchly.org 付费展示系统实施方案

## 🎯 付费展示功能概览

### 当前状态分析
- ✅ **Submit Tools**: 应用提交功能已完成，数据存储在内存中
- ❌ **数据库持久化**: 需要升级为真正的数据库存储
- ❌ **付费展示**: 尚未实现付费功能
- ❌ **管理后台**: 缺少管理员界面

### 目标架构
```
用户提交应用 → 审核 → 批准 → 付费展示 → 收入
     ↓           ↓      ↓        ↓        ↓
  内存存储 → 数据库 → 管理后台 → 支付系统 → 统计分析
```

---

## 💰 付费展示套餐

### 套餐方案设计

#### 1. 免费展示 (Free Listing)
- **费用**: $0
- **包含**:
  - ✅ 基础应用信息展示
  - ✅ 应用截图 (最多3张)
  - ✅ 下载链接
  - ✅ 用户评价系统
  - ✅ 标准搜索排名
- **限制**:
  - ❌ 无特殊标记
  - ❌ 无优先排名
  - ❌ 无置顶展示

#### 2. 精选推荐 (Featured) - $99/月
- **包含免费套餐所有功能**
- **额外权益**:
  - ⭐ "Featured" 标识
  - 🏆 分类页置顶展示
  - 🔍 搜索结果优先排名
  - 📱 首页推荐位展示
  - 📊 详细数据分析
  - 📧 周报推送

#### 3. 赞助推广 (Sponsored) - $299/月
- **包含精选套餐所有功能**
- **额外权益**:
  - 💎 "Sponsored" 醒目标识
  - 🎯 强制置顶展示 (Top 3)
  - 🌐 全站推广位
  - 📈 2倍搜索排名加权
  - 🎨 自定义展示样式
  - 📞 优先客服支持

#### 4. 白金赞助 (Platinum) - $799/月
- **包含赞助套餐所有功能**
- **额外权益**:
  - 👑 "Platinum" 顶级标识
  - 🏅 首页Banner展示
  - 🚀 强制置顶 (Top 1)
  - 📱 移动端推广位
  - 📊 实时数据监控
  - 🎯 定向推广
  - 📧 日报推送
  - 🤝 专属客户经理

### 套餐对比表
| 功能 | 免费 | 精选 | 赞助 | 白金 |
|------|------|------|------|------|
| 基础展示 | ✅ | ✅ | ✅ | ✅ |
| 用户评价 | ✅ | ✅ | ✅ | ✅ |
| Featured标识 | ❌ | ⭐ | ⭐ | 👑 |
| 分类置顶 | ❌ | ✅ | ✅ | ✅ |
| 首页推荐 | ❌ | ✅ | ✅ | ✅ |
| 搜索优先 | ❌ | ✅ | ✅ | ✅ |
| 强制置顶 | ❌ | ❌ | ✅ | 🏅 |
| Banner展示 | ❌ | ❌ | ❌ | 🏆 |
| 数据分析 | ❌ | 📊 | 📊 | 📊 |
| 客服支持 | 📧 | 📧 | 📧 | 🤝 |

---

## 🏗️ 技术实现方案

### 1. 数据库扩展
```sql
-- 付费展示表
CREATE TABLE paid_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id),
  type TEXT NOT NULL CHECK (type IN ('featured', 'sponsored', 'platinum')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  auto_renew BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- 付费展示统计表
CREATE TABLE promotion_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES paid_promotions(id),
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 财务记录表
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES paid_promotions(id),
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'chargeback')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

### 2. 支付系统集成
```typescript
// src/lib/payment/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripePaymentService {
  async createPaymentIntent(promotionType: string, duration: number): Promise<Stripe.PaymentIntent> {
    const prices = {
      featured: 99,
      sponsored: 299,
      platinum: 799
    };

    const amount = prices[promotionType] * duration * 100; // 转换为分

    return await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        promotion_type: promotionType,
        duration: duration.toString()
      }
    });
  }

  async createSubscription(promotionType: string): Promise<Stripe.Subscription> {
    const prices = {
      featured: 'price_featured_monthly',
      sponsored: 'price_sponsored_monthly',
      platinum: 'price_platinum_monthly'
    };

    return await stripe.subscriptions.create({
      customer: 'customer_id',
      items: [{ price: prices[promotionType] }],
      metadata: {
        promotion_type: promotionType
      }
    });
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleSubscriptionPayment(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancellation(event.data.object);
        break;
    }
  }
}
```

### 3. 付费展示API
```typescript
// src/routes/api/promotions/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const type = url.searchParams.get('type'); // featured, sponsored, platinum
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  // 获取活跃的付费推广应用
  const query = `
    SELECT a.*, pp.type, pp.end_date
    FROM apps a
    JOIN paid_promotions pp ON a.id = pp.app_id
    WHERE pp.status = 'active'
      AND pp.end_date > NOW()
      AND a.status = 'approved'
      ${type ? `AND pp.type = '${type}'` : ''}
      ${category ? `AND a.category = '${category}'` : ''}
    ORDER BY
      CASE pp.type
        WHEN 'platinum' THEN 1
        WHEN 'sponsored' THEN 2
        WHEN 'featured' THEN 3
        ELSE 4
      END,
      pp.created_at DESC
    LIMIT $1
  `;

  const promotions = await db.query(query, [limit]);

  return json({
    success: true,
    promotions: promotions.rows,
    count: promotions.rows.length
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const { appId, promotionType, duration, paymentMethod } = await request.json();

  // 1. 验证应用存在且已批准
  const app = await db.query('SELECT * FROM apps WHERE id = $1 AND status = $2', [appId, 'approved']);
  if (app.rows.length === 0) {
    return json({ success: false, error: 'App not found or not approved' }, { status: 400 });
  }

  // 2. 检查是否已有有效的付费推广
  const existingPromotion = await db.query(
    'SELECT * FROM paid_promotions WHERE app_id = $1 AND status = $2 AND end_date > NOW()',
    [appId, 'active']
  );

  if (existingPromotion.rows.length > 0) {
    return json({ success: false, error: 'App already has an active promotion' }, { status: 400 });
  }

  // 3. 创建付费推广记录
  const prices = { featured: 99, sponsored: 299, platinum: 799 };
  const totalPrice = prices[promotionType] * duration;

  const promotion = await db.query(`
    INSERT INTO paid_promotions (app_id, type, start_date, end_date, price, payment_status)
    VALUES ($1, $2, NOW(), NOW() + INTERVAL '${duration} months', $3, 'pending')
    RETURNING *
  `, [appId, promotionType, totalPrice]);

  // 4. 创建支付意图
  const paymentService = new StripePaymentService();
  const paymentIntent = await paymentService.createPaymentIntent(promotionType, duration);

  // 5. 更新推广记录
  await db.query(
    'UPDATE paid_promotions SET payment_id = $1 WHERE id = $2',
    [paymentIntent.id, promotion.rows[0].id]
  );

  return json({
    success: true,
    promotion: promotion.rows[0],
    paymentIntent: {
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount
    }
  });
};
```

### 4. 应用展示逻辑更新
```typescript
// src/routes/category/[slug]/+page.svelte
async function loadCategoryApps() {
  loading = true;
  try {
    let allApps = [];

    // 1. 获取付费推广应用 (白金 > 赞助 > 精选)
    const paidResponse = await fetch(`/api/promotions?category=${categorySlug}&limit=10`);
    if (paidResponse.ok) {
      const paidData = await paidResponse.json();
      allApps = paidData.promotions || [];
    }

    // 2. 获取常规应用
    const regularResponse = await fetch(`/api/category/${categorySlug}?subcategory=${selectedSubcategory}&sort=${sortBy}`);
    if (regularResponse.ok) {
      const regularData = await regularResponse.json();
      const regularApps = Array.isArray(regularData) ? regularData : regularData.apps || [];

      // 合并应用，确保不重复
      const existingIds = new Set(allApps.map(app => app.id));
      const uniqueRegularApps = regularApps.filter(app => !existingIds.has(app.id));
      allApps = [...allApps, ...uniqueRegularApps];
    }

    categoryApps = allApps.length > 0 ? allApps : getMockCategoryApps();

  } catch (error) {
    console.error('Failed to load category apps:', error);
    categoryApps = getMockCategoryApps();
  } finally {
    loading = false;
  }
}
```

### 5. 付费推广标识组件
```svelte
<!-- src/lib/components/PromotionBadge.svelte -->
<script lang="ts">
  export let type: 'featured' | 'sponsored' | 'platinum';
  export let endDate: string;
  export let size: 'small' | 'medium' | 'large' = 'medium';

  const badges = {
    featured: {
      label: 'Featured',
      color: '#FF6B6B',
      icon: '⭐'
    },
    sponsored: {
      label: 'Sponsored',
      color: '#4ECDC4',
      icon: '💎'
    },
    platinum: {
      label: 'Platinum',
      color: '#FFD93D',
      icon: '👑'
    }
  };

  $: badge = badges[type];
  $: daysLeft = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  $: isExpiringSoon = daysLeft <= 7;
</script>

<div class="promotion-badge {type} {size}" style="--badge-color: {badge.color}">
  <span class="badge-icon">{badge.icon}</span>
  <span class="badge-label">{badge.label}</span>
  {#if isExpiringSoon}
    <span class="expiry-warning">({daysLeft} days left)</span>
  {/if}
</div>

<style>
  .promotion-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    background: var(--badge-color);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .promotion-badge.large {
    padding: 6px 12px;
    font-size: 0.875rem;
  }

  .promotion-badge.small {
    padding: 2px 6px;
    font-size: 0.625rem;
  }

  .badge-icon {
    font-size: 1em;
  }

  .expiry-warning {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 8px;
    margin-left: 4px;
  }
</style>
```

---

## 📊 数据存储现状

### 当前存储方案分析
```typescript
// 当前实现 (内存存储)
global.submittedApps = []; // ❌ 服务器重启后丢失

// 存在的问题:
1. 数据不持久化
2. 无法支持多实例
3. 没有数据备份
4. 无法进行复杂查询
5. 无法支持付费功能
```

### 数据升级路径
```typescript
// 步骤1: 文件系统存储 (立即可用)
export class FileSystemStorage {
  private dataPath = './data';

  async saveApps(apps: AppData[]) {
    await fs.writeFile(`${this.dataPath}/apps.json`, JSON.stringify(apps, null, 2));
  }

  async loadApps(): Promise<AppData[]> {
    if (await fs.pathExists(`${this.dataPath}/apps.json`)) {
      return JSON.parse(await fs.readFile(`${this.dataPath}/apps.json`, 'utf-8'));
    }
    return [];
  }
}

// 步骤2: SQLite数据库 (1-2周)
export class SQLiteDatabase {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // 执行完整的数据库结构
  }
}

// 步骤3: PostgreSQL (生产环境) - 4-6周
export class PostgreSQLDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }
}
```

---

## 🚀 立即可实施的快速方案

### 1. 立即升级到文件存储
```typescript
// 替换当前的内存存储
import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');

// 确保数据目录存在
await fs.ensureDir(DATA_DIR);

// 读取应用数据
export async function loadApps(): Promise<AppData[]> {
  try {
    if (await fs.pathExists(APPS_FILE)) {
      return JSON.parse(await fs.readFile(APPS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to load apps:', error);
  }
  return [];
}

// 保存应用数据
export async function saveApps(apps: AppData[]): Promise<void> {
  try {
    await fs.writeFile(APPS_FILE, JSON.stringify(apps, null, 2));
  } catch (error) {
    console.error('Failed to save apps:', error);
  }
}
```

### 2. 更新API以使用文件存储
```typescript
// src/routes/api/submit-app/+server.ts
export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.json();

    // 验证数据
    const requiredFields = ['appName', 'category', 'websiteUrl', 'description'];
    // ... 验证逻辑

    // 创建新应用
    const newApp: AppData = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      // ... 其他字段
    };

    // 加载现有应用
    const existingApps = await loadApps();

    // 添加新应用
    existingApps.push(newApp);

    // 保存到文件
    await saveApps(existingApps);

    return json({
      success: true,
      message: 'App submitted successfully!',
      appId: newApp.id
    });

  } catch (error) {
    console.error('Submit app error:', error);
    return json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
};
```

### 3. 添加简单的付费功能
```typescript
// 临时付费管理 (文件存储)
interface Payment {
  id: string;
  appId: string;
  type: 'featured' | 'sponsored' | 'platinum';
  startDate: string;
  endDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  paymentId?: string;
}

// 保存付费记录
export async function savePayment(payment: Payment): Promise<void> {
  const payments = await loadPayments();
  payments.push(payment);
  await fs.writeFile(path.join(DATA_DIR, 'payments.json'), JSON.stringify(payments, null, 2));
}

// 获取活跃的付费应用
export async function getActivePromotions(): Promise<AppData[]> {
  const apps = await loadApps();
  const payments = await loadPayments();

  const activePaymentIds = payments
    .filter(p => p.status === 'paid' && new Date(p.endDate) > new Date())
    .map(p => p.appId);

  return apps.filter(app => activePaymentIds.includes(app.id));
}
```

---

## 📋 实施优先级和时间表

### 立即可执行 (本周内)
1. **✅** 文件存储升级 - 解决数据持久化问题
2. **✅** 简单付费记录 - 开始接收付费申请
3. **✅** 付费标识显示 - 在应用卡片上显示付费状态

### 短期目标 (2-4周)
1. **🔄** SQLite数据库集成
2. **🔄** Stripe支付集成
3. **🔄** 管理员后台基础功能
4. **🔄** 应用审核工作流

### 中期目标 (1-2个月)
1. **⏳** PostgreSQL数据库迁移
2. **⏳** 完整的管理员系统
3. **⏳** 高级分析和报告
4. **⏳** 自动化支付处理

### 长期目标 (3-6个月)
1. **⏳** 微服务架构
2. **⏳** 容器化部署
3. **⏳** 高级营销工具
4. **⏳** API对外开放

---

## 🤝 下一步行动

### 立即执行步骤
1. **数据持久化**: 替换内存存储为文件存储
2. **付费接口**: 创建简单的付费申请API
3. **展示更新**: 修改应用卡片显示付费标识

### 技术债务清理
1. **代码重构**: 优化现有代码结构
2. **错误处理**: 添加完整的错误处理
3. **测试覆盖**: 添加单元测试和集成测试

### 业务流程建立
1. **审核流程**: 建立应用审核标准
2. **客服支持**: 设置客户支持渠道
3. **财务管理**: 建立财务跟踪系统

---

*最后更新: 2025年11月15日*