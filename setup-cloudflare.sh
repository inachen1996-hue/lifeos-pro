#!/bin/bash

echo "======================================"
echo "☁️  Cloudflare Tunnel 配置向导"
echo "======================================"
echo ""

# 检查是否安装了 cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "❌ 未检测到 cloudflared"
    echo ""
    echo "请先安装："
    echo "  brew install cloudflare/cloudflare/cloudflared"
    echo ""
    exit 1
fi

echo "✅ 已检测到 cloudflared"
echo ""

# 检查是否已登录
if [ ! -d ~/.cloudflared ] || [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "📝 需要先登录 Cloudflare"
    echo ""
    echo "运行以下命令登录："
    echo "  cloudflared tunnel login"
    echo ""
    echo "登录后重新运行此脚本"
    exit 1
fi

echo "✅ 已登录 Cloudflare"
echo ""

# 检查是否已创建隧道
echo "🔍 检查现有隧道..."
EXISTING_TUNNEL=$(cloudflared tunnel list 2>/dev/null | grep "lifeos-pro" | awk '{print $1}')

if [ -z "$EXISTING_TUNNEL" ]; then
    echo "📝 创建新隧道: lifeos-pro"
    cloudflared tunnel create lifeos-pro
    
    if [ $? -ne 0 ]; then
        echo "❌ 创建隧道失败"
        exit 1
    fi
    
    TUNNEL_ID=$(cloudflared tunnel list | grep "lifeos-pro" | awk '{print $1}')
else
    echo "✅ 找到现有隧道: lifeos-pro"
    TUNNEL_ID=$EXISTING_TUNNEL
fi

echo ""
echo "🆔 隧道 ID: $TUNNEL_ID"
echo ""

# 创建配置文件
echo "📝 创建配置文件..."

cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: ~/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: lifeos-pro-${TUNNEL_ID:0:8}.trycloudflare.com
    service: http://localhost:8001
  - service: http_status:404
EOF

echo "✅ 配置文件已创建: ~/.cloudflared/config.yml"
echo ""

# 显示访问地址
echo "======================================"
echo "✅ 配置完成！"
echo "======================================"
echo ""
echo "🌐 你的公网访问地址："
echo "   https://lifeos-pro-${TUNNEL_ID:0:8}.trycloudflare.com"
echo ""
echo "📝 下一步："
echo "   1. 运行: ./start-with-cloudflare.sh"
echo "   2. 访问上面的地址"
echo "   3. 配置 DeepSeek API Key"
echo ""
echo "💡 提示："
echo "   - 这个地址是固定的，不会变"
echo "   - 可以分享给朋友"
echo "   - 可以用数据流量访问"
echo ""
echo "======================================"
