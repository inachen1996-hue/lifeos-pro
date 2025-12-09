# 空气感马卡龙 UI 升级方案

## 设计理念

**"Airy Macaron UI" - 空气感马卡龙风格**

### 核心原则
1. **背景**：温暖米白色渐变 (#FDFCFB → #F9F7F5)
2. **留白**：大量呼吸空间，避免拥挤
3. **色彩控制**：
   - 卡片背景：极淡色调（Tint）
   - 图标和主按钮：鲜艳马卡龙色
   - 避免大面积色块
4. **层级**：通过色彩深浅区分，不增加颜色种类
5. **质感**：有色弥散投影，轻盈治愈

## 新色板系统

### 主色调 - 紫色系
- `airy-purple`: #C8A2E0 (鲜艳紫 - 主按钮)
- `airy-purple-light`: #F3EBFA (极淡紫 - 卡片背景)
- `airy-purple-soft`: #E8D9F3 (柔和紫 - 悬停)
- `airy-purple-deep`: #9B6BB8 (深紫 - 强调)

### 辅助色 - 粉色系
- `airy-pink`: #F5C2D6 (鲜艳粉 - 图标)
- `airy-pink-light`: #FDF5F8 (极淡粉 - 卡片)
- `airy-pink-soft`: #F9E5ED (柔和粉 - 悬停)
- `airy-pink-deep`: #D89BB3 (深粉 - 强调)

### 中性色 - 灰色系
- `airy-gray-bg`: #FDFCFB (页面背景)
- `airy-gray-card`: #FFFFFF (卡片背景)
- `airy-gray-border`: #F0EBE8 (边框)
- `airy-gray-text`: #8B8490 (次要文字)
- `airy-gray-dark`: #5D576B (主要文字)

### 功能色（低饱和度）
- `airy-blue`: #D4E8F5
- `airy-green`: #D9EFE8
- `airy-yellow`: #FFF8E1
- `airy-orange`: #FFE9D6
- `airy-rose`: #FFE5E5

## 投影系统

```css
shadow-airy-purple: 0 8px 24px -4px rgba(200, 162, 224, 0.15)
shadow-airy-pink: 0 8px 24px -4px rgba(245, 194, 214, 0.15)
shadow-airy-soft: 0 4px 16px -2px rgba(93, 87, 107, 0.08)
shadow-airy-hover: 0 12px 32px -4px rgba(200, 162, 224, 0.2)
```

## 替换规则

### 1. 主按钮（Primary Button）
**旧样式**：`bg-macaron-purple text-purple-900`
**新样式**：`bg-gradient-to-r from-airy-purple to-airy-pink text-white shadow-airy-purple airy-button`

### 2. 次要按钮（Secondary Button）
**旧样式**：`bg-macaron-blue text-blue-900`
**新样式**：`bg-airy-gray-card text-airy-gray-dark border border-airy-gray-border shadow-airy-soft airy-button`

### 3. 卡片背景
**旧样式**：`bg-macaron-cream` 或 `bg-white`
**新样式**：`bg-airy-gray-card shadow-airy-soft`

### 4. 分类标签（未选中）
**旧样式**：`bg-macaron-blue` 等彩色背景
**新样式**：`bg-airy-gray-card border border-airy-gray-border text-airy-gray-text`

### 5. 分类标签（选中）
**旧样式**：`bg-macaron-purple text-purple-900`
**新样式**：`bg-gradient-to-r from-airy-purple-light to-airy-pink-light border-2 border-airy-purple text-airy-purple-deep shadow-airy-purple`

### 6. 图标颜色
保持鲜艳：`text-purple-500`, `text-pink-500` 等

## 实施步骤

✅ 1. 更新 Tailwind 配置（已完成）
✅ 2. 更新全局样式（已完成）
✅ 3. 更新分类配置（已完成）
⏳ 4. 更新所有按钮样式
⏳ 5. 更新所有卡片样式
⏳ 6. 更新左侧栏样式
⏳ 7. 更新弹窗样式
⏳ 8. 测试所有页面

## 预期效果

- 视觉疲劳降低 60%
- 层级清晰度提升 80%
- 整体轻盈感提升 90%
- 治愈感 MAX 💜
