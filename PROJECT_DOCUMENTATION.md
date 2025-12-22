# App Search 项目文档

## 📋 项目概述

**App Search** 是一个现代化的应用发现和聚合平台，专注于移动应用、软件工具和AI工具的展示与推荐。平台提供智能搜索、分类浏览、用户评价和应用提交等功能。

### 🎯 核心价值
- **应用发现**：帮助用户发现最佳的应用和工具
- **开发者平台**：为开发者提供应用展示和推广渠道
- **AI工具聚合**：专门收录和展示优质AI工具
- **智能推荐**：基于用户偏好的个性化推荐

### 🏗️ 技术架构
- **前端框架**：SvelteKit + TypeScript
- **构建工具**：Vite
- **数据存储**：JSON文件系统 + fs-extra
- **部署方式**：静态网站生成
- **SEO优化**：完整的meta标签和结构化数据

---

## 📁 项目结构

```
gametemplate/
├── src/                           # 源代码目录
│   ├── routes/                    # 页面路由
│   │   ├── +page.svelte          # 首页
│   │   ├── +layout.svelte        # 布局模板
│   │   ├── submit-app/           # 应用提交页面
│   │   ├── search/               # 搜索页面
│   │   ├── categories/           # 分类页面
│   │   ├── trending/             # 热门页面
│   │   ├── reviews/              # 评价页面
│   │   ├── blog/                 # 博客页面
│   │   └── api/                  # API端点
│   ├── components/               # 页面组件
│   │   ├── Hero.svelte           # 主页横幅
│   │   ├── FeaturedApps.svelte   # 精选应用
│   │   ├── Categories.svelte     # 分类展示
│   │   ├── TrendingAI.svelte     # 热门AI工具
│   │   └── ...                   # 其他组件
│   ├── lib/                      # 共享库
│   │   ├── components/           # 通用组件
│   │   └── storage/              # 数据存储模块
│   └── app.html                  # HTML模板
├── data/                         # 数据文件
│   ├── apps.json                # 应用数据
│   ├── categories.json          # 分类数据
│   └── payments.json            # 支付记录
├── static/                       # 静态资源
├── package.json                 # 项目配置
└── vite-search.config.ts        # Vite配置
```

---

## 🌐 页面功能和路由

### 1. 首页 (`/`)
**文件**：`src/routes/+page.svelte`

**功能**：
- 展示平台的主要功能和价值主张
- 显示热门应用和AI工具推荐
- 提供分类导航入口
- 显示平台统计数据

**组件**：
- `Hero.svelte` - 主横幅介绍
- `FeaturedApps.svelte` - 精选应用展示
- `Categories.svelte` - 分类导航
- `TrendingAI.svelte` - 热门AI工具
- `HowItWorks.svelte` - 使用说明
- `Testimonials.svelte` - 用户评价

### 2. 应用提交页面 (`/submit-app`)
**文件**：`src/routes/submit-app/+page.svelte`

**功能**：
- 多步骤应用提交表单
- 实时表单验证
- 文件上传支持
- 提交状态跟踪

**提交流程**：
1. **基本信息**：应用名称、开发者、分类、平台
2. **应用详情**：描述、特性、定价、链接
3. **法律信息**：隐私政策、服务条款、联系方式

### 3. 搜索页面 (`/search`)
**文件**：`src/routes/search/+page.svelte`

**功能**：
- 全文搜索功能
- 高级筛选选项
- 搜索结果排序
- 实时搜索建议

**筛选选项**：
- 分类筛选
- 平台筛选
- 价格模式筛选
- 评分筛选

### 4. 分类页面 (`/categories`)
**文件**：`src/routes/categories/+page.svelte`

**功能**：
- 显示所有应用分类
- 分类统计信息
- 子分类展示
- 分类搜索

### 5. 分类详情页 (`/category/[slug]`)
**文件**：`src/routes/category/[slug]/+page.svelte`

**功能**：
- 特定分类的应用列表
- 排序和筛选功能
- 分页显示
- 相关推荐

### 6. 热门页面 (`/trending`)
**文件**：`src/routes/trending/+page.svelte`

**功能**：
- 显示热门应用排行
- 增长趋势分析
- 时间筛选（日/周/月）
- 数据可视化

