# 🔌 API集成指南

## 🎯 立即行动计划

现在你的MVP已经运行，最重要的事情是接入真实的应用数据！本指南将帮助你快速完成数据集成。

---

## 📊 数据源选项分析

### 🥇 选项1：第三方API服务（推荐新手）

#### RapidAPI - App Store APIs
```bash
# 优势：立即可用，免费额度足够测试
# 劣势：数据质量一般，可能有延迟

# 访问：https://rapidapi.com/hub
# 搜索：app store, google play, mobile apps
```

#### Serpdog API
```bash
# 优势：价格便宜，数据质量好
# 劣势：需要付费，但起步价很低

# 访问：https://serpdog.io/
# 提供：App Store和Google Play数据
```

#### Similarweb API
```bash
# 优势：数据非常全面
# 劣势：价格较贵，适合规模化后

# 访问：https://www.similarweb.com/corp/products/api/
```

### 🥈 选项2：官方API（长期方案）

#### Apple App Store Connect API
```bash
# 要求：
# - Apple Developer账号 ($99/年)
# - 应用审核通过
# - 复杂的JWT认证

# 文档：https://developer.apple.com/documentation/appstoreconnectapi
```

#### Google Play Developer API
```bash
# 要求：
# - Google Play开发者账号 ($25/一次性)
# - 应用发布在Play Store
# - OAuth2认证设置

# 文档：https://developers.google.com/android-publisher
```

---

## 🚀 快速集成方案（立即开始）

### 第一步：选择RapidAPI（免费快速）

```bash
# 1. 注册RapidAPI账号
# 访问：https://rapidapi.com/
# 使用GitHub或邮箱注册

# 2. 搜索应用数据API
# 推荐API：
# - "Apple App Store Search"
# - "Google Play Store API"
# - "App Store and Play Store"

# 3. 测试API响应
curl --request GET \
  --url 'https://app-store-scraper.p.rapidapi.com/search/term=productivity' \
  --header 'X-RapidAPI-Key: YOUR_API_KEY' \
  --header 'X-RapidAPI-Host: app-store-scraper.p.rapidapi.com'
```

### 第二步：创建API服务类

```typescript
// src/services/apiService.ts
class AppDataService {
  private rapidApiKey: string;
  private baseUrl: string;

  constructor() {
    this.rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    this.baseUrl = 'https://app-store-scraper.p.rapidapi.com';
  }

  async searchApps(query: string, platform: string = 'all'): Promise<App[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/term=${query}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'app-store-scraper.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformApiResponse(data);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private transformApiResponse(apiData: any): App[] {
    // 将API数据转换为我们的App格式
    return apiData.results.map((app: any) => ({
      id: app.trackId || app.appId,
      name: app.trackName || app.title,
      description: app.description || app.summary,
      category: app.primaryGenreName || app.genre,
      platform: app.kind?.includes('ios') ? 'ios' : 'android',
      price: app.price || 0,
      currency: app.currency || 'USD',
      rating: app.averageUserRating || app.rating,
      reviewCount: app.userRatingCount || app.reviews,
      icon: app.artworkUrl100 || app.icon,
      screenshots: app.screenshotUrls || app.screenshots,
      developer: app.artistName || app.developer,
      size: app.fileSizeBytes || app.size,
      version: app.version || app.currentVersion,
      lastUpdated: app.currentVersionReleaseDate || app.updated,
      downloadUrl: app.trackViewUrl || app.url,
      tags: this.extractTags(app),
      isFree: app.price === 0 || !app.price,
      inAppPurchases: app.inAppPurchases || false
    }));
  }

  private extractTags(app: any): string[] {
    // 从应用描述和类别中提取标签
    const tags = [];

    if (app.primaryGenreName) {
      tags.push(app.primaryGenreName.toLowerCase());
    }

    if (app.genres) {
      tags.push(...app.genres.map((g: string) => g.toLowerCase()));
    }

    // 从描述中提取关键词
    if (app.description) {
      const keywords = ['productivity', 'game', 'education', 'business', 'health'];
      keywords.forEach(keyword => {
        if (app.description.toLowerCase().includes(keyword)) {
          tags.push(keyword);
        }
      });
    }

    return [...new Set(tags)]; // 去重
  }
}

export const appDataService = new AppDataService();
```

### 第三步：更新数据存储

