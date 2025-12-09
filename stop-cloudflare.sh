#!/bin/bash

echo "⏹  正在停止所有服务..."
echo ""

# 停止代理服务器
if pgrep -f "node deepseek-proxy.js" > /dev/null; then
    echo "停止 DeepSeek 代理服务器..."
    pkill -f "node deepseek-proxy.js"
fi

# 停止 Web 服务器
if pgrep -f "http-server" > /dev/null; then
    echo "停止 Web 服务器..."
    pkill -f "http-server"
fi

# 停止 Cloudflare Tunnel
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo "停止 Cloudflare Tunnel..."
    pkill -f "cloudflared tunnel"
fi

echo ""
echo "✅ 所有服务已停止"
