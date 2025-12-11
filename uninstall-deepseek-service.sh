#!/bin/bash

# 卸载 DeepSeek 系统服务

echo "🗑️  卸载 DeepSeek 系统服务..."

SERVICE_FILE="$HOME/Library/LaunchAgents/com.lifeos.deepseek.plist"

if [ -f "$SERVICE_FILE" ]; then
    # 停止并卸载服务
    launchctl stop com.lifeos.deepseek 2>/dev/null || true
    launchctl unload "$SERVICE_FILE" 2>/dev/null || true
    
    # 删除服务文件
    rm -f "$SERVICE_FILE"
    
    echo "✅ DeepSeek 系统服务已卸载！"
else
    echo "ℹ️  DeepSeek 系统服务未安装"
fi

echo ""
echo "💡 你仍然可以手动启动服务："
echo "   ./start-deepseek-daemon.sh"