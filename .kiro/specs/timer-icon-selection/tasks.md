# 计时器图标选择功能实施计划

## 项目结构概览

```
src/
├── icon-selector/
│   ├── IconSelector.tsx
│   ├── GlassIcon.tsx
│   ├── IconGrid.tsx
│   └── SmartMatcher.ts
├── types/
│   └── icon-types.ts
└── utils/
    └── category-colors.ts
```

## 实施任务

- [-] 1. 设置项目基础结构和类型定义
  - 创建图标选择相关的 TypeScript 接口和类型
  - 定义图标映射配置数据结构
  - 设置基础的工具函数
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.1 创建图标选择类型定义
  - 编写 IconSelector、GlassIcon、SmartMatcher 的 TypeScript 接口
  - 定义图标映射和选择状态的数据结构
  - 扩展现有 Timer 接口以支持图标来源追踪
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 编写图标类型定义的属性测试
  - **Property 1: 图标选择界面显示**
  - **Validates: Requirements 1.1**

- [ ] 1.3 实现分类颜色服务扩展
  - 扩展 CategoryColorService 以支持光效颜色计算
  - 实现分类主题色到 CSS 变量的转换
  - 添加动态光晕效果的颜色计算逻辑
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 1.4 编写分类颜色服务的属性测试
  - **Property 9: 分类颜色获取**
  - **Validates: Requirements 3.1**

- [ ] 2. 实现 GlassIcon 组件
  - 创建带有玻璃质感效果的图标容器组件
  - 实现动态光效跟随分类颜色
  - 添加响应式尺寸调整功能
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.1 创建基础 GlassIcon 组件
  - 实现圆形磨砂玻璃容器
  - 添加半透明白底背景和细微白边框
  - 实现 Emoji 居中显示布局
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 2.2 编写 GlassIcon 组件的属性测试
  - **Property 6: 玻璃容器包裹**
  - **Validates: Requirements 2.1**

- [ ] 2.3 实现动态光效系统
  - 添加 backdrop-filter 背景模糊效果
  - 实现基于分类颜色的动态 box-shadow
  - 添加光效颜色实时更新机制
  - _Requirements: 2.3, 3.2, 3.5_

- [ ] 2.4 编写光效系统的属性测试
  - **Property 10: 光效颜色匹配**
  - **Validates: Requirements 3.2**

- [ ] 2.5 添加响应式设计支持
  - 实现不同尺寸下的自适应调整
  - 添加 CSS 特性检测和降级方案
  - 优化移动端和桌面端的显示效果
  - _Requirements: 6.3, 6.5_

- [ ] 2.6 编写响应式设计的属性测试
  - **Property 19: 响应式尺寸调整**
  - **Validates: Requirements 6.3**

- [ ] 3. 实现智能匹配服务
  - 创建基于关键词的图标匹配算法
  - 建立图标映射数据库
  - 实现匹配优先级和状态管理
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.1 创建 SmartMatcher 服务类
  - 实现关键词匹配算法
  - 建立默认的图标映射配置
  - 添加匹配结果缓存机制
  - _Requirements: 4.1, 4.5_

- [ ] 3.2 编写智能匹配的属性测试
  - **Property 12: 输入监听**
  - **Validates: Requirements 4.1**

- [ ] 3.3 实现关键词映射数据库
  - 创建常用关键词到图标的映射表
  - 支持中文关键词匹配（看书→📖、跑步→👟、代码→💻）
  - 添加映射优先级和分类关联
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 3.4 编写关键词匹配的属性测试
  - **Property 13: 无匹配默认行为**
  - **Validates: Requirements 4.5**

- [ ] 4. 实现 IconSelector 主组件
  - 创建图标选择的主要 UI 组件
  - 集成智能匹配和手动选择功能
  - 实现用户交互和状态管理
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4_

- [ ] 4.1 创建 IconSelector 基础组件
  - 实现图标选择器的 UI 布局
  - 添加图标网格显示功能
  - 集成 GlassIcon 组件显示
  - _Requirements: 1.1, 1.2_

- [ ] 4.2 编写 IconSelector 基础功能的属性测试
  - **Property 2: 图标列表展示**
  - **Validates: Requirements 1.2**

- [ ] 4.3 实现图标选择逻辑
  - 添加用户点击选择图标功能
  - 实现选择状态的视觉反馈
  - 集成图标应用到计时器的逻辑
  - _Requirements: 1.3, 5.1, 5.2_

- [ ] 4.4 编写图标选择逻辑的属性测试
  - **Property 3: 图标应用到计时器**
  - **Validates: Requirements 1.3**

- [ ] 4.5 实现智能匹配集成
  - 集成 SmartMatcher 服务到组件
  - 实现输入监听和自动匹配
  - 添加手动选择优先级逻辑
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4.6 编写智能匹配集成的属性测试
  - **Property 15: 手动优先级**
  - **Validates: Requirements 5.2**

