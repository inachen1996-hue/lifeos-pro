#!/bin/bash

echo "======================================"
echo "🚀 部署到 Vercel - DeepSeek 支持版本"
echo "======================================"
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

echo "📋 检查必要文件..."

# 检查 vercel.json
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json 文件不存在"
    exit 1
else
    echo "✅ vercel.json 存在"
fi

# 检查 API 路由
if [ ! -f "api/deepseek.js" ]; then
    echo "❌ api/deepseek.js 文件不存在"
    exit 1
else
    echo "✅ api/deepseek.js 存在"
fi

# 检查主应用
if [ ! -f "index.html" ]; then
    echo "❌ index.html 文件不存在"
    exit 1
else
    echo "✅ index.html 存在"
fi

echo ""
echo "🔄 开始部署到 Vercel..."
echo ""

# 部署到 Vercel
vercel --prod

echo ""
echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo ""
echo "📱 接下来的步骤："
echo "1. 访问 Vercel 给你的域名"
echo "2. 打开测试页面: /test-vercel-deepseek.html"
echo "3. 输入 DeepSeek API Key 测试"
echo "4. 在主应用中配置 DeepSeek"
echo ""
echo "🔧 如果有问题，查看部署日志："
echo "   vercel logs"
echo ""
echo "======================================"