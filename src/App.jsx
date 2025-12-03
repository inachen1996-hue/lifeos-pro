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
  Hourglass, Bath, UtensilsCrossed
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
const cleanApiKey = (key) => {
  if (!key) return '';
  return key.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '');
};

const validateApiKey = (key) => {
  const cleaned = cleanApiKey(key);
  return cleaned.startsWith('AIza') && cleaned.length > 20;
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
};

const getTodayDate = () => formatDate(new Date());

const getCurrentTimeStr = () => {
  const now = new Date();
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// 计算清醒时长逻辑 (解决跨天问题)
const calculateAwakeInfo = (wakeStr, sleepStr) => {
  if (!wakeStr || !sleepStr) return { durationText: '', isNextDay: false, totalMinutes: 0 };

  const [wakeH, wakeM] = wakeStr.split(':').map(Number);
  const [sleepH, sleepM] = sleepStr.split(':').map(Number);
  
  let wakeMinutes = wakeH * 60 + wakeM;
  let sleepMinutes = sleepH * 60 + sleepM;
  let isNextDay = false;

  if (sleepMinutes < wakeMinutes) {
    sleepMinutes += 24 * 60;
    isNextDay = true;
  }

  const diff = sleepMinutes - wakeMinutes;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  return {
    durationText: `${hours}小时${mins > 0 ? ` ${mins}分` : ''}`,
    isNextDay,
    totalMinutes: diff,
    debugStr: `Wake: ${wakeStr}, Sleep: ${sleepStr} (${isNextDay ? 'Next Day' : 'Same Day'})`
  };
};

const callGeminiWithRetry = async (model, prompt, retries = 3, initialDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result; 
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
        throw new Error("API Key 无效或无权限 (403)。请检查 Key 是否正确。");
      }
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
    }
  }
};

