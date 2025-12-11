#!/bin/bash

# 检查 DeepSeek 服务状态

echo "🔍 检查 DeepSeek 服务状态..."
echo ""

# 检查 DeepSeek 代理服务器
if lsof -i :3000 > /dev/null 2>&1; then
    PID=$(lsof -ti :3000)
    echo "✅ DeepSeek代理服务器: 运行中 (PID: $PID, 端口: 3000)"
    echo "   📡 访问地址: http://localhost:3000"
else
    echo "❌ DeepSeek代理服务器: 未运行"
fi

# 检查 Web 服务器
if lsof -i :8001 > /dev/null 2>&1; then
    PID=$(lsof -ti :8001)
    echo "✅ Web服务器: 运行中 (PID: $PID, 端口: 8001)"
    echo "   🌐 电脑访问: http://localhost:8001/index.html"
    echo "   📱 手机访问: http://$(ipconfig getifaddr en0):8001/index.html"
else
    echo "❌ Web服务器: 未运行"
fi

echo ""

# 检查日志文件
if [ -f deepseek.log ]; then
    echo "📋 DeepSeek 日志 (最近5行):"
    tail -5 deepseek.log
    echo ""
fi

if [ -f webserver.log ]; then
    echo "📋 Web服务器日志 (最近3行):"
    tail -3 webserver.log
    echo ""
fi

# 显示管理命令
echo "📋 管理命令："
echo "   启动服务: ./start-deepseek-daemon.sh"
echo "   停止服务: ./stop-deepseek-daemon.sh"
echo "   实时日志: tail -f deepseek.log"
echo "   测试API: open http://localhost:8001/test-deepseek-quick.html"