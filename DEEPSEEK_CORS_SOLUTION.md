# 🔧 DeepSeek CORS 问题解决方案

## ✅ 问题已解决！

你遇到的CORS错误是因为DeepSeek代理服务器没有运行。现在已经启动了所有必要的服务。

## 🚀 服务器状态

### ✅ 已启动的服务
1. **DeepSeek代理服务器** - 端口 3000 ✅
2. **Web服务器** - 端口 8001 ✅

### 📱 访问地址
- **电脑访问**: http://localhost:8001/test-deepseek-quick.html
- **手机访问**: http://192.168.0.103:8001/test-deepseek-quick.html

---

## 🧪 立即测试

### 第1步：测试DeepSeek API
1. 打开浏览器访问：**http://localhost:8001/test-deepseek-quick.html**
2. 输入你的DeepSeek API Key（以`sk-`开头）
3. 点击"🧪 测试 DeepSeek"按钮
4. 应该显示"✅ DeepSeek API 测试成功！"

### 第2步：在主应用中使用
1. 访问：**http://localhost:8001/index.html**
2. 点击右上角"⚙️ 设置"
3. 选择"DeepSeek"
4. 输入API Key
5. 点击"🧪 测试连接"
6. 保存设置

---

## 💡 为什么会出现CORS错误？

### 问题原因
- 浏览器的安全策略阻止直接调用DeepSeek API
- 需要通过代理服务器来转发请求
- 代理服务器没有运行时就会出现CORS错误

### 解决方案
- ✅ 启动DeepSeek代理服务器（端口3000）
- ✅ 启动Web服务器（端口8001）
- ✅ 通过代理服务器访问DeepSeek API

---

## 🔄 如果服务器停止了

如果你关闭了终端或重启了电脑，服务器会停止。重新启动方法：

### 方法1：使用启动脚本
```bash
./start-deepseek.sh
```

### 方法2：手动启动
```bash
# 启动DeepSeek代理服务器
node deepseek-proxy.js &

# 启动Web服务器
npx http-server -p 8001 -a 0.0.0.0 &
```

---

## 📱 手机访问

### 当前IP地址
你的电脑IP是：**192.168.0.103**

### 手机访问地址
- 主应用：**http://192.168.0.103:8001/index.html**
- 测试页面：**http://192.168.0.103:8001/test-deepseek-quick.html**

### 注意事项
- 确保手机和电脑在同一WiFi网络
- 如果IP地址变了，重新启动服务器会显示新IP

---

## 🎉 现在可以正常使用了！

DeepSeek API现在应该可以正常工作了：
- ✅ CORS问题已解决
- ✅ 代理服务器运行中
- ✅ Web服务器运行中
- ✅ 支持电脑和手机访问

享受使用LifeOS Pro吧！🚀