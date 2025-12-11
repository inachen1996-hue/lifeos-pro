#!/bin/bash

# 启动本地服务器解决 CORS 问题

echo "🚀 启动本地服务器..."

# 检查是否有 Python
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python3 启动服务器"
    echo "📱 访问地址: http://localhost:8000"
    echo "🔧 按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python2 启动服务器"
    echo "📱 访问地址: http://localhost:8000"
    echo "🔧 按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "✅ 使用 Node.js 启动服务器"
    echo "📱 访问地址: http://localhost:8000"
    echo "🔧 按 Ctrl+C 停止服务器"
    echo ""
    npx http-server -p 8000
else
    echo "❌ 未找到 Python 或 Node.js"
    echo "💡 请安装以下任一工具："
    echo "   - Python: brew install python"
    echo "   - Node.js: brew install node"
    echo ""
    echo "🔧 或者手动启动服务器："
    echo "   python3 -m http.server 8000"
    echo "   然后访问 http://localhost:8000"
fi