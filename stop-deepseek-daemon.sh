#!/bin/bash

# 停止 DeepSeek 持久化服务

echo "🛑 停止 DeepSeek 服务..."

# 停止 DeepSeek 代理服务器
if [ -f deepseek.pid ]; then
    PID=$(cat deepseek.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ DeepSeek代理服务器已停止 (PID: $PID)"
    else
        echo "⚠️  DeepSeek代理服务器进程不存在"
    fi
    rm -f deepseek.pid
else
    # 尝试通过端口查找并停止
    PID=$(lsof -ti :3000)
    if [ ! -z "$PID" ]; then
        kill $PID
        echo "✅ DeepSeek代理服务器已停止 (端口 3000)"
    else
        echo "ℹ️  DeepSeek代理服务器未运行"
    fi
fi

# 停止 Web 服务器
if [ -f webserver.pid ]; then
    PID=$(cat webserver.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Web服务器已停止 (PID: $PID)"
    else
        echo "⚠️  Web服务器进程不存在"
    fi
    rm -f webserver.pid
else
    # 尝试通过端口查找并停止
    PID=$(lsof -ti :8001)
    if [ ! -z "$PID" ]; then
        kill $PID
        echo "✅ Web服务器已停止 (端口 8001)"
    else
        echo "ℹ️  Web服务器未运行"
    fi
fi

echo ""
echo "🎉 所有服务已停止！"