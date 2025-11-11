# App Search MVP 🚀

移动应用聚合搜索引擎MVP版本 - 基于Apple App Store源码构建

## 🎯 项目概述

这是一个快速原型产品，用于验证移动应用聚合搜索的市场需求。基于Apple App Store的UI设计语言，提供跨平台应用搜索、筛选和推荐功能。

### 核心功能
- 🔍 **跨平台搜索**: iOS、Android、Web应用统一搜索
- 🎚️ **智能筛选**: 按平台、类别、价格、评分筛选
- 💰 **价格监控**: 实时价格和限免信息
- 📱 **移动优先**: 响应式设计，移动端体验优秀
- 🤝 **联盟营销**: 集成应用商店联盟链接
- ⚡ **快速加载**: 基于Svelte的高性能前端

## 🚀 快速开始

### 方式一：使用启动脚本（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd gametemplate

# 运行启动脚本
./start-search.sh
```

### 方式二：手动启动

```bash
# 1. 安装依赖
npm install

# 2. 复制搜索配置
cp package-search.json package.json

# 3. 启动开发服务器
npm run dev
```

### 访问应用

打开浏览器访问: http://localhost:5173

## 🏗️ 技术架构

### 前端技术栈
- **Svelte 5**: 现代响应式前端框架
- **TypeScript**: 类型安全的JavaScript
- **SCSS**: CSS预处理器
- **Vite**: 快速构建工具

### UI设计
- **Apple Design System**: 基于Apple官方UI组件
- **响应式设计**: 移动端优先设计理念
- **无障碍支持**: 完整的可访问性实现

### 核心组件
- `AppSearch.svelte`: 主搜索界面
- `SearchBar.svelte`: 搜索栏组件
- `FilterPanel.svelte`: 筛选面板
- `AppGrid.svelte`: 应用网格展示
- `AppCard.svelte`: 应用卡片
- `AppDetail.svelte`: 应用详情模态

## 📊 数据结构

### 应用数据模型
```typescript
interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  platform: 'ios' | 'android' | 'web' | 'desktop';
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  icon: string;
  screenshots: string[];
  developer: string;
  size: string;
  version: string;
  lastUpdated: string;
  downloadUrl: string;
  affiliateUrl?: string;
  tags: string[];
  isFree: boolean;
  inAppPurchases: boolean;
}
```

## 💰 商业化模式

### 联盟营销
- **Apple App Store**: 15-30%佣金
- **Google Play Store**: 10-20%佣金
- **Amazon Appstore**: 5-15%佣金

### 广告收入
- Google AdSense集成
- 应用开发商推广合作
- 高级功能订阅

## 🌐 部署选项

### 静态部署
```bash
# 构建生产版本
npm run build

# 本地预览
npm run preview

# 使用serve命令
npm run serve
```

### 部署平台
- **Vercel**: 推荐，零配置部署
- **Netlify**: 简单静态托管
- **GitHub Pages**: 免费静态托管
- **Cloudflare Pages**: 全球CDN加速

### 环境变量配置
```bash
# Apple联盟营销
VITE_APPLE_AFFILIATE_TOKEN=your_token
VITE_APPLE_CAMPAIGN_ID=your_campaign

# Google联盟营销
VITE_GOOGLE_AFFILIATE_ID=your_id
VITE_GOOGLE_CAMPAIGN_ID=your_campaign

# Amazon联盟营销
VITE_AMAZON_AFFILIATE_TAG=your_tag
```

## 📈 SEO优化

### 元标签优化
- 动态页面标题
- 描述性meta描述
- Open Graph标签
- Twitter Card支持

### 结构化数据
- JSON-LD格式
- WebApplication schema
- 搜索引擎友好

### 性能优化
- 图片懒加载
- 代码分割
- 缓存策略
- CDN加速

## 🔧 开发指南

### 添加新应用
```typescript
// 在 src/stores/apps.ts 中添加模拟数据
const newApp: App = {
  id: 'unique-id',
  name: 'App Name',
  // ... 其他字段
};
```

### 自定义筛选器
```typescript
// 在 FilterPanel.svelte 中添加新的筛选选项
const newFilter = {
  label: 'Filter Name',
  value: 'filter-value'
};
```

### 添加新平台
1. 更新App接口中的platform类型
2. 在affiliate.ts中添加URL转换逻辑
3. 更新UI组件中的平台显示

## 📱 移动端优化

### 响应式断点
- 手机: < 640px
- 平板: 640px - 1024px
- 桌面: > 1024px

### 触摸优化
- 点击区域 >= 44px
- 手势支持
- 原生滚动体验

### 性能优化
- 懒加载
- 虚拟滚动
- 图片优化

## 🧪 测试

### 本地测试
```bash
# 运行类型检查
npm run check

# 代码格式检查
npm run lint

# 自动修复格式
npm run format
```

### 测试数据
当前使用模拟数据进行开发。生产环境需要：
1. 接入真实的应用商店API
2. 实现数据缓存策略
3. 错误处理和重试机制

## 🚧 已知限制

### MVP版本限制
- 使用模拟数据
- 单用户界面
- 无用户认证
- 无实时更新

### 数据获取限制
- 需要应用商店API密钥
- 遵守使用条款和限制
- 实现缓存避免超限

## 📞 支持

### 技术支持
- 查看代码注释
- 阅读Svelte文档
- 检查浏览器控制台

### 功能建议
欢迎提交功能请求和bug报告！

## 📄 许可证

基于Apple App Store源码学习项目，仅用于教育和研究目的。

---

## 🎯 下一步计划

1. **集成真实API**: 接入应用商店API
2. **用户系统**: 添加收藏和历史记录
3. **AI推荐**: 智能应用推荐
4. **内容营销**: 应用评测和推荐文章
5. **社区功能**: 用户评价和讨论

**立即开始测试MVP，验证市场需求！** 🚀