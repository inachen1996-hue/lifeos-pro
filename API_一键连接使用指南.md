# API 一键连接使用指南

## 🚀 功能概述

现在您可以通过一键连接功能，无需手动输入 API 密钥，直接连接到预设的 DeepSeek 和 Gemini API 服务。

## 📋 预设 API 密钥

- **DeepSeek API**: `sk-d1fdb210d0424ffdbad83f1ebe4e283b`
- **Gemini API**: `AIzaSyAs95vJEeL-CkfTdvxeKgZsViKJtjAppBE`

## 🎯 使用方法

### 方法一：一键连接（推荐）

1. 打开应用，进入 **设置** 页面
2. 点击 **AI 设置** 卡片
3. 在弹出的设置窗口中，点击 **🚀 一键连接 (DeepSeek + Gemini)** 按钮
4. 系统会自动：
   - 配置 DeepSeek 和 Gemini API 密钥
   - 设置 DeepSeek 为默认服务
   - 测试连接是否成功
   - 保存配置到本地存储
5. 连接成功后会显示 "🎉 一键连接成功！DeepSeek API 已就绪"
6. 弹窗会在 2 秒后自动关闭

### 方法二：手动测试

1. 在 API 设置窗口中，选择要测试的服务（DeepSeek 或 Google）
2. 点击 **🧪 测试当前连接** 按钮
3. 系统会验证当前选中服务的 API 密钥是否有效

## ✅ 连接状态指示

- **绿色圆点** + "当前: DeepSeek/Google Gemini" = API 已配置
- **💡 点击可一键连接预设 API** = 提示可使用一键连接功能

## 🔧 技术实现

### 预设配置
```javascript
const presetKeys = {
  deepseek: 'sk-d1fdb210d0424ffdbad83f1ebe4e283b',
  google: 'AIzaSyAs95vJEeL-CkfTdvxeKgZsViKJtjAppBE'
};
```

### 默认配置
- **默认服务**: DeepSeek（更稳定，响应更快）
- **备用服务**: Google Gemini（功能更丰富）
- **自动保存**: 配置会自动保存到 `localStorage`

## 🚨 错误处理

### 常见错误及解决方案

1. **连接超时**
   - 检查网络连接
   - 稍后重试

2. **API 密钥无效**
   - 系统会自动使用预设密钥
   - 如仍失败，请检查 API 服务状态

3. **服务不可用**
   - 尝试切换到其他 AI 服务
   - 检查 API 配额是否用完

## 🧪 测试功能

使用 `test-api-one-click.html` 文件可以独立测试 API 连接：

```bash
# 在项目根目录打开测试页面
open test-api-one-click.html
```

测试页面提供：
- DeepSeek API 连接测试
- Gemini API 连接测试
- 实时连接状态显示
- 详细错误信息

## 📱 移动端支持

一键连接功能完全支持移动端：
- 触摸友好的按钮设计
- 响应式布局
- 自动关闭弹窗

## 🔄 更新说明

### v4.0 新增功能
- ✅ 预设 API 密钥
- ✅ 一键连接按钮
- ✅ 自动连接测试
- ✅ 智能错误提示
- ✅ 配置自动保存

### 兼容性
- 保持与旧版本配置的兼容性
- 自动迁移旧的 API 密钥设置
- 支持手动输入自定义 API 密钥

## 💡 使用建议

1. **首次使用**: 直接点击一键连接，无需任何配置
2. **日常使用**: DeepSeek 作为主要服务，Gemini 作为备用
3. **功能测试**: 使用测试按钮验证连接状态
4. **问题排查**: 查看浏览器控制台获取详细日志

---

**享受无缝的 AI 体验！** 🎉