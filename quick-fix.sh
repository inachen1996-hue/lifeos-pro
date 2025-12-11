#!/bin/bash

echo "🔧 LifeOS Pro 快速修复脚本"
echo "================================"

# 检查当前目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误：请在 LifeOS Pro 项目根目录运行此脚本"
    exit 1
fi

echo "✅ 项目目录检查通过"

# 检查 dist 目录
if [ ! -d "dist" ]; then
    echo "⚠️  警告：dist 目录不存在，尝试创建..."
    mkdir -p dist
    echo "📁 已创建 dist 目录"
else
    echo "✅ dist 目录存在"
fi

# 检查关键文件
REQUIRED_FILES=("dist/storage.js" "dist/timer-manager.js" "dist/types.js")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "⚠️  警告：以下文件缺失："
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    
    # 检查是否有 TypeScript 编译器
    if command -v tsc &> /dev/null; then
        echo "🔨 尝试编译 TypeScript 文件..."
        tsc
        if [ $? -eq 0 ]; then
            echo "✅ TypeScript 编译成功"
        else
            echo "❌ TypeScript 编译失败"
        fi
    elif command -v npm &> /dev/null; then
        echo "🔨 尝试使用 npm 编译..."
        npm run build
        if [ $? -eq 0 ]; then
            echo "✅ npm build 成功"
        else
            echo "❌ npm build 失败"
        fi
    else
        echo "❌ 未找到 TypeScript 编译器或 npm"
        echo "💡 请安装 TypeScript: npm install -g typescript"
    fi
else
    echo "✅ 所有必需文件都存在"
fi

# 检查是否有服务器在运行
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ 本地服务器已在运行 (端口 8000)"
    echo "🌐 访问地址: http://localhost:8000"
else
    echo "⚠️  本地服务器未运行，正在启动..."
    
    # 检查 Python
    if command -v python3 &> /dev/null; then
        echo "🚀 使用 Python3 启动服务器..."
        echo "📱 访问地址: http://localhost:8000"
        echo "🔧 按 Ctrl+C 停止服务器"
        echo ""
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        echo "🚀 使用 Python2 启动服务器..."
        echo "📱 访问地址: http://localhost:8000"
        echo "🔧 按 Ctrl+C 停止服务器"
        echo ""
        python -m SimpleHTTPServer 8000
    elif command -v node &> /dev/null; then
        echo "🚀 使用 Node.js 启动服务器..."
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
fi