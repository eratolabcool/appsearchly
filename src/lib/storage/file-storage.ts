/**
 * [INPUT]: 依赖 fs-extra, path
 * [OUTPUT]: 对外提供 AppData, PaymentData, AnalyticsData
 * [POS]: src/lib/storage/file-storage 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// 确保数据目录存在
export async function ensureDataDir() {
  try {
    await fs.ensureDir(DATA_DIR);
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// 应用数据接口
export interface AppData {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  icon: string;
  screenshots?: string[];
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
  status: 'pending' | 'approved' | 'rejected' | 'featured' | 'sponsored' | 'archived';
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
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

// 付费记录接口
export interface PaymentData {
  id: string;
  appId: string;
  type: 'featured' | 'sponsored' | 'platinum';
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  paymentId?: string;
  paymentProvider?: string;
  created_at: string;
  updated_at: string;
  auto_renew: boolean;
  notes?: string;
}

// 分析数据接口
export interface AnalyticsData {
  date: string;
  totalApps: number;
  approvedApps: number;
  pendingApps: number;
  totalDownloads: number;
  totalViews: number;
  revenue: number;
  activePromotions: number;
}

// 加载应用数据
export async function loadApps(): Promise<AppData[]> {
  try {
    await ensureDataDir();
    if (await fs.pathExists(APPS_FILE)) {
      const data = await fs.readFile(APPS_FILE, 'utf-8');
      const apps = JSON.parse(data);
      return Array.isArray(apps) ? apps : [];
    }
  } catch (error) {
    console.error('Failed to load apps:', error);
  }
  return [];
}

// 保存应用数据
export async function saveApps(apps: AppData[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(APPS_FILE, JSON.stringify(apps, null, 2));
    console.log(`Saved ${apps.length} apps to ${APPS_FILE}`);
  } catch (error) {
    console.error('Failed to save apps:', error);
    throw error;
  }
}

// 添加单个应用
export async function addApp(app: Omit<AppData, 'id'>): Promise<AppData> {
  const apps = await loadApps();
  const newApp: AppData = {
    ...app,
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    submittedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  apps.push(newApp);
  await saveApps(apps);
  return newApp;
}

// 更新应用
export async function updateApp(id: string, updates: Partial<AppData>): Promise<AppData | null> {
  const apps = await loadApps();
  const index = apps.findIndex(app => app.id === id);

  if (index === -1) {
    return null;
  }

  apps[index] = {
    ...apps[index],
    ...updates,
    lastUpdated: new Date().toISOString()
  };

  await saveApps(apps);
  return apps[index];
}

// 获取单个应用
export async function getApp(id: string): Promise<AppData | null> {
  const apps = await loadApps();
  return apps.find(app => app.id === id) || null;
}

// 删除应用
export async function deleteApp(id: string): Promise<boolean> {
  const apps = await loadApps();
  const index = apps.findIndex(app => app.id === id);

  if (index === -1) {
    return false;
  }

  apps.splice(index, 1);
  await saveApps(apps);
  return true;
}

// 搜索应用
export async function searchApps(query: string, filters?: {
  category?: string;
  status?: string;
  platform?: string;
  pricingModel?: string;
}): Promise<AppData[]> {
  const apps = await loadApps();
  let filteredApps = apps;

  // 文本搜索
  if (query) {
    const queryLower = query.toLowerCase();
    filteredApps = apps.filter(app =>
      app.name.toLowerCase().includes(queryLower) ||
      app.description.toLowerCase().includes(queryLower) ||
      app.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      app.developerName.toLowerCase().includes(queryLower)
    );
  }

  // 应用筛选
  if (filters) {
    if (filters.category) {
      filteredApps = filteredApps.filter(app => app.category === filters.category);
    }
    if (filters.status) {
      filteredApps = filteredApps.filter(app => app.status === filters.status);
    }
    if (filters.platform) {
      filteredApps = filteredApps.filter(app => app.platforms.includes(filters.platform as any));
    }
    if (filters.pricingModel) {
      filteredApps = filteredApps.filter(app => app.pricingModel === filters.pricingModel);
    }
  }

  return filteredApps;
}

// 获取分类应用
export async function getAppsByCategory(category: string, filters?: {
  subcategory?: string;
  status?: string;
  sortBy?: 'name' | 'rating' | 'downloads' | 'submittedAt';
  sortOrder?: 'asc' | 'desc';
}): Promise<AppData[]> {
  const apps = await loadApps();
  let filteredApps = apps.filter(app => app.category === category);

  if (filters) {
    if (filters.subcategory) {
      filteredApps = filteredApps.filter(app => app.subcategory === filters.subcategory);
    }
    if (filters.status) {
      filteredApps = filteredApps.filter(app => app.status === filters.status);
    }

    if (filters.sortBy) {
      const sortBy = filters.sortBy;
      filteredApps.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const order = filters.sortOrder === 'desc' ? -1 : 1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * order;
        }
        return String(aVal).localeCompare(String(bVal)) * order;
      });
    }
  }

  return filteredApps;
}

// 获取推荐应用
export async function getFeaturedApps(limit: number = 10): Promise<AppData[]> {
  const apps = await loadApps();
  const now = new Date().toISOString();

  return apps
    .filter(app =>
      app.status === 'approved' &&
      (app.featuredUntil && app.featuredUntil > now)
    )
    .slice(0, limit);
}

// 获取赞助应用
export async function getSponsoredApps(limit: number = 5): Promise<AppData[]> {
  const apps = await loadApps();
  const now = new Date().toISOString();

  return apps
    .filter(app =>
      app.status === 'approved' &&
      (app.sponsoredUntil && app.sponsoredUntil > now)
    )
    .slice(0, limit);
}

// 付费记录相关方法
export async function loadPayments(): Promise<PaymentData[]> {
  try {
    await ensureDataDir();
    if (await fs.pathExists(PAYMENTS_FILE)) {
      const data = await fs.readFile(PAYMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load payments:', error);
  }
  return [];
}

export async function savePayments(payments: PaymentData[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
  } catch (error) {
    console.error('Failed to save payments:', error);
    throw error;
  }
}

export async function addPayment(payment: Omit<PaymentData, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentData> {
  const payments = await loadPayments();
  const newPayment: PaymentData = {
    ...payment,
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  payments.push(newPayment);
  await savePayments(payments);
  return newPayment;
}

// 获取活跃的付费推广
export async function getActivePromotions(): Promise<{app: AppData, payment: PaymentData}[]> {
  const apps = await loadApps();
  const payments = await loadPayments();
  const now = new Date().toISOString();

  const activePayments = payments.filter(p =>
    p.status === 'paid' &&
    p.startDate <= now &&
    p.endDate > now
  );

  return activePayments.map(payment => ({
    app: apps.find(a => a.id === payment.appId)!,
    payment
  }));
}

// 分析数据相关方法
export async function loadAnalytics(): Promise<AnalyticsData[]> {
  try {
    await ensureDataDir();
    if (await fs.pathExists(ANALYTICS_FILE)) {
      const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
  return [];
}

export async function saveAnalytics(analytics: AnalyticsData[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (error) {
    console.error('Failed to save analytics:', error);
  }
}

// 生成今日分析数据
export async function generateTodayAnalytics(): Promise<AnalyticsData> {
  const apps = await loadApps();
  const payments = await loadPayments();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  return {
    date: today,
    totalApps: apps.length,
    approvedApps: apps.filter(a => a.status === 'approved').length,
    pendingApps: apps.filter(a => a.status === 'pending').length,
    totalDownloads: apps.reduce((sum, app) => sum + (app.downloads || 0), 0),
    totalViews: apps.reduce((sum, app) => sum + (app.analytics?.views || 0), 0),
    revenue: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.price || 0), 0),
    activePromotions: payments.filter(p =>
      p.status === 'paid' &&
      p.startDate <= now &&
      p.endDate > now
    ).length
  };
}

// 数据备份
export async function backupData(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(DATA_DIR, 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  try {
    await fs.ensureDir(backupDir);

    const backupData = {
      timestamp: new Date().toISOString(),
      apps: await loadApps(),
      payments: await loadPayments(),
      analytics: await loadAnalytics()
    };

    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`Backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw error;
  }
}

// 清理过期数据
export async function cleanupExpiredData(): Promise<void> {
  try {
    const apps = await loadApps();
    const now = new Date().toISOString();

    // 清理过期的推广
    const updatedApps = apps.map(app => ({
      ...app,
      featuredUntil: (app.featuredUntil && app.featuredUntil <= now) ? undefined : app.featuredUntil,
      sponsoredUntil: (app.sponsoredUntil && app.sponsoredUntil <= now) ? undefined : app.sponsoredUntil
    }));

    await saveApps(updatedApps);

    // 清理过期的支付记录
    const payments = await loadPayments();
    const updatedPayments = payments.map(payment => ({
      ...payment,
      status: (payment.endDate <= now && payment.status === 'paid') ? 'expired' as const : payment.status,
      updated_at: new Date().toISOString()
    }));

    await savePayments(updatedPayments);

    console.log('Expired data cleanup completed');
  } catch (error) {
    console.error('Failed to cleanup expired data:', error);
    throw error;
  }
}

// 初始化数据
export async function initializeData(): Promise<void> {
  await ensureDataDir();

  // 如果数据文件不存在，创建空的结构
  if (!await fs.pathExists(APPS_FILE)) {
    await saveApps([]);
  }

  if (!await fs.pathExists(PAYMENTS_FILE)) {
    await savePayments([]);
  }

  if (!await fs.pathExists(ANALYTICS_FILE)) {
    await saveAnalytics([]);
  }

  console.log('Data storage initialized');
}
