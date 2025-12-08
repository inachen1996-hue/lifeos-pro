# ⚡ 快速开始 - 3 步搞定 DeepSeek

## 🎯 你需要做的事

### 第 1 步：启动服务（在终端运行）
```bash
./start-deepseek.sh
```

等待看到：
```
✅ 服务启动成功！
📱 打开浏览器访问：
   http://localhost:8001/index.html
```

### 第 2 步：配置 API Key
1. 打开浏览器：**http://localhost:8001/index.html**
2. 点击右上角 **⚙️ 设置**
3. 选择 **DeepSeek**
4. 输入你的 **API Key**（以 sk- 开头）
5. 点击 **🧪 测试连接**
6. 看到 **✅ 连接成功！**
7. 点击 **保存设置**

### 第 3 步：开始使用
现在可以使用 AI 功能了！试试：
- 创建一些计划事项
- 点击 "复盘" → "AI 生成总结"

---

## ❌ 如果失败了

### 错误：权限被拒绝
```bash
chmod +x start-deepseek.sh
./start-deepseek.sh
```

### 错误：端口被占用
```bash
./stop-servers.sh
./start-deepseek.sh
```

### 错误：找不到 node
安装 Node.js：
```bash
brew install node
```

### 测试连接失败
1. 检查两个终端窗口都在运行
2. 确认通过 http://localhost:8001 访问（不是 file://）
3. 检查 API Key 是否正确
4. 访问 https://platform.deepseek.com/usage 确认有余额

---

## 🛑 停止服务
```bash
./stop-servers.sh
```

---

## 💬 需要帮助？
告诉我：
1. 在哪一步失败了？
2. 看到什么错误信息？
3. 截图更好！
