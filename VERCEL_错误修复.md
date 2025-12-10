# 🔧 Vercel 部署错误修复

## 错误信息
```
Error: Function Runtimes must have a valid version, for example 'now-php@1.0.0'
```

## ✅ 问题已修复

### 问题原因
`vercel.json` 中的 `runtime: "nodejs18.x"` 格式不正确，Vercel 不识别这种格式。

### 修复方案
我已经简化了 `vercel.json` 配置：

```json
{
  "rewrites": [
    {
      "source": "/api/deepseek",
      "destination": "/api/deepseek.js"
    }
  ]
}
```

Vercel 会自动检测 `api/` 目录下的 `.js` 文件并使用正确的 Node.js 运行时。

---

## 📋 重新部署步骤

### 方法1：通过 Git 推送（推荐）
```bash
# 提交修复
git add vercel.json
git commit -m "修复 Vercel 配置错误"
git push

# Vercel 会自动重新部署
```

### 方法2：使用 Vercel CLI
```bash
# 如果没有安装 Vercel CLI
npm install -g vercel

# 重新部署
vercel --prod
```

### 方法3：在 Vercel 网站手动重新部署
1. 访问 [vercel.com](https://vercel.com)
2. 进入你的项目
3. 点击 "Redeploy" 按钮

---

## 🧪 部署成功后测试

### 1. 检查部署状态
访问你的 Vercel 域名，应该能正常加载页面。

### 2. 测试 API 路由
访问：`https://your-app.vercel.app/test-vercel-deepseek.html`

应该显示：
- ✅ 环境类型：Vercel 部署环境
- ✅ 代理URL：/api/deepseek
- ✅ 能够成功调用 DeepSeek API

### 3. 测试主应用
访问：`https://your-app.vercel.app/index.html`
- 进入设置
- 选择 DeepSeek
- 输入 API Key
- 测试连接应该成功

---

## 🔍 如果还有问题

### 检查 Vercel 部署日志
1. 在 Vercel 项目页面点击 "Functions" 标签
2. 查看 `api/deepseek.js` 的日志
3. 如果有错误，会显示具体信息

### 常见问题

#### 问题1：API 路由 404
**解决方案：**
- 确认 `api/deepseek.js` 文件存在
- 确认 `vercel.json` 配置正确
- 重新部署

#### 问题2：CORS 错误
**解决方案：**
- API 文件已经设置了正确的 CORS 头
- 如果还有问题，检查浏览器控制台的具体错误

#### 问题3：DeepSeek API 调用失败
**解决方案：**
- 检查 API Key 是否正确
- 确认 DeepSeek 账户有余额
- 查看 Vercel 函数日志

---

## 💡 配置说明

### 简化的 vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/deepseek",
      "destination": "/api/deepseek.js"
    }
  ]
}
```

这个配置：
- ✅ 不指定运行时版本（让 Vercel 自动检测）
- ✅ 只设置路由重写规则
- ✅ 更简单，更不容易出错

### API 文件结构
```
api/
└── deepseek.js  (Vercel 自动识别为 Node.js 函数)
```

---

## 🎉 修复完成

现在重新部署应该就能成功了！

记住测试流程：
1. 重新部署 ✅
2. 测试页面 ✅
3. 主应用配置 ✅
4. 开始使用 ✅

如果还有问题，告诉我具体的错误信息！