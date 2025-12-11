#!/bin/bash

# 安装 DeepSeek 为系统服务（开机自启动）

echo "🔧 安装 DeepSeek 为系统服务..."

# 获取当前目录的绝对路径
CURRENT_DIR=$(pwd)
PLIST_FILE="$CURRENT_DIR/deepseek-service.plist"
SERVICE_DIR="$HOME/Library/LaunchAgents"
SERVICE_FILE="$SERVICE_DIR/com.lifeos.deepseek.plist"

# 创建服务目录
mkdir -p "$SERVICE_DIR"

# 更新plist文件中的路径
sed "s|/Users/chenhongxu/Desktop/工程文件/计划app/lifeos-pro|$CURRENT_DIR|g" "$PLIST_FILE" > "$SERVICE_FILE"

# 加载服务
launchctl unload "$SERVICE_FILE" 2>/dev/null || true
launchctl load "$SERVICE_FILE"

echo "✅ DeepSeek 服务已安装！"
echo ""
echo "📋 服务管理命令："
echo "   启动服务: launchctl start com.lifeos.deepseek"
echo "   停止服务: launchctl stop com.lifeos.deepseek"
echo "   卸载服务: ./uninstall-deepseek-service.sh"
echo "   查看状态: launchctl list | grep deepseek"
echo ""
echo "🎉 现在 DeepSeek 会在开机时自动启动！"