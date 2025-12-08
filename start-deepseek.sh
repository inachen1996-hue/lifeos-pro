#!/bin/bash

echo "======================================"
echo "🚀 启动 LifeOS Pro + DeepSeek 代理"
echo "======================================"
echo ""

# 检查是否已经有进程在运行
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3000 已被占用，正在停止旧进程..."
    kill $(lsof -t -i:3000) 2>/dev/null
    sleep 1
fi

if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 8001 已被占用，正在停止旧进程..."
    kill $(lsof -t -i:8001) 2>/dev/null
    sleep 1
fi

echo "📡 启动 DeepSeek 代理服务器（端口 3000）..."
node deepseek-proxy.js &
PROXY_PID=$!
sleep 2

echo ""
echo "🌐 启动 Web 服务器（端口 8001）..."
npx http-server -p 8001 &
WEB_PID=$!
sleep 2

echo ""
echo "======================================"
echo "✅ 服务启动成功！"
echo "======================================"
echo ""
echo "📱 打开浏览器访问："
echo "   http://localhost:8001/index.html"
echo ""
echo "🔧 测试 DeepSeek API："
echo "   http://localhost:8001/test-deepseek-browser.html"
echo ""
echo "⏹  停止服务："
echo "   按 Ctrl+C 或运行: ./stop-servers.sh"
echo ""
echo "======================================"

# 等待用户中断
wait
