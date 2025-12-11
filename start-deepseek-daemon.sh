#!/bin/bash

# DeepSeek 持久化服务启动脚本
# 让DeepSeek代理服务器在后台持续运行

echo "🚀 启动 DeepSeek 持久化服务..."

# 检查是否已经在运行
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ DeepSeek代理服务器已在运行 (端口 3000)"
else
    echo "🔄 启动 DeepSeek代理服务器..."
    nohup node deepseek-proxy.js > deepseek.log 2>&1 &
    echo $! > deepseek.pid
    echo "✅ DeepSeek代理服务器已启动 (PID: $(cat deepseek.pid))"
fi

# 检查Web服务器
if lsof -i :8001 > /dev/null 2>&1; then
    echo "✅ Web服务器已在运行 (端口 8001)"
else
    echo "🔄 启动 Web服务器..."
    nohup npx http-server -p 8001 -a 0.0.0.0 > webserver.log 2>&1 &
    echo $! > webserver.pid
    echo "✅ Web服务器已启动 (PID: $(cat webserver.pid))"
fi

echo ""
echo "🎉 所有服务已启动！"
echo "📱 访问地址："
echo "   电脑: http://localhost:8001/index.html"
echo "   手机: http://$(ipconfig getifaddr en0):8001/index.html"
echo ""
echo "📋 管理命令："
echo "   查看状态: ./check-deepseek-status.sh"
echo "   停止服务: ./stop-deepseek-daemon.sh"
echo "   查看日志: tail -f deepseek.log"