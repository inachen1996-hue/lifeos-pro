#!/bin/bash

echo "⏹  正在停止服务器..."

# 停止端口 3000 的进程（DeepSeek 代理）
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "停止 DeepSeek 代理服务器（端口 3000）..."
    kill $(lsof -t -i:3000) 2>/dev/null
fi

# 停止端口 8001 的进程（Web 服务器）
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "停止 Web 服务器（端口 8001）..."
    kill $(lsof -t -i:8001) 2>/dev/null
fi

echo "✅ 所有服务器已停止"