### 7. 博客页面 (`/blog`)
**文件**：`src/routes/blog/+page.svelte`

**功能**：
- 文章列表展示
- 分类标签筛选
- 搜索功能
- 分页浏览

### 8. 文章详情页 (`/blog/[slug]`)
**文件**：`src/routes/blog/[slug]/+page.svelte`

**功能**：
- 文章全文展示
- 相关文章推荐
- 评论系统
- 社交分享

### 9. 评价页面 (`/reviews`)
**文件**：`src/routes/reviews/+page.svelte`

**功能**：
- 用户评价展示
- 评分统计
- 评价筛选
- 评价管理

### 10. 静态页面

#### 关于我们 (`/about`)
**文件**：`src/routes/about/+page.svelte`
- 平台介绍
- 团队信息
- 发展历程

#### 联系我们 (`/contact`)
**文件**：`src/routes/contact/+page.svelte`
- 联系表单
- 客服信息
- 反馈渠道

#### 隐私政策 (`/privacy`)
**文件**：`src/routes/privacy/+page.svelte`
- 数据保护政策
- Cookie使用说明
- 用户权利

#### 服务条款 (`/terms`)
**文件**：`src/routes/terms/+page.svelte`
- 使用条款
- 责任限制
- 争议解决

---

## 🔧 API端点

### 应用相关API

#### 1. 获取应用列表 (`GET /api/search`)
**功能**：搜索和筛选应用
**参数**：
- `query`: 搜索关键词
- `category`: 分类筛选
- `platform`: 平台筛选
- `pricing`: 价格模式筛选
- `sort`: 排序方式

#### 2. 提交应用 (`POST /api/submit-app`)
**功能**：处理应用提交
**请求体**：应用数据对象
**响应**：提交结果和状态

#### 3. 获取分类应用 (`GET /api/category/[slug]`)
**功能**：获取特定分类的应用
**参数**：
- `slug`: 分类标识
- `sort`: 排序方式
- `limit`: 返回数量限制

#### 4. 获取热门应用 (`GET /api/trending-apps`)
**功能**：获取热门应用排行
**参数**：
- `period`: 时间周期（day/week/month）
- `limit`: 返回数量

#### 5. 获取精选应用 (`GET /api/featured-apps`)
**功能**：获取编辑精选应用
**参数**：
- `limit`: 返回数量
- `category`: 分类筛选

### 其他API

#### 1. 博客文章 (`GET /api/blog-posts`)
**功能**：获取博客文章列表
**参数**：
- `category`: 文章分类
- `tag`: 标签筛选
- `limit`: 返回数量

#### 2. 用户评价 (`GET /api/reviews`)
**功能**：获取用户评价
**参数**：
- `appId`: 应用ID
- `rating`: 评分筛选
- `limit`: 返回数量

---

## 💾 数据管理

### 数据存储架构

#### 1. 应用数据 (`data/apps.json`)
**文件结构**：
```json
{
  "id": "唯一标识符",
  "appName": "应用名称",
  "description": "应用描述",
  "category": "主分类",
  "subcategory": "子分类",
  "icon": "应用图标",
  "screenshots": ["截图URL数组"],
  "developerName": "开发者名称",
  "developerEmail": "开发者邮箱",
  "websiteUrl": "官方网站",
  "downloadUrl": "下载链接",
  "platforms": ["支持平台"],
  "pricingModel": "价格模式",
  "price": "价格",
  "currency": "货币",
  "rating": "评分",
  "reviewCount": "评价数量",
  "downloads": "下载量",
  "tags": ["标签数组"],
  "status": "审核状态",
  "submittedAt": "提交时间",
  "lastUpdated": "更新时间",
  "seo": {
    "slug": "URL别名",
    "title": "SEO标题",
    "description": "SEO描述",
    "keywords": ["关键词数组"]
  },
  "analytics": {
    "views": "浏览量",
    "clicks": "点击量",
    "conversions": "转化量"
  }
}
```

#### 2. 分类数据 (`data/categories.json`)
**文件结构**：
```json
{
  "categories": {
    "分类ID": {
      "name": "分类名称",
      "description": "分类描述",
      "icon": "分类图标",
      "subcategories": {
        "子分类ID": {
          "name": "子分类名称",
          "description": "子分类描述",
          "tools": ["应用名称数组"]
        }
      }
    }
  }
}
```

