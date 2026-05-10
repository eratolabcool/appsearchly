/**
 * [INPUT]: 依赖 @sveltejs/kit, $lib/storage/file-storage
 * [OUTPUT]: 对外提供 POST, GET
 * [POS]: src/routes/api/submit-app/+server 的工具模块
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { addApp, loadApps, updateApp, AppData } from '$lib/storage/file-storage';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.json();

    // 验证必填字段
    const requiredFields = ['appName', 'category', 'websiteUrl', 'description', 'developerName', 'developerEmail'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      return json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.developerEmail)) {
      return json({
        success: false,
        error: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // 验证URL格式
    try {
      new URL(formData.websiteUrl);
    } catch {
      return json({
        success: false,
        error: 'Please enter a valid website URL'
      }, { status: 400 });
    }

    // 创建应用记录
    const newApp = await addApp({
      appName: formData.appName,
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory || null,
      icon: formData.icon || '📱',
      screenshots: formData.screenshots || [],
      developerName: formData.developerName,
      developerEmail: formData.developerEmail,
      websiteUrl: formData.websiteUrl,
      downloadUrl: formData.downloadUrl || null,
      platforms: formData.platforms || ['web'],
      pricingModel: formData.pricingModel || 'free',
      price: formData.price || null,
      currency: formData.currency || 'USD',
      rating: 0,
      reviewCount: 0,
      downloads: 0,
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
      status: 'pending',
      version: formData.version || '1.0.0',
      size: formData.size || null,
      requirements: formData.requirements || null,
      privacyPolicy: formData.privacyPolicy || '',
      termsOfService: formData.termsOfService || '',
      supportEmail: formData.supportEmail || formData.developerEmail,
      socialLinks: formData.socialLinks || {},
      seo: {
        slug: formData.appName.toLowerCase().replace(/\s+/g, '-'),
        title: `${formData.appName} - App Search`,
        description: formData.description,
        keywords: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : []
      },
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0
      }
    });

    console.log('New app submitted:', newApp);

    // 发送确认邮件（这里只是模拟）
    console.log(`Confirmation email sent to: ${formData.developerEmail}`);

    return json({
      success: true,
      message: 'App submitted successfully! Our team will review it within 48 hours.',
      appId: newApp.id,
      submittedAt: newApp.submittedAt,
      seoSlug: newApp.seo.slug
    });

  } catch (error) {
    console.error('Submit app error:', error);
    return json({
      success: false,
      error: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
};

// GET方法用于查看提交的应用
export const GET: RequestHandler = async ({ url }) => {
  try {
    const status = url.searchParams.get('status') || 'all'; // pending, approved, rejected, all
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');

    let apps = await loadApps();

    // 过滤状态
    if (status !== 'all') {
      apps = apps.filter(app => app.status === status);
    }

    // 按提交时间倒序排列
    apps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApps = apps.slice(startIndex, endIndex);

    return json({
      success: true,
      apps: paginatedApps,
      total: apps.length,
      page,
      limit,
      totalPages: Math.ceil(apps.length / limit)
    });

  } catch (error) {
    console.error('Get submitted apps error:', error);
    return json({
      success: false,
      error: 'Failed to fetch submitted apps'
    }, { status: 500 });
  }
};