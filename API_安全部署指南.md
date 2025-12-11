# API 安全部署指南

## 🔒 安全架构概述

新的 API 系统将敏感的 API 密钥存储在服务器端，前端代码中不包含任何敏感信息，确保多用户部署的安全性。

## 📁 文件结构

```
├── api/
│   ├── config.js          # API 配置服务
│   └── deepseek.js        # DeepSeek API 代理
├── .env.local             # 本地环境变量（不提交到 Git）
├── .env.example           # 环境变量示例
├── .gitignore             # Git 忽略文件
└── index.html             # 主应用（已移除硬编码密钥）
```

## ⚙️ 环境配置

### 1. 本地开发

创建 `.env.local` 文件：
```bash
# DeepSeek API 密钥
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Google Gemini API 密钥
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API 密钥（可选）
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Vercel 部署

在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel 项目 Dashboard
2. 点击 **Settings** → **Environment Variables**
3. 添加以下变量：
   - `DEEPSEEK_API_KEY`: 你的 DeepSeek API 密钥
   - `GEMINI_API_KEY`: 你的 Gemini API 密钥
   - `OPENAI_API_KEY`: 你的 OpenAI API 密钥（可选）

### 3. 其他平台部署

根据部署平台的要求配置环境变量：
- **Netlify**: 在 Site settings → Environment variables 中配置
- **Railway**: 在项目设置中添加环境变量
- **Heroku**: 使用 `heroku config:set` 命令或 Dashboard 配置

## 🔗 API 路由说明

### `/api/config`

**GET 请求** - 获取可用服务列表
```javascript
// 响应示例
{
  "success": true,
  "services": {
    "deepseek": true,
    "gemini": true,
    "openai": false
  },
  "defaultProvider": "deepseek"
}
```

**POST 请求** - 测试连接或获取密钥
```javascript
// 测试连接
{
  "action": "test",
  "provider": "deepseek"
}

// 获取密钥（仅供内部使用）
{
  "action": "getKey",
  "provider": "deepseek"
}
```

### `/api/deepseek`

DeepSeek API 代理服务，处理所有 DeepSeek API 调用。

## 🚀 一键连接功能

### 工作流程

1. **检查配置**: 调用 `/api/config` 获取可用服务
2. **测试连接**: 调用 `/api/config` 测试 DeepSeek 连接
3. **保存配置**: 将配置保存到本地存储
4. **启用安全模式**: 设置 `useServerKeys: true`

### 用户体验

- 点击 **🚀 一键连接服务器 API** 按钮
- 自动检测和配置可用的 API 服务
- 显示连接状态和结果
- 2秒后自动关闭设置弹窗

## 🛡️ 安全特性

### 1. 密钥隐藏
- API 密钥存储在服务器端环境变量中
- 前端代码中不包含任何敏感信息
- 用户无法通过查看源代码获取密钥

### 2. 访问控制
- 只有通过后端 API 路由才能访问密钥
- 支持 CORS 配置限制访问来源
- 可以添加身份验证和授权机制

### 3. 多用户支持
- 每个部署实例可以配置不同的 API 密钥
- 支持多租户架构
- 便于企业内部部署

## 📋 部署检查清单

### 部署前
- [ ] 确认 `.env.local` 文件不在版本控制中
- [ ] 检查 `.gitignore` 文件包含环境变量文件
- [ ] 验证 API 密钥的有效性

### 部署时
- [ ] 在部署平台配置环境变量
- [ ] 确认 API 路由正常工作
- [ ] 测试一键连接功能

### 部署后
- [ ] 使用 `test-secure-api.html` 验证功能
- [ ] 检查 API 配置服务响应
- [ ] 测试所有 AI 服务连接

## 🧪 测试方法

### 1. 使用测试页面
打开 `test-secure-api.html` 进行完整测试：
- API 配置检查
- DeepSeek 连接测试
- Gemini 连接测试
- 一键连接功能测试

### 2. 手动测试
```bash
# 检查 API 配置
curl https://your-domain.com/api/config

# 测试 DeepSeek 连接
curl -X POST https://your-domain.com/api/config \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "provider": "deepseek"}'
```

## 🔧 故障排除

### 常见问题

1. **环境变量未生效**
   - 检查变量名是否正确
   - 确认部署平台已重新部署
   - 验证变量值没有多余的空格

2. **API 连接失败**
   - 检查 API 密钥是否有效
   - 确认网络连接正常
   - 查看服务器日志获取详细错误

3. **一键连接不工作**
   - 检查 `/api/config` 路由是否可访问
   - 确认前端能正常调用后端 API
   - 查看浏览器控制台错误信息

### 调试技巧

1. **查看服务器日志**
   ```javascript
   console.log('API Keys loaded:', {
     deepseek: !!process.env.DEEPSEEK_API_KEY,
     gemini: !!process.env.GEMINI_API_KEY
   });
   ```

2. **前端调试**
   ```javascript
   // 在浏览器控制台中检查配置
   console.log('API Config:', localStorage.getItem('lifeos_pro_api_config'));
   ```

## 📈 性能优化

### 1. 缓存策略
- 缓存 API 配置响应
- 减少重复的连接测试
- 使用本地存储缓存配置

### 2. 错误处理
- 实现重试机制
- 提供详细的错误信息
- 优雅降级到备用服务

## 🔄 版本迁移

### 从旧版本升级
1. 现有用户的配置会自动迁移
2. 硬编码的 API 密钥会被忽略
3. 启用 `useServerKeys` 标志

### 兼容性
- 保持与现有 API 调用的兼容性
- 支持手动输入 API 密钥的回退机制
- 渐进式升级，不影响现有功能

---

**安全提示**: 请确保在生产环境中妥善保管 API 密钥，定期轮换密钥，并监控 API 使用情况。