#!/bin/bash

echo "======================================"
echo "🚀 启动 LifeOS Pro (Cloudflare Tunnel)"
echo "======================================"
echo ""

# 检查配置文件
if [ ! -f ~/.cloudflared/config.yml ]; then
    echo "❌ 未找到配置文件"
    echo ""
    echo "请先运行: ./setup-cloudflare.sh"
    exit 1
fi

# 停止旧进程
echo "🧹 清理旧进程..."
pkill -f "node deepseek-proxy.js" 2>/dev/null
pkill -f "http-server" 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# 启动代理服务器
echo "📡 启动 DeepSeek 代理服务器..."
node deepseek-proxy.js > /tmp/deepseek-proxy.log 2>&1 &
PROXY_PID=$!
sleep 2

# 启动 Web 服务器
echo "🌐 启动 Web 服务器..."
npx http-server -p 8001 -a 0.0.0.0 > /tmp/http-server.log 2>&1 &
WEB_PID=$!
sleep 2

# 启动 Cloudflare Tunnel
echo "☁️  启动 Cloudflare Tunnel..."
cloudflared tunnel run > /tmp/cloudflared.log 2>&1 &
TUNNEL_PID=$!
sleep 3

# 获取隧道 ID
TUNNEL_ID=$(grep "tunnel:" ~/.cloudflared/config.yml | awk '{print $2}')

echo ""
echo "======================================"
echo "✅ 所有服务已启动！"
echo "======================================"
echo ""
echo "🌐 公网访问地址："
echo "   https://lifeos-pro-${TUNNEL_ID:0:8}.trycloudflare.com"
echo ""
echo "📱 使用方法："
echo "   - 电脑/手机/平板都可以访问"
echo "   - WiFi 或数据流量都可以"
echo "   - 分享给朋友也可以"
echo ""
echo "📊 进程 ID："
echo "   代理服务器: $PROXY_PID"
echo "   Web 服务器: $WEB_PID"
echo "   Cloudflare: $TUNNEL_PID"
echo ""
echo "📝 日志文件："
echo "   /tmp/deepseek-proxy.log"
echo "   /tmp/http-server.log"
echo "   /tmp/cloudflared.log"
echo ""
echo "⏹  停止服务："
echo "   ./stop-cloudflare.sh"
echo ""
echo "======================================"

# 保持运行
echo ""
echo "⏳ 服务运行中... (按 Ctrl+C 停止)"
echo ""

# 等待用户中断
wait
