import * as React from 'react';
import { 
  Play, Calendar, ClipboardPaste, Activity, BrainCircuit, 
  AlertCircle, Moon, Briefcase, BookOpen, Gamepad2, Car, Coffee, 
  Heart, Sunrise, Snowflake, Plus, X, Timer, List, Sparkles, 
  ShieldCheck, Loader2, Link2, CheckCircle, Settings, ChevronRight, ArrowRight,
  ChevronDown, ChevronUp, RefreshCw, Clock, PieChart as PieIcon, Save, Trash2,
  Music, MoveRight, Wand2, Feather, Archive, History, BarChart3, CalendarDays,
  Battery, BatteryCharging, BatteryFull, BatteryWarning, Lightbulb, Database,
  Layout, BookMarked, Eraser, Zap, Utensils, TrendingUp, TrendingDown, Minus,
  ToggleLeft, ToggleRight, Scale, Sofa, Telescope, Footprints, Droplets, Edit3,
  Target, ArrowUpRight, ArrowDownRight, PlusCircle, RefreshCcw, Eye, EyeOff, Key,
  Hourglass, Bath, UtensilsCrossed, FileText, Percent, UserCheck, MessageSquarePlus,
  Sun, MoonStar, User, ArrowLeftRight, FileJson, RotateCcw
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 解构 React Hooks
const { useState, useEffect, useRef, useMemo } = React;

// --- 错误边界 ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
          <div className="bg-rose-50 p-6 rounded-full"><AlertCircle className="w-12 h-12 text-rose-500" /></div>
          <div>
            <h3 className="text-slate-800 font-bold text-2xl mb-2">出了一点小问题</h3>
            <p className="text-base text-slate-500">应用程序遇到错误 (React Load Error)。</p>
          </div>
          <button onClick={this.handleReset} className="bg-slate-800 text-white px-6 py-4 rounded-2xl text-lg font-medium">重置数据</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 辅助函数 ---
const cleanApiKey = (key) => key ? key.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '') : '';
const validateApiKey = (key) => {
  const cleaned = cleanApiKey(key);
  return cleaned.startsWith('AIza') && cleaned.length > 20;
};
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getTodayDate = () => formatDate(new Date());
const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
};
const getCurrentTimeStr = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

// 获取日期范围
const getMonday = (d) => {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};
const getStartOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// 数据切片：只提取相关日期的数据，避免 token 超限和干扰
const getHistoryContext = (fullHistory, scope) => {
    if (!fullHistory) return "";
    
    const lines = fullHistory.split('\n');
    const today = new Date();
    let startDate = new Date('2000-01-01');
    let endDate = new Date('2099-12-31');

    if (scope === 'today') {
        startDate = new Date(getTodayDate());
        endDate = new Date(getTodayDate() + 'T23:59:59');
    } else if (scope === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        startDate = new Date(formatDate(y));
        endDate = new Date(formatDate(y) + 'T23:59:59');
    } else if (scope === 'weekly') {
        startDate = getMonday(today);
        endDate = today;
    } else if (scope === 'monthly') {
        startDate = getStartOfMonth();
        endDate = today;
    }

    // 简单的文本过滤（如果行包含日期，检查日期；如果不包含，保留作为上下文）
    // 这里为了简化，我们提取所有带日期的行并比较，以及其后的非日期行
    const filteredLines = [];
    let isKeeping = false;
    
    // 正则匹配 YYYY-MM-DD
    const dateRegex = /(\d{4}-\d{1,2}-\d{1,2})/;

    for (let line of lines) {
        const match = line.match(dateRegex);
        if (match) {
            const lineDate = new Date(match[1]);
            // 比较时间戳
            if (lineDate >= startDate && lineDate <= endDate) {
                isKeeping = true;
                filteredLines.push(line);
            } else {
                isKeeping = false;
            }
        } else if (isKeeping) {
            // 如果是跟随在有效日期后的描述行，保留
            filteredLines.push(line);
        }
    }

    // 如果是周/月，如果数据太少，可能需要多给一点点之前的作为对比，但在Prompt里处理对比逻辑更好
    // 这里返回过滤后的文本，限制长度
    return filteredLines.join('\n').slice(0, 50000); 
};

const callGeminiWithRetry = async (model, prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result; 
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

const parseJSONSafely = (text) => {
  try { return JSON.parse(text); } 
  catch (e) {
    try { return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '')); } 
    catch (e2) { throw new Error("无法解析 AI 返回的数据"); }
  }
};

