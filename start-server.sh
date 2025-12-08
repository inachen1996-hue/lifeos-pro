#!/bin/bash

# LifeOS Pro 本地服务器启动脚本

echo "🚀 正在启动 LifeOS Pro 本地服务器..."
echo ""
echo "📍 服务器地址: http://localhost:8000"
echo "📄 访问应用: http://localhost:8000/index.html"
echo ""
echo "💡 提示："
echo "   - 保持此窗口打开"
echo "   - 按 Ctrl+C 可以停止服务器"
echo "   - 在浏览器中访问上面的地址"
echo ""
echo "⏳ 服务器启动中..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动 Python HTTP 服务器
python3 -m http.server 8000
