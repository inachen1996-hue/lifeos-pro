#!/bin/bash

echo "🎨 空气感马卡龙 UI 预览"
echo "========================"
echo ""
echo "选择查看方式："
echo "1. 查看主应用（需要启动服务器）"
echo "2. 查看 UI 预览页面（直接打开）"
echo "3. 查看升级文档"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动服务器..."
        npm run dev
        ;;
    2)
        echo ""
        echo "📱 打开 UI 预览页面..."
        open test-airy-ui.html
        ;;
    3)
        echo ""
        echo "📖 打开升级文档..."
        open 空气感马卡龙UI升级完成.md
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
