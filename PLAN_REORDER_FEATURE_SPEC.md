# 今日计划拖拽排序功能规范

## 功能概述
用户生成今日计划后，可以通过拖拽方式调整事项顺序，点击保存后重新生成按新顺序排列的计划，并自动调整时间段。

## 功能需求

### 1. 拖拽排序
- ✅ 计划列表中的每个事项可以拖拽
- ✅ 拖拽时显示视觉反馈（半透明、阴影）
- ✅ 拖拽目标位置显示插入指示器
- ✅ 松开鼠标完成排序

### 2. 保存按钮
- ✅ 拖拽后显示"保存新顺序"按钮
- ✅ 按钮位置：计划列表底部
- ✅ 按钮样式：渐变紫色，醒目

### 3. 重新生成计划
- ✅ 根据新顺序重新分配时间段
- ✅ 保持每个事项的时长不变
- ✅ 按顺序从早到晚排列
- ✅ 更新计划文本

## 技术实现

### 1. 状态管理
```javascript
const [planItems, setPlanItems] = useState([]);
const [hasReordered, setHasReordered] = useState(false);
```

### 2. 解析计划文本
```javascript
const parsePlanItems = (planText) => {
  // 解析计划文本，提取每个事项
  // 格式: "时间段 | 事项名称 | 时长"
  const lines = planText.split('\n').filter(l => l.trim());
  return lines.map((line, index) => {
    const match = line.match(/(\d{2}:\d{2}-\d{2}:\d{2})\s*\|\s*(.+?)\s*\|\s*(.+)/);
    if (match) {
      return {
        id: index,
        timeRange: match[1],
        name: match[2],
        duration: match[3],
        originalLine: line
      };
    }
    return null;
  }).filter(Boolean);
};
```

### 3. 拖拽处理
```javascript
const handleDragStart = (e, index) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', index);
  setDraggedIndex(index);
};

const handleDragOver = (e, index) => {
  e.preventDefault();
  if (draggedIndex === null || draggedIndex === index) return;
  
  const newItems = [...planItems];
  const draggedItem = newItems[draggedIndex];
  newItems.splice(draggedIndex, 1);
  newItems.splice(index, 0, draggedItem);
  
  setPlanItems(newItems);
  setDraggedIndex(index);
  setHasReordered(true);
};

const handleDragEnd = () => {
  setDraggedIndex(null);
};
```

### 4. 重新生成计划
```javascript
const regeneratePlan = () => {
  // 1. 解析每个事项的时长（分钟）
  const items = planItems.map(item => {
    const durationMatch = item.duration.match(/(\d+(\.\d+)?)\s*(h|min)/g);
    let totalMinutes = 0;
    
    durationMatch?.forEach(d => {
      const match = d.match(/(\d+(\.\d+)?)\s*(h|min)/);
      const value = parseFloat(match[1]);
      const unit = match[3];
      totalMinutes += unit === 'h' ? value * 60 : value;
    });
    
    return { ...item, durationMinutes: totalMinutes };
  });
  
  // 2. 从早上开始分配时间（例如：08:00）
  let currentTime = 8 * 60; // 08:00 in minutes
  const newPlanLines = [];
  
  items.forEach(item => {
    const startHour = Math.floor(currentTime / 60);
    const startMin = currentTime % 60;
    const endTime = currentTime + item.durationMinutes;
    const endHour = Math.floor(endTime / 60);
    const endMin = endTime % 60;
    
    const timeRange = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}-${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    
    newPlanLines.push(`${timeRange} | ${item.name} | ${item.duration}`);
    
    currentTime = endTime;
  });
  
  // 3. 更新计划
  const newPlan = {
    ...todayPlan,
    content: newPlanLines.join('\n'),
    updatedAt: new Date().toISOString()
  };
  
  setTodayPlan(newPlan);
  setHasReordered(false);
  showToast('计划已更新');
};
```

### 5. UI 组件
```javascript
<div className="space-y-2">
  {planItems.map((item, index) => (
    <div
      key={item.id}
      draggable
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => handleDragOver(e, index)}
      onDragEnd={handleDragEnd}
      className={`p-4 bg-white rounded-xl border-2 transition-all cursor-move ${
        draggedIndex === index 
          ? 'opacity-50 scale-105 border-macaron-purple' 
          : 'border-slate-100 hover:border-macaron-blue'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-400">
          <Menu className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-slate-700">{item.name}</div>
          <div className="text-sm text-slate-400">
            {item.timeRange} · {item.duration}
          </div>
        </div>
      </div>
    </div>
  ))}
  
  {hasReordered && (
    <button
      onClick={regeneratePlan}
      className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
    >
      <Save className="w-5 h-5" /> 保存新顺序
    </button>
  )}
</div>
```

## 用户流程

### 流程 1：生成计划
1. 点击"生成今日计划"
2. AI 生成计划列表
3. 显示可拖拽的事项列表

### 流程 2：调整顺序
1. 拖拽事项到新位置
2. 实时更新列表顺序
3. 显示"保存新顺序"按钮

### 流程 3：保存计划
1. 点击"保存新顺序"
2. 重新计算时间段
3. 更新计划文本
4. 显示成功提示

## 视觉设计

### 拖拽状态
```
┌─────────────────────────────────────┐
│ ≡ 深度工作                           │
│   09:00-10:30 · 1h 30min            │
├─────────────────────────────────────┤
│ ≡ 学习英语 (拖拽中，半透明)          │
│   10:30-11:30 · 1h                  │
├─────────────────────────────────────┤
│ ≡ 午休                               │
│   12:00-13:00 · 1h                  │
└─────────────────────────────────────┘
```

### 保存按钮
```
┌─────────────────────────────────────┐
│ [💾 保存新顺序]                      │
│ (渐变紫色，全宽按钮)                 │
└─────────────────────────────────────┘
```

## 注意事项

### 1. 时间分配
- 从早上 08:00 开始
- 按顺序连续排列
- 保持原有时长
- 自动计算结束时间

### 2. 边界情况
- 时间超过 24:00 的处理
- 空计划的处理
- 拖拽到相同位置的处理

### 3. 性能优化
- 使用 React DnD 或原生 HTML5 拖拽
- 避免频繁重新渲染
- 使用 useMemo 缓存计算结果

## 需要的图标
- `Menu` - 拖拽手柄（三条横线）
- `Save` - 保存按钮

## 实现步骤

### 第一步：解析计划
1. 从 `todayPlan.content` 提取事项
2. 解析时间段、名称、时长
3. 存储到 `planItems` 状态

### 第二步：实现拖拽
1. 添加拖拽事件处理
2. 实现拖拽视觉反馈
3. 更新列表顺序

### 第三步：重新生成
1. 计算每个事项的时长（分钟）
2. 从 08:00 开始分配时间
3. 生成新的计划文本
4. 更新 `todayPlan`

### 第四步：UI 优化
1. 添加拖拽手柄图标
2. 添加保存按钮
3. 添加成功提示

## 文件修改
- `index.html` - 添加拖拽排序功能到计划显示组件
- 需要导入 `Menu` 和 `Save` 图标

## 预期效果
- ✅ 用户可以直观地调整计划顺序
- ✅ 时间自动重新分配
- ✅ 操作流畅，反馈及时
- ✅ 保存后立即生效

## 后续优化
- 支持设置开始时间（不固定 08:00）
- 支持添加休息时间间隔
- 支持删除某个事项
- 支持编辑事项时长