```typescript
// src/stores/apps.ts
import { writable, derived } from 'svelte/store';
import { appDataService } from '../services/apiService';

export interface App {
  // ... 现有接口保持不变
}

// 修改搜索函数
export const searchApps = async (query: string): Promise<void> => {
  isLoadingStore.set(true);

  try {
    if (query.trim() === '') {
      // 显示热门应用
      const popularApps = await appDataService.getPopularApps();
      searchResultsStore.set(popularApps);
    } else {
      // 搜索应用
      const results = await appDataService.searchApps(query);
      searchResultsStore.set(results);
    }
  } catch (error) {
    console.error('Search failed:', error);
    // 显示模拟数据作为fallback
    searchResultsStore.set(mockApps);
  } finally {
    isLoadingStore.set(false);
  }
};

// 添加获取热门应用功能
export const getPopularApps = async (): Promise<App[]> => {
  try {
    return await appDataService.getPopularApps();
  } catch (error) {
    console.error('Failed to get popular apps:', error);
    return mockApps.slice(0, 5); // 返回前5个模拟应用
  }
};
```

### 第四步：环境变量配置

```bash
# 创建 .env 文件
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_APPLE_AFFILIATE_TOKEN=appsearch
VITE_GOOGLE_AFFILIATE_ID=appsearch

# .env.example（提交到版本控制）
VITE_RAPIDAPI_KEY=
VITE_APPLE_AFFILIATE_TOKEN=appsearch
VITE_GOOGLE_AFFILIATE_ID=appsearch
```

### 第五步：添加加载状态和错误处理

```svelte
<!-- src/components/LoadingState.svelte -->
<script lang="ts">
  export let message = 'Loading...';
</script>

<div class="loading-state">
  <div class="loading-spinner"></div>
  <p>{message}</p>
</div>

<style>
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
```

---

## 🛠️ 实施时间表

### 第1天：API注册和测试
- [ ] 注册RapidAPI账号
- [ ] 选择并订阅API服务
- [ ] 测试API端点
- [ ] 获取API密钥

### 第2天：数据集成
- [ ] 创建API服务类
- [ ] 实现搜索功能
- [ ] 添加错误处理
- [ ] 测试数据转换

### 第3天：UI优化
- [ ] 添加加载状态
- [ ] 优化错误显示
- [ ] 改进用户体验
- [ ] 移动端测试

### 第4天：性能优化
- [ ] 实现缓存机制
- [ ] 添加防抖搜索
- [ ] 优化图片加载
- [ ] 测试性能指标

### 第5天：部署准备
- [ ] 生产环境配置
- [ ] 环境变量设置
- [ ] 最终测试
- [ ] 部署到生产环境

---

## 🔧 常见问题解决

### Q: API调用失败怎么办？
```typescript
// 添加重试机制
async function apiCallWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Q: 数据质量不高怎么办？
```typescript
// 添加数据验证
function validateAppData(app: any): boolean {
  return !!(app.id && app.name && app.icon && app.description);
}

// 在API响应中过滤无效数据
const validApps = apiData.filter(validateAppData);
```

### Q: API限制怎么办？
```typescript
// 实现客户端缓存
const searchCache = new Map<string, { data: App[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

function getCachedSearch(query: string): App[] | null {
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

---

## 💰 成本分析

### RapidAPI成本
- **免费版本**: 1000次请求/月
- **基础版本**: $9/月，10000次请求
- **专业版本**: $49/月，100000次请求

### 预估使用量
- **初期测试**: 100-500次/月
- **产品发布**: 1000-5000次/月
- **规模化后**: 10000+次/月

### 成本优化建议
1. **缓存策略**: 减少50%的API调用
2. **分页加载**: 减少单次数据量
3. **预加载热门应用**: 减少实时搜索

---

## 📈 成功指标

### 技术指标
- [ ] API响应时间 < 1秒
- [ ] 数据准确率 > 95%
- [ ] 缓存命中率 > 30%

### 产品指标
- [ ] 搜索成功率 > 90%
- [ ] 用户满意度 > 4/5
- [ ] 移动端性能 > 90分

---

## 🎯 立即行动清单

### 今天就做的事情：
1. [ ] **注册RapidAPI账号**（5分钟）
2. [ ] **测试一个API端点**（10分钟）
3. [ ] **获取API密钥**（5分钟）

### 明天要完成的事情：
1. [ ] **创建API服务类**（2小时）
2. [ ] **实现基础搜索**（2小时）
3. [ ] **测试数据流**（1小时）

### 本周目标：
- [ ] **完全替换模拟数据**
- [ ] **实现真实搜索功能**
- [ ] **优化用户体验**
- [ ] **准备生产部署**

---

**记住：完美的开始胜过完美的计划！立即开始，持续改进！** 🚀

**你现在最重要的是：注册RapidAPI账号，获取API密钥，这是真实数据的第一步！** 💪