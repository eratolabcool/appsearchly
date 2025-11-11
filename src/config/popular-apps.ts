// 热门应用配置文件 - 你可以完全控制首页显示哪些应用

export interface PopularAppCategory {
  category: string;
  searchTerms: string[];
  limit: number;
  priority: number; // 1-10，数字越大优先级越高
}

export const POPULAR_APPS_CONFIG: PopularAppCategory[] = [
  {
    category: 'productivity',
    searchTerms: ['notion', 'slack', 'zoom', 'microsoft 365', 'trello'],
    limit: 5,
    priority: 10 // 最高优先级，首先显示
  },
  {
    category: 'high_commission',
    searchTerms: ['adobe creative cloud', 'microsoft office', 'canva pro', 'figma pro'],
    limit: 3,
    priority: 9 // 高佣金应用
  },
  {
    category: 'social',
    searchTerms: ['instagram', 'tiktok', 'snapchat', 'whatsapp', 'telegram'],
    limit: 3,
    priority: 8
  },
  {
    category: 'entertainment',
    searchTerms: ['netflix', 'youtube premium', 'spotify', 'disney+', 'hbo max'],
    limit: 3,
    priority: 7
  },
  {
    category: 'games',
    searchTerms: ['among us', 'minecraft', 'roblox', 'clash royale', 'genshin impact'],
    limit: 3,
    priority: 6
  },
  {
    category: 'creative',
    searchTerms: ['procreate', 'adobe photoshop', 'canva', 'figma', 'adobe premiere'],
    limit: 2,
    priority: 5
  },
  {
    category: 'health',
    searchTerms: ['calm', 'headspace', 'myfitnesspal', 'strava', 'peloton'],
    limit: 2,
    priority: 4
  }
];

// 手动推荐的应用（高佣金或高转化率）
export const FEATURED_APPS = [
  {
    name: 'Notion',
    searchTerms: ['notion'],
    description: '最受欢迎的生产力工具',
    commission: '7%',
    reason: '高评分 + 高转化率',
    position: 1 // 首页第1位
  },
  {
    name: 'Procreate',
    searchTerms: ['procreate'],
    description: '设计师必备绘画工具',
    commission: '7%',
    reason: '高价值付费应用',
    position: 2
  },
  {
    name: 'Adobe Creative Cloud',
    searchTerms: ['adobe photoshop'],
    description: '订阅制高佣金应用',
    commission: '7%',
    reason: '订阅制高佣金',
    position: 3
  }
];

// 根据优先级排序的热门应用类别
export const SORTED_POPULAR_APPS = POPULAR_APPS_CONFIG
  .sort((a, b) => b.priority - a.priority);

// 高佣金应用列表（用于优化收入）
export const HIGH_COMMISSION_APPS = [
  'adobe creative cloud',
  'microsoft office 365',
  'canva pro',
  'figma pro',
  'slack',
  'zoom',
  'notion',
  'trello',
  'asana'
];

// 季节性推荐应用
export const SEASONAL_RECOMMENDATIONS = {
  'January': ['fitness', 'productivity', 'planning'], // 新年目标
  'February': ['learning', 'education', 'skill development'], // 情人节后
  'March': ['fitness', 'outdoor', 'health'], // 春天来临
  'April': ['tax', 'finance', 'budgeting'], // 报税季节
  'May': ['travel', 'vacation', 'booking'], // 暑假规划
  'June': ['travel', 'outdoor', 'photography'], // 夏天开始
  'July': ['vacation', 'travel', 'entertainment'], // 暑假高峰
  'August': ['back to school', 'education', 'learning'], // 返校季
  'September': ['productivity', 'organization', 'learning'], // 工作季节
  'October': ['creative', 'design', 'photography'], // 艺术季节
  'November': ['productivity', 'planning', 'black friday'], // 黑色星期五
  'December': ['shopping', 'entertainment', 'holiday'] // 节日季节
};

// 根据当前月份获取推荐
export function getSeasonalRecommendations(): string[] {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  return SEASONAL_RECOMMENDATIONS[currentMonth] || ['productivity', 'social'];
}

// 根据时间获取推荐应用
export function getPopularApps(): string[] {
  const seasonalApps = getSeasonalRecommendations();
  const trendingApps = ['trending', 'popular', 'new'];

  return [...seasonalApps, ...trendingApps];
}