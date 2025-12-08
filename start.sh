#!/bin/bash

# LifeOS Timer Rework - 快速启动脚本

echo "🚀 LifeOS Timer Rework - 启动中..."
echo ""

# 检查 dist 目录是否存在
if [ ! -d "dist" ]; then
    echo "📦 编译后端代码..."
    npm run build
    echo "✅ 编译完成"
    echo ""
fi

# 检查端口 8000 是否被占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 8000 已被占用"
    echo "请手动停止占用端口的进程，或使用其他端口"
    echo ""
    echo "使用其他端口启动："
    echo "  python3 -m http.server 8001"
    exit 1
fi

echo "🌐 启动本地服务器..."
echo "📍 地址: http://localhost:8000"
echo ""
echo "🎯 打开以下链接："
echo "  - 完整应用: http://localhost:8000/index.html"
echo "  - 后端测试: http://localhost:8000/test-timer.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动 Python 服务器
python3 -m http.server 8000
