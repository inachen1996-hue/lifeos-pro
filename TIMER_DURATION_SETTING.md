# 计时器时长设置功能

## 功能描述
在点击已有计时器并选择倒计时或番茄钟模式后，允许用户设置时长再开始计时。

## 实现方案

### 1. 两步流程设计
**第一步：选择模式**
- 正计时 → 直接开始（无需设置）
- 倒计时 → 进入时长设置界面
- 番茄钟 → 进入时长设置界面

**第二步：设置时长**（仅倒计时和番茄钟）
- 倒计时：设置倒计时时长（分钟）
- 番茄钟：设置工作时长和休息时长（分钟）

### 2. TimerTypeSelectModal 组件改进

#### 状态管理
```javascript
const [step, setStep] = useState('selectMode'); // 'selectMode' or 'setDuration'
const [selectedMode, setSelectedMode] = useState(null);
const [countdownDuration, setCountdownDuration] = useState(timer.settings?.countdownDuration || 25);
const [workDuration, setWorkDuration] = useState(timer.settings?.workDuration || 25);
const [restDuration, setRestDuration] = useState(timer.settings?.restDuration || 5);
```

#### 倒计时设置界面
- 大号数字输入框（居中显示）
- 快捷按钮：5, 10, 15, 25, 30, 45, 60 分钟
- 橙色主题配色
- 返回按钮（左上角）

#### 番茄钟设置界面
- 工作时长输入框 + 快捷按钮（15, 25, 30, 45）
- 休息时长输入框 + 快捷按钮（5, 10, 15, 20）
- 红色/绿色主题配色
- 返回按钮（左上角）

### 3. handleStartWithMode 函数增强
```javascript
const handleStartWithMode = (mode, settings = {}) => {
  if (selectedTimer) {
    const timerWithMode = { 
      ...selectedTimer, 
      mode,
      settings: {
        ...selectedTimer.settings,
        ...settings  // 合并新的时长设置
      }
    };
    onStartTimer(timerWithMode);
    setShowTimerTypeModal(false);
    setSelectedTimer(null);
  }
};
```

### 4. 用户体验优化
- ✅ 使用计时器原有的 settings 作为默认值
- ✅ 提供快捷按钮，方便快速选择常用时长
- ✅ 大号字体显示时长，易于阅读
- ✅ 支持手动输入自定义时长
- ✅ 返回按钮可以重新选择模式
- ✅ 渐变紫色"开始计时"按钮

## 使用流程

### 倒计时
1. 点击计时器 → 选择"倒计时"
2. 设置时长（例如：25 分钟）
3. 点击"开始计时"
4. 倒计时开始运行

### 番茄钟
1. 点击计时器 → 选择"番茄钟"
2. 设置工作时长（例如：25 分钟）
3. 设置休息时长（例如：5 分钟）
4. 点击"开始计时"
5. 番茄钟开始运行

### 正计时
1. 点击计时器 → 选择"正计时"
2. 直接开始计时（无需设置）

## 技术细节
- 使用 `useState` 管理步骤和时长状态
- 条件渲染：根据 `step` 显示不同界面
- 参数传递：`onSelectMode(mode, settings)` 支持传递时长设置
- 默认值：从 `timer.settings` 读取，如果不存在则使用默认值

## 文件修改
- `index.html` - 修改 `TimerTypeSelectModal` 和 `handleStartWithMode` 函数

## 状态
✅ 实现完成
✅ 代码编译成功