- [ ] 5. 集成到 TimerCreateModal
  - 将 IconSelector 组件集成到现有的计时器创建模态框
  - 更新计时器创建流程以支持图标选择
  - 实现与现有 UI 的无缝集成
  - _Requirements: 1.4, 1.5, 5.5_

- [ ] 5.1 修改 TimerCreateModal 组件
  - 在计时器创建表单中添加图标选择区域
  - 集成 IconSelector 组件到模态框布局
  - 更新表单状态管理以包含图标选择
  - _Requirements: 1.1, 1.4_

- [ ] 5.2 编写 TimerCreateModal 集成的属性测试
  - **Property 4: 图标在卡片上显示**
  - **Validates: Requirements 1.4**

- [ ] 5.3 实现默认图标逻辑
  - 更新 getIconForMode 函数以支持新的图标系统
  - 实现未选择图标时的默认值处理
  - 确保向后兼容现有计时器数据
  - _Requirements: 1.5_

- [ ] 5.4 编写默认图标逻辑的属性测试
  - **Property 5: 默认图标使用**
  - **Validates: Requirements 1.5**

- [ ] 5.5 更新计时器保存逻辑
  - 修改计时器创建函数以保存图标选择信息
  - 添加图标来源（default/smart/manual）的追踪
  - 实现图标选择时间戳的记录
  - _Requirements: 5.5_

- [ ] 5.6 编写计时器保存逻辑的属性测试
  - **Property 18: 最终图标保存**
  - **Validates: Requirements 5.5**

- [ ] 6. 更新计时器显示组件
  - 修改计时器卡片以使用新的 GlassIcon 组件
  - 更新 getTimerMainIcon 函数以支持玻璃效果
  - 确保所有计时器显示位置都使用新样式
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2_

- [ ] 6.1 更新计时器卡片显示
  - 替换现有的扁平图标为 GlassIcon 组件
  - 确保光效颜色正确跟随分类主题
  - 优化卡片布局以适配新的图标样式
  - _Requirements: 2.1, 3.2_

- [ ] 6.2 编写计时器显示的属性测试
  - **Property 7: 玻璃效果样式**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ] 6.3 更新全局图标函数
  - 修改 getTimerMainIcon 函数以使用 GlassIcon
  - 更新所有调用图标显示的地方
  - 确保运行状态动画与新样式兼容
  - _Requirements: 2.5, 3.5_

- [ ] 6.4 编写全局图标函数的属性测试
  - **Property 11: 颜色变更响应**
  - **Validates: Requirements 3.5**

- [ ] 7. 性能优化和错误处理
  - 实现图标加载的错误处理机制
  - 添加性能优化和缓存策略
  - 实现优雅降级方案
  - _Requirements: 6.4, 6.5_

- [ ] 7.1 实现错误处理机制
  - 添加图标加载失败的降级处理
  - 实现分类颜色获取失败的默认方案
  - 添加智能匹配服务异常的恢复机制
  - _Requirements: 设计文档错误处理部分_

- [ ] 7.2 编写错误处理的属性测试
  - **Property 20: CSS兼容性降级**
  - **Validates: Requirements 6.5**

- [ ] 7.3 实现性能优化
  - 添加智能匹配结果的缓存机制
  - 实现图标列表的虚拟滚动（如需要）
  - 优化 CSS 动画和 GPU 加速
  - _Requirements: 设计文档性能优化部分_

- [ ] 7.4 编写性能优化的单元测试
  - 测试缓存机制的正确性
  - 验证内存使用的合理性
  - 测试渲染性能的优化效果

- [ ] 8. 检查点 - 确保所有测试通过
  - 确保所有测试通过，询问用户是否有问题

- [ ] 9. 创建测试页面和文档
  - 创建功能演示页面
  - 编写使用说明文档
  - 进行最终的集成测试
  - _Requirements: 全部需求的综合验证_

- [ ] 9.1 创建功能演示页面
  - 创建独立的测试页面展示图标选择功能
  - 包含各种使用场景的演示
  - 添加交互式的功能测试界面
  - _Requirements: 全部需求_

- [ ] 9.2 编写使用说明文档
  - 创建用户使用指南
  - 编写开发者集成文档
  - 添加故障排除和常见问题解答
  - _Requirements: 6.1, 6.2_

- [ ] 9.3 进行最终集成测试
  - 测试与现有系统的完整集成
  - 验证所有需求的满足情况
  - 进行跨浏览器兼容性测试
  - _Requirements: 全部需求_

- [ ] 9.4 编写集成测试的属性测试
  - **Property 16: 手动选择后禁用自动匹配**
  - **Validates: Requirements 5.3**

- [ ] 9.5 编写最终验证的属性测试
  - **Property 17: 重置后重新启用匹配**
  - **Validates: Requirements 5.4**

- [ ] 10. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，询问用户是否有问题