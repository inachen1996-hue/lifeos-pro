# Achievement Jar 主应用集成需求文档

## 介绍

本规格定义了将已开发完成的 Achievement Jar 系统集成到 LifeOS 主应用的"当前进度"页面中，替换现有的传统统计界面，提供更加治愈和游戏化的进度可视化体验。

## 术语表

- **主应用**: LifeOS 的 index.html 文件中的主要应用程序
- **当前进度页面**: 复盘页面中的"当前进度" Tab，当前显示传统的统计卡片
- **Achievement_Jar_System**: 已开发完成的 3D 成就罐系统，包含所有组件和功能
- **集成点**: 主应用中需要替换或修改的代码位置
- **数据适配器**: 将现有数据格式转换为 Achievement Jar 系统所需格式的转换函数
- **组件导入**: 将 Achievement Jar 组件引入到主应用中的过程

## 需求

### 需求 1

**用户故事:** 作为用户，我希望在"当前进度"页面看到美丽的 3D 成就罐可视化，而不是传统的统计卡片，这样我能获得更加治愈和激励的体验。

#### 验收标准

1. WHEN 用户点击"当前进度" Tab 时，THE 系统 SHALL 显示 Achievement Jar 容器而不是传统的统计卡片
2. WHEN 进度数据存在时，THE Achievement_Jar SHALL 根据现有的 fullHistory 和 calculateStatsFromLogs 数据填充彩色黏土球
3. WHEN 用户切换时间范围（今日/本周/本月）时，THE Achievement_Jar SHALL 动态更新显示相应时间段的数据
4. WHEN 没有进度数据时，THE 系统 SHALL 显示空的成就罐和激励性的空状态消息
5. WHEN Achievement Jar 加载失败时，THE 系统 SHALL 优雅降级到传统统计界面

### 需求 2

**用户故事:** 作为用户，我希望现有的庆祝音效功能能够与新的 Achievement Jar 系统无缝集成，这样我可以继续享受激励性的交互体验。

#### 验收标准

1. WHEN Achievement Jar 系统加载时，THE 系统 SHALL 保留现有的三个庆祝按钮（喝彩、鼓掌、打鼓）
2. WHEN 用户点击庆祝按钮时，THE 系统 SHALL 同时触发音效和 Achievement Jar 的庆祝动画
3. WHEN 自定义音效已配置时，THE 系统 SHALL 优先使用自定义音效而不是内置音效
4. WHEN 庆祝效果触发时，THE 系统 SHALL 显示弹幕和彩纸效果覆盖整个屏幕
5. WHEN 用户离开当前进度页面时，THE 系统 SHALL 清除所有庆祝效果和动画

### 需求 3

**用户故事:** 作为用户，我希望 Achievement Jar 系统能够正确使用现有的分类数据和颜色系统，这样保持界面的一致性和熟悉感。

#### 验收标准

1. WHEN 显示黏土球时，THE 系统 SHALL 使用现有的 CATEGORIES 配置中的颜色和标签
2. WHEN 计算球的大小时，THE 系统 SHALL 基于现有的时长统计数据（工作、学习等分类）
3. WHEN 显示指标托盘时，THE 系统 SHALL 使用现有的分类图标和马卡龙色彩系统
4. WHEN 工作或学习时间存在时，THE 系统 SHALL 给予这些分类更大的视觉突出度
5. WHEN 渲染界面时，THE 系统 SHALL 保持与主应用一致的空气感马卡龙设计风格

### 需求 4

**用户故事:** 作为用户，我希望 Achievement Jar 系统能够在移动设备上正常工作，并且性能良好，这样我可以在任何设备上享受流畅的体验。

#### 验收标准

1. WHEN 在移动设备上显示时，THE Achievement_Jar SHALL 适应屏幕尺寸并保持适当的触摸目标大小
2. WHEN 设备性能不足时，THE 系统 SHALL 自动降级到 CSS 动画而不是物理引擎
3. WHEN 用户进行触摸交互时，THE 系统 SHALL 在支持的设备上提供触觉反馈
4. WHEN 屏幕方向改变时，THE Achievement_Jar SHALL 重新调整布局以保持最佳显示效果
5. WHEN 渲染性能低于 60fps 时，THE 系统 SHALL 自动优化动画以维持流畅体验

### 需求 5

**用户故事:** 作为开发者，我希望集成过程不会破坏现有功能，并且能够轻松回滚到原始界面，这样确保系统的稳定性和可维护性。

#### 验收标准

1. WHEN Achievement Jar 组件加载失败时，THE 系统 SHALL 自动回退到原始的统计卡片界面
2. WHEN 集成完成后，THE 系统 SHALL 保持所有现有的数据处理和状态管理逻辑不变
3. WHEN 用户切换到其他 Tab 时，THE 系统 SHALL 正确清理 Achievement Jar 相关的资源和事件监听器
4. WHEN 进行错误处理时，THE 系统 SHALL 记录详细的错误信息以便调试和维护
5. WHEN 需要时，THE 系统 SHALL 提供配置选项来启用或禁用 Achievement Jar 功能