// --- 组件: 配比滑块 (小时制) ---
const AllocationSlider = ({ label, value, onChange, colorClass, icon: Icon }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-20`}>
          <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <span className="font-bold text-slate-700 text-sm">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-mono font-black text-slate-700 block text-lg">{value}h</span>
      </div>
    </div>
    <input 
      type="range" min="0" max="12" step="0.5" value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800"
    />
  </div>
);

// --- 组件: 比较图表 (小时制) ---
const ComparisonBar = ({ label, target, actual, color }) => {
  const diff = actual - target;
  const isPositive = diff >= 0;
  // 计算进度条宽度 (最大基准设为 12小时或更大的 actual)
  const maxScale = Math.max(12, target, actual);
  const targetPercent = (target / maxScale) * 100;
  const actualPercent = (actual / maxScale) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
        <span>{label}</span>
        <span className={isPositive ? 'text-emerald-500' : 'text-rose-500'}>
          {actual}h <span className="text-[10px] opacity-60 text-slate-400">(目标 {target}h)</span>
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 w-1 bg-slate-300 z-10 opacity-50" style={{ left: `${targetPercent}%` }}></div>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`} 
          style={{ width: `${Math.min(actualPercent, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- 主程序 ---
function App() {
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [activePage, setActivePage] = useState('data'); 
  // Loading 状态增加 taskType 和 scope
  const [loading, setLoading] = useState({ state: false, text: '', progress: 0, taskType: '', scope: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Page A: Data & Allocations (Separated Store vs Input)
  const [fullHistory, setFullHistory] = useState(''); // 数据库
  const [tempInput, setTempInput] = useState(''); // 输入框
  const [dataDateRange, setDataDateRange] = useState(null);
  const [allocations, setAllocations] = useState({
    work: 8, study: 2,  
    rest: 2, sleep: 7,  
    life: 2.5, entertainment: 2.5 
  });
  const [isOrganizing, setIsOrganizing] = useState(false);

  // Page B: Review (Cached Results)
  const [reviewScope, setReviewScope] = useState('today');
  const [reviewResults, setReviewResults] = useState({
      today: null,
      yesterday: null,
      weekly: null,
      monthly: null
  });

  // Page C: Status
  const [userState, setUserState] = useState({
    physical: 'normal', 
    mental: 'calm',
  });
  const [bioState, setBioState] = useState({
    wakeTime: '08:00',
    sleepTime: '23:30',
    hadBreakfast: false,
    hadLunch: false,
    hadDinner: false,
    washedMorning: false,
    washedEvening: false
  });
  const [planInput, setPlanInput] = useState('');

  // Page D: Plan
  const [todayPlan, setTodayPlan] = useState(null);

  // Init
  useEffect(() => {
    const savedKey = localStorage.getItem('lifeos_pro_key');
    if (savedKey) setUserApiKey(savedKey);
    
    const savedAllocations = localStorage.getItem('lifeos_pro_allocations_hours'); 
    if (savedAllocations) setAllocations(JSON.parse(savedAllocations));

    const savedHistory = localStorage.getItem('lifeos_pro_history_full'); // Changed key
    if (savedHistory) setFullHistory(savedHistory);
    
    const savedBio = localStorage.getItem('lifeos_pro_bio');
    if (savedBio) setBioState(JSON.parse(savedBio));
  }, []);

  // Auto-save & Date Range Detection
  useEffect(() => {
    localStorage.setItem('lifeos_pro_allocations_hours', JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem('lifeos_pro_history_full', fullHistory);
    // 简单的日期范围提取
    const dates = fullHistory.match(/\d{4}-\d{1,2}-\d{1,2}/g);
    if (dates && dates.length > 0) {
      dates.sort();
      setDataDateRange({ start: dates[0], end: dates[dates.length - 1] });
    } else {
      setDataDateRange(null);
    }
  }, [fullHistory]);

  useEffect(() => {
    localStorage.setItem('lifeos_pro_bio', JSON.stringify(bioState));
  }, [bioState]);

  const showToast = (text, type = 'success') => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const toggleBio = (key) => setBioState(prev => ({ ...prev, [key]: !prev[key] }));

  // --- 进度条模拟 ---
  const simulateProgress = (start, end, duration) => {
    let current = start;
    const step = (end - start) / (duration / 100);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        clearInterval(timer);
        setLoading(prev => ({ ...prev, progress: Math.floor(end) }));
      } else {
        setLoading(prev => ({ ...prev, progress: Math.floor(Math.min(current, 99)) }));
      }
    }, 100);
    return timer;
  };

  // --- Action: 保存数据 ---
  const handleSaveData = () => {
      if (!tempInput.trim()) return showToast('没有新内容需要保存', 'error');
      
      const newData = tempInput;
      // Append to full history
      setFullHistory(prev => (prev ? prev + "\n" + newData : newData));
      setTempInput(''); // Clear input
      showToast('数据已归档，历史库已更新');
  };

  // --- AI: 整理数据源 (整理输入框内容) ---
  const handleOrganizeData = async () => {
    if (!userApiKey) { setShowKeyInput(true); return; }
    if (!tempInput.trim()) return showToast("请输入需要整理的内容", "error");
    
    setIsOrganizing(true);
    try {
      const genAI = new GoogleGenerativeAI(userApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
      const prompt = `
        Task: Organize the user's messy daily logs into a structured format.
        Input: "${tempInput}"
        Output Format: Keep strictly to this format for each entry:
        YYYY-MM-DD: [Time Range] Task Description (Duration)
        
        Example:
        2023-10-01: [09:00-11:00] Coding Feature A (2h)
        2023-10-01: [11:00-12:00] Meeting (1h)
        
        Keep existing data, just format it. If date is missing, infer from context or leave as is.
      `;
      const result = await callGeminiWithRetry(model, prompt);
      const text = result.response.text();
      setTempInput(text);
      showToast("整理完成，请确认后点击自动保存");
    } catch (e) {
      showToast("整理失败", "error");
    } finally {
      setIsOrganizing(false);
    }
  };

  // --- AI 1: 复盘分析 ---
  const generateReview = async (scope = reviewScope) => {
    if (!userApiKey) { setShowKeyInput(true); return; }
    if (!fullHistory.trim()) { showToast('请先在[数据源]页面输入并保存数据', 'error'); setActivePage('data'); return; }

    // Start loading for THIS scope
    setLoading({ state: true, text: '读取历史...', progress: 5, taskType: 'review', scope: scope });
    const timer1 = simulateProgress(5, 45, 1500);

    // Get Filtered Data
    const relevantHistory = getHistoryContext(fullHistory, scope);
    
    // Dates
    const today = new Date();
    const thisMonday = formatDate(getMonday(today));
    const thisMonthFirst = formatDate(getStartOfMonth());
    const lastWeekMondayDate = getMonday(today);
    lastWeekMondayDate.setDate(lastWeekMondayDate.getDate() - 7);
    const lastWeekMonday = formatDate(lastWeekMondayDate);

    try {
      const genAI = new GoogleGenerativeAI(userApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });

      setTimeout(() => {
        clearInterval(timer1);
        setLoading(prev => ({ ...prev, text: '深度分析时间分布...', progress: 45 }));
        simulateProgress(45, 90, 3000);
      }, 1500);

      const prompt = `
        Role: Data Analyst.
        Target Allocation (Hours): ${JSON.stringify(allocations)}
        Review Scope: ${scope.toUpperCase()}
        
        Date Context:
        - Today: ${getTodayDate()}
        - This Week Starts: ${thisMonday}
        - Last Week Starts: ${lastWeekMonday}
        - This Month Starts: ${thisMonthFirst}
        
        Relevant History Data: 
        """${relevantHistory}""" 
        
        Task: Analyze time usage (HOURS) vs Target.
        
        **CRITICAL RULES:**
        1. **Sleep Calculation**: Treat gaps in logs as sleep ONLY if they occur between 01:00 AM and 11:00 AM. Any other missing time is 'Unknown' or 'Life'.
        2. **Weekly Scope**: If scope is 'weekly', analyze data from ${thisMonday} to Today.
        3. **Weekly Comparison**: If scope is 'weekly', ALSO calculate stats for Last Week (${lastWeekMonday} to ${thisMonday}) and provide a comparison in 'insights'.
        4. **Monthly Scope**: From ${thisMonthFirst} to Today.
        
        Output JSON (Chinese):
        {
          "summary": "String",
          "score": 0-100,
          "actual_allocation": { "work": number, "study": number, "rest": number, "sleep": number, "life": number, "entertainment": number },
          "insights": ["String (Comparison with prev period)", "String (Trend)", "String (Advice)"],
          "key_metric": { "label": "String", "value": "String" }
        }
      `;

      const result = await callGeminiWithRetry(model, prompt);
      const data = parseJSONSafely(result.response.text());
      
      setLoading(prev => ({ ...prev, progress: 100, text: '完成' }));
      
      // Update specific scope cache
      setReviewResults(prev => ({
          ...prev,
          [scope]: data
      }));

      showToast(`${scope === 'today' ? '今日' : scope === 'yesterday' ? '昨日' : scope === 'weekly' ? '本周' : '本月'}复盘已更新`);

    } catch (e) {
      console.error(e);
      showToast('分析失败，请检查 API Key 或数据量', 'error');
    } finally {
      setTimeout(() => setLoading({ state: false, text: '', progress: 0, taskType: '', scope: '' }), 500);
    }
  };

  // --- AI 2: 计划生成 ---
  const generatePlan = async () => {
    if (!userApiKey) { setShowKeyInput(true); return; }
    
    setLoading({ state: true, text: '拆解时间...', progress: 10, taskType: 'plan' });
    const timer = simulateProgress(10, 90, 4000);
    setActivePage('plan'); 

    try {
      const genAI = new GoogleGenerativeAI(userApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });

      const prompt = `
        Current Time: ${getCurrentTimeStr()}
        Date: ${getTodayDate()}
        
        User Bio Context:
        - Wake: ${bioState.wakeTime}, Sleep: ${bioState.sleepTime}
        - Status: Meals(B:${bioState.hadBreakfast}, L:${bioState.hadLunch}, D:${bioState.hadDinner}), Wash(M:${bioState.washedMorning}, E:${bioState.washedEvening})
        
        User Special Request: "${planInput}"
        
        Task: Generate schedule from NOW until Sleep Time.
        
        **RULES:**
        1. **Check Meals/Hygiene**: 
           - If hadLunch=false and time > 12:00, INSERT Lunch block. 
           - If hadDinner=false and time > 18:00, INSERT Dinner block.
           - If washedMorning=false, INSERT Morning Routine immediately if early.
           - If washedEvening=false, INSERT Evening Routine before sleep.
        2. **Prep Time**: 'Organize & Prep' block (startup) MUST include 3-5 distinct, micro-actionable bullet points to reduce friction (e.g. 'Fill water bottle', 'Open VS Code'). Max 10 mins.
        3. **Pomodoro (Strict)**: 
           - For Work/Study > 1h: Use Pomodoro 25m/5m cycles. 
           - Every 4th cycle (approx 2h mark), insert a **20m Long Break**.
           - List these cycles in 'pomodoro_cycles'.
        4. **Layout**: Time ranges MUST be explicit.
        5. **Special Request**: If user specifies duration (e.g. "Work 4h"), prioritize that duration.

        Output JSON (Chinese):
        {
          "theme_title": "String",
          "advice": "String",
          "blocks": [
            { 
              "time": "HH:MM - HH:MM", 
              "category": "work|study|rest|sleep|life|entertainment", 
              "title": "String", 
              "desc": "String", 
              "energy_required": "high|medium|low",
              "is_pomodoro": boolean,
              "pomodoro_cycles": [ 
                 { "type": "focus|rest|long_break", "duration": "string", "content": "string" }
              ]
            }
          ]
        }
      `;

      const result = await callGeminiWithRetry(model, prompt);
      const data = parseJSONSafely(result.response.text());
      setTodayPlan(data);
      showToast('今日计划已生成');
    } catch (e) {
      showToast('生成失败', 'error');
      setActivePage('status'); 
    } finally {
      clearInterval(timer);
      setLoading({ state: false, text: '', progress: 0, taskType: '' });
    }
  };

  // --- Renders ---

  const renderDataPage = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2rem] border border-indigo-100">
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-500"/> 理想配比 (24h)
        </h2>
        
        <div className="space-y-3">
          <AllocationSlider label="工作" value={allocations.work} icon={Briefcase} colorClass="bg-indigo-500" onChange={(v)=>setAllocations({...allocations, work: v})} />
          <AllocationSlider label="学习" value={allocations.study} icon={BookOpen} colorClass="bg-blue-500" onChange={(v)=>setAllocations({...allocations, study: v})} />
          <AllocationSlider label="休息" value={allocations.rest} icon={Coffee} colorClass="bg-emerald-500" onChange={(v)=>setAllocations({...allocations, rest: v})} />
          <AllocationSlider label="睡眠" value={allocations.sleep} icon={Moon} colorClass="bg-slate-500" onChange={(v)=>setAllocations({...allocations, sleep: v})} />
          <AllocationSlider label="生活" value={allocations.life} icon={Utensils} colorClass="bg-orange-500" onChange={(v)=>setAllocations({...allocations, life: v})} />
          <AllocationSlider label="娱乐" value={allocations.entertainment} icon={Gamepad2} colorClass="bg-rose-500" onChange={(v)=>setAllocations({...allocations, entertainment: v})} />
          
          <div className="flex justify-between items-center px-2 pt-2 border-t border-slate-200/50 mt-2">
            <span className="text-xs font-bold text-slate-400 uppercase">总计 (需等于24h)</span>
            <span className={`text-lg font-black ${Math.abs(Object.values(allocations).reduce((a,b)=>a+b,0) - 24) > 0.1 ? 'text-rose-500' : 'text-slate-700'}`}>
              {Object.values(allocations).reduce((a,b)=>a+b,0)}h
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <Database className="w-6 h-6 text-slate-400"/> 数据源输入
           </h2>
           <button 
             onClick={handleOrganizeData}
             disabled={isOrganizing}
             className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors"
           >
             {isOrganizing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
             AI 一键整理
           </button>
        </div>
        
        <textarea 
          className="w-full h-48 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-mono text-slate-600 focus:border-indigo-300 outline-none resize-none mb-2"
          placeholder="在此粘贴新增的记录 (例如: 2025-11-28: 工作 4h)..."
          value={tempInput}
          onChange={(e) => setTempInput(e.target.value)}
        />
        
        <div className="flex justify-between items-center mb-4">
           <span className="text-[10px] text-slate-400 font-medium">
              输入新数据并点击保存归档
           </span>
           <button 
             onClick={handleSaveData}
             className="text-xs text-white bg-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-1 hover:bg-slate-700 transition-colors"
           >
             <Save className="w-3 h-3"/> 确认归档
           </button>
        </div>

        {/* Database Status */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
           <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><History className="w-3 h-3"/> 历史库状态</span>
             <span className="text-[10px] text-slate-400">{dataDateRange ? `已存: ${dataDateRange.start} ~ ${dataDateRange.end}` : '空空如也'}</span>
           </div>
           <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-400" style={{width: fullHistory ? '100%' : '0%'}}></div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderReviewPage = () => {
    // Determine loading state for THIS page specifically
    const isThisLoading = loading.state && loading.taskType === 'review' && loading.scope === reviewScope;
    // Get cached result
    const currentResult = reviewResults[reviewScope];

    return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
        {['today', 'yesterday', 'weekly', 'monthly'].map(scope => (
          <button 
            key={scope}
            onClick={() => setReviewScope(scope)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${reviewScope === scope ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {scope === 'today' ? '今日' : scope === 'yesterday' ? '昨日' : scope === 'weekly' ? '本周' : '本月'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px] relative transition-all">
        {isThisLoading ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/95 z-20">
             <div className="w-full max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
               <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{width: `${loading.progress}%`}}></div>
             </div>
             <p className="text-slate-500 font-bold text-sm animate-pulse">{loading.text}</p>
             <p className="text-xs text-slate-300 mt-2">{loading.progress}%</p>
           </div>
        ) : !currentResult ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <PieIcon className="w-16 h-16 text-slate-200 mb-4"/>
            <p className="text-slate-400 font-medium mb-6">暂无<span className="text-indigo-500 font-bold mx-1">{reviewScope === 'today' ? '今日' : reviewScope === 'yesterday' ? '昨日' : reviewScope === 'weekly' ? '本周' : '本月'}</span>报告</p>
            <button 
              onClick={() => generateReview(reviewScope)}
              className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4"/> 立即生成
            </button>
          </div>
        ) : (
          <div className="p-6 animate-in fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-2xl text-slate-800">
                  {currentResult.score} <span className="text-sm font-medium text-slate-400">/ 100</span>
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">执行评分</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="bg-indigo-50 px-4 py-2 rounded-xl text-right">
                    <div className="text-xs text-indigo-400 font-bold mb-1">{currentResult.key_metric?.label || "核心指标"}</div>
                    <div className="text-lg font-black text-indigo-900">{currentResult.key_metric?.value || "-"}</div>
                 </div>
                 {/* Refresh Button */}
                 {(reviewScope === 'weekly' || reviewScope === 'monthly') && (
                     <button onClick={() => generateReview(reviewScope)} className="text-xs font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                         <RefreshCw className="w-3 h-3"/> 刷新数据
                     </button>
                 )}
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              "{currentResult.summary}"
            </p>

            <div className="space-y-2 mb-6">
              <ComparisonBar label="工作" target={allocations.work} actual={currentResult.actual_allocation?.work || 0} color="bg-indigo-500" />
              <ComparisonBar label="学习" target={allocations.study} actual={currentResult.actual_allocation?.study || 0} color="bg-blue-500" />
              <ComparisonBar label="休息" target={allocations.rest} actual={currentResult.actual_allocation?.rest || 0} color="bg-emerald-500" />
              <ComparisonBar label="睡眠" target={allocations.sleep} actual={currentResult.actual_allocation?.sleep || 0} color="bg-slate-500" />
              <ComparisonBar label="生活" target={allocations.life} actual={currentResult.actual_allocation?.life || 0} color="bg-orange-500" />
              <ComparisonBar label="娱乐" target={allocations.entertainment} actual={currentResult.actual_allocation?.entertainment || 0} color="bg-rose-500" />
            </div>
            
            {currentResult.insights && (
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                 {currentResult.insights.map((insight, idx) => (
                   <div key={idx} className="flex gap-2 text-xs text-slate-600">
                     <span className="text-indigo-400 mt-0.5">•</span>
                     {insight}
                   </div>
                 ))}
              </div>
            )}

            {(reviewScope === 'today' || reviewScope === 'yesterday') && (
                 <button onClick={() => generateReview(reviewScope)} className="w-full mt-6 py-2 text-xs font-bold text-slate-300 hover:text-slate-500 flex justify-center gap-1 items-center">
                    <RotateCcw className="w-3 h-3"/> 重新生成
                 </button>
            )}
          </div>
        )}
      </div>
    </div>
    );
  };

  const renderStatusPage = () => {
    const physicalOptions = [
      { id: 'energetic', label: '精力充沛', icon: '⚡️', color: 'bg-amber-500 border-amber-500 text-white' },
      { id: 'normal', label: '状态平稳', icon: '🙂', color: 'bg-indigo-500 border-indigo-500 text-white' },
      { id: 'tired', label: '有些疲惫', icon: '🥱', color: 'bg-slate-500 border-slate-500 text-white' },
      { id: 'pain', label: '身体不适', icon: '🤕', color: 'bg-rose-500 border-rose-500 text-white' }
    ];

    const mentalOptions = [
      { id: 'focus', label: '极度专注', icon: '🧠', color: 'bg-emerald-500 border-emerald-500 text-white' },
      { id: 'calm', label: '内心平静', icon: '🌊', color: 'bg-cyan-500 border-cyan-500 text-white' },
      { id: 'anxious', label: '焦虑紧张', icon: '🔥', color: 'bg-orange-500 border-orange-500 text-white' },
      { id: 'scattered', label: '注意力涣散', icon: '😶‍🌫️', color: 'bg-purple-500 border-purple-500 text-white' }
    ];

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-24">
        {/* Bio Settings */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500"/> 作息设定</h3>
           <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase block mb-2">起床时间</label>
               <div className="relative">
                 <Sun className="w-4 h-4 absolute left-3 top-3 text-amber-400"/>
                 <input type="time" value={bioState.wakeTime} onChange={(e)=>setBioState({...bioState, wakeTime: e.target.value})} className="w-full bg-slate-50 p-2.5 pl-10 rounded-xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-indigo-400"/>
               </div>
             </div>
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase block mb-2">预计入睡</label>
               <div className="relative">
                 <MoonStar className="w-4 h-4 absolute left-3 top-3 text-slate-400"/>
                 <input type="time" value={bioState.sleepTime} onChange={(e)=>setBioState({...bioState, sleepTime: e.target.value})} className="w-full bg-slate-50 p-2.5 pl-10 rounded-xl font-bold text-slate-700 outline-none border border-slate-200 focus:border-indigo-400"/>
               </div>
             </div>
           </div>
           
           <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
             <span>💡 凌晨睡觉会自动识别为次日</span>
           </div>
        </div>

        {/* Bio Checklist */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-emerald-500"/> 生理打卡</h3>
           <div className="grid grid-cols-3 gap-2 mb-4">
             <button onClick={()=>toggleBio('hadBreakfast')} className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${bioState.hadBreakfast ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Coffee className="w-4 h-4"/> 早餐
             </button>
             <button onClick={()=>toggleBio('hadLunch')} className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${bioState.hadLunch ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <UtensilsCrossed className="w-4 h-4"/> 午餐
             </button>
             <button onClick={()=>toggleBio('hadDinner')} className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${bioState.hadDinner ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Utensils className="w-4 h-4"/> 晚餐
             </button>
           </div>
           <div className="grid grid-cols-2 gap-2">
             <button onClick={()=>toggleBio('washedMorning')} className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${bioState.washedMorning ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Bath className="w-4 h-4"/> 晨间洗漱
             </button>
             <button onClick={()=>toggleBio('washedEvening')} className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${bioState.washedEvening ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Bath className="w-4 h-4"/> 晚间洗漱
             </button>
           </div>
        </div>

        {/* State Selectors */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> 能量状态</h3>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-4 gap-2">
               {physicalOptions.map(opt => (
                 <button key={opt.id} onClick={()=>setUserState({...userState, physical:opt.id})} className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${userState.physical === opt.id ? opt.color : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                   <div className="text-xl">{opt.icon}</div>
                   <div className="text-[10px] font-bold">{opt.label}</div>
                 </button>
               ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
               {mentalOptions.map(opt => (
                 <button key={opt.id} onClick={()=>setUserState({...userState, mental:opt.id})} className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${userState.mental === opt.id ? opt.color : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
                   <div className="text-xl">{opt.icon}</div>
                   <div className="text-[10px] font-bold">{opt.label}</div>
                 </button>
               ))}
            </div>
          </div>

          <div className="mb-6">
             <label className="text-xs font-bold text-slate-400 uppercase block mb-2">今日特别事项 (必填时间)</label>
             <div className="relative">
                <MessageSquarePlus className="w-4 h-4 text-slate-500 absolute left-3 top-3.5"/>
                <textarea 
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  placeholder="例：写代码4小时，晚上8点去看电影..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pl-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500 h-24 resize-none"
                />
             </div>
          </div>

          <button onClick={generatePlan} className="w-full bg-white text-slate-900 py-4 rounded-xl font-black flex justify-center items-center gap-2 hover:bg-slate-100 transition-colors">
            生成今日计划 <ArrowRight className="w-5 h-5"/>
          </button>
        </div>
      </div>
    );
  };

  const renderPlanPage = () => {
    // Check loading task type
    if (loading.state && loading.taskType === 'plan') {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in">
          <div className="relative w-24 h-24">
             <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center font-black text-slate-800 text-xl">{loading.progress}%</div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-700 font-bold text-lg">{loading.text}</p>
            <p className="text-slate-400 text-sm">正在智能重构时间...</p>
          </div>
        </div>
      );
    }

    if (!todayPlan) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
          <div className="bg-slate-100 p-6 rounded-full"><Layout className="w-12 h-12 text-slate-400"/></div>
          <p className="text-slate-400 max-w-xs">请先在 [状态] 页面完成打卡，AI 将为您定制今日计划。</p>
          <button onClick={() => setActivePage('status')} className="text-indigo-500 font-bold">去打卡</button>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Footprints className="w-32 h-32"/></div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">{todayPlan.theme_title}</h2>
          <p className="text-slate-500 font-medium italic">"{todayPlan.advice}"</p>
        </div>

        <div className="space-y-4">
          {todayPlan.blocks?.map((block, idx) => {
            const getBorderColor = (cat) => {
               if(cat === 'work') return 'border-l-indigo-500';
               if(cat === 'study') return 'border-l-blue-500';
               if(cat === 'rest') return 'border-l-emerald-500';
               if(cat === 'sleep') return 'border-l-slate-500';
               if(cat === 'life') return 'border-l-orange-500';
               return 'border-l-rose-500';
            };
            
            return (
              <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 ${getBorderColor(block.category)}`}>
                <div className="mb-3 border-b border-slate-50 pb-2">
                    <span className="text-lg font-black text-slate-700 font-mono tracking-tight">{block.time}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-slate-500">{block.category}</span>
                    {block.energy_required === 'high' && <span className="text-xs text-rose-400 flex items-center gap-0.5"><Zap className="w-3 h-3"/> 高能耗</span>}
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{block.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{block.desc}</p>
                </div>

                {block.is_pomodoro && block.pomodoro_cycles && (
                   <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                        <Timer className="w-3 h-3"/> 番茄钟执行流
                      </div>
                      {block.pomodoro_cycles.map((cycle, cIdx) => (
                        <div key={cIdx} className="flex gap-3 text-sm items-start relative">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cycle.type === 'focus' ? 'bg-indigo-400' : cycle.type === 'long_break' ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
                          <div className="flex-1">
                            <span className={`font-bold ${cycle.type === 'focus' ? 'text-slate-700' : 'text-slate-500'}`}>
                                 {cycle.type === 'focus' ? '专注' : cycle.type === 'long_break' ? '长休' : '短休'} ({cycle.duration})
                            </span>
                            <div className={`text-xs mt-0.5 ${cycle.type === 'focus' ? 'text-slate-400' : 'text-emerald-600 font-medium'}`}>{cycle.content}</div>
                          </div>
                        </div>
                      ))}
                   </div>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={() => { setTodayPlan(null); setActivePage('status'); }} className="w-full py-4 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-slate-600">
          <RefreshCcw className="w-4 h-4"/> 重新生成
        </button>
      </div>
    );
  };

  const navBtnClass = (page) => `flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activePage === page ? 'bg-indigo-500 text-white shadow-lg transform -translate-y-2' : 'text-slate-400 hover:bg-slate-800'}`;

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-slate-800 selection:bg-indigo-100">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg"><BrainCircuit className="w-5 h-5"/></div>
          <span className="font-black text-lg tracking-tight">LifeOS <span className="text-indigo-500">Pro</span></span>
        </div>
        <button onClick={() => setShowKeyInput(true)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><Settings className="w-5 h-5"/></button>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-md mx-auto">
        {activePage === 'data' && renderDataPage()}
        {activePage === 'review' && renderReviewPage()}
        {activePage === 'status' && renderStatusPage()}
        {activePage === 'plan' && renderPlanPage()}
      </main>

      {/* Bottom Nav (4 Tabs) */}
      <nav className="fixed bottom-6 inset-x-6 max-w-md mx-auto bg-slate-900 text-slate-400 rounded-[2rem] p-2 shadow-2xl shadow-slate-300 z-50 flex justify-between items-center text-[10px] font-bold">
        <button onClick={() => setActivePage('data')} className={navBtnClass('data')}>
          <Database className="w-5 h-5"/> 数据源
        </button>
        <button onClick={() => setActivePage('review')} className={navBtnClass('review')}>
          {/* 动态显示 Loading 状态 */}
          {loading.state && loading.taskType === 'review' ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400"/> : <PieIcon className="w-5 h-5"/>}
          复盘
        </button>
        <button onClick={() => setActivePage('status')} className={navBtnClass('status')}>
          <UserCheck className="w-5 h-5"/> 状态
        </button>
        <button onClick={() => setActivePage('plan')} className={navBtnClass('plan')}>
          {loading.state && loading.taskType === 'plan' ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400"/> : <CalendarDays className="w-5 h-5"/>}
          计划
        </button>
      </nav>

      {/* API Key Modal & Toast */}
      {showKeyInput && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm p-6 rounded-[2rem] shadow-2xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-500"/> 设置 API Key</h3>
            <input type="password" value={userApiKey} onChange={(e) => setUserApiKey(cleanApiKey(e.target.value))} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 outline-none focus:border-indigo-500 font-mono text-sm" placeholder="输入 Gemini Key (AIza...)"/>
            <div className="flex gap-2">
               <button onClick={() => { localStorage.removeItem('lifeos_pro_key'); setUserApiKey(''); }} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-500">清除</button>
               <button onClick={() => { if(validateApiKey(userApiKey)) { localStorage.setItem('lifeos_pro_key', userApiKey); setShowKeyInput(false); showToast('Key 已保存'); } else { showToast('Key 格式无效', 'error'); } }} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold">保存</button>
            </div>
            <button onClick={() => setShowKeyInput(false)} className="w-full mt-4 text-xs text-slate-400">关闭</button>
          </div>
        </div>
      )}
      {msg.text && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-xl z-[70] animate-in slide-in-from-top-4 ${msg.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>{msg.text}</div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}