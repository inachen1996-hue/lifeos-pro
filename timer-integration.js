/**
 * Timer Integration Module
 * 这个文件将被插入到 index.html 的 React 应用中
 * 提供 Timer 功能的完整实现
 */

// 导入后端模块（这些将在 HTML 中通过 script type="module" 导入）
// import { TimerManager } from './dist/timer-manager.js';
// import { CategoryStorage } from './dist/storage.js';
// import { StopwatchEngine } from './dist/stopwatch-engine.js';
// import { CountdownEngine } from './dist/countdown-engine.js';
// import { PomodoroEngine } from './dist/pomodoro-engine.js';
// import { EventManager } from './dist/event-manager.js';
// import { ConflictResolver } from './dist/conflict-resolver.js';
// import { BlankPeriodDetector } from './dist/blank-period-detector.js';

/**
 * Timer Page Component
 * 显示所有分类和计时器
 */
const TimerPage = ({ 
  categories, 
  timers, 
  onCreateTimer, 
  onStartTimer, 
  onEditTimer, 
  onDeleteTimer,
  expandedCategories,
  toggleCategory
}) => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  return (
    <div className="space-y-6 animate-in pb-48">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-macaron-dark flex items-center gap-2">
          <Timer className="w-6 h-6 text-macaron-blue"/> 计时器
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-macaron-blue text-blue-900 px-4 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1"
        >
          <Plus className="w-4 h-4"/> 新建
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryTimers = timers.filter(t => t.categoryId === category.id);
          const isExpanded = expandedCategories[category.id];

          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${category.color}`}>
                    {/* Icon placeholder - 实际使用时需要映射到 Lucide 图标 */}
                    <Briefcase className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="font-bold text-slate-700">{category.name}</span>
                  <span className="text-xs text-slate-400">({categoryTimers.length})</span>
                </div>
                {isExpanded ? 
                  <ChevronUp className="w-5 h-5 text-slate-400" /> : 
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                }
              </button>

              {/* Timer List */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 space-y-2">
                  {categoryTimers.length === 0 ? (
                    <p className="text-center text-slate-400 py-4 text-sm">暂无计时器</p>
                  ) : (
                    categoryTimers.map(timer => (
                      <div 
                        key={timer.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{timer.icon}</div>
                          <div>
                            <div className="font-bold text-slate-700">{timer.name}</div>
                            <div className="text-xs text-slate-400">
                              {timer.mode === 'stopwatch' && '秒表'}
                              {timer.mode === 'countdown' && `倒计时 ${timer.settings.countdownDuration}分钟`}
                              {timer.mode === 'pomodoro' && `番茄钟 ${timer.settings.workDuration}/${timer.settings.restDuration}分钟`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onStartTimer(timer)}
                          className="p-2 bg-macaron-blue rounded-full text-blue-900 hover:shadow-md transition-all"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                  
                  {/* Add Timer Button */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full py-2 text-slate-400 text-sm font-bold hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> 添加计时器
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Category Button */}
      <button className="w-full py-4 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> 新建分类组
      </button>

      {/* Create Timer Modal */}
      {showCreateModal && (
        <TimerCreateModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateTimer}
        />
      )}
    </div>
  );
};

/**
 * Timer Create/Edit Modal
 */
const TimerCreateModal = ({ categories, onClose, onCreate, editingTimer }) => {
  const [name, setName] = React.useState(editingTimer?.name || '');
  const [icon, setIcon] = React.useState(editingTimer?.icon || '⏱️');
  const [categoryId, setCategoryId] = React.useState(editingTimer?.categoryId || categories[0]?.id);
  const [mode, setMode] = React.useState(editingTimer?.mode || 'stopwatch');
  const [countdownDuration, setCountdownDuration] = React.useState(editingTimer?.settings?.countdownDuration || 25);
  const [workDuration, setWorkDuration] = React.useState(editingTimer?.settings?.workDuration || 25);
  const [restDuration, setRestDuration] = React.useState(editingTimer?.settings?.restDuration || 5);
  const [cycles, setCycles] = React.useState(editingTimer?.settings?.cycles || 4);

  const icons = ['⏱️', '⏰', '🍅', '💼', '📚', '🏃', '🎯', '💪', '🎨', '🎮', '☕', '🌙'];

  const handleSubmit = () => {
    const timer = {
      id: editingTimer?.id || `timer_${Date.now()}`,
      name,
      icon,
      categoryId,
      mode,
      settings: {
        ...(mode === 'countdown' && { countdownDuration }),
        ...(mode === 'pomodoro' && { workDuration, restDuration, cycles })
      },
      createdAt: editingTimer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onCreate(timer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in">
      <div className="bg-white w-full max-w-md p-6 rounded-[2rem] shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">{editingTimer ? '编辑计时器' : '创建计时器'}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="text-sm font-bold text-slate-600 mb-2 block">名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 ring-macaron-blue"
            placeholder="例如：深度工作"
          />
        </div>

        {/* Icon Picker */}
        <div className="mb-4">
          <label className="text-sm font-bold text-slate-600 mb-2 block">图标</label>
          <div className="grid grid-cols-6 gap-2">
            {icons.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`p-3 rounded-xl text-2xl transition-all ${
                  icon === i ? 'bg-macaron-blue ring-2 ring-blue-400' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Category Select */}
        <div className="mb-4">
          <label className="text-sm font-bold text-slate-600 mb-2 block">分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 ring-macaron-blue font-bold text-slate-700"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Mode Select */}
        <div className="mb-4">
          <label className="text-sm font-bold text-slate-600 mb-2 block">模式</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'stopwatch', label: '秒表', icon: '⏱️' },
              { value: 'countdown', label: '倒计时', icon: '⏰' },
              { value: 'pomodoro', label: '番茄钟', icon: '🍅' }
            ].map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-3 rounded-xl font-bold text-sm transition-all ${
                  mode === m.value 
                    ? 'bg-macaron-purple text-purple-900 ring-2 ring-purple-400' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-2xl mb-1">{m.icon}</div>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific Settings */}
        {mode === 'countdown' && (
          <div className="mb-4">
            <label className="text-sm font-bold text-slate-600 mb-2 block">时长（分钟）</label>
            <input
              type="number"
              value={countdownDuration}
              onChange={(e) => setCountdownDuration(Number(e.target.value))}
              className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 ring-macaron-blue font-mono font-bold text-slate-700"
              min="1"
              max="180"
            />
          </div>
        )}

        {mode === 'pomodoro' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-sm font-bold text-slate-600 mb-2 block">工作时长（分钟）</label>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 ring-macaron-blue font-mono font-bold text-slate-700"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 mb-2 block">休息时长（分钟）</label>
              <input
                type="number"
                value={restDuration}
                onChange={(e) => setRestDuration(Number(e.target.value))}
                className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 ring-macaron-blue font-mono font-bold text-slate-700"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 mb-2 block">循环次数</label>
              <input
                type="number"
                value={cycles}
                onChange={(e) => setCycles(Number(e.target.value))}
                className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:ring-2 ring-macaron-blue font-mono font-bold text-slate-700"
                min="1"
                max="10"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-4 bg-macaron-dark text-white rounded-xl font-bold text-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingTimer ? '保存修改' : '创建计时器'}
        </button>
      </div>
    </div>
  );
};

