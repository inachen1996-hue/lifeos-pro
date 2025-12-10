#!/bin/bash

echo "======================================"
echo "🔧 修复 Vercel 配置并重新部署"
echo "======================================"
echo ""

echo "📋 检查修复状态..."

# 检查 vercel.json 是否已修复
if grep -q '"runtime"' vercel.json 2>/dev/null; then
    echo "❌ vercel.json 仍包含 runtime 配置，需要修复"
    echo "正在修复 vercel.json..."
    
    # 创建修复后的 vercel.json
    cat > vercel.json << 'EOF'
{
  "rewrites": [
    {
      "source": "/api/deepseek",
      "destination": "/api/deepseek.js"
    }
  ]
}
EOF
    echo "✅ vercel.json 已修复"
else
    echo "✅ vercel.json 配置正确"
fi

# 检查 API 文件
if [ ! -f "api/deepseek.js" ]; then
    echo "❌ api/deepseek.js 文件不存在"
    exit 1
else
    echo "✅ api/deepseek.js 存在"
fi

echo ""
echo "🔄 提交修复并重新部署..."

# 提交修复
git add vercel.json
git add api/deepseek.js
git commit -m "修复 Vercel 配置错误 - 移除无效的 runtime 配置"

echo ""
echo "📤 推送到远程仓库..."
git push

echo ""
echo "======================================"
echo "✅ 修复完成！"
echo "======================================"
echo ""
echo "📱 Vercel 会自动重新部署，请等待 1-2 分钟"
echo ""
echo "🧪 部署完成后测试："
echo "1. 访问你的 Vercel 域名"
echo "2. 打开: /test-vercel-deepseek.html"
echo "3. 测试 DeepSeek API 连接"
echo ""
echo "🔍 如果还有问题："
echo "1. 查看 Vercel 部署日志"
echo "2. 检查浏览器控制台错误"
echo "3. 告诉我具体的错误信息"
echo ""
echo "======================================"