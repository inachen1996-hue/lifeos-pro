# 🚀 DeepSeek 持久化服务指南

## ✅ 当前状态

DeepSeek代理服务器**现在正在运行**，可以一直保持运行状态！

## 🔄 三种运行方式

### 方式1：临时运行（当前方式）
- ✅ 已启动，正在后台运行
- ⚠️ 关闭终端或重启电脑会停止
- 适合：临时使用

### 方式2：守护进程运行
```bash
# 启动持久化服务
./start-deepseek-daemon.sh

# 检查服务状态
./check-deepseek-status.sh

# 停止服务
./stop-deepseek-daemon.sh
```
- ✅ 后台持续运行
- ✅ 自动记录日志
- ⚠️ 重启电脑需要重新启动

### 方式3：系统服务（开机自启）
```bash
# 安装为系统服务
./install-deepseek-service.sh

# 卸载系统服务
./uninstall-deepseek-service.sh
```
- ✅ 开机自动启动
- ✅ 系统级管理
- ✅ 最稳定的方式

---

## 📋 服务管理

### 检查当前状态
```bash
./check-deepseek-status.sh
```

### 查看实时日志
```bash
# 查看DeepSeek代理日志
tail -f deepseek.log

# 查看Web服务器日志  
tail -f webserver.log
```

### 重启服务
```bash
# 停止所有服务
./stop-deepseek-daemon.sh

# 重新启动
./start-deepseek-daemon.sh
```

---

## 🌐 访问地址

### 电脑访问
- 主应用：http://localhost:8001/index.html
- 测试页面：http://localhost:8001/test-deepseek-quick.html

### 手机访问
- 主应用：http://192.168.0.103:8001/index.html
- 测试页面：http://192.168.0.103:8001/test-deepseek-quick.html

---

## 💡 推荐方案

### 日常使用
推荐使用**方式2（守护进程）**：
```bash
./start-deepseek-daemon.sh
```

### 长期使用
如果你经常使用，推荐**方式3（系统服务）**：
```bash
./install-deepseek-service.sh
```

---

## 🔧 故障排除

### 问题1：端口被占用
```bash
# 查看端口占用
lsof -i :3000
lsof -i :8001

# 强制停止
./stop-deepseek-daemon.sh
```

### 问题2：服务无法启动
```bash
# 检查Node.js是否安装
node --version

# 检查依赖
npm install
```

### 问题3：手机无法访问
```bash
# 检查IP地址
ipconfig getifaddr en0

# 检查防火墙设置
# 系统偏好设置 > 安全性与隐私 > 防火墙
```

---

## 📊 性能监控

### 资源使用
```bash
# 查看进程资源使用
ps aux | grep node
ps aux | grep http-server
```

### 日志大小管理
```bash
# 清理日志（如果太大）
> deepseek.log
> webserver.log
```

---

## 🎉 总结

现在你有了完整的DeepSeek持久化解决方案：

1. ✅ **当前运行中** - 可以立即使用
2. 🔄 **守护进程模式** - 后台持续运行
3. 🚀 **系统服务模式** - 开机自动启动
4. 📋 **完整管理工具** - 启动、停止、监控

选择最适合你的方式，享受稳定的DeepSeek API服务！