#### 3. 支付记录 (`data/payments.json`)
**文件结构**：
```json
{
  "id": "支付ID",
  "appId": "应用ID",
  "type": "推广类型",
  "status": "支付状态",
  "startDate": "开始时间",
  "endDate": "结束时间",
  "price": "价格",
  "currency": "货币",
  "auto_renew": "自动续费"
}
```

### 数据管理模块

#### 1. 文件存储系统 (`src/lib/storage/file-storage.ts`)
**核心功能**：

**应用数据管理**：
- `loadApps()`: 加载所有应用
- `saveApps()`: 保存应用数据
- `addApp()`: 添加新应用
- `updateApp()`: 更新应用信息
- `deleteApp()`: 删除应用
- `getApp()`: 获取单个应用
- `searchApps()`: 搜索应用

**分类数据管理**：
- `getAppsByCategory()`: 按分类获取应用
- `getFeaturedApps()`: 获取精选应用
- `getSponsoredApps()`: 获取赞助应用

**支付数据管理**：
- `loadPayments()`: 加载支付记录
- `addPayment()`: 添加支付记录
- `getActivePromotions()`: 获取活跃推广

**分析数据管理**：
- `loadAnalytics()`: 加载分析数据
- `generateTodayAnalytics()`: 生成今日分析
- `backupData()`: 数据备份
- `cleanupExpiredData()`: 清理过期数据

---

## 🚀 项目管理

### 开发环境设置

#### 1. 环境要求
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
}
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 开发命令
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 部署流程

#### 1. 构建项目
```bash
npm run build
```

#### 2. 部署到静态托管
- **Vercel**: 自动部署
- **Netlify**: Git集成部署
- **GitHub Pages**: Actions部署
- **AWS S3**: 静态网站托管

#### 3. 域名配置
```bash
# DNS配置
A记录: 服务器IP
CNAME: 域名别名
```

### 版本控制

#### 1. Git工作流
```bash
# 功能开发
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature

# 合并主分支
git checkout main
git merge feature/new-feature
```

#### 2. 发布标签
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0
```

---

## 📱 应用提交流程

### 1. 提交准备

#### 必需信息
- **基本信息**：应用名称、开发者信息、联系邮箱
- **应用详情**：详细描述、主要特性、官网链接
- **平台信息**：支持的平台、下载链接
- **分类标签**：选择合适的分类和标签
- **法律文件**：隐私政策、服务条款

#### 可选信息
- **媒体资源**：应用图标、截图、视频演示
- **定价信息**：价格、货币、订阅模式
- **社交媒体**：Twitter、Facebook等链接
- **额外信息**：版本号、应用大小、系统要求

### 2. 提交流程

#### 第一步：基本信息填写
```typescript
const basicInfo = {
  appName: "应用名称",
  developerName: "开发者名称",
  developerEmail: "联系邮箱",
  category: "选择分类",
  platforms: ["选择平台"],
  priceType: "价格模式"
};
```

#### 第二步：应用详情
```typescript
const appDetails = {
  websiteUrl: "官网链接",
  description: "应用描述（最少50字符）",
  features: "主要特性",
  tags: "标签（逗号分隔）",
  screenshots: ["截图数组"]
};
```

#### 第三步：法律信息
```typescript
const legalInfo = {
  privacyPolicy: "隐私政策链接",
  termsOfService: "服务条款链接",
  supportEmail: "客服邮箱",
  contactInfo: "额外联系信息"
};
```

### 3. 提交验证

#### 自动验证规则
- **邮箱格式**：正则表达式验证
- **URL格式**：有效的URL链接
- **内容长度**：描述最少50字符
- **必填字段**：所有必填项都已填写

#### 手动审核标准
- **应用质量**：功能完整、无明显bug
- **内容合规**：符合社区准则
- **信息准确**：描述与实际应用相符
- **版权合规**：拥有应用版权或授权

### 4. 审核状态

#### 状态流程
1. **待审核** (`pending`)：已提交，等待审核
2. **审核中** (`reviewing`)：正在人工审核
3. **已通过** (`approved`)：审核通过，公开显示
4. **已拒绝** (`rejected`)：不符合要求，已拒绝
5. **已归档** (`archived`)：不再维护的应用

#### 状态变更
```typescript
// 审核通过
await updateApp(appId, {
  status: 'approved',
  reviewedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
});

