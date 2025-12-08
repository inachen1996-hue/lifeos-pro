# 计时器数据记录功能

## 功能描述
计时器结束后，自动将计时数据添加到数据源（fullHistory），可在"数据源-管理数据"中查看。

## 实现方案

### 1. 数据记录逻辑
在 `handleStopTimer` 函数中：
1. 计算计时时长（秒和分钟）
2. 只记录超过 1 分钟的计时
3. 保存到 EventStorage（后端存储）
4. 添加到 fullHistory（数据源）

### 2. 数据格式
```
[CATEGORY] 日期: 模式图标 计时器图标 计时器名称 时长 | 开始时间-结束时间
```

**示例**：
```
[WORK] 2024-12-08: ⏱️ 💼 深度工作 45min | 09:00-09:45
[STUDY] 2024-12-08: 🍅 📚 学习英语 1h 30min | 14:00-15:30
[HEALTH] 2024-12-08: ⏰ 🏃 跑步 30min | 18:00-18:30
```

### 3. 分类映射
将自定义分类名称映射到标准分类标签：

| 分类名称 | 标签 |
|---------|------|
| 工作 | WORK |
| 学习 | STUDY |
| 休息 | REST |
| 睡眠 | SLEEP |
| 生活 | LIFE |
| 娱乐 | ENTERTAINMENT |
| 健康 | HEALTH |
| 兴趣 | HOBBY |
| 其他 | LIFE（默认） |

### 4. 模式图标
- ⏱️ 正计时（stopwatch）
- ⏰ 倒计时（countdown）
- 🍅 番茄钟（pomodoro）

### 5. 时长格式化
- 小于 1 小时：`30min`
- 1 小时以上：`1h 30min` 或 `2h`
- 整小时：`1h`

### 6. 时间格式
- 日期：`YYYY-MM-DD`（例如：2024-12-08）
- 时间：`HH:MM`（24小时制，例如：09:00-09:45）

## 代码实现

### 关键代码片段
```javascript
const handleStopTimer = () => {
  if (activeTimerSession && window.TimerBackend) {
    const { timer, session } = activeTimerSession;
    const durationSeconds = (Date.now() - startTime) / 1000;
    
    if (durationSeconds >= 60) {
      // 1. 保存到 EventStorage
      window.TimerBackend.EventStorage.saveEvent(event);
      
      // 2. 构建数据行
      const dataLine = `[${categoryTag}] ${dateStr}: ${modeIcon} ${timer.icon} ${timer.name} ${durationText} | ${startTimeStr}-${endTimeStr}`;
      
      // 3. 添加到 fullHistory
      setFullHistory(prev => (prev ? prev + "\n" + dataLine : dataLine));
      
      showToast('已记录到数据源');
    } else {
      showToast('时长不足 1 分钟，未记录', 'error');
    }
  }
};
```

## 用户体验

### 记录成功
- ✅ 显示提示："已记录到数据源"
- ✅ 数据出现在"数据源-管理数据"列表中
- ✅ 可以在复盘功能中统计和分析

### 记录失败
- ⚠️ 时长不足 1 分钟：显示"时长不足 1 分钟，未记录"
- ⚠️ 防止记录过短的计时，保持数据质量

## 数据用途
记录的计时数据可以用于：
1. **数据源管理**：在"管理数据"中查看、编辑、删除
2. **复盘分析**：统计各分类的时间分配
3. **AI 洞察**：生成时间管理建议
4. **历史追溯**：查看过去的计时记录

## 注意事项
- 只记录超过 1 分钟的计时
- 支持所有三种模式（正计时、倒计时、番茄钟）
- 自动映射自定义分类到标准分类
- 数据格式与手动输入的数据格式一致

## 文件修改
- `index.html` - 修改 `handleStopTimer` 函数

## 状态
✅ 实现完成
✅ 代码编译成功
✅ 支持所有计时模式
✅ 数据格式规范