/**
 * Timer Control Modal
 * 显示正在运行的计时器
 */
const TimerControlModal = ({ timer, session, onPause, onResume, onStop, onClose }) => {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [displayTime, setDisplayTime] = React.useState('00:00:00');

  // 格式化时间显示
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 更新显示时间
  React.useEffect(() => {
    if (session.status === 'running') {
      const interval = setInterval(() => {
        const now = Date.now();
        const start = new Date(session.startTime).getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);
        
        if (timer.mode === 'stopwatch') {
          setDisplayTime(formatTime(elapsed));
        } else if (timer.mode === 'countdown') {
          const remaining = Math.max(0, (timer.settings.countdownDuration * 60) - elapsed);
          setDisplayTime(formatTime(remaining));
        } else if (timer.mode === 'pomodoro') {
          // Pomodoro 显示逻辑
          const totalWorkTime = timer.settings.workDuration * 60;
          const totalRestTime = timer.settings.restDuration * 60;
          const cycleTime = totalWorkTime + totalRestTime;
          const currentCycleElapsed = elapsed % cycleTime;
          
          if (currentCycleElapsed < totalWorkTime) {
            // 工作时段
            const remaining = totalWorkTime - currentCycleElapsed;
            setDisplayTime(formatTime(remaining));
          } else {
            // 休息时段
            const remaining = cycleTime - currentCycleElapsed;
            setDisplayTime(formatTime(remaining));
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session, timer]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in">
      <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] shadow-2xl text-center">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">{timer.icon} {timer.name}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Display */}
        <div className="text-6xl font-black text-slate-800 mb-2 font-mono">
          {displayTime}
        </div>

        {/* Mode Info */}
        <div className="text-sm text-slate-500 mb-8">
          {timer.mode === 'stopwatch' && '秒表模式'}
          {timer.mode === 'countdown' && `倒计时 ${timer.settings.countdownDuration} 分钟`}
          {timer.mode === 'pomodoro' && (
            <div>
              <div>番茄钟模式</div>
              <div className="text-xs mt-1">
                周期 {session.currentCycle || 1}/{timer.settings.cycles}
                {session.currentPeriod === 'work' ? ' - 工作时段' : ' - 休息时段'}
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {session.status === 'running' ? (
            <button
              onClick={onPause}
              className="flex-1 py-4 bg-macaron-yellow text-yellow-900 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" /> 暂停
            </button>
          ) : (
            <button
              onClick={onResume}
              className="flex-1 py-4 bg-macaron-green text-green-900 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> 继续
            </button>
          )}
          <button
            onClick={onStop}
            className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" /> 停止
          </button>
        </div>

        {/* Warning for stopwatch < 1 min */}
        {timer.mode === 'stopwatch' && elapsedTime < 60 && (
          <p className="text-xs text-slate-400 mt-4">
            ⚠️ 少于 1 分钟的记录将不会保存
          </p>
        )}
      </div>
    </div>
  );
};

// 导出组件供 index.html 使用
if (typeof window !== 'undefined') {
  window.TimerComponents = {
    TimerPage,
    TimerCreateModal,
    TimerControlModal
  };
}