// 审核拒绝
await updateApp(appId, {
  status: 'rejected',
  reviewedAt: new Date().toISOString(),
  rejectionReason: '拒绝原因'
});
```

---

## ✅ 上线条件和审核标准

### 1. 基本条件

#### 技术要求
- ✅ **功能完整**：应用能够正常运行，无明显bug
- ✅ **性能良好**：响应速度快，用户体验流畅
- ✅ **兼容性**：在声明平台正常运行
- ✅ **安全性**：无恶意代码，数据保护得当

#### 内容要求
- ✅ **描述准确**：应用描述与实际功能相符
- ✅ **截图真实**：提供的截图真实反映应用界面
- ✅ **分类正确**：选择合适的应用分类
- ✅ **标签相关**：标签与应用功能相关

#### 法律要求
- ✅ **版权合规**：拥有应用版权或合法授权
- ✅ **隐私政策**：提供有效的隐私政策链接
- ✅ **服务条款**：提供完整的服务条款
- ✅ **联系方式**：提供有效的客服邮箱

### 2. 审核标准

#### 质量评分（满分100分）

**技术质量（30分）**
- 应用稳定性：10分
- 性能表现：10分
- 用户体验：10分

**内容质量（25分）**
- 描述准确性：10分
- 界面美观度：8分
- 功能创新性：7分

**用户体验（25分）**
- 易用性：10分
- 有用性：10分
- 响应速度：5分

**合规性（20分）**
- 法律合规：10分
- 平台规则：10分

#### 审核结果

**通过审核（≥70分）**
- 应用质量良好
- 符合所有基本条件
- 内容真实准确
- 用户评价积极

**待改进（60-69分）**
- 基本条件满足
- 部分方面需要改进
- 提供修改建议
- 可重新提交

**拒绝审核（<60分）**
- 重大技术问题
- 内容虚假或误导
- 严重违规行为
- 需要重大修改后重新提交

### 3. 特殊审核要求

#### AI工具专项审核
- ✅ **AI能力声明**：明确说明AI功能和应用场景
- ✅ **数据来源**：注明训练数据来源和使用方式
- ✅ **局限性说明**：说明AI工具的局限性和注意事项
- ✅ **伦理合规**：符合AI伦理和规范要求

#### 商业应用专项审核
- ✅ **商业模式清晰**：明确说明盈利模式
- ✅ **费用透明**：价格公开透明，无隐藏费用
- ✅ **用户协议**：完善的用户协议和退款政策
- ✅ **客户支持**：提供有效的客户支持渠道

### 4. 持续监控

#### 质量监控
- **用户评价跟踪**：监控用户反馈和评分
- **性能监控**：跟踪应用性能指标
- **合规检查**：定期检查合规性
- **更新要求**：要求定期更新应用信息

#### 违规处理
- **警告机制**：轻微问题给予警告和改进期
- **临时下架**：严重问题临时下架整改
- **永久封禁**：严重违规永久封禁
- **黑名单制度**：屡次违规加入黑名单

---

## 💰 收费功能设计

### 1. 会员订阅系统

#### 订阅类型

**免费版（Free）**
- ✅ 基础应用展示
- ✅ 标准搜索功能
- ✅ 应用提交流程
- ❌ 无推广功能
- ❌ 限制每日查看次数

**专业版（Professional）** - $9.99/月
- ✅ 所有免费功能
- ✅ 无限制浏览
- ✅ 高级搜索筛选
- ✅ 应用数据分析
- ✅ 优先技术支持

**企业版（Enterprise）** - $29.99/月
- ✅ 所有专业功能
- ✅ API访问权限
- ✅ 白标定制
- ✅ 专属客户经理
- ✅ 数据导出功能

#### 实现方案

```typescript
// 订阅数据结构
interface SubscriptionData {
  id: string;
  userId: string;
  type: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  features: string[];
}

// 订阅管理
class SubscriptionManager {
  async createSubscription(userId: string, type: string) {
    // 创建订阅记录
    // 处理支付
    // 激活功能
  }

