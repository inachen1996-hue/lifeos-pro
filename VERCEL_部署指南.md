# 🚀 Vercel 部署指南 - DeepSeek API 支持

## 问题解决方案

你遇到的问题是：**本地能用，Vercel部署后不能用**

### 原因分析
- 本地环境：使用 `localhost:3000` 的Node.js代理服务器
- Vercel环境：静态托管，无法运行Node.js服务器，需要使用Vercel API路由

### ✅ 解决方案
我已经为你创建了Vercel兼容的解决方案！

---

## 📁 新增的文件

### 1. `vercel.json` - Vercel配置文件
```json
{
  "functions": {
    "api/deepseek.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/deepseek",
      "destination": "/api/deepseek.js"
    }
  ]
}
```

### 2. `api/deepseek.js` - Vercel API路由
- 替代本地的 `deepseek-proxy.js`
- 在Vercel服务器端运行，解决CORS问题
- 自动处理DeepSeek API调用

### 3. `test-vercel-deepseek.html` - 部署测试页面
- 智能检测当前环境（本地/Vercel）
- 显示环境信息和代理URL
- 测试API是否正常工作

---

## 🔧 修改的文件

### `index.html` - 智能环境检测
修改了DeepSeek API调用逻辑：
- **Vercel环境**：使用 `/api/deepseek`
- **本地环境**：使用 `http://localhost:3000`
- **手机访问**：使用 `http://IP:3000`

---

## 📋 部署步骤

### 第1步：提交代码到Git
```bash
git add .
git commit -m "添加Vercel DeepSeek API支持"
git push
```

### 第2步：部署到Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 连接你的GitHub仓库
3. 点击"Deploy"
4. 等待部署完成

### 第3步：测试部署
1. 打开Vercel给你的域名（如：`https://your-app.vercel.app`）
2. 访问测试页面：`https://your-app.vercel.app/test-vercel-deepseek.html`
3. 输入DeepSeek API Key测试
4. 应该显示"✅ DeepSeek API 测试成功！"

### 第4步：在主应用中使用
1. 访问：`https://your-app.vercel.app/index.html`
2. 进入设置，选择DeepSeek
3. 输入API Key，测试连接
4. 开始正常使用

---

## 🔍 环境检测逻辑

应用会自动检测当前环境：

```javascript
const getProxyUrl = () => {
  const hostname = window.location.hostname;
  
  // Vercel 或其他在线部署环境
  if (hostname.includes('vercel.app') || 
      hostname.includes('netlify.app') || 
      hostname.includes('github.io') ||
      (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/))) {
    return '/api/deepseek';  // 使用 Vercel API 路由
  }
  
  // 本地环境
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3000`;  // 手机通过IP访问
  }
  return 'http://localhost:3000';  // 本地电脑访问
};
```

---

## 🧪 测试不同环境

### 本地测试
```bash
# 启动本地服务器
node deepseek-proxy.js &
npx http-server -p 8001 &

# 访问测试
http://localhost:8001/test-vercel-deepseek.html
```

### Vercel测试
```
https://your-app.vercel.app/test-vercel-deepseek.html
```

---

## ❌ 常见问题

### 问题1：Vercel部署后显示404
**原因：** API路由未正确部署
**解决：**
1. 确认 `vercel.json` 文件在根目录
2. 确认 `api/deepseek.js` 文件存在
3. 重新部署项目

### 问题2：API调用失败
**原因：** API Key或网络问题
**解决：**
1. 检查API Key是否正确
2. 确认DeepSeek账户有余额
3. 查看Vercel部署日志

### 问题3：本地环境失效
**原因：** 代理服务器未启动
**解决：**
```bash
node deepseek-proxy.js
```

---

## 💡 优势

### 🌐 全环境支持
- ✅ 本地开发：使用Node.js代理
- ✅ Vercel部署：使用API路由
- ✅ 手机访问：自动适配IP地址

### 🔄 无缝切换
- 同一套代码，自动适配不同环境
- 无需手动修改配置
- 智能检测当前环境

### 🚀 高性能
- Vercel边缘计算，全球加速
- 无需维护服务器
- 自动扩容

---

## 📞 需要帮助？

如果部署后还是有问题，请告诉我：

1. **Vercel部署URL**：你的应用地址
2. **错误信息**：浏览器控制台显示什么
3. **测试结果**：测试页面显示什么状态
4. **环境信息**：测试页面显示的环境类型

我会帮你进一步排查！

---

## 🎉 总结

现在你的应用支持：
- ✅ **本地开发**：`http://localhost:8001`
- ✅ **Vercel部署**：`https://your-app.vercel.app`
- ✅ **手机访问**：两种环境都支持
- ✅ **DeepSeek API**：全环境可用

部署到Vercel后，DeepSeek API就能正常工作了！🚀