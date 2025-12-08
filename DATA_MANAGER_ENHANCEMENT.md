# 数据管理功能增强

## 功能概述
全面改进"管理数据"功能，提供更强大的数据查看和管理能力。

## 新增功能

### 1. 优化显示方式
**修改前**：
```
2024-12-08: ⏱️ ⏱️ 哈哈 2s | 20:10-20:10
```

**修改后**：
- **事项名称**：哈哈（大字体，粗体）
- **分类标签**：工作/学习/休息等（彩色标签）
- **时间段**：20:10-20:10（小字体，灰色）
- **时长**：2s（小字体，灰色）

### 2. 按名称搜索
- ✅ 实时搜索框
- ✅ 搜索所有日期的数据
- ✅ 不区分大小写
- ✅ 支持部分匹配

**使用场景**：
- 搜索"工作"，找到所有包含"工作"的事项
- 搜索"学习"，找到所有学习相关的记录
- 跨日期查找特定任务

### 3. 日历选择
- ✅ 日期选择器
- ✅ 默认选中今天
- ✅ 可查看任意日期的数据
- ✅ 快速切换日期

### 4. 时间段筛选
**时间段定义**：
- **全部**：00:00-24:00（显示所有）
- **凌晨**：00:00-06:00
- **早上**：06:00-12:00
- **下午**：12:00-18:00
- **晚上**：18:00-24:00

**智能默认**：
- 根据当前系统时间自动选择对应时间段
- 例如：现在是 14:30，默认选中"下午"

## 界面设计

### 筛选区域
```
┌─────────────────────────────────────┐
│ 🔍 搜索事项名称...                   │
├─────────────────────────────────────┤
│ 📅 2024-12-08                        │
├─────────────────────────────────────┤
│ [全部] [凌晨] [早上] [下午] [晚上]   │
└─────────────────────────────────────┘
```

### 数据卡片
```
┌─────────────────────────────────────┐
│ [工作] 09:00-09:45  45min    [✏️][🗑️]│
│ 深度工作                             │
└─────────────────────────────────────┘
```

## 技术实现

### 1. 数据解析
```javascript
const parseItemDetails = (fullContent) => {
  // 提取事项名称（去掉日期、图标、时长、时间段）
  let name = fullContent;
  name = name.replace(/\d{4}-\d{1,2}-\d{1,2}:\s*/, '');
  name = name.replace(/[⏱️⏰🍅💼📚🏃🎯💪🎨🎮☕🌙]/g, '');
  name = name.replace(/\s*\d+(\.\d+)?(s|min|h)\s*/g, '');
  name = name.replace(/\s*\|\s*\d{1,2}:\d{2}-\d{1,2}:\d{2}\s*$/, '');
  
  // 提取时间段和时长
  const timeMatch = fullContent.match(/\|\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  const durationMatch = fullContent.match(/(\d+(\.\d+)?(s|min|h)(\s+\d+min)?)/);
  
  return { name, timeRange, duration };
};
```

### 2. 多条件筛选
```javascript
const filteredData = useMemo(() => {
  let data = parseHistoryData();
  
  // 1. 按日期筛选
  data = data.filter(item => item.date === selectedDate);
  
  // 2. 按时间段筛选
  if (timePeriod !== 'all') {
    data = data.filter(item => {
      const hour = parseTime(item.startTime);
      return hour >= period.hours[0] && hour < period.hours[1];
    });
  }
  
  // 3. 按名称搜索
  if (searchQuery.trim()) {
    data = data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return data;
}, [searchQuery, selectedDate, timePeriod]);
```

### 3. 智能默认时间段
```javascript
const [timePeriod, setTimePeriod] = useState(() => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return 'dawn';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
});
```

## 用户体验改进

### 显示优化
- ✅ 事项名称突出显示（粗体、大字）
- ✅ 时间和时长次要显示（小字、灰色）
- ✅ 分类标签彩色醒目
- ✅ 卡片悬停效果

### 交互优化
- ✅ 实时搜索，无需点击按钮
- ✅ 日期选择器，快速切换
- ✅ 时间段按钮，一键筛选
- ✅ 空状态提示（未找到数据）

### 性能优化
- ✅ 使用 `useMemo` 缓存筛选结果
- ✅ 避免不必要的重新渲染
- ✅ 高效的正则表达式解析

## 使用场景

### 场景 1：查看今天下午的工作记录
1. 打开"管理数据"
2. 日期自动选中今天
3. 时间段自动选中"下午"（如果当前是下午）
4. 查看筛选后的数据

### 场景 2：搜索所有"学习"相关的记录
1. 在搜索框输入"学习"
2. 查看所有日期中包含"学习"的记录
3. 可以进一步按日期或时间段筛选

### 场景 3：查看上周某天的凌晨数据
1. 选择日期（例如：2024-12-01）
2. 点击"凌晨"按钮
3. 查看该日凌晨的所有记录

## 文件修改
- `index.html` - 新增 `DataManagerModal` 组件，添加 `Search` 图标导入

## 状态
✅ 实现完成
✅ 代码编译成功
✅ 支持搜索、日期筛选、时间段筛选
✅ 优化显示方式
