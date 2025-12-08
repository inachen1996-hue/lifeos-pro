# 计时器最小记录时长调整

## 修改内容
将计时器记录到数据源的最小时长从 **60 秒（1 分钟）** 改为 **1 秒**。

## 修改原因
- 用户希望记录所有计时数据，即使是很短的计时
- 提高数据记录的灵活性
- 支持快速测试和短时任务记录

## 具体改动

### 1. 时长判断条件
**修改前**：
```javascript
if (durationSeconds >= 60) {
  // 记录数据
} else {
  showToast('时长不足 1 分钟，未记录', 'error');
}
```

**修改后**：
```javascript
if (durationSeconds >= 1) {
  // 记录数据
} else {
  showToast('时长不足 1 秒，未记录', 'error');
}
```

### 2. 时长格式化增强
添加秒级显示支持：

```javascript
// 格式化时长（支持秒级显示）
const hours = Math.floor(durationMinutes / 60);
const minutes = Math.floor(durationMinutes % 60);
const seconds = Math.floor(durationSeconds % 60);
let durationText = '';

if (hours > 0) {
  durationText = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
} else if (minutes > 0) {
  durationText = `${minutes}min`;
} else {
  durationText = `${seconds}s`;  // 新增：秒级显示
}
```

## 时长显示格式

| 时长 | 显示格式 | 示例 |
|------|---------|------|
| < 1 分钟 | `Xs` | `5s`, `30s`, `59s` |
| 1-59 分钟 | `Xmin` | `1min`, `30min`, `59min` |
| 1+ 小时（整小时） | `Xh` | `1h`, `2h`, `3h` |
| 1+ 小时（非整小时） | `Xh Ymin` | `1h 30min`, `2h 15min` |

## 数据示例

**修改前**（最小 1 分钟）：
```
[WORK] 2024-12-08: ⏱️ 💼 深度工作 45min | 09:00-09:45
```

**修改后**（支持秒级）：
```
[WORK] 2024-12-08: ⏱️ 💼 快速任务 30s | 09:00-09:00
[STUDY] 2024-12-08: ⏱️ 📚 阅读笔记 5min | 10:00-10:05
[HEALTH] 2024-12-08: ⏱️ 🏃 拉伸 2min | 14:00-14:02
```

## 用户体验改进
- ✅ 支持记录任何超过 1 秒的计时
- ✅ 秒级时长清晰显示（例如：30s）
- ✅ 适合快速任务和测试场景
- ✅ 提高数据记录的完整性

## 注意事项
- 时长不足 1 秒的计时仍然不会记录
- 秒级计时会显示为 `Xs` 格式
- 所有时长格式保持一致性

## 文件修改
- `index.html` - 修改 `handleStopTimer` 函数

## 状态
✅ 修改完成
✅ 代码编译成功
✅ 支持秒级时长显示
