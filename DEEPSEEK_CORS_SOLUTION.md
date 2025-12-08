# DeepSeek API CORS 问题解决方案

## 🚨 问题：Failed to fetch - CORS 限制

当你看到 "Failed to fetch" 错误时，这通常是因为浏览器的 CORS（跨域资源共享）安全限制。

## ✅ 已解决：在主应用中测试

我已经在主应用的 API 设置界面中添加了一个 **"🧪 测试连接"** 按钮！

### 使用方法

1. **打开主应用**
   ```bash
   # 使用本地服务器运行
   python3 -m http.server 8000
   ```
   
   然后访问：`http://localhost:8000/index.html`

2. **点击设置按钮**（右上角的齿轮图标）

3. **选择 DeepSeek**

4. **输入你的 API Key**

5. **点击 "🧪 测试连接" 按钮**
   - ✅ 如果成功：会显示 "✅ DEEPSEEK API 测试成功！"
   - ❌ 如果失败：会显示具体的错误信息

6. **保存 Key**
   - 测试成功后，点击 "保存" 按钮

## 🔧 为什么需要本地服务器？

### 问题原因

当你直接双击打开 HTML 文件时：
- 浏览器使用 `file://` 协议
- 浏览器会阻止 `file://` 向外部 API 发送请求（CORS 限制）
- 这是浏览器的安全机制

### 解决方案

使用本地 HTTP 服务器：
- 使用 `http://` 协议
- 浏览器允许 `http://` 向外部 API 发送请求
- 这是正常的 Web 应用运行方式

## 📋 启动本地服务器的方法

### 方法 1：Python（推荐）

```bash
# 在项目目录下运行
python3 -m http.server 8000

# 然后在浏览器访问
# http://localhost:8000/index.html
```

### 方法 2：Node.js

```bash
# 安装（只需一次）
npm install -g http-server

# 运行
http-server -p 8000

# 访问
# http://localhost:8000/index.html
```

### 方法 3：VS Code Live Server

1. 安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"
4. 自动在浏览器中打开

### 方法 4：使用 npm scripts

如果你的项目有 `package.json`：

```bash
npm start
# 或
npm run dev
```

## 🎯 测试流程

### 完整测试步骤

1. **启动服务器**
   ```bash
   python3 -m http.server 8000
   ```

2. **打开应用**
   - 访问 `http://localhost:8000/index.html`

3. **打开设置**
   - 点击右上角齿轮图标

4. **配置 API**
   - 选择 "DeepSeek"
   - 输入 API Key（以 `sk-` 开头）

5. **测试连接**
   - 点击 "🧪 测试连接" 按钮
   - 等待测试结果

6. **查看结果**
   - ✅ 成功：保存 Key 并开始使用
   - ❌ 失败：查看错误信息

### 查看详细日志

打开浏览器控制台（F12）查看：
- 请求详情
- 响应数据
- 错误信息

## 🔍 常见错误及解决方案

### 错误 1：Failed to fetch（在 file:// 协议下）
**解决**：使用本地服务器（http://）

### 错误 2：401 Unauthorized
**原因**：API Key 无效
**解决**：
1. 检查 Key 是否正确
2. 访问 https://platform.deepseek.com/api_keys
3. 重新生成 Key

### 错误 3：400 Bad Request
**原因**：请求参数问题
**解决**：代码已优化，应该不会出现

### 错误 4：429 Too Many Requests
**原因**：请求过于频繁
**解决**：等待几秒后重试

### 错误 5：500/502/503 Server Error
**原因**：DeepSeek 服务器问题
**解决**：
1. 等待几分钟后重试
2. 临时切换到 Google Gemini

## 💡 推荐工作流程

### 日常使用

1. **启动服务器**（只需一次）
   ```bash
   python3 -m http.server 8000
   ```

2. **在浏览器中打开**
   ```
   http://localhost:8000/index.html
   ```

3. **保持服务器运行**
   - 不要关闭终端窗口
   - 刷新浏览器即可看到更新

### 开发调试

1. **使用浏览器控制台**（F12）
   - Console：查看日志
   - Network：查看请求
   - Application：查看存储

2. **测试 API**
   - 使用内置的测试按钮
   - 查看详细的错误信息

3. **切换提供商**
   - Google Gemini（推荐，稳定）
   - OpenAI（功能强大）
   - DeepSeek（备用）

## 🎉 测试成功后

当你看到 "✅ DEEPSEEK API 测试成功！" 后：

1. **点击保存**
   - Key 会保存到本地存储

2. **开始使用**
   - 生成今日计划
   - 生成复盘报告
   - 使用所有 AI 功能

3. **监控使用**
   - 访问 https://platform.deepseek.com/usage
   - 查看 API 调用次数和余额

## 📞 仍然有问题？

如果测试仍然失败：

1. **检查网络连接**
   - 确保可以访问外网
   - 尝试访问 https://api.deepseek.com/

2. **检查 API Key**
   - 确认 Key 已激活
   - 确认账户有余额

3. **查看控制台日志**
   - 打开 F12 开发者工具
   - 查看 Console 和 Network 标签

4. **尝试其他提供商**
   - Google Gemini（推荐）
   - OpenAI

5. **联系支持**
   - DeepSeek 官方支持
   - 提供详细的错误日志

## 🔗 相关资源

- DeepSeek 平台：https://platform.deepseek.com/
- API 文档：https://platform.deepseek.com/api-docs/
- API Keys：https://platform.deepseek.com/api_keys
- 使用情况：https://platform.deepseek.com/usage

## ✨ 总结

**问题**：直接打开 HTML 文件导致 CORS 错误

**解决**：
1. 使用本地服务器运行应用
2. 使用内置的 "🧪 测试连接" 功能
3. 在 `http://localhost` 环境下测试

**推荐**：
- 使用 Python 的 http.server（最简单）
- 或使用 VS Code Live Server（最方便）
