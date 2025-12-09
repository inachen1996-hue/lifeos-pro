# ☁️ Cloudflare Tunnel - 完全免费的外网访问方案

## 🎉 为什么选择 Cloudflare Tunnel

- ✅ **完全免费**（不像 ngrok 免费版有限制）
- ✅ **固定域名**（不会每次都变）
- ✅ **无限流量**
- ✅ **自动 HTTPS**
- ✅ **快速稳定**（Cloudflare 全球 CDN）
- ✅ **无需公网 IP**

**这是最推荐的免费方案！**

---

## 📋 快速开始

### 第 1 步：安装 cloudflared
```bash
brew install cloudflare/cloudflare/cloudflared
```

### 第 2 步：登录 Cloudflare
```bash
cloudflared tunnel login
```

这会打开浏览器，选择你的域名（如果没有域名，Cloudflare 会给你一个免费的）。

### 第 3 步：创建隧道
```bash
cloudflared tunnel create lifeos-pro
```

会显示：
```
Created tunnel lifeos-pro with id: abc123-def456-ghi789
```

记下这个 tunnel ID。

### 第 4 步：配置隧道

我已经为你准备好了配置文件！运行：
```bash
./setup-cloudflare.sh
```

### 第 5 步：启动服务
```bash
./start-with-cloudflare.sh
```

### 第 6 步：获取公网地址

会显示：
```
🌐 公网访问地址：
   https://lifeos-pro.你的用户名.workers.dev

或者（如果你有域名）：
   https://app.yourdomain.com
```

**这个地址是固定的，不会变！**

---

## 🎯 详细步骤

### 方案 A：使用 Cloudflare 免费域名

1. 注册 Cloudflare 账号（免费）：https://dash.cloudflare.com/sign-up
2. 安装 cloudflared（见上面）
3. 运行 `cloudflared tunnel login`
4. 创建隧道：`cloudflared tunnel create lifeos-pro`
5. 运行我准备的脚本：`./setup-cloudflare.sh`
6. 启动：`./start-with-cloudflare.sh`

### 方案 B：使用自己的域名（可选）

如果你有自己的域名（如 example.com）：

1. 在 Cloudflare 添加你的域名
2. 修改域名的 DNS 服务器到 Cloudflare
3. 创建隧道时指定域名：
   ```bash
   cloudflared tunnel route dns lifeos-pro app.example.com
   ```
4. 访问：https://app.example.com

---

## 🔧 配置文件

我会创建 `~/.cloudflared/config.yml`：

```yaml
tunnel: lifeos-pro
credentials-file: ~/.cloudflared/abc123-def456-ghi789.json

ingress:
  - hostname: lifeos-pro.你的用户名.workers.dev
    service: http://localhost:8001
  - service: http_status:404
```

---

## 🚀 使用体验

### 电脑上
访问：https://lifeos-pro.你的用户名.workers.dev

### 手机上（数据流量）
访问：https://lifeos-pro.你的用户名.workers.dev

### 分享给朋友
直接发送链接：https://lifeos-pro.你的用户名.workers.dev

**所有人都用同一个地址，永远不变！**

---

## ⚠️ 注意事项

### DeepSeek API 配置

由于使用了 Cloudflare Tunnel，代理服务器的配置需要稍微调整。

**方案 1：每个用户用自己的 API Key（推荐）**
- 用户在设置中输入自己的 DeepSeek API Key
- 数据保存在浏览器本地
- 更安全，每个人独立使用

**方案 2：共享 API Key（不推荐）**
- 所有人用你的 API Key
- 费用由你承担
- 需要注意用量限制

---

## 💰 成本对比

| 方案 | 成本 | 固定地址 | 速度 | 稳定性 |
|------|------|---------|------|--------|
| Cloudflare Tunnel | 免费 | ✅ | 快 | 高 |
| ngrok 免费 | 免费 | ❌ | 中 | 中 |
| ngrok 付费 | $8/月 | ✅ | 中 | 高 |
| 云服务器 | ¥100/年 | ✅ | 快 | 高 |

**Cloudflare Tunnel 是最佳免费方案！**

---

## 📝 下一步

告诉我：
1. 你想用 Cloudflare Tunnel 吗？（推荐）
2. 你有自己的域名吗？
3. 还是想用其他方案？

我会帮你一步步配置！
