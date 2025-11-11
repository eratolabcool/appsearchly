<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { itunesAffiliateManager } from '../utils/itunes-affiliate';
  import { isAdmin, logoutAdmin } from '~/utils/admin-auth';
  import AdminLogin from './AdminLogin.svelte';

  let stats = {
    totalClicks: 0,
    topApps: [],
    recentClicks: [],
    todayClicks: 0,
    thisWeekClicks: 0
  };

  let refreshInterval: NodeJS.Timeout;
  let showLoginModal = false;
  let isAuthenticated = false;

  function checkAuthStatus() {
    isAuthenticated = isAdmin();
    if (isAuthenticated) {
      updateStats();
    }
  }

  onMount(() => {
    checkAuthStatus();
    // 每30秒刷新一次统计数据
    refreshInterval = setInterval(() => {
      if (isAuthenticated) {
        updateStats();
      }
    }, 30000);
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  function updateStats() {
    stats = itunesAffiliateManager.getClickStats();

    // 计算今日点击
    const today = new Date().toDateString();
    const allClicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    const todayClicks = allClicks.filter(click =>
      new Date(click.timestamp).toDateString() === today
    ).length;
    stats.todayClicks = todayClicks;

    // 计算本周点击
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekClicks = allClicks.filter(click =>
      new Date(click.timestamp) >= weekAgo
    ).length;
    stats.thisWeekClicks = thisWeekClicks;
  }

  function clearStats() {
    if (confirm('确定要清除所有统计数据吗？')) {
      localStorage.removeItem('affiliate_clicks');
      updateStats();
    }
  }

  function exportStats() {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `affiliate-stats-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  function handleLoginSuccess() {
    isAuthenticated = true;
    updateStats();
  }

  function handleLogout() {
    logoutAdmin();
    isAuthenticated = false;
    showLoginModal = false;
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}天前`;
    } else if (diffHours > 0) {
      return `${diffHours}小时前`;
    } else {
      return '刚刚';
    }
  }
</script>

<div class="analytics-dashboard">
  {#if !isAuthenticated}
    <div class="access-denied">
      <div class="lock-icon">🔒</div>
      <h2>访问受限</h2>
      <p>此页面仅限管理员访问</p>
      <button class="btn btn-primary" on:click={() => showLoginModal = true}>
        管理员登录
      </button>
    </div>
  {:else}
    <div class="dashboard-header">
      <h2>📊 联盟营销统计</h2>
      <div class="header-actions">
        <button class="btn btn-secondary" on:click={exportStats}>
          📥 导出数据
        </button>
        <button class="btn btn-danger" on:click={clearStats}>
          🗑️ 清除数据
        </button>
        <button class="btn btn-outline" on:click={handleLogout}>
          🚪 退出登录
        </button>
      </div>
    </div>

  <div class="stats-grid">
    <div class="stat-card primary">
      <div class="stat-icon">🎯</div>
      <div class="stat-content">
        <h3>总点击次数</h3>
        <p class="stat-number">{formatNumber(stats.totalClicks)}</p>
      </div>
    </div>

    <div class="stat-card success">
      <div class="stat-icon">📅</div>
      <div class="stat-content">
        <h3>今日点击</h3>
        <p class="stat-number">{formatNumber(stats.todayClicks)}</p>
      </div>
    </div>

    <div class="stat-card info">
      <div class="stat-icon">📆</div>
      <div class="stat-content">
        <h3>本周点击</h3>
        <p class="stat-number">{formatNumber(stats.thisWeekClicks)}</p>
      </div>
    </div>

    <div class="stat-card warning">
      <div class="stat-icon">💰</div>
      <div class="stat-content">
        <h3>预估收入</h3>
        <p class="stat-number">${formatNumber(Math.round(stats.totalClicks * 0.02 * 15 * 0.07))}</p>
        <small>基于2%转化率和$15平均价值</small>
      </div>
    </div>
  </div>

  <div class="analytics-row">
    <div class="analytics-card">
      <h3>🔥 热门应用点击</h3>
      <div class="app-stats">
        {#each stats.topApps as app, index}
          <div class={`app-stat rank-${index + 1}`}>
            <span class="app-rank">#{index + 1}</span>
            <span class="app-name">{app.appName}</span>
            <span class="app-clicks">{formatNumber(app.clicks)}次点击</span>
          </div>
        {/each}
        {#if stats.topApps.length === 0}
          <p class="no-data">暂无点击数据</p>
        {/if}
      </div>
    </div>

    <div class="analytics-card">
      <h3>⏰ 最近点击记录</h3>
      <div class="recent-clicks">
        {#each stats.recentClicks as click}
          <div class="recent-click">
            <span class="click-app">{click.appName}</span>
            <span class="click-time">{formatTime(click.timestamp)}</span>
          </div>
        {/each}
        {#if stats.recentClicks.length === 0}
          <p class="no-data">暂无点击记录</p>
        {/if}
      </div>
    </div>
  </div>

  <div class="analytics-card full-width">
    <h3>📈 收入分析</h3>
    <div class="revenue-analysis">
      <div class="revenue-metric">
        <h4>保守估算</h4>
        <p>假设: 2%转化率, $15平均价值, 7%佣金</p>
        <p class="revenue-amount">
          月收入: ${formatNumber(Math.round(stats.totalClicks * 0.02 * 15 * 0.07 * 30 / stats.thisWeekClicks || 1))}
          (按当前趋势预估)
        </p>
      </div>
      <div class="revenue-metric">
        <h4>乐观估算</h4>
        <p>假设: 4%转化率, $25平均价值, 7%佣金</p>
        <p class="revenue-amount">
          月收入: ${formatNumber(Math.round(stats.totalClicks * 0.04 * 25 * 0.07 * 30 / stats.thisWeekClicks || 1))}
          (按当前趋势预估)
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .analytics-dashboard {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .dashboard-header h2 {
    margin: 0;
    color: #1d1d1f;
    font-size: 24px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #1d1d1f;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }

  .btn-danger {
    background: #ff3b30;
    color: white;
  }

  .btn-danger:hover {
    background: #ff0800;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    font-size: 24px;
    margin-right: 16px;
  }

  .stat-content h3 {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #86868b;
    font-weight: 500;
  }

  .stat-number {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1d1d1f;
  }

  .stat-number small {
    font-size: 12px;
    color: #86868b;
    font-weight: normal;
  }

  .analytics-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .analytics-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .analytics-card h3 {
    margin: 0 0 16px 0;
    color: #1d1d1f;
    font-size: 18px;
    font-weight: 600;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .app-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .app-stat {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .app-stat:hover {
    background: #e9ecef;
  }

  .app-rank {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #007aff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    margin-right: 12px;
  }

  .app-name {
    flex: 1;
    font-weight: 500;
    color: #1d1d1f;
  }

  .app-clicks {
    font-size: 14px;
    color: #86868b;
    font-weight: 500;
  }

  .recent-clicks {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }

  .recent-click {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .click-app {
    font-weight: 500;
    color: #1d1d1f;
  }

  .click-time {
    font-size: 12px;
    color: #86868b;
  }

  .no-data {
    text-align: center;
    color: #86868b;
    padding: 20px;
    font-style: italic;
  }

  .revenue-analysis {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .revenue-metric {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .revenue-metric h4 {
    margin: 0 0 8px 0;
    color: #1d1d1f;
    font-size: 16px;
    font-weight: 600;
  }

  .revenue-metric p {
    margin: 4px 0;
    font-size: 14px;
    color: #666;
  }

  .revenue-amount {
    font-size: 18px;
    font-weight: 700;
    color: #007aff;
    margin: 8px 0 0 0;
  }

  @media (max-width: 768px) {
    .analytics-row {
      grid-template-columns: 1fr;
    }

    .revenue-analysis {
      grid-template-columns: 1fr;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      justify-content: center;
    }
  }

  .access-denied {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    padding: 40px 20px;
  }

  .lock-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .access-denied h2 {
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .access-denied p {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .btn-outline {
    background-color: transparent;
    color: #6b7280;
    border: 1px solid #d1d5db;
  }

  .btn-outline:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
</style>

<AdminLogin
  bind:isOpen={showLoginModal}
  onSuccess={handleLoginSuccess}
/>