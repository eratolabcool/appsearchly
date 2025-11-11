# 🚀 App Search MVP - 部署指南

## 快速部署清单 ✅

### 1. 生产环境配置

创建生产环境变量文件：
```bash
cp .env.example .env.production
```

配置以下变量：
```env
VITE_ADMIN_PASSWORD=your_secure_admin_password_here
VITE_AFFILIATE_TOKEN=your_apple_affiliate_token_here
```

### 2. 构建检查

运行生产构建：
```bash
npm run build
```

检查构建是否成功：
```bash
npm run preview
```

### 3. 部署选项

#### Option A: Vercel (推荐) 🌟

1. **一键部署**：
   ```bash
   npm i -g vercel
   vercel
   ```

2. **环境变量设置**：
   - 在 Vercel Dashboard 设置环境变量
   - `VITE_ADMIN_PASSWORD`: 你的管理员密码
   - `VITE_AFFILIATE_TOKEN`: Apple联盟token

3. **自动部署**：
   - 连接GitHub仓库
   - 自动部署main分支

#### Option B: Netlify

1. **连接仓库**：
   - 拖拽或连接GitHub
   - 设置构建设置

2. **构建设置**：
   - Build command: `npm run build`
   - Publish directory: `build`

3. **环境变量**：
   - 在Netlify Dashboard设置环境变量

#### Option C: VPS/服务器

1. **构建应用**：
   ```bash
   npm run build
   ```

2. **使用Nginx/Apache**：
   - 指向`build`目录
   - 配置SPA路由

3. **使用PM2** (可选)：
   ```bash
   npm install -g pm2
   pm2 start "npm run preview" --name app-search
   ```

### 4. 部署后检查

1. **功能测试**：
   - [ ] 应用搜索正常工作
   - [ ] 联盟链接生成正确
   - [ ] 分析页面可以访问
   - [ ] 管理员登录功能正常

2. **安全检查**：
   - [ ] HTTPS已启用
   - [ ] 管理员密码已更改
   - [ ] 环境变量已设置

3. **性能检查**：
   - [ ] 页面加载速度
   - [ ] 图片资源优化
   - [ ] 缓存策略生效

## 🔧 故障排除

### 常见问题

1. **页面空白**：
   - 检查控制台错误
   - 确认环境变量设置
   - 检查路由配置

2. **联盟链接不工作**：
   - 检查`VITE_AFFILIATE_TOKEN`
   - 确认Apple联盟账户状态

3. **管理员无法登录**：
   - 检查`VITE_ADMIN_PASSWORD`
   - 清除浏览器缓存

### 性能优化

1. **图片优化**：
   - 使用WebP格式
   - 设置适当的图片尺寸

2. **缓存策略**：
   - 静态资源长期缓存
   - API响应适当缓存

3. **CDN配置**：
   - 使用CDN加速静态资源
   - 配置适当的缓存头

## 📊 监控设置

1. **分析工具**：
   - Google Analytics
   - 内置分析仪表板

2. **错误监控**：
   - 设置错误报告
   - 监控404错误

3. **性能监控**：
   - Core Web Vitals
   - 页面加载时间

## 🎯 部署成功后的下一步

1. **申请Apple联盟计划**：
   - 访问 https://www.apple.com/itunes/affiliates/
   - 完成申请流程

2. **配置收款信息**：
   - 设置银行账户
   - 配置税务信息

3. **推广你的应用**：
   - SEO优化
   - 社交媒体推广
   - 内容营销

---

**需要帮助？** 查看 [MONETIZATION_GUIDE.md](./MONETIZATION_GUIDE.md) 获取详细指南。