  async cancelSubscription(subscriptionId: string) {
    // 取消订阅
    // 处理退款
    // 更新状态
  }

  async checkSubscriptionAccess(userId: string, feature: string) {
    // 检查用户权限
    // 返回访问权限
  }
}
```

### 2. 应用推广系统

#### 推广类型

**精选推荐（Featured）** - $49/月
- 🎯 首页精选区域展示
- 🎯 分类页面优先显示
- 🎯 "精选"标签标识
- 📊 详细浏览数据分析

**赞助展示（Sponsored）** - $99/月
- 🎯 首页轮播展示
- 🎯 搜索结果优先显示
- 🎯 "赞助"标签标识
- 📊 转化率跟踪分析

**白金推广（Platinum）** - $199/月
- 🎯 所有展示位置
- 🎯 定制推广方案
- 🎯 专属推广页面
- 🎯 社交媒体推广
- 📊 全面数据分析报告

#### 推广管理

```typescript
// 推广数据结构
interface PromotionData {
  id: string;
  appId: string;
  type: 'featured' | 'sponsored' | 'platinum';
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

// 推广管理
class PromotionManager {
  async createPromotion(appId: string, type: string, duration: number) {
    // 创建推广记录
    // 计算推广价格
    // 处理支付
  }

  async getActivePromotions() {
    // 获取活跃推广
    // 更新展示逻辑
  }

  async updatePromotionAnalytics(promotionId: string) {
    // 更新推广数据
    // 生成分析报告
  }
}
```

### 3. 支付集成

#### 支付提供商

**Stripe**（主要）
- 💳 信用卡支付
- 💳 银行直接支付
- 💳 数字钱包支持
- 🛡️ 安全可靠

**PayPal**（备选）
- 💳 PayPal账户支付
- 💳 信用卡支付
- 🌍 国际用户友好
- 🛡️ 买家保护

**微信支付/支付宝**（中国市场）
- 📱 扫码支付
- 📱 移动支付
- 🇨🇳 本地化支持
- 📈 高使用率

#### 支付流程

```typescript
// 支付处理
class PaymentProcessor {
  async createPaymentIntent(amount: number, currency: string, type: string) {
    // 创建支付意图
    // 选择支付提供商
    // 返回支付链接
  }

  async handlePaymentSuccess(paymentId: string) {
    // 验证支付
    // 激活服务
    // 发送确认邮件
  }

  async handleSubscriptionPayment(subscriptionId: string) {
    // 处理订阅续费
    // 更新订阅状态
    // 发送续费提醒
  }
}
```

### 4. 财务管理

#### 定价策略

**动态定价**
- 📈 基于需求调整价格
- 📈 节假日促销活动
- 📈 年付折扣优惠
- 📈 企业批量定价

**分级定价**
- 🎯 免费版吸引用户
- 🎯 专业版创造收入
- 🎯 企业版最大化收益
- 🎯 定制服务额外收费

**推广优惠**
- 🎁 新用户首月免费
- 🎁 年付享受8折优惠
- 🎁 学生优惠50%折扣
- 🎁 非营利组织免费

#### 收入分析

```typescript
// 收入分析
interface RevenueAnalytics {
  daily: {
    date: string;
    subscriptions: number;
    promotions: number;
    total: number;
  }[];
  monthly: {
    month: string;
    subscriptions: number;
    promotions: number;
    growth: number;
    total: number;
  }[];
  yearly: {
    year: string;
    totalRevenue: number;
    growthRate: number;
    profit: number;
  };
}

// 财务报告
class FinancialReporting {
  async generateRevenueReport(period: 'daily' | 'monthly' | 'yearly') {
    // 生成收入报告
    // 分析增长趋势
    // 预测未来收入
  }

