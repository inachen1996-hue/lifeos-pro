# Requirements Document

## Introduction

为计时器页面的分类按钮添加完整的 iOS 风格交互功能，包括长按进入编辑模式、抖动动画、拖动排序和删除分类。这将提供与 iOS 主屏幕应用图标相同的用户体验。

## Glossary

- **System**: LifeOS Pro 计时器系统
- **Category Button**: 左侧栏中的分类按钮
- **Edit Mode**: 编辑模式，允许用户删除和重排序分类
- **Shake Animation**: 抖动动画，iOS 风格的视觉反馈
- **Long Press**: 长按操作，触发编辑模式的手势
- **Drag and Drop**: 拖放操作，用于重新排序分类
- **Delete Button**: 删除按钮，显示在分类按钮左上角的 X 图标
- **CategoryStorage**: 后端分类存储服务

## Requirements

### Requirement 1

**User Story:** 作为用户，我想通过长按分类按钮进入编辑模式，以便管理我的分类。

#### Acceptance Criteria

1. WHEN 用户在分类按钮上按住 500-800 毫秒 THEN System SHALL 进入编辑模式并显示所有分类按钮的抖动动画
2. WHEN 用户在长按过程中移开手指或鼠标 THEN System SHALL 取消长按操作并保持正常模式
3. WHEN 编辑模式被激活 THEN System SHALL 在所有分类按钮上显示删除按钮（X 图标）
4. WHEN 编辑模式被激活 THEN System SHALL 禁用分类按钮的点击切换功能
5. WHEN 用户点击空白区域或完成按钮 THEN System SHALL 退出编辑模式并停止抖动动画

### Requirement 2

**User Story:** 作为用户，我想看到抖动动画作为视觉反馈，以便知道我处于编辑模式。

#### Acceptance Criteria

1. WHEN 编辑模式被激活 THEN System SHALL 对所有分类按钮应用连续的抖动动画
2. WHEN 抖动动画播放时 THEN System SHALL 使按钮在 -2 度到 +2 度之间旋转
3. WHEN 抖动动画播放时 THEN System SHALL 以 0.3 秒为周期无限循环动画
4. WHEN 退出编辑模式 THEN System SHALL 立即停止所有抖动动画并恢复按钮到原始状态
5. WHEN 新建分类按钮存在时 THEN System SHALL 不对新建分类按钮应用抖动动画

### Requirement 3

**User Story:** 作为用户，我想通过拖动分类按钮来重新排序，以便按照我的偏好组织分类。

#### Acceptance Criteria

1. WHEN 编辑模式被激活 THEN System SHALL 使所有分类按钮可拖动
2. WHEN 用户开始拖动分类按钮 THEN System SHALL 显示拖动中的视觉反馈（如半透明或放大）
3. WHEN 用户拖动分类按钮到另一个位置 THEN System SHALL 实时更新其他按钮的位置以显示新的排序
4. WHEN 用户释放拖动的按钮 THEN System SHALL 将按钮放置到新位置并保存新的排序到 CategoryStorage
5. WHEN 分类排序被更新 THEN System SHALL 保持所有计时器与其分类的关联关系不变

### Requirement 4

**User Story:** 作为用户，我想通过点击删除按钮来删除不需要的分类，以便保持分类列表的整洁。

#### Acceptance Criteria

1. WHEN 编辑模式被激活 THEN System SHALL 在每个分类按钮的左上角显示删除按钮（X 图标）
2. WHEN 用户点击删除按钮 THEN System SHALL 显示确认对话框询问是否删除该分类
3. WHEN 用户确认删除 THEN System SHALL 从 CategoryStorage 中删除该分类
4. WHEN 分类被删除且该分类下有计时器 THEN System SHALL 将这些计时器移动到默认分类或提示用户选择新分类
5. WHEN 分类被删除且该分类当前被选中 THEN System SHALL 自动切换到第一个可用分类
6. WHEN 只剩一个分类时 THEN System SHALL 隐藏该分类的删除按钮以防止删除最后一个分类
7. WHEN 新建分类按钮存在时 THEN System SHALL 不显示删除按钮在新建分类按钮上

### Requirement 5

**User Story:** 作为用户，我想要流畅的触摸和鼠标交互体验，以便在不同设备上都能轻松使用。

#### Acceptance Criteria

1. WHEN 用户使用触摸设备 THEN System SHALL 通过 touchstart、touchmove、touchend 事件处理长按和拖动
2. WHEN 用户使用鼠标设备 THEN System SHALL 通过 mousedown、mousemove、mouseup 事件处理长按和拖动
3. WHEN 用户在拖动过程中移出按钮区域 THEN System SHALL 继续跟踪拖动操作直到释放
4. WHEN 用户快速点击按钮（少于 500ms）THEN System SHALL 执行正常的点击操作而不是进入编辑模式
5. WHEN 用户在编辑模式下拖动按钮 THEN System SHALL 提供平滑的动画过渡效果

### Requirement 6

**User Story:** 作为用户，我想要我的分类排序和删除操作被持久化保存，以便下次访问时保持我的设置。

#### Acceptance Criteria

1. WHEN 用户重新排序分类 THEN System SHALL 立即将新的排序保存到 CategoryStorage
2. WHEN 用户删除分类 THEN System SHALL 立即从 CategoryStorage 中移除该分类
3. WHEN 页面刷新后 THEN System SHALL 从 CategoryStorage 加载分类并按照保存的顺序显示
4. WHEN 分类数据保存失败 THEN System SHALL 显示错误提示并保持当前状态不变
5. WHEN 分类排序被更新 THEN System SHALL 触发状态更新以重新渲染分类列表

### Requirement 7

**User Story:** 作为用户，我想要清晰的视觉反馈和提示，以便理解当前的操作状态。

#### Acceptance Criteria

1. WHEN 进入编辑模式 THEN System SHALL 显示"完成"按钮或提示文字指示如何退出编辑模式
2. WHEN 删除分类时 THEN System SHALL 显示确认对话框包含分类名称和警告信息
3. WHEN 拖动分类时 THEN System SHALL 改变被拖动按钮的视觉样式（如透明度、阴影）
4. WHEN 操作成功完成 THEN System SHALL 显示成功提示消息（如"分类已删除"、"排序已保存"）
5. WHEN 操作失败 THEN System SHALL 显示错误提示消息并说明失败原因