const parseJSONSafely = (text) => {
  try { return JSON.parse(text); } 
  catch (e) {
    try { return JSON.parse(text.replace(/,(\s*[}\]])/g, '$1').replace(/'/g, '"')); } 
    catch (e2) { throw new Error("无法解析 AI 返回的数据"); }
  }
};

const sanitizeData = (data) => {
  const safeData = { 
    daily_reviews: [], 
    today_plan: { 
      date: '', 
      smart_advice: '', 
      full_advice: '',  
      has_conflict: false,
      blocks: [],          
      full_blocks: []      
    },
    weekly_review: null, 
    monthly_review: null 
  };
  if (!data) return safeData;
  if (Array.isArray(data.daily_reviews)) {
    safeData.daily_reviews = data.daily_reviews.map(item => ({
      type: item.type || 'unknown',
      date: item.date || '未知日期',
      analysis: item.analysis || '无分析内容',
      today_completed_analysis: item.today_completed_analysis || '暂无今日完成记录',
      stats: Array.isArray(item.stats) ? item.stats : []
    }));
  }
  if (data.today_plan && typeof data.today_plan === 'object') {
    safeData.today_plan = {
      date: data.today_plan.date || '今日',
      smart_advice: data.today_plan.smart_advice || data.today_plan.overall_advice || '',
      full_advice: data.today_plan.full_advice || data.today_plan.overall_advice || '',
      has_conflict: !!data.today_plan.has_conflict,
      blocks: Array.isArray(data.today_plan.blocks) ? data.today_plan.blocks : [],
      full_blocks: Array.isArray(data.today_plan.full_blocks) ? data.today_plan.full_blocks : []
    };
  }
  return safeData;
};

// --- 组件 ---
const SimplePieChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return <div className="text-center text-slate-300 py-12">暂无时间分布数据</div>;
  const colors = ['#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#F87171'];
  
  let maxPercent = -1;
  let maxIndex = -1;
  data.forEach((item, idx) => {
    const p = parseFloat(item.percentage) || 0;
    if (p > maxPercent) { maxPercent = p; maxIndex = idx; }
  });

  let cumulativePercent = 0;
  const totalPercentage = data.reduce((acc, item) => acc + (parseFloat(item.percentage) || 0), 0);

  const slices = data.map((slice, index) => {
    const rawPercentage = parseFloat(slice.percentage) || 0;
    if (rawPercentage <= 0) return null;
    const normalizedPercent = totalPercentage > 0 ? (rawPercentage / totalPercentage) : 0;
    
    const startAngle = 2 * Math.PI * cumulativePercent;
    const endAngle = 2 * Math.PI * (cumulativePercent + normalizedPercent);
    
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    
    const largeArcFlag = normalizedPercent > 0.5 ? 1 : 0;
    
    let textElement = null;
    if (index === maxIndex && normalizedPercent > 0.1) { 
       const midAngle = startAngle + (endAngle - startAngle) / 2;
       const textX = Math.cos(midAngle) * 0.6; 
       const textY = Math.sin(midAngle) * 0.6;
       textElement = (
         <text 
           x={textX} 
           y={textY} 
           fill="white" 
           fontSize="0.2" 
           fontWeight="bold" 
           textAnchor="middle" 
           dominantBaseline="middle"
           style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
           transform={`rotate(90 ${textX} ${textY})`}
         >
           {slice.category}
         </text>
       );
    }

    cumulativePercent += normalizedPercent;

    if (normalizedPercent >= 0.999) return <circle key={index} cx="0" cy="0" r="1" fill={colors[index % colors.length]} />;

    const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
    
    return (
      <g key={index}>
        <path d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="0.02"/>
        {textElement}
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-40 h-40 relative">
        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90 drop-shadow-md">{slices}</svg>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
        {data.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: colors[idx % colors.length]}}></div>
              <span className="text-slate-600 truncate max-w-[80px]" title={item.category}>{item.category}</span>
            </div>
            <span className="font-mono text-slate-400 font-bold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const getBlockStyle = (type) => {
  switch (type) {
    case 'focus': return 'bg-[#E0F7FA]/90 border-[#B2EBF2] text-cyan-900';
    case 'transition': return 'bg-indigo-50 border-indigo-200 text-indigo-900 border-dashed'; 
    case 'rest': return 'bg-[#E8F5E9]/90 border-[#C8E6C9] text-emerald-900';
    case 'meal': return 'bg-amber-50 border-amber-200 text-amber-900'; 
    case 'recovery': return 'bg-[#FCE4EC]/90 border-[#F8BBD0] text-pink-900';
    default: return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

const getBlockIcon = (type) => {
  switch (type) {
    case 'focus': return <Briefcase className="w-4 h-4"/>;
    case 'transition': return <Zap className="w-4 h-4"/>;
    case 'rest': return <Coffee className="w-4 h-4"/>;
    case 'meal': return <Utensils className="w-4 h-4"/>;
    case 'recovery': return <Heart className="w-4 h-4"/>;
    case 'routine': return <Droplets className="w-4 h-4"/>;
    default: return <Activity className="w-4 h-4"/>;
  }
};

// --- App ---
function App() {
  const [dataInput, setDataInput] = useState('');
  const [userApiKey, setUserApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('input'); 
  const [step, setStep] = useState(1);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [reviewScope, setReviewScope] = useState('daily'); 
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const [loadingText, setLoadingText] = useState("准备中..."); 
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isSuggestingMode, setIsSuggestingMode] = useState(false); 
  const [modeSuggestion, setModeSuggestion] = useState(null); 
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false); 
  
  // Review Update State
  const [updateReviewInput, setUpdateReviewInput] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [showUpdateReviewModal, setShowUpdateReviewModal] = useState(false);
  const [targetReviewDate, setTargetReviewDate] = useState(null);

  const [workloadMode, setWorkloadMode] = useState('medium'); 
  const [planVersion, setPlanVersion] = useState('smart'); 

  // 默认任务 & 用户状态 (新增：洗漱/吃饭 状态)
  const [userContext, setUserContext] = useState({
    currentActivity: '',
    physicalState: [], 
    mentalState: [], 
    wakeTime: '11:00', 
    sleepTime: '02:00', 
    hasWashed: false, // 已洗漱
    hasLunch: false,  // 已午饭
    hasDinner: false, // 已晚饭
    tasks: [{ id: Date.now(), name: '', durationHour: 0, durationMin: 30, workflowId: '' }],
    pomodoroSettings: [{ id: 1, name: '通用专注', work: 25, rest: 5 }]
  });

  // 计算清醒时间展示
  const awakeInfo = React.useMemo(() => 
    calculateAwakeInfo(userContext.wakeTime, userContext.sleepTime), 
  [userContext.wakeTime, userContext.sleepTime]);

  const textareaRef = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const physicalOptions = ["⚡️ 充沛", "🙂 正常", "🥱 疲惫", "💥 腰痛", "🤕 头痛", "🤢 腹痛"];
  const mentalOptions = ["🧠 专注", "🌊 平静", "😐 一般", "🔥 焦虑", "🕳️ 空虚", "😶‍🌫️ 涣散"];
  const workloadOptions = [
    { id: 'rest', label: '彻底躺平', icon: <Battery className="w-5 h-5"/>, desc: '最低负荷，修复能量', color: 'bg-stone-100 text-stone-600 border-stone-200' },
    { id: 'light', label: '轻松过渡', icon: <BatteryCharging className="w-5 h-5"/>, desc: '只做最重要的事', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'medium', label: '保持节奏', icon: <BatteryFull className="w-5 h-5"/>, desc: '稳步推进日常任务', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'heavy', label: '深度冲刺', icon: <BatteryWarning className="w-5 h-5"/>, desc: '高强度专注模式', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  ];

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_lifeos_key');
    if (savedKey) setUserApiKey(savedKey); else setShowKeyInput(true);
    const savedHistory = localStorage.getItem('gemini_lifeos_history');
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch(e) {}
  }, []);

  useEffect(() => {
    if (history.length > 0) localStorage.setItem('gemini_lifeos_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (activeTab === 'review' && history.length > 0 && !analysisResult?.weekly_review && !isAutoGenerating && userApiKey) {
      const timer = setTimeout(() => {
        handleAutoPeriodReview(userApiKey, history);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, history, userApiKey]);

  const showMessage = (text, type = 'error') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  const updateTask = (id, field, value) => {
    setUserContext(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const toggleBioState = (field) => {
    setUserContext(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const saveToHistory = (result, inputData) => {
    if (!result) return history; 
    const newEntries = [];
    let isUpdate = false;
    
    if (result.daily_reviews && Array.isArray(result.daily_reviews)) {
      result.daily_reviews.forEach(review => {
        const isPlanDate = review.date === result.today_plan?.date;
        const entry = {
          id: Date.now() + Math.random(),
          date: review.date,
          timestamp: new Date().toISOString(),
          rawInput: inputData,
          result: {
            daily_reviews: [review],
            today_plan: isPlanDate ? result.today_plan : {
              date: review.date,
              smart_advice: review.analysis.slice(0, 50) + "...", 
              full_advice: review.analysis.slice(0, 50) + "...",
              blocks: []
            }
          },
          context: userContext
        };
        newEntries.push(entry);
      });
    }
    
    if (newEntries.length === 0 && result.today_plan) {
      newEntries.push({
        id: Date.now(),
        date: result.today_plan.date,
        timestamp: new Date().toISOString(),
        rawInput: inputData,
        result: result,
        context: userContext
      });
    }

    let updatedHistory = [];
    setHistory(prev => {
      const incomingDates = new Set(newEntries.map(e => e.date));
      if (prev.some(item => incomingDates.has(item.date))) isUpdate = true;
      const filtered = prev.filter(item => !incomingDates.has(item.date));
      updatedHistory = [...newEntries, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      return updatedHistory;
    });
    
    if (newEntries.length > 0) {
       showMessage(isUpdate ? "已更新历史日期的记录" : "已归档新的一天", "success");
    }

    return updatedHistory.length > 0 ? updatedHistory : history;
  };

  const loadFromHistory = (entry) => {
    setDataInput(entry.rawInput);
    setAnalysisResult(entry.result);
    setUserContext(entry.context || userContext);
    setActiveTab('plan'); 
    setShowHistoryModal(false);
    showMessage(`已加载 ${entry.date} 的数据`, "success");
  };

  const deleteFromHistory = (e, id) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  // --- AI: 补充更新复盘 ---
  const handleUpdateReviewAnalysis = async () => {
    if (!updateReviewInput.trim() || !userApiKey) return showMessage("请输入内容", "error");
    setIsUpdatingReview(true);
    try {
      const genAI = new GoogleGenerativeAI(userApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
      
      const prompt = `
        Context: User is updating/creating a daily log for: ${targetReviewDate}.
        Input Data (Tasks/Calendar): "${updateReviewInput}"
        
        Task: 
        1. Analyze this input.
        2. Generate 'analysis': summary of completed tasks (in Chinese).
        3. Generate 'stats': Time distribution percentage.
        **IMPORTANT**: Use standard Chinese categories for 'stats' -> category (e.g. "工作/学习", "休息", "睡眠", "娱乐").
        
        Return JSON (Chinese): 
        { 
          "analysis": "string",
          "stats": [{"category": "string (Chinese)", "percentage": number}]
        }
      `;
      
      const result = await callGeminiWithRetry(model, prompt);
      const data = parseJSONSafely(result.response.text());
      
      const existingEntryIndex = history.findIndex(h => h.date === targetReviewDate);
      let newHistory;
      
      if (existingEntryIndex !== -1) {
        newHistory = history.map((entry, index) => {
          if (index === existingEntryIndex) {
             const updatedReviews = entry.result.daily_reviews.map(r => ({
               ...r,
               today_completed_analysis: data.analysis,
               stats: data.stats || r.stats 
             }));
             if (!updatedReviews.length) {
                updatedReviews.push({
                  date: targetReviewDate,
                  type: 'today',
                  today_completed_analysis: data.analysis,
                  analysis: data.analysis, 
                  stats: data.stats
                });
             }
             return { ...entry, result: { ...entry.result, daily_reviews: updatedReviews } };
          }
          return entry;
        });
      } else {
        const newEntry = {
          id: Date.now(),
          date: targetReviewDate,
          timestamp: new Date().toISOString(),
          rawInput: updateReviewInput,
          result: {
            daily_reviews: [{
              date: targetReviewDate,
              type: 'today',
              analysis: data.analysis,
              today_completed_analysis: data.analysis,
              stats: data.stats
            }],
            today_plan: { date: targetReviewDate, overall_advice: '手动补充记录', blocks: [] }
          },
          context: userContext
        };
        newHistory = [newEntry, ...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      setHistory(newHistory);
      
      if (analysisResult?.daily_reviews) {
        const updatedCurrentReviews = analysisResult.daily_reviews.map(r => {
          if (r.date === targetReviewDate) {
            return { ...r, today_completed_analysis: data.analysis, stats: data.stats || r.stats };
          }
          return r;
        });
        if (existingEntryIndex === -1) {
           const entry = newHistory.find(h => h.date === targetReviewDate);
           if(entry) setAnalysisResult(entry.result);
        } else {
           setAnalysisResult(prev => ({ ...prev, daily_reviews: updatedCurrentReviews }));
        }
      } else if (existingEntryIndex === -1) {
         const entry = newHistory.find(h => h.date === targetReviewDate);
         if(entry) setAnalysisResult(entry.result);
      }

      setShowUpdateReviewModal(false);
      setUpdateReviewInput('');
      showMessage("记录已保存", "success");

    } catch (e) {
      console.error(e);
      showMessage("保存失败", "error");
    } finally {
      setIsUpdatingReview(false);
    }
  };

  // --- AI: 模式建议 ---
  const handleGenerateModeSuggestion = async () => {
    if (!userApiKey || !validateApiKey(userApiKey)) { setShowKeyInput(true); return showMessage("请检查 API Key", "error"); }
    setIsSuggestingMode(true);
    try {
      const genAI = new GoogleGenerativeAI(userApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
      const prompt = `
        Current Time: ${getCurrentTimeStr()}
        Wake Time: ${userContext.wakeTime}, Sleep Time: ${userContext.sleepTime}
        Input Data: "${dataInput.substring(0,300)}..."
        Status: Body[${userContext.physicalState}], Mind[${userContext.mentalState}].
        
        Objective: Recommend a daily workload mode.
        Rules:
        - If current time is very late or status is exhausted -> 'rest'.
        - If energetic -> 'heavy' or 'medium'.
        
        Return JSON: {"recommendedMode": "rest|light|medium|heavy", "reason": "string (Chinese)"}
      `;
      const result = await callGeminiWithRetry(model, prompt);
      const suggestion = parseJSONSafely(result.response.text());
      setModeSuggestion(suggestion);
      
      if (['rest', 'light', 'medium', 'heavy'].includes(suggestion.recommendedMode)) {
        setWorkloadMode(suggestion.recommendedMode);
      }
      setStep(3); 
    } catch (e) { showMessage("建议生成失败", "error"); setStep(3); } finally { setIsSuggestingMode(false); }
  };

  // --- AI: 核心分析 ---
  const handleAnalyze = async () => {
    if (!dataInput.trim() || !userApiKey) return showMessage("请完善输入", "error");
    setIsAnalyzing(true);
    setLoadingProgress(5);
    setLoadingText("连接大脑...");

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return prev; 
        if (prev < 30) return prev + 2; 
        if (prev < 70) return prev + 1; 
        return prev + 0.2; 
      });
      
      setLoadingText(prevText => {
         const currentP = loadingProgress; 
         if (currentP < 20) return "读取历史记录...";
         if (currentP < 50) return "分析能量状态...";
         if (currentP < 80) return "生成最优路径...";
         return "正在打磨细节...";
      });

    }, 200);

    try {
      const genAI = new GoogleGenerativeAI(userApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
      
      const recentHistory = history.slice(0, 7);
      let memoryContext = "";
      if (recentHistory.length > 0) {
        memoryContext = recentHistory.map(h => {
          const r = h.result.daily_reviews?.[0];
          return r ? `[Date: ${h.date}] Completed: ${r.today_completed_analysis.substring(0,150)}... Stats: ${JSON.stringify(r.stats)}` : "";
        }).join("\n");
      }

      const taskDetails = userContext.tasks.map(t => 
        `- ${t.name} (User est: ${t.durationHour}h ${t.durationMin}m)`
      ).join('\n');

      const currentTime = getCurrentTimeStr();

      // Inject Awake Info and Bio Flags
      const awakeInfoStr = `Wake: ${userContext.wakeTime}, Sleep: ${userContext.sleepTime}. Total Awake Window: ${awakeInfo.durationText}. IsNextDaySleep: ${awakeInfo.isNextDay}`;
      const bioStatusStr = `Already Washed: ${userContext.hasWashed}, Already Lunch: ${userContext.hasLunch}, Already Dinner: ${userContext.hasDinner}`;

      const prompt = `
        Current Time: ${currentTime}, Today: ${getTodayDate()}
        
        **DATABASE MEMORY (Recent Context)**: 
        ${memoryContext || "No recent history."}
        
        **NEW USER INPUT (Current Input Box)**: "${dataInput}"
        
        User Settings: 
          - ${awakeInfoStr}
          - ${bioStatusStr}
          - Mode: ${workloadMode.toUpperCase()}
          - Status: Body[${userContext.physicalState}], Mind[${userContext.mentalState}]
        Tasks: ${taskDetails}

        **TASK: GENERATE PLAN (Smart vs Full) & UPDATE REVIEWS**
        
        **1. MEMORY & UPDATE LOGIC**:
        - If "New User Input" has data for previous days, generate 'daily_reviews' for them.
        
        **2. MANDATORY RULES FOR PLAN**:
        - **Pomodoro**: ALL 'focus' (Work/Study) blocks **MUST** have 'sub_schedule' (25m work/5m rest cycles).
        - **Cold Start**: If switching from Rest/Routine to Focus, **INSERT** a 5-10m 'transition' block.
        - **Continuity**: Group identical tasks. Do NOT interleave.
        - **Hygiene**: Insert "Wash/Brush" (15-20mins) TWICE. **EXCEPTION**: If 'Already Washed' is true, do NOT schedule the first one.
        - **Meals**: Schedule Lunch (~12:00) and Dinner (~18:00). **EXCEPTION**: If 'Already Lunch' is true, do NOT schedule lunch. If 'Already Dinner' is true, do NOT schedule dinner.
        - **Long Break**: AFTER 3 consecutive focus blocks (~90mins), INSERT 15-20min "Long Break".
        - **Conflict**: If SleepTime > 00:00 (12am) AND not explicitly a night owl schedule (handled by awake duration), trigger conflict.

        **3. VERSION A: 'smart_advice' & 'blocks' (Healthy)**:
        - **HARD RULE**: End by UserSleepTime. If tasks don't fit, DROP them.
        
        **4. VERSION B: 'full_advice' & 'full_blocks' (User)**:
        - **HARD RULE**: INCLUDE ALL TASKS. Extend time past sleep time if needed.

        **5. DAILY REVIEW GENERATION**: 
           - Generate 'daily_reviews' item for **EACH** date found in input.
           - **Stats**: Use CHINESE categories (e.g., "工作/学习", "睡眠").
           - 'today_completed_analysis': Summarize accomplishments + Evaluate time distribution.

        Return JSON (Chinese):
        {
          "daily_reviews": [{ "type": "past|today", "date": "YYYY-MM-DD", "stats": [{"category": "string (Chinese)", "percentage": number}], "analysis": "string", "today_completed_analysis": "string" }],
          "today_plan": { 
            "date": "${getTodayDate()}", 
            "smart_advice": "...", "full_advice": "...", "has_conflict": boolean,
            "blocks": [{ "time": "range", "type": "focus|rest|routine|transition|meal", "activity": "string", "desc": "string", "tips": "string", "sub_schedule": [{"time":"range", "label":"string"}] }],
            "full_blocks": [{ "time": "range", "type": "focus|rest|routine|transition|meal", "activity": "string", "desc": "string", "tips": "string", "sub_schedule": [{"time":"range", "label":"string"}] }]
          }
        }
      `;

      const result = await callGeminiWithRetry(model, prompt);
      const parsed = parseJSONSafely(result.response.text());
      const safeData = sanitizeData(parsed);
      
      if (!safeData.today_plan.blocks) safeData.today_plan.blocks = [];
      if (!safeData.today_plan.full_blocks) safeData.today_plan.full_blocks = [];

      setAnalysisResult(safeData);
      setPlanVersion('smart'); 
      setActiveTab('plan'); 
      
      const updatedHistory = saveToHistory(safeData, dataInput);
      handleAutoPeriodReview(userApiKey, updatedHistory); 
      setLoadingProgress(100);
      setLoadingText("完成！");

    } catch (e) { 
      showMessage(`分析失败: ${e.message}`, "error"); 
    } finally { 
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoadingProgress(0);
        setLoadingText("准备中...");
      }, 500); 
      setIsAnalyzing(false); 
    }
  };

  // --- AI: 周期复盘 ---
  const handleAutoPeriodReview = async (apiKey, historyData) => {
    setIsAutoGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
      
      let analysisData = historyData;
      if (!analysisData) {
         const str = localStorage.getItem('gemini_lifeos_history');
         analysisData = str ? JSON.parse(str) : [];
      }

      if (!analysisData || analysisData.length === 0) {
        setIsAutoGenerating(false);
        return;
      }

      const thisWeek = analysisData.slice(0, 7).map(h=>({d:h.date, a:h.result?.daily_reviews?.[0]?.analysis}));
      const lastWeek = analysisData.slice(7, 14).map(h=>({d:h.date, a:h.result?.daily_reviews?.[0]?.analysis}));

      const prompt = `
        Current Data: ${JSON.stringify(thisWeek)}
        Previous Data: ${JSON.stringify(lastWeek)}
        
        Generate Weekly/Monthly Review (Chinese).
        **METRIC REQUIREMENT**: Extract/Estimate hours for 'Work' and 'Play' for both periods.
        Return JSON:
        {
          "weekly_review": {
            "summary": "string", "highlights": ["str"], "improvements": ["str"], "stats": [{"category": "str", "percentage": num}],
            "comparison": {
               "work": { "prev": "string (e.g. 10h)", "curr": "string (e.g. 12h)", "diff": "string (e.g. +20%)" },
               "play": { "prev": "string", "curr": "string", "diff": "string" },
               "analysis": "string (Detailed explanation of why work/play hours changed)"
            }
          },
          "monthly_review": { ...same structure, specifically for month... }
        }
      `;

      const result = await callGeminiWithRetry(model, prompt);
      const periodData = parseJSONSafely(result.response.text());
      
      setAnalysisResult(prev => {
        if (!prev) return { 
           daily_reviews: [], 
           today_plan: null, 
           weekly_review: periodData.weekly_review, 
           monthly_review: periodData.monthly_review 
        };
        return { 
          ...prev, 
          weekly_review: periodData.weekly_review, 
          monthly_review: periodData.monthly_review 
        };
      });
    } catch (e) { console.error("Review gen failed", e); } finally { setIsAutoGenerating(false); }
  };

  // --- UI Components ---
  const ComparisonCard = ({ title, data }) => {
    if (!data) return null;
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-500"/> {title}详细对比</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-indigo-50 p-4 rounded-2xl">
            <div className="text-xs text-indigo-400 font-bold uppercase mb-1">工作/学习</div>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-indigo-900">{data.work.curr}</span>
              <span className={`text-xs font-bold ${data.work.diff.includes('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{data.work.diff}</span>
            </div>
            <div className="text-[10px] text-indigo-400 mt-1">上期: {data.work.prev}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl">
            <div className="text-xs text-amber-400 font-bold uppercase mb-1">娱乐/休息</div>
            <div className="flex items-end gap-2">
              <span className="text-xl font-black text-amber-900">{data.play.curr}</span>
              <span className={`text-xs font-bold ${data.play.diff.includes('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{data.play.diff}</span>
            </div>
            <div className="text-[10px] text-amber-400 mt-1">上期: {data.play.prev}</div>
          </div>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl">{data.analysis}</p>
      </div>
    );
  };

  const renderPeriodReview = (data, title) => {
    if (!data) return isAutoGenerating ? <div className="p-8 text-center text-indigo-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>AI 正在对比历史数据...</div> : <div className="p-8 text-center text-slate-400">暂无{title}数据</div>;
    return (
      <div className="space-y-6 animate-in fade-in">
        {data.comparison && <ComparisonCard title={title} data={data.comparison} />}
        <div className="bg-[#F8FAFC] p-6 rounded-[2rem] border border-[#E2E8F0]">
          <h4 className="font-bold text-slate-700 mb-2">💡 核心洞察</h4>
          <p className="text-slate-600 leading-relaxed">{data.summary}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-4">✨ 高光时刻</h4>
            <ul className="space-y-2">{data.highlights?.map((h, i) => <li key={i} className="flex gap-2 text-emerald-700 text-sm"><CheckCircle className="w-4 h-4 shrink-0"/>{h}</li>)}</ul>
          </div>
          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-4">🚀 提升空间</h4>
            <ul className="space-y-2">{data.improvements?.map((h, i) => <li key={i} className="flex gap-2 text-amber-700 text-sm"><ArrowRight className="w-4 h-4 shrink-0"/>{h}</li>)}</ul>
          </div>
        </div>
        {data.stats && <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100"><SimplePieChart data={data.stats} /></div>}
      </div>
    );
  };

  const renderDayReview = (dateLabel) => {
    const isToday = dateLabel === 'today';
    const targetDate = isToday ? getTodayDate() : getYesterdayDate();
    let target = analysisResult?.daily_reviews?.find(r => r.date === targetDate);
    if (!target && history.length > 0) {
      const h = history.find(item => item.date === targetDate);
      if (h && h.result.daily_reviews) target = h.result.daily_reviews[0];
    }

    if (target) {
      return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 animate-in fade-in space-y-8">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-black text-slate-700 flex items-center gap-2">
                <PieIcon className="w-6 h-6 text-[#A78BFA]"/> 
                {isToday ? '今日完成情况' : `${targetDate} 复盘`}
             </h3>
             {isToday && (
               <button 
                  onClick={() => { setTargetReviewDate(target.date); setShowUpdateReviewModal(true); }} 
                  className="text-xs font-bold text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1 shadow-sm"
               >
                  <Edit3 className="w-3 h-3"/> 补充/更新
               </button>
             )}
          </div>
          <SimplePieChart data={target.stats} />
          <div className="bg-[#F8FAFC] p-6 rounded-[1.5rem] text-slate-600 leading-relaxed text-justify">
            <h4 className="font-bold text-slate-400 text-xs uppercase mb-2">综合分析</h4>
            {target.analysis}
          </div>
          {target.today_completed_analysis && (
             <div className="bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><Target className="w-4 h-4"/> 已完成事项总结</h4>
                <p className="text-emerald-700 text-sm leading-relaxed whitespace-pre-wrap">{target.today_completed_analysis}</p>
             </div>
          )}
        </div>
      );
    }
    
    // Empty state for today: Allow creation
    if (isToday) {
      return (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-8 h-8 text-indigo-300"/>
          </div>
          <p className="text-slate-400 font-medium mb-6">暂无今日复盘记录</p>
          <button 
            onClick={() => { setTargetReviewDate(getTodayDate()); setShowUpdateReviewModal(true); }} 
            className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-colors"
          >
            立即创建今日复盘
          </button>
        </div>
      );
    }

    return <div className="py-16 text-center text-slate-400 bg-white rounded-[2rem]">暂无历史复盘数据</div>;
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-slate-800 font-sans pb-40">
      <div className="fixed inset-0 -z-10 bg-[#FFFBF0]"><div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/hand-drawn-minimal-background_23-2148999829.jpg')] opacity-[0.03] bg-repeat"></div></div>
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-[#FFE4E1] z-30 px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#FFB7B2] to-[#FFDAC1] p-2 rounded-xl shadow-inner"><BrainCircuit className="text-white w-6 h-6" /></div>
          <h1 className="text-xl font-black text-slate-700 tracking-tight">LifeOS <span className="text-[#FFB7B2] font-serif italic text-sm">v5.7</span></h1>
        </div>
        <div className="flex gap-2">
           {activeTab !== 'input' && <button onClick={() => { setActiveTab('input'); setStep(1); }} className="text-sm font-bold text-[#FF8FA3] bg-[#FFF0F5] hover:bg-[#FFE4E1] px-4 py-2 rounded-full transition-colors flex items-center gap-2"><Plus className="w-4 h-4"/> 新的一天</button>}
           <button onClick={() => setShowKeyInput(true)} className="p-2 rounded-full bg-slate-100 text-slate-500"><Settings className="w-5 h-5"/></button>
        </div>
      </div>

      <main className="pt-32 px-4 max-w-md mx-auto space-y-8">
        {/* API Key Modal */}
        {showKeyInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm max-h-[80vh] overflow-y-auto p-6 rounded-[2rem] border-2 border-[#FFB7B2] shadow-2xl animate-in zoom-in-95 relative">
              <h3 className="font-bold text-slate-700 mb-1 text-lg flex items-center gap-2"><Key className="w-5 h-5 text-[#FFB7B2]"/> 设置 API Key</h3>
              <p className="text-xs text-slate-400 mb-4">使用 Gemini API 需要密钥 (AIza...)</p>
              
              <div className="relative mb-4">
                <input 
                  type={isKeyVisible ? "text" : "password"} 
                  value={userApiKey} 
                  onChange={(e)=>setUserApiKey(cleanApiKey(e.target.value))} 
                  className="w-full p-4 pr-12 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-[#FFB7B2] outline-none text-sm font-mono text-slate-600" 
                  placeholder="粘贴 key..."
                />
                <button 
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {isKeyVisible ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={()=>{setUserApiKey('');localStorage.removeItem('gemini_lifeos_key');}} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-colors"><Eraser className="w-5 h-5"/></button>
                <button 
                  onClick={()=>{
                    if(validateApiKey(userApiKey)){
                      localStorage.setItem('gemini_lifeos_key',userApiKey);
                      setShowKeyInput(false);
                      showMessage("API Key 已保存", "success");
                    } else {
                      showMessage("Key 格式错误 (需AIza开头)", "error");
                    }
                  }} 
                  className="flex-1 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-colors"
                >
                  确认保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Review Modal */}
        {showUpdateReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm p-6 rounded-[2rem] shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 text-lg">补充/更新今日记录</h3>
                <button onClick={() => setShowUpdateReviewModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
              </div>
              <p className="text-xs text-slate-400 mb-3">补充实际完成的任务，AI 将重新生成图表和总结。</p>
              <textarea 
                value={updateReviewInput} 
                onChange={(e) => setUpdateReviewInput(e.target.value)} 
                className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-slate-100 p-3 text-sm focus:border-indigo-200 outline-none resize-none mb-4" 
                placeholder="例如：下午完成了方案初稿，但晚上多玩了1小时游戏..."
              />
              <button 
                onClick={handleUpdateReviewAnalysis} 
                disabled={isUpdatingReview}
                className="w-full bg-indigo-500 text-white rounded-2xl py-3 font-bold flex justify-center items-center gap-2"
              >
                {isUpdatingReview ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                {isUpdatingReview ? "AI 重新计算中..." : "更新复盘"}
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        {activeTab !== 'input' && analysisResult && (
          <div className="bg-white p-2 rounded-2xl shadow-sm flex gap-1 border border-slate-100 mb-4">
            <button onClick={() => setActiveTab('plan')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'plan' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><Layout className="w-4 h-4"/> 今日计划</button>
            <button onClick={() => setActiveTab('review')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'review' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><BookMarked className="w-4 h-4"/> 复盘中心</button>
          </div>
        )}

        {/* Input Flow */}
        {activeTab === 'input' && (
          <div className="space-y-8">
            <section className={`transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between mb-4"><h3 className="text-xl font-black text-slate-700">1. 日历数据</h3><button onClick={()=>setShowHistoryModal(true)} className="text-indigo-500 font-bold text-xs bg-indigo-50 px-3 py-1 rounded-lg">历史</button></div>
                <textarea ref={textareaRef} value={dataInput} onChange={(e) => setDataInput(e.target.value)} placeholder="粘贴日历..." className="w-full h-32 bg-[#F8FAFC] border-slate-200 border rounded-2xl p-4 text-sm mb-4 resize-none focus:border-[#FFB7B2] outline-none" />
                {step === 1 && dataInput && <button onClick={() => setStep(2)} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl">下一步 <ArrowRight className="w-5 h-5 inline"/></button>}
              </div>
            </section>

            {step >= 2 && (
              <section ref={step2Ref} className="animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-xl font-black text-slate-700 border-b pb-4">2. 当前状态</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">起床时间</label>
                      <input type="time" value={userContext.wakeTime} onChange={(e)=>setUserContext({...userContext, wakeTime: e.target.value})} className="w-full bg-[#F8FAFC] p-3 rounded-2xl font-bold outline-none border focus:border-[#FFB7B2] transition-colors text-lg" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">预计入睡</label>
                      <input type="time" value={userContext.sleepTime} onChange={(e)=>setUserContext({...userContext, sleepTime: e.target.value})} className="w-full bg-[#F8FAFC] p-3 rounded-2xl font-bold outline-none border focus:border-[#FFB7B2] transition-colors text-lg" />
                    </div>
                  </div>

                  {/* 清醒时长展示 (动态反馈) */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-slate-300 font-bold flex items-center gap-1"><Hourglass className="w-3 h-3"/> 预计清醒时长</span>
                    <span className={`text-xs font-black ${awakeInfo.isNextDay ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {awakeInfo.durationText}
                      {awakeInfo.isNextDay && <span className="text-[10px] ml-1 bg-indigo-50 px-1.5 rounded text-indigo-300">次日</span>}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">当前活动</label>
                    <input value={userContext.currentActivity} onChange={(e)=>setUserContext({...userContext,currentActivity:e.target.value})} className="w-full bg-[#F8FAFC] p-3 rounded-2xl font-bold outline-none" placeholder="当前活动..." />
                  </div>

                  {/* 生理状态选择 */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">生理状态</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => toggleBioState('hasWashed')}
                        className={`flex-1 p-3 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-1 ${userContext.hasWashed ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-400'}`}
                      >
                        <Bath className="w-5 h-5"/>
                        <span className="text-xs">已洗漱</span>
                      </button>
                      <button 
                        onClick={() => toggleBioState('hasLunch')}
                        className={`flex-1 p-3 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-1 ${userContext.hasLunch ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-400'}`}
                      >
                        <UtensilsCrossed className="w-5 h-5"/>
                        <span className="text-xs">已午餐</span>
                      </button>
                      <button 
                        onClick={() => toggleBioState('hasDinner')}
                        className={`flex-1 p-3 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-1 ${userContext.hasDinner ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-400'}`}
                      >
                        <Utensils className="w-5 h-5"/>
                        <span className="text-xs">已晚餐</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">身体</label>
                      <select onChange={(e)=>setUserContext({...userContext,physicalState:[e.target.value]})} className="w-full bg-[#F8FAFC] p-3 rounded-2xl font-bold outline-none">{physicalOptions.map(o=><option key={o}>{o}</option>)}</select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">精神</label>
                      <select onChange={(e)=>setUserContext({...userContext,mentalState:[e.target.value]})} className="w-full bg-[#F8FAFC] p-3 rounded-2xl font-bold outline-none">{mentalOptions.map(o=><option key={o}>{o}</option>)}</select>
                    </div>
                  </div>
                  {step === 2 && <button onClick={handleGenerateModeSuggestion} disabled={isSuggestingMode} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl">{isSuggestingMode ? <Loader2 className="w-5 h-5 animate-spin inline"/> : <>下一步 <ArrowRight className="w-5 h-5 inline"/></>}</button>}
                </div>
              </section>
            )}

            {step >= 3 && (
              <section ref={step3Ref} className="animate-in slide-in-from-bottom-8 duration-500 pb-24">
                 <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-slate-700">3. 今日计划</h3>
                      <div className="flex gap-2 items-center bg-slate-100 px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-400"/>
                        <span className="text-sm font-bold text-slate-600">{getCurrentTimeStr()}</span>
                      </div>
                    </div>

                    {modeSuggestion && <div className="bg-indigo-50 border-2 border-indigo-100 p-4 rounded-2xl mb-6 flex gap-3 items-center"><Sparkles className="w-5 h-5 text-indigo-500"/><span className="font-bold text-indigo-700 text-sm">{modeSuggestion.reason}</span></div>}
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {workloadOptions.map((opt) => (
                          <button key={opt.id} onClick={() => setWorkloadMode(opt.id)} className={`p-3 rounded-2xl border-2 text-left ${workloadMode === opt.id ? opt.color : 'bg-white border-slate-100 opacity-60'}`}>
                            <div className="font-bold text-sm flex items-center gap-2 mb-1">{opt.icon} {opt.label}</div>
                            <div className="text-[10px] opacity-70">{opt.desc}</div>
                          </button>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8">
                      {userContext.tasks.map((task, i) => (
                        <div key={task.id} className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
                           <div className="flex justify-between mb-3">
                             <span className="text-xs font-bold text-slate-300">Task {i+1}</span>
                             <button onClick={()=>setUserContext(p=>({...p,tasks:p.tasks.filter(t=>t.id!==task.id)}))}><X className="w-4 h-4 text-slate-300"/></button>
                           </div>
                           <input value={task.name} onChange={(e)=>updateTask(task.id,'name',e.target.value)} placeholder="输入任务名称..." className="w-full bg-transparent font-bold text-slate-700 outline-none mb-3 placeholder:font-normal"/>
                           <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-100">
                             <Clock className="w-4 h-4 text-slate-400"/>
                             <select value={task.durationHour} onChange={(e)=>updateTask(task.id,'durationHour',Number(e.target.value))} className="bg-transparent font-mono font-bold outline-none">{[0,1,2,3,4,5,6,7,8].map(h=><option key={h} value={h}>{h}h</option>)}</select>
                             <select value={task.durationMin} onChange={(e)=>updateTask(task.id,'durationMin',Number(e.target.value))} className="bg-transparent font-mono font-bold outline-none">{[0,15,30,45].map(m=><option key={m} value={m}>{m}m</option>)}</select>
                           </div>
                        </div>
                      ))}
                      
                      <button onClick={()=>setUserContext(p=>({...p,tasks:[...p.tasks,{id:Date.now(),name:'',durationHour:0,durationMin:30}]}))} className="w-full border-2 border-dashed border-slate-200 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                        <Plus className="w-5 h-5"/> 加一项任务
                      </button>
                    </div>

                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-slate-800 text-white font-bold py-6 rounded-[2rem] shadow-xl text-lg flex justify-center items-center gap-2 relative overflow-hidden">
                      {loadingProgress > 0 && (
                        <div className="absolute bottom-0 left-0 h-1 bg-emerald-400 transition-all duration-300 ease-out" style={{width: `${loadingProgress}%`}}></div>
                      )}
                      {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin"/> : <Sparkles className="w-6 h-6"/>} 
                      {isAnalyzing ? `生成中 ${loadingProgress.toFixed(0)}% - ${loadingText}` : "生成指南"}
                    </button>
                 </div>
              </section>
            )}
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && analysisResult && (
          <div className="space-y-6 pb-32 animate-in slide-in-from-bottom-8">
            {/* Conflict Toggle Switch */}
            {analysisResult.today_plan.has_conflict && (
              <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-3xl flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2 rounded-full"><AlertCircle className="w-5 h-5 text-rose-500"/></div>
                  <div>
                    <h4 className="font-bold text-rose-700 text-sm">检测到作息风险</h4>
                    <p className="text-xs text-rose-500">建议优化作息或查看全量版</p>
                  </div>
                </div>
                <div className="flex bg-white rounded-full p-1 border border-rose-100">
                  <button onClick={()=>setPlanVersion('smart')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${planVersion==='smart'?'bg-rose-500 text-white':'text-rose-300'}`}>AI健康版</button>
                  <button onClick={()=>setPlanVersion('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${planVersion==='all'?'bg-rose-500 text-white':'text-rose-300'}`}>全量冲刺版</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white">
              <div className={`p-8 ${workloadOptions.find(o => o.id === workloadMode)?.color.split(' ')[0] || 'bg-slate-50'}`}>
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h2 className="text-2xl font-black text-slate-800">{analysisResult.today_plan.date}</h2>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded-md text-slate-600">
                         {workloadOptions.find(o => o.id === workloadMode)?.label}模式
                       </span>
                       {planVersion === 'all' && <span className="text-xs font-bold bg-rose-500 text-white px-2 py-1 rounded-md">全量版</span>}
                     </div>
                   </div>
                   <div className="bg-white/40 p-2 rounded-full backdrop-blur-sm"><Sunrise className="w-6 h-6 text-slate-700"/></div>
                 </div>
                 {/* 动态显示建议文案 */}
                 <div className="text-lg font-bold text-slate-800/90 leading-relaxed italic relative">
                   <Telescope className="w-8 h-8 text-slate-400/20 absolute -top-4 -left-4 -rotate-12"/>
                   "{planVersion === 'smart' ? analysisResult.today_plan.smart_advice : analysisResult.today_plan.full_advice}"
                 </div>
              </div>
              
              <div className="p-6 space-y-4">
                {(planVersion === 'smart' ? analysisResult.today_plan.blocks : analysisResult.today_plan.full_blocks)?.map((block, idx) => (
                  <div key={idx} className={`p-5 rounded-[2rem] ${getBlockStyle(block.type)} border`}>
                    <div className="flex justify-between items-center mb-3">
                       <span className="font-mono font-bold opacity-70 bg-white/50 px-3 py-1 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap"><Clock className="w-4 h-4"/> {block.time}</span>
                       <span className="uppercase text-[10px] font-black tracking-widest opacity-40 flex items-center gap-1">{getBlockIcon(block.type)} {block.type}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{block.activity}</h4>
                    
                    {/* 休息/过渡方案展示 */}
                    {(block.type === 'rest' || block.type === 'recovery' || block.type === 'transition' || block.type === 'routine') && block.tips && (
                      <div className="bg-white/60 p-3 rounded-xl mb-3 flex items-start gap-2 border border-white/50">
                        {block.type === 'transition' ? <Footprints className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0"/> : <Sofa className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"/>}
                        <span className={`text-sm font-medium ${block.type === 'transition' ? 'text-indigo-800' : 'text-emerald-800'}`}>{block.tips}</span>
                      </div>
                    )}

                    {block.sub_schedule && (
                      <div className="space-y-2 mt-4 pl-4 border-l-2 border-black/5">
                        {block.sub_schedule.map((sub, sIdx) => (
                          <div key={sIdx} className="text-sm font-medium opacity-80 flex gap-3">
                            <span className="opacity-50 font-mono whitespace-nowrap">{sub.time}</span>
                            <span>{sub.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <button onClick={() => saveToHistory(analysisResult, dataInput) && showMessage("已保存", "success")} className="bg-white text-slate-400 font-bold py-3 px-8 rounded-full border-2 border-slate-100 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center gap-2 text-sm">
                <Archive className="w-4 h-4" /> 确保已归档
              </button>
            </div>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && analysisResult && (
          <div className="space-y-6 pb-32 animate-in slide-in-from-bottom-8">
            <div className="bg-white p-2 rounded-[2rem] shadow-sm flex gap-1 border border-slate-100 overflow-x-auto">
              <div className="flex w-full gap-1 min-w-[320px]">
                {['today', 'yesterday', 'weekly', 'monthly'].map(scope => (
                  <button key={scope} onClick={() => setReviewScope(scope)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap ${reviewScope === scope ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                    {scope === 'today' ? '今日' : scope === 'yesterday' ? '昨日' : scope === 'weekly' ? '周度' : '月度'}
                  </button>
                ))}
              </div>
            </div>
            {(reviewScope === 'today' || reviewScope === 'yesterday') ? renderDayReview(reviewScope) : renderPeriodReview(analysisResult[`${reviewScope}_review`], reviewScope === 'weekly' ? '周报' : '月报')}
          </div>
        )}
      </main>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-black text-slate-800">时光档案</h3><button onClick={() => setShowHistoryModal(false)} className="bg-slate-100 p-2 rounded-full"><X className="w-5 h-5 text-slate-500"/></button></div>
            <div className="overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] flex-1">
              {history.length === 0 ? <div className="text-center py-12 text-slate-400">暂无存档</div> : history.map(entry => (
                <div key={entry.id} onClick={() => loadFromHistory(entry)} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative group cursor-pointer">
                   <div className="flex justify-between items-start mb-2"><h4 className="font-black text-slate-700">{entry.date}</h4></div>
                   <p className="text-sm text-slate-500 line-clamp-2 pr-8">{entry.result?.today_plan?.overall_advice || "无摘要"}</p>
                   <button onClick={(e) => deleteFromHistory(e, entry.id)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-rose-50 text-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {statusMsg.text && <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex gap-3 font-bold shadow-xl animate-in slide-in-from-top-4 ${statusMsg.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{statusMsg.text}</div>}
    </div>
  );
}

export default function AppWrapper() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}