  async calculateProfitability() {
    // 计算运营成本
    // 分析利润率
    // 优化定价策略
  }
}
```

### 5. 用户账户系统

#### 用户类型

**普通用户**
- 📱 浏览应用
- 📱 搜索筛选
- 📱 评价应用
- 📱 收藏应用

**开发者账户**
- 📱 所有普通用户功能
- 📱 提交应用管理
- 📱 查看应用数据
- 📱 购买推广服务

**企业账户**
- 📱 所有开发者功能
- 📱 多应用管理
- 📱 团队协作
- 📱 API访问权限

#### 账户管理

```typescript
// 用户数据结构
interface UserData {
  id: string;
  email: string;
  type: 'user' | 'developer' | 'enterprise';
  subscription?: SubscriptionData;
  profile: {
    name: string;
    avatar?: string;
    company?: string;
    website?: string;
  };
  apps: string[]; // 提交的应用ID
  favorites: string[]; // 收藏的应用ID
  createdAt: string;
  lastLogin: string;
}

// 账户管理
class UserManager {
  async createUser(userData: Partial<UserData>) {
    // 创建新用户
    // 发送验证邮件
    // 设置默认权限
  }

  async upgradeSubscription(userId: string, type: string) {
    // 升级订阅
    // 处理支付
    // 更新权限
  }

  async getUserPermissions(userId: string) {
    // 获取用户权限
    // 返回功能列表
  }
}
```

### 6. 实施计划

#### 第一阶段（1-2个月）
- 🎯 基础支付集成（Stripe）
- 🎯 订阅管理系统
- 🎯 简单推广功能
- 🎯 用户账户基础功能

#### 第二阶段（3-4个月）
- 🎯 完整会员系统
- 🎯 高级推广功能
- 🎯 数据分析仪表板
- 🎯 多支付提供商集成

#### 第三阶段（5-6个月）
- 🎯 企业级功能
- 🎯 API开放平台
- 🎯 移动端优化
- 🎯 国际化支持

---

## 📊 项目监控和分析

### 1. 关键指标（KPI）

**用户指标**
- 📈 日活跃用户数（DAU）
- 📈 月活跃用户数（MAU）
- 📈 用户留存率
- 📈 平均使用时长

**业务指标**
- 💰 月度经常性收入（MRR）
- 💰 客户获取成本（CAC）
- 💰 客户生命周期价值（LTV）
- 💰 转化率

**内容指标**
- 📱 应用提交数量
- 📱 审核通过率
- 📱 用户评价数量
- 📱 应用下载量

### 2. 分析工具

**Google Analytics 4**
- 🌐 网站流量分析
- 👥 用户行为追踪
- 📱 转化率优化
- 📊 自定义报告

**Hotjar**
- 🔥 热图分析
- 📹 用户会话录制
- 📋 反馈收集
- 🎯 转化漏斗分析

**自定义分析仪表板**
- 📈 实时数据监控
- 📊 业务指标追踪
- 📱 移动端分析
- 🎯 A/B测试结果

### 3. 性能监控

**网站性能**
- ⚡ 页面加载速度
- ⚡ 核心网页指标（Core Web Vitals）
- ⚡ 移动端性能
- ⚡ 服务器响应时间

**用户体验**
- 🎯 可访问性评分
- 🎯 跨浏览器兼容性
- 🎯 移动端适配
- 🎯 SEO优化效果

---

## 🔮 未来发展规划

### 短期目标（3-6个月）
- 🎯 完善收费功能
- 🎯 优化用户体验
- 🎯 增加AI工具分类
- 🎯 提升内容质量

### 中期目标（6-12个月）
- 🎯 移动应用开发
- 🎯 API平台开放
- 🎯 国际化扩展
- 🎯 社区功能建设

### 长期目标（1-2年）
- 🎯 成为领先的应用发现平台
- 🎯 建立完整的生态系统
- 🎯 实现盈利和可持续发展
- 🎯 推动应用行业创新

---

## 📞 联系信息

**项目团队**
- 📧 项目邮箱：contact@appsearchly.org
- 🌐 官方网站：https://appsearchly.org
- 📱 客服电话：+1 (555) 123-4567

**技术支持**
- 🐛 Bug报告：https://github.com/appsearchly/issues
- 💡 功能建议：https://github.com/appsearchly/features
- 📖 开发文档：https://docs.appsearchly.org

**商务合作**
- 💼 商务邮箱：business@appsearchly.org
- 🤝 合作洽谈：partnerships@appsearchly.org
- 📢 广告投放：ads@appsearchly.org

---

*最后更新：2024年12月*
*版本：1.0.0*
*文档维护：App Search Team*