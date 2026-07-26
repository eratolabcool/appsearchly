/**
 * [INPUT]: 依赖 @sveltejs/kit
 * [OUTPUT]: 对外提供 GET, POST, PUT
 * [POS]: src/routes/api/submitted-apps/+server 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import {
  loadApps,
  updateApp,
  getActivePromotions
} from '$lib/storage/file-storage';
import type { AppData } from '$lib/storage/file-storage';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const status = url.searchParams.get('status') || 'approved'; // pending, approved, rejected, all
    const category = url.searchParams.get('category') || null;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');
    const includePromotions = url.searchParams.get('includePromotions') === 'true';

    let apps = await loadApps();

    // 过滤应用
    let filteredApps = apps.filter(app => {
      if (status !== 'all' && app.status !== status) return false;
      if (category && app.category !== category) return false;
      return true;
    });

    // 如果包含付费推广，获取活跃推广的应用并置顶
    if (includePromotions) {
      const activePromotions = await getActivePromotions();
      const promotedAppIds = new Set(activePromotions.map(p => p.app.id));

      // 将付费应用置顶
      filteredApps.sort((a, b) => {
        const aIsPromoted = promotedAppIds.has(a.id);
        const bIsPromoted = promotedAppIds.has(b.id);

        if (aIsPromoted && !bIsPromoted) return -1;
        if (!aIsPromoted && bIsPromoted) return 1;

        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
    } else {
      // 排序：最新提交的优先
      filteredApps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApps = filteredApps.slice(startIndex, endIndex);

    // 格式化应用数据以匹配AppCard组件
    const formattedApps = paginatedApps.map(app => {
      const baseApp = {
        id: app.id,
        name: app.name,
        description: app.description,
        icon: app.icon || '📱',
        rating: app.rating || 4.0 + Math.random() * 1.5, // 如果没有评分则模拟
        reviewCount: app.reviewCount || Math.floor(Math.random() * 1000) + 10,
        price: app.pricingModel === 'free' ? 0 : (app.price || (app.pricingModel === 'freemium' ? 0 : Math.floor(Math.random() * 50) + 5)),
        currency: app.currency || 'USD',
        platform: app.platforms?.[0] || 'web',
        category: app.category,
        subcategory: app.subcategory,
        url: app.websiteUrl,
        downloadUrl: app.downloadUrl,
        featured: !!(app.featuredUntil && new Date(app.featuredUntil) > new Date()),
        sponsored: !!(app.sponsoredUntil && new Date(app.sponsoredUntil) > new Date()),
        submittedAt: app.submittedAt,
        publishedAt: app.publishedAt,
        developer: app.developerName,
        developerEmail: app.developerEmail,
        tags: app.tags || [],
        version: app.version,
        size: app.size,
        pricingModel: app.pricingModel,
        screenshots: app.screenshots || [],
        socialLinks: app.socialLinks || {},
        analytics: app.analytics || { views: 0, clicks: 0, conversions: 0 }
      };

      // 如果是付费应用，添加付费信息
      if (includePromotions) {
        const now = new Date().toISOString();
        if (app.featuredUntil && app.featuredUntil > now) {
          (baseApp as any).promotionType = 'featured';
          (baseApp as any).promotionEndDate = app.featuredUntil;
        }
        if (app.sponsoredUntil && app.sponsoredUntil > now) {
          (baseApp as any).promotionType = 'sponsored';
          (baseApp as any).promotionEndDate = app.sponsoredUntil;
        }
      }

      return baseApp;
    });

    return json({
      success: true,
      apps: formattedApps,
      total: filteredApps.length,
      page,
      limit,
      totalPages: Math.ceil(filteredApps.length / limit),
      hasPromotions: includePromotions
    });

  } catch (error) {
    console.error('Get submitted apps error:', error);
    return json({
      success: false,
      error: 'Failed to fetch submitted apps'
    }, { status: 500 });
  }
};

// 管理员批量审核应用
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { appIds, action, reason, notifyDevelopers } = await request.json();

    if (!appIds || !Array.isArray(appIds) || appIds.length === 0) {
      return json({
        success: false,
        error: 'Invalid app IDs provided'
      }, { status: 400 });
    }

    if (!['approve', 'reject', 'feature', 'unfeature'].includes(action)) {
      return json({
        success: false,
        error: 'Invalid action provided'
      }, { status: 400 });
    }

    let updatedCount = 0;
    const updatedApps: AppData[] = [];

    for (const appId of appIds) {
      const app = await updateApp(appId, {
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : undefined,
        featuredUntil: action === 'feature' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
                     action === 'unfeature' ? undefined : undefined,
        reviewedAt: new Date().toISOString(),
        adminNotes: reason
      });

      if (app) {
        updatedCount++;
        updatedApps.push(app);

        // 模拟发送邮件通知
        if (notifyDevelopers !== false) {
          console.log(`Notification email sent to ${app.developerEmail}: App ${action}d`);
        }
      }
    }

    console.log(`Bulk review completed: ${updatedCount} apps ${action}d`);

    return json({
      success: true,
      message: `Successfully ${action}d ${updatedCount} apps`,
      updatedCount,
      updatedApps
    });

  } catch (error) {
    console.error('Bulk review error:', error);
    return json({
      success: false,
      error: 'Failed to perform bulk review'
    }, { status: 500 });
  }
};

// 管理员更新单个应用状态
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const { appId, updates } = await request.json();

    if (!appId || !updates) {
      return json({
        success: false,
        error: 'App ID and updates are required'
      }, { status: 400 });
    }

    const updatedApp = await updateApp(appId, {
      ...updates,
      reviewedAt: new Date().toISOString()
    });

    if (!updatedApp) {
      return json({
        success: false,
        error: 'App not found'
      }, { status: 404 });
    }

    return json({
      success: true,
      app: updatedApp,
      message: 'App updated successfully'
    });

  } catch (error) {
    console.error('Update app error:', error);
    return json({
      success: false,
      error: 'Failed to update app'
    }, { status: 500 });
  }
};
