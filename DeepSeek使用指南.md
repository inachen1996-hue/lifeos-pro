# 🎯 DeepSeek API 完整使用指南

## 问题原因
DeepSeek API 不允许直接从浏览器调用（CORS 限制），所以我们需要一个代理服务器。

## ✅ 解决方案
我已经创建了一个代理服务器来解决这个问题。

---

## 📋 使用步骤

### 方法一：使用自动启动脚本（推荐）

#### 第 1 步：给脚本添加执行权限
在终端中运行：
```bash
chmod +x start-deepseek.sh
chmod +x stop-servers.sh
```

#### 第 2 步：启动服务
```bash
./start-deepseek.sh
```

你会看到：
```
======================================
✅ 服务启动成功！
======================================

📱 打开浏览器访问：
   http://localhost:8001/index.html

🔧 测试 DeepSeek API：
   http://localhost:8001/test-deepseek-browser.html
```

#### 第 3 步：配置 DeepSeek
1. 打开浏览器：http://localhost:8001/index.html
2. 点击右上角 "⚙️ 设置"
3. 选择 "DeepSeek"
4. 输入你的 API Key
5. 点击 "🧪 测试连接"
6. 应该显示 "✅ 连接成功！"
7. 点击 "保存设置"

#### 第 4 步：开始使用
现在可以正常使用 AI 功能了！

#### 停止服务
```bash
./stop-servers.sh
```

---

### 方法二：手动启动（如果脚本不工作）

#### 第 1 步：启动代理服务器
打开第一个终端窗口，运行：
```bash
node deepseek-proxy.js
```

看到这个就成功了：
```
🚀 DeepSeek API 代理服务器已启动！
📡 监听端口: 3000
```

**保持这个窗口运行，不要关闭！**

#### 第 2 步：启动 Web 服务器
打开第二个终端窗口，运行：
```bash
npx http-server -p 8001
```

看到这个就成功了：
```
Available on:
  http://127.0.0.1:8001
```

**保持这个窗口也运行，不要关闭！**

#### 第 3 步：配置和使用
同方法一的第 3、4 步。

---

## 🔍 测试是否工作

### 测试代理服务器
打开浏览器：http://localhost:8001/test-deepseek-browser.html
1. 输入你的 API Key
2. 点击 "🚀 测试连接"
3. 应该显示 "✅ 测试成功！"

### 测试主应用
1. 打开：http://localhost:8001/index.html
2. 创建一些计划事项
3. 点击 "复盘" → "AI 生成总结"
4. 应该能看到 AI 生成的内容

---

## ❌ 常见问题

### 问题 1：端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法：**
```bash
# 停止占用端口的进程
./stop-servers.sh

# 或者手动停止
lsof -ti:3000 | xargs kill
lsof -ti:8001 | xargs kill
```

### 问题 2：找不到 node 命令
```
command not found: node
```

**解决方法：**
安装 Node.js：
```bash
# 使用 Homebrew 安装
brew install node

# 或者访问 https://nodejs.org/ 下载安装
```

### 问题 3：权限被拒绝
```
Permission denied: ./start-deepseek.sh
```

**解决方法：**
```bash
chmod +x start-deepseek.sh
```

### 问题 4：测试连接还是失败

**检查清单：**
1. ✅ 代理服务器在运行吗？（终端显示 "监听端口: 3000"）
2. ✅ Web 服务器在运行吗？（终端显示 "Available on"）
3. ✅ 是通过 http://localhost:8001 访问的吗？（不是 file://）
4. ✅ API Key 正确吗？（以 sk- 开头）
5. ✅ 账户有余额吗？（访问 https://platform.deepseek.com/usage）

### 问题 5：浏览器显示 "Failed to fetch"

**可能原因：**
- 代理服务器没有启动
- 端口 3000 被占用

**解决方法：**
1. 检查第一个终端是否显示 "监听端口: 3000"
2. 如果没有，重新运行 `node deepseek-proxy.js`
3. 如果端口被占用，运行 `./stop-servers.sh` 后重试

---

## 💡 工作原理

```
浏览器 → 代理服务器(3000) → DeepSeek API
         ↑
         解决 CORS 问题
```

1. 浏览器发送请求到本地代理（localhost:3000）
2. 代理服务器转发请求到 DeepSeek API
3. DeepSeek API 返回结果给代理
4. 代理返回结果给浏览器

这样就绕过了浏览器的 CORS 限制！

---

## 📞 还是不行？

如果按照以上步骤还是不成功，请告诉我：

1. 你在哪一步失败了？
2. 终端显示什么错误信息？
3. 浏览器控制台（F12）显示什么？
4. 截图会更有帮助！

我会继续帮你解决！
