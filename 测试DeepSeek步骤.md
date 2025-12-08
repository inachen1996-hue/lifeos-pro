# 🎯 测试 DeepSeek API - 简单 3 步

## ✅ 你已经完成：
- 服务器已启动在端口 8001
- 终端显示：`Available on: http://127.0.0.1:8001`

## 📝 接下来做这 3 件事：

### 第 1 步：打开测试页面
在浏览器地址栏输入并回车：
```
http://localhost:8001/test-deepseek-browser.html
```

### 第 2 步：输入 API Key 并测试
1. 在页面的输入框中粘贴你的 DeepSeek API Key
2. 点击 "🚀 测试连接" 按钮
3. 等待几秒钟

### 第 3 步：查看结果

#### 如果看到绿色框 ✅
恭喜！API Key 有效！
- 现在打开主应用：http://localhost:8001/index.html
- 点击右上角 "⚙️ 设置"
- 选择 "DeepSeek"
- 输入相同的 API Key
- 点击 "🧪 测试连接"
- 保存设置
- 开始使用！

#### 如果看到红色框 ❌
告诉我显示的错误信息，我会帮你解决。

常见错误：
- **401 错误**：API Key 无效，需要去 https://platform.deepseek.com/api_keys 检查
- **Failed to fetch**：网络问题，检查是否用 http://localhost:8001 打开（不是 file://）

---

## 🆘 遇到问题？

**问题 1：打不开测试页面**
- 检查终端是否还在运行（显示 "Available on"）
- 如果终端关闭了，重新运行：`npx http-server -p 8001`

**问题 2：不知道 API Key 在哪里**
- 访问：https://platform.deepseek.com/api_keys
- 点击 "创建 API Key"
- 复制生成的 Key（以 sk- 开头）

**问题 3：测试页面成功，但主应用失败**
- 确认主应用也是用 http://localhost:8001/index.html 打开
- 确认输入的是同一个 API Key
- 按 F12 查看控制台错误

---

## 💬 告诉我结果

测试完成后，告诉我：
1. ✅ 成功了！（然后就可以开始使用了）
2. ❌ 失败了，错误信息是：【把错误信息复制给我】

我会立即帮你解决！
