import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Calendar, ClipboardPaste, Activity, BrainCircuit, 
  AlertCircle, Moon, Briefcase, BookOpen, Gamepad2, Car, Coffee, 
  Heart, Sunrise, Snowflake, Plus, X, Timer, List, Sparkles, 
  ShieldCheck, Loader2, Link2, CheckCircle, Settings, ChevronRight, ArrowRight,
  ChevronDown, ChevronUp, RefreshCw, Clock, PieChart as PieIcon, Save, Trash2,
  Music, MoveRight, Wand2, Feather
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- 防崩溃组件 ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  
  handleReset = () => {
      localStorage.removeItem('gemini_lifeos_result');
      localStorage.removeItem('gemini_lifeos_tab');
      localStorage.removeItem('gemini_lifeos_context');
      window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
          <div className="bg-rose-50 p-6 rounded-full">
              <AlertCircle className="w-12 h-12 text-rose-500" />
          </div>
          <div>
              <h3 className="text-slate-800 font-bold text-2xl mb-2">显示出了点小问题</h3>
              <p className="text-base text-slate-500">数据格式可能有点偏差</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
             <button onClick={() => window.location.reload()} className="w-full bg-slate-800 text-white px-6 py-4 rounded-2xl text-lg font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5"/> 刷新页面
             </button>
             <button onClick={this.handleReset} className="w-full bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl text-lg font-medium active:bg-slate-50 transition-colors">
                重置数据
             </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 智能重试函数 ---
const callGeminiWithRetry = async (model, prompt, retries = 3, initialDelay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result; 
    } catch (error) {
      const isOverloaded = error.message.includes('503') || error.message.includes('overloaded');
      if (i === retries - 1 || !isOverloaded) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// --- JSON 修复工具 ---
const parseJSONSafely = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      let fixed = text.replace(/,(\s*[}\]])/g, '$1').replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch (e2) {
      throw new Error("无法解析 AI 返回的数据");
    }
  }
};

// --- 数据清洗 ---
const sanitizeData = (data) => {
  const safeData = { 
    daily_reviews: [], 
    today_plan: { date: '', overall_advice: '', blocks: [] } 
  };

  if (!data) return safeData;

  if (Array.isArray(data.daily_reviews)) {
    safeData.daily_reviews = data.daily_reviews.map(item => ({
      type: item.type || 'unknown',
      date: item.date || '未知日期',
      analysis: item.analysis || '无分析内容',
      stats: Array.isArray(item.stats) ? item.stats.map(s => ({
        category: s.category || '其他',
        percentage: Number(s.percentage) || 0,
        duration: s.duration || ''
      })) : []
    }));
  }

  if (data.today_plan && typeof data.today_plan === 'object') {
    safeData.today_plan.date = data.today_plan.date || '今日';
    safeData.today_plan.overall_advice = data.today_plan.overall_advice || '';
    
    if (Array.isArray(data.today_plan.blocks)) {
      safeData.today_plan.blocks = data.today_plan.blocks.map(b => ({
        time: b.time || '',
        type: b.type || 'routine',
        activity: b.activity || '未命名事项',
        desc: b.desc || '',
        sub_schedule: Array.isArray(b.sub_schedule) ? b.sub_schedule : [],
        actionable_tips: Array.isArray(b.actionable_tips) ? b.actionable_tips : []
      }));
    }
  }

  return safeData;
};

// --- 饼图组件 (归一化版) ---
const SimplePieChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
            <PieIcon className="w-10 h-10 text-slate-300 mb-3" />
            <span className="text-base text-slate-400 font-medium">暂无时间记录</span>
        </div>
      );
  }

  const colors = [
    '#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A3A3A3', '#818CF8', '#FB923C'
  ];

  // 1. 计算当前数据的总占比 (可能是 20%, 50% 等)
  const totalPercentage = data.reduce((acc, item) => acc + (parseFloat(item.percentage) || 0), 0);
  
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((slice, index) => {
    const color = colors[index % colors.length];
    const rawPercentage = parseFloat(slice.percentage) || 0;
    if (rawPercentage <= 0) return null;

    // 2. 归一化：计算这项任务在“已记录总时间”里的占比 (0.0 - 1.0)
    // 这样就能保证所有扇形加起来是一个完整的圆 (100%)
    const normalizedPercent = totalPercentage > 0 ? (rawPercentage / totalPercentage) : 0;

    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += normalizedPercent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    
    // 如果占比接近 100%，画一个完整的圆
    if (normalizedPercent > 0.999) {
      return <circle key={index} cx="0" cy="0" r="1" fill={color} />;
    }

    const largeArcFlag = normalizedPercent > 0.5 ? 1 : 0;
    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(' ');

    return <path key={index} d={pathData} fill={color} stroke="white" strokeWidth="0.02" />;
  });

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex items-center justify-center gap-8 w-full">
          <div className="w-36 h-36 relative shrink-0">
            <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90 drop-shadow-md">
              {slices}
            </svg>
          </div>
          <div className="flex-1 min-w-[140px] space-y-3">
            {data.map((item, idx) => {
              const rawPercentage = parseFloat(item.percentage) || 0;
              // 计算显示的百分比：也是基于“已记录时间”的占比
              const displayPercent = totalPercentage > 0 ? ((rawPercentage / totalPercentage) * 100).toFixed(1) : 0;
              
              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <span className="text-slate-700 font-bold text-sm truncate max-w-[110px]" title={item.category}>{item.category}</span>
                  </div>
                  <span className="text-slate-500 font-mono font-bold text-sm">{displayPercent}%</span>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};

// 图标获取
const getCategoryIcon = (category) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes('睡') || cat.includes('sleep')) return <Moon className="w-4 h-4" />;
  if (cat.includes('工') || cat.includes('work')) return <Briefcase className="w-4 h-4" />;
  if (cat.includes('学') || cat.includes('study') || cat.includes('读')) return <BookOpen className="w-4 h-4" />;
  if (cat.includes('娱') || cat.includes('play') || cat.includes('game')) return <Gamepad2 className="w-4 h-4" />;
  if (cat.includes('通') || cat.includes('commute')) return <Car className="w-4 h-4" />;
  if (cat.includes('吃') || cat.includes('eat') || cat.includes('饭')) return <Coffee className="w-4 h-4" />;
  if (cat.includes('复') || cat.includes('recovery')) return <Heart className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

// 样式
const getBlockStyle = (type) => {
  switch (type) {
    case 'focus': return 'bg-[#E0F7FA]/90 border-[#B2EBF2] text-cyan-900 shadow-sm';
    case 'rest': return 'bg-[#E8F5E9]/90 border-[#C8E6C9] text-emerald-900 shadow-sm';
    case 'recovery': return 'bg-[#FCE4EC]/90 border-[#F8BBD0] text-pink-900 shadow-sm';
    case 'routine': return 'bg-[#FFF3E0]/90 border-[#FFE0B2] text-orange-900 shadow-sm';
    case 'fun': return 'bg-[#F3E5F5]/90 border-[#E1BEE7] text-purple-900 shadow-sm';
    default: return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

function App() {
  const [dataInput, setDataInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [step, setStep] = useState(1); 
  const [reviewTab, setReviewTab] = useState('yesterday');

  // Features State
  const [breakdownStates, setBreakdownStates] = useState({}); 
  const [loadingBreakdown, setLoadingBreakdown] = useState(null); 
  const [shieldLoading, setShieldLoading] = useState(false);
  const [shieldAdvice, setShieldAdvice] = useState(null);
  const [bgmLoading, setBgmLoading] = useState(false);
  const [bgmAdvice, setBgmAdvice] = useState(null);
  const [estimatingIndex, setEstimatingIndex] = useState(null); 
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diaryContent, setDiaryContent] = useState(null);

  const [userContext, setUserContext] = useState({
    currentActivity: '',
    physicalState: [], 
    mentalState: [],   
    sleepTime: '23:00',
    tasks: [{ id: Date.now(), name: '', durationHour: '', durationMin: '', durationSec: '', workflowId: '' }],
    pomodoroSettings: [
      { id: 1, name: '通用专注', work: 25, rest: 5 },
      { id: 2, name: '深度学习', work: 45, rest: 10 }
    ]
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const textareaRef = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const diaryRef = useRef(null);

  const physicalOptions = [
    { l: "⚡️ 充沛", v: "充沛", activeClass: "bg-indigo-100 border-indigo-300 text-indigo-800 ring-1 ring-indigo-200" },
    { l: "🙂 正常", v: "正常", activeClass: "bg-slate-100 border-slate-300 text-slate-800 ring-1 ring-slate-200" },
    { l: "🥱 疲惫", v: "疲惫", activeClass: "bg-amber-100 border-amber-300 text-amber-800 ring-1 ring-amber-200" },
    { l: "💥 腰痛", v: "腰痛", activeClass: "bg-rose-100 border-rose-300 text-rose-800 ring-1 ring-rose-200" },
    { l: "🤕 头痛", v: "头痛", activeClass: "bg-rose-100 border-rose-300 text-rose-800 ring-1 ring-rose-200" },
    { l: "🤢 腹痛", v: "腹痛", activeClass: "bg-rose-100 border-rose-300 text-rose-800 ring-1 ring-rose-200" }
  ];

  const mentalOptions = [
    { l: "🧠 专注", v: "专注", activeClass: "bg-violet-100 border-violet-300 text-violet-800 ring-1 ring-violet-200" },
    { l: "🌊 平静", v: "平静", activeClass: "bg-sky-100 border-sky-300 text-sky-800 ring-1 ring-sky-200" },
    { l: "😐 一般", v: "一般", activeClass: "bg-slate-100 border-slate-300 text-slate-800 ring-1 ring-slate-200" },
    { l: "🔥 焦虑", v: "焦虑", activeClass: "bg-orange-100 border-orange-300 text-orange-800 ring-1 ring-orange-200" },
    { l: "🕳️ 空虚", v: "空虚", activeClass: "bg-gray-200 border-gray-400 text-gray-700 ring-1 ring-gray-300" },
    { l: "😶‍🌫️ 涣散", v: "涣散", activeClass: "bg-stone-100 border-stone-300 text-stone-700 ring-1 ring-stone-200" }
  ];

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_lifeos_key');
    if (savedKey) { setUserApiKey(savedKey); setShowKeyInput(false); } 
    else { setShowKeyInput(true); }

    const savedContext = localStorage.getItem('gemini_lifeos_context');
    if (savedContext) {
        try { setUserContext(prev => ({ ...prev, ...JSON.parse(savedContext) })); } catch (e) {}
    }

    const savedResult = localStorage.getItem('gemini_lifeos_result');
    if (savedResult) {
        try {
            const parsed = JSON.parse(savedResult);
            if(parsed && (parsed.daily_reviews || parsed.today_plan)) {
                setAnalysisResult(parsed);
                const savedTab = localStorage.getItem('gemini_lifeos_tab');
                if (savedTab) setActiveTab(savedTab);
            }
        } catch(e) { console.error("Restore failed"); }
    }
  }, []);

  const handleKeyChange = (e) => {
      const val = e.target.value;
      setUserApiKey(val);
      localStorage.setItem('gemini_lifeos_key', val);
  };

  useEffect(() => {
      const toSave = {
          sleepTime: userContext.sleepTime,
          pomodoroSettings: userContext.pomodoroSettings,
          tasks: userContext.tasks
      };
      localStorage.setItem('gemini_lifeos_context', JSON.stringify(toSave));
  }, [userContext.sleepTime, userContext.pomodoroSettings, userContext.tasks]);

  useEffect(() => {
      if (analysisResult) {
          localStorage.setItem('gemini_lifeos_result', JSON.stringify(analysisResult));
      }
      localStorage.setItem('gemini_lifeos_tab', activeTab);
  }, [analysisResult, activeTab]);

  useEffect(() => {
      if (step === 2 && step2Ref.current) step2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (step === 3 && step3Ref.current) step3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const showMessage = (text, type = 'error') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  const toggleDay = (dateKey) => {
    setExpandedDays(prev => ({...prev, [dateKey]: !prev[dateKey]}));
  };

  const toggleState = (field, value) => {
    setUserContext(prev => {
      const current = prev[field];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const addTask = () => setUserContext(prev => ({...prev, tasks: [...prev.tasks, { id: Date.now(), name: '', durationHour: '', durationMin: '', durationSec: '', workflowId: '' }]}));
  const removeTask = (id) => { if(userContext.tasks.length > 1) setUserContext(prev => ({...prev, tasks: prev.tasks.filter(t => t.id !== id)})) };
  const updateTask = (id, f, v) => setUserContext(prev => ({...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, [f]: v } : t)}));
  const addPomodoro = () => setUserContext(prev => ({...prev, pomodoroSettings: [...prev.pomodoroSettings, { id: Date.now(), name: '新预设', work: 25, rest: 5 }]}));
  const removePomodoro = (id) => setUserContext(prev => ({...prev, pomodoroSettings: prev.pomodoroSettings.filter(p => p.id !== id)}));
  const updatePomodoro = (id, f, v) => setUserContext(prev => ({...prev, pomodoroSettings: prev.pomodoroSettings.map(p => p.id === id ? { ...p, [f]: v } : p)}));

  const handleDeleteBlock = (blockIndex) => {
      if (!analysisResult || !analysisResult.today_plan) return;
      const newBlocks = analysisResult.today_plan.blocks.filter((_, idx) => idx !== blockIndex);
      setAnalysisResult(prev => ({
          ...prev,
          today_plan: {
              ...prev.today_plan,
              blocks: newBlocks
          }
      }));
      showMessage("已删除该日程", "success");
  };

  const handleSavePlan = () => {
      localStorage.setItem('gemini_lifeos_result', JSON.stringify(analysisResult));
      showMessage("计划已保存！", "success");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDataInput(text);
      showMessage("已粘贴！", "success");
    } catch (err) {
      showMessage("无法自动读取，请手动粘贴", "error");
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  // --- Gemini API Features ---

  const handleMagicBreakdown = async (block, index) => {
      const finalKey = userApiKey;
      if (!finalKey) return showMessage("需要 API Key", "error");
      setLoadingBreakdown(index);
      try {
          const genAI = new GoogleGenerativeAI(finalKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
          const prompt = `拆解任务: "${block.activity}"。状态: 身体${userContext.physicalState}, 精神${userContext.mentalState}。返回3-5个极简微步骤字符串数组JSON。`;
          const result = await callGeminiWithRetry(model, prompt);
          let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
          const first = text.indexOf('['); const last = text.lastIndexOf(']');
          if (first !== -1 && last !== -1) text = text.substring(first, last+1);
          setBreakdownStates(prev => ({...prev, [index]: JSON.parse(text)}));
      } catch (e) { showMessage("拆解失败，请重试", "error"); } finally { setLoadingBreakdown(null); }
  };

  const handleEnergyShield = async () => {
      const finalKey = userApiKey;
      if (!finalKey) return showMessage("需要 API Key", "error");
      const isNegative = userContext.physicalState.some(s => s.includes('痛')||s.includes('惫')) || userContext.mentalState.some(s => s.includes('焦')||s.includes('空')||s.includes('袭'));
      if (!isNegative && userContext.physicalState.length > 0) return showMessage("状态不错，继续保持！", "success");
      setShieldLoading(true); setShieldAdvice(null);
      try {
          const genAI = new GoogleGenerativeAI(finalKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
          const prompt = `用户状态告急：身体${userContext.physicalState}，精神${userContext.mentalState}。给出一个1分钟能做的急救建议，50字以内，语气温柔。`;
          const result = await callGeminiWithRetry(model, prompt);
          setShieldAdvice(result.response.text());
      } catch (e) { showMessage("启动失败，请稍后重试", "error"); } finally { setShieldLoading(false); }
  };

  const handleSmartEstimate = async (taskId, index) => {
      const finalKey = userApiKey;
      if (!finalKey) return showMessage("需要 API Key", "error");
      const task = userContext.tasks.find(t => t.id === taskId);
      if (!task || !task.name.trim()) return showMessage("请填写任务名称", "error");

      setEstimatingIndex(index);
      try {
          const genAI = new GoogleGenerativeAI(finalKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
          
          const prompt = `Task: "${task.name}". User: Phys[${userContext.physicalState}], Mental[${userContext.mentalState}]. Workflows: ${JSON.stringify(userContext.pomodoroSettings.map(p => ({id: p.id, name: p.name})))}. Estimate duration (hour, min) and recommend workflow ID. Return JSON: { "h": number, "m": number, "workflowId": number|string }`;
          
          const result = await callGeminiWithRetry(model, prompt);
          const data = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
          
          setUserContext(prev => ({
              ...prev,
              tasks: prev.tasks.map(t => t.id === taskId ? { 
                  ...t, durationHour: data.h || 0, durationMin: data.m || 0, durationSec: 0, workflowId: data.workflowId || t.workflowId
              } : t)
          }));
          showMessage("已自动估时", "success");
      } catch (e) { showMessage("估算失败", "error"); } finally { setEstimatingIndex(null); }
  };

  const handleFutureDiary = async () => {
      const finalKey = userApiKey;
      if (!finalKey) return showMessage("需要 API Key", "error");
      setDiaryLoading(true); setDiaryContent(null);
      try {
          const genAI = new GoogleGenerativeAI(finalKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
          const taskNames = analysisResult.today_plan.blocks.map(b => b.activity).join(', ');
          const prompt = `Assuming user completed: ${taskNames}. Write a short Chinese diary entry (max 80 words) from user's perspective tonight. Tone: Fulfilling, relaxed.`;
          const result = await callGeminiWithRetry(model, prompt);
          setDiaryContent(result.response.text());
          setTimeout(() => diaryRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (e) { showMessage("生成日记失败", "error"); } finally { setDiaryLoading(false); }
  };

  const handleGetBGM = async () => {
      const finalKey = userApiKey;
      if (!finalKey) return showMessage("需要 API Key", "error");
      setBgmLoading(true); setBgmAdvice(null);
      try {
          const genAI = new GoogleGenerativeAI(finalKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
          const taskNames = userContext.tasks.map(t => t.name).join(',');
          const prompt = `任务：${taskNames}。状态：${userContext.mentalState}。推荐1种BGM风格。极简，如"🎵 Lo-fi"。`;
          const result = await callGeminiWithRetry(model, prompt);
          setBgmAdvice(result.response.text());
      } catch (e) { showMessage("获取失败", "error"); } finally { setBgmLoading(false); }
  };

  const handleAnalyze = async () => {
      if (!dataInput.trim()) return showMessage("请先粘贴日历数据", "error");
      if (!userApiKey) return showMessage("请配置 API Key", "error");
      setIsAnalyzing(true); setBreakdownStates({});
      try {
          const genAI = new GoogleGenerativeAI(userApiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
          const todayStr = new Date().toLocaleDateString();
          const now = new Date();
          const currentTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

          const structuredTasks = userContext.tasks.filter(t => t.name.trim()).map(t => {
              const flow = userContext.pomodoroSettings.find(p => String(p.id) === String(t.workflowId));
              const durationStr = `${t.durationHour || 0}时${t.durationMin || 0}分${t.durationSec || 0}秒`;
              const flowInfo = flow ? `(绑定: ${flow.name} ${flow.work}m/${flow.rest}m)` : '(普通任务，无番茄钟绑定)';
              return `- 事项: "${t.name}", 耗时: "${durationStr}" ${flowInfo}`;
          }).join('\n');
          
          const prompt = `你是一位敏锐且极具同理心的生活管家。今天是 ${todayStr}。
          【当前时刻】: ${currentTime} (注意：生成的计划必须从这个时刻之后开始，严禁安排已经过去的时间！)
          
          【输入数据】
          1. 日历数据: ${dataInput}
          2. 用户当前正在做: "${userContext.currentActivity}"
          3. 用户身体状态: [${userContext.physicalState}]
          4. 用户精神状态: [${userContext.mentalState}]
          5. 预计睡觉: ${userContext.sleepTime}
          6. 待办计划(Plan): ${structuredTasks || "无"}

          【核心任务】
          请生成一份 JSON 格式的复盘与计划。
          
          【逻辑要求 1：复盘 (Stats)】
          - 分析【今天】、【昨天】、【前天】的数据。
          - **关键原则：诚实统计**。如果某天日历数据为空，则 stats 返回空数组 []，analysis 说明"无记录"。
          - **绝对禁止编造**：不要自动填充"睡眠"或"工作"等未在日历中出现的活动。
          - category 必须使用用户输入的原始名称。

          【逻辑要求 2：智能过渡 (Smart Transition)】
          - 在第一个任务开始前，插入一个基于 "${userContext.currentActivity}" 的短暂过渡动作（sub_schedule）。

          【逻辑要求 3：计划执行 (关键)】
          - **起始时间：第一个任务必须晚于 ${currentTime}。**
          - 严格执行 Plan 中的绑定时长。
          - 负面状态必须插入[心情提升]或[身体修复]。
          - 凌晨归前一天。

          **IMPORTANT: Return ONLY valid JSON.**

          返回JSON: { 
            "daily_reviews": [{ "type": "dayBefore|yesterday|today", "date": "string", "stats": [{"category": "string", "percentage": number}], "analysis": "string" }], 
            "today_plan": { "date": "string", "overall_advice": "string", "blocks": [{ "time": "HH:MM-HH:MM", "type": "focus|rest|routine|fun|recovery", "activity": "string", "desc": "string", "sub_schedule": [{"time":"HH:MM-HH:MM", "label":"string"}], "actionable_tips": ["string"] }] } 
          }`;
          
          const result = await callGeminiWithRetry(model, prompt);
          let text = result.response.text();
          
          let parsed;
          try {
              let jsonCandidate = text.replace(/```json/g, '').replace(/```/g, '').trim();
              const firstOpen = jsonCandidate.indexOf('{');
              const lastClose = jsonCandidate.lastIndexOf('}');
              if (firstOpen !== -1 && lastClose !== -1) {
                  jsonCandidate = jsonCandidate.substring(firstOpen, lastClose + 1);
                  parsed = parseJSONSafely(jsonCandidate);
              } else { throw new Error("Not JSON"); }
          } catch (parseError) {
              console.warn("JSON Parsing Failed:", text);
              parsed = {
                  daily_reviews: [],
                  today_plan: { date: todayStr, overall_advice: "AI 返回内容格式有误，请重试。", blocks: [] }
              };
          }

          const safeData = sanitizeData(parsed);
          setAnalysisResult(safeData);
          setActiveTab('report');
          setReviewTab('yesterday'); 
      } catch (e) { 
          console.error(e); 
          showMessage(`请求失败: ${e.message}`, "error"); 
      } finally { 
          setIsAnalyzing(false); 
      }
  };

  const getCurrentReview = () => {
      if (!analysisResult?.daily_reviews) return null;
      return analysisResult.daily_reviews.find(r => r.type === reviewTab) || analysisResult.daily_reviews[0];
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-slate-800 font-sans pb-32 selection:bg-rose-100 selection:text-rose-900">
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-30 px-5 h-18 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-rose-400 to-orange-400 p-2.5 rounded-2xl shadow-md">
                <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Gemini LifeOS</h1>
          </div>
          {activeTab === 'report' && (
             <button onClick={() => { setActiveTab('input'); setStep(1); }} className="text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-full transition-colors">
               新的一天
             </button>
          )}
      </div>

      <main className="pt-28 px-5 max-w-md mx-auto space-y-8">
        
        {/* Key Card */}
        <div className="bg-white/80 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white overflow-hidden backdrop-blur-md">
            {showKeyInput ? (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-base font-bold text-slate-600">Gemini API Key</label>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-xs text-rose-500 flex items-center bg-rose-50 px-3 py-1.5 rounded-full font-bold hover:bg-rose-100 transition-colors">
                            获取 Key <ChevronRight className="w-3 h-3" />
                        </a>
                    </div>
                    <input type="password" value={userApiKey} onChange={handleKeyChange} placeholder="粘贴 AIza 开头的 Key..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-lg focus:ring-2 focus:ring-rose-300 outline-none transition-all placeholder:text-slate-400" />
                    {userApiKey && <button onClick={() => setShowKeyInput(false)} className="mt-5 w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-base font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-transform">保存并继续</button>}
                </div>
            ) : (
                <div onClick={() => setShowKeyInput(true)} className="p-5 flex items-center justify-between active:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <div className="bg-emerald-100 p-1.5 rounded-full"><CheckCircle className="w-5 h-5" /></div>
                        <span className="text-base font-bold">大脑已连接</span>
                    </div>
                    <Settings className="w-6 h-6 text-slate-300" />
                </div>
            )}
        </div>

        {/* Messages */}
        {statusMsg.text && (
          <div className={`fixed top-24 left-5 right-5 z-50 p-4 rounded-2xl flex items-center gap-3 text-base font-bold shadow-2xl animate-in fade-in slide-in-from-top-4 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
            {statusMsg.type === 'error' ? <AlertCircle className="w-6 h-6 shrink-0"/> : <CheckCircle className="w-6 h-6 shrink-0"/>}
            {statusMsg.text}
          </div>
        )}

        {/* Energy Shield Modal */}
        {shieldAdvice && (
          <div className="fixed top-28 left-5 right-5 z-50 animate-bounce-in">
             <div className="bg-white/95 backdrop-blur-xl border border-rose-100 p-6 rounded-[2rem] shadow-2xl ring-4 ring-rose-50 flex items-start gap-4">
                 <div className="bg-rose-100 p-3 rounded-full text-rose-500"><ShieldCheck className="w-8 h-8" /></div>
                 <div className="flex-1">
                    <h4 className="font-bold text-rose-600 text-lg mb-2">✨ 能量急救包</h4>
                    <p className="text-base text-slate-700 leading-relaxed font-medium">{shieldAdvice}</p>
                 </div>
                 <button onClick={() => setShieldAdvice(null)} className="text-slate-400 p-2 hover:text-slate-600 bg-slate-50 rounded-full"><X className="w-5 h-5" /></button>
             </div>
          </div>
        )}

        {activeTab === 'input' && (
          <div className="space-y-8 pb-10">
            {/* Step 1 */}
            <section className={`transition-all duration-500 ${step === 1 ? 'opacity-100 translate-y-0' : 'opacity-40 scale-95 translate-y-4'}`}>
                <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/40 border border-white">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                            <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span>
                            日历数据源
                        </h3>
                        {!dataInput && <button onClick={handlePaste} className="text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold active:scale-95 transition-transform border border-indigo-100 hover:bg-indigo-100">粘贴剪贴板</button>}
                    </div>
                    <div className="relative group">
                        <textarea ref={textareaRef} value={dataInput} onChange={(e) => setDataInput(e.target.value)} placeholder="请先运行 iOS 快捷指令，然后点右上角粘贴..." className="w-full h-36 bg-[#F8FAFC] border-2 border-transparent focus:border-rose-300 rounded-3xl p-5 text-base text-slate-700 outline-none resize-none placeholder:text-slate-400 transition-all" />
                        {dataInput && <div className="absolute bottom-4 right-4 text-xs text-emerald-600 font-bold bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> 已获取</div>}
                    </div>
                    {step === 1 && dataInput && <button onClick={() => setStep(2)} className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4.5 rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-lg">下一步：确认状态 <ArrowRight className="w-5 h-5" /></button>}
                </div>
            </section>

            {/* Step 2 */}
            {step >= 2 && (
                <section ref={step2Ref} className="animate-in slide-in-from-bottom-12 duration-700 fade-in fill-mode-forwards">
                    <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/40 border border-white space-y-8">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                            <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">2</span>
                            <h3 className="text-xl font-extrabold text-slate-800">当前状态</h3>
                        </div>
                        
                        <div>
                            <label className="text-sm font-bold text-slate-500 block mb-3 pl-1">正在做什么?</label>
                            <input type="text" value={userContext.currentActivity} onChange={(e) => setUserContext({...userContext, currentActivity: e.target.value})} placeholder="如: 刚起床、坐地铁、发呆" className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-amber-300 rounded-2xl p-4 text-lg text-slate-800 outline-none transition-all placeholder:text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-500 block mb-3 pl-1">身体感受 (多选)</label>
                                <div className="flex flex-wrap gap-3">
                                        {physicalOptions.map(opt => (
                                            <button key={opt.v} onClick={() => toggleState('physicalState', opt.v)} 
                                                className={`px-5 py-3 rounded-2xl text-base font-bold transition-all border-2 ${userContext.physicalState.includes(opt.v) ? opt.activeClass : 'bg-[#F8FAFC] border-transparent text-slate-400 hover:bg-slate-50'}`}>
                                                {opt.l}
                                            </button>
                                        ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-500 block mb-3 pl-1">精神状态 (多选)</label>
                                <div className="flex flex-wrap gap-3">
                                        {mentalOptions.map(opt => (
                                            <button key={opt.v} onClick={() => toggleState('mentalState', opt.v)} 
                                                className={`px-5 py-3 rounded-2xl text-base font-bold transition-all border-2 ${userContext.mentalState.includes(opt.v) ? opt.activeClass : 'bg-[#F8FAFC] border-transparent text-slate-400 hover:bg-slate-50'}`}>
                                                {opt.l}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-500 block mb-3 pl-1">预估睡觉时间</label>
                            <input type="time" value={userContext.sleepTime} onChange={(e) => setUserContext({...userContext, sleepTime: e.target.value})} className="w-full bg-[#F8FAFC] border-2 border-transparent focus:border-blue-300 rounded-2xl p-4 text-xl text-slate-800 outline-none text-center font-mono" />
                        </div>
                        {step === 2 && <button onClick={() => setStep(3)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4.5 rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-lg">下一步：完善计划 <ArrowRight className="w-5 h-5" /></button>}
                    </div>
                </section>
            )}

            {/* Step 3 */}
            {step >= 3 && (
                <section ref={step3Ref} className="space-y-8 animate-in slide-in-from-bottom-12 duration-700 fade-in pb-20">
                    <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/40 border border-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                <span className="bg-violet-100 text-violet-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">3</span>
                                今日计划
                            </h3>
                            <button onClick={addTask} className="text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"><Plus className="w-4 h-4" /> 加一项</button>
                        </div>
                        <div className="space-y-5">
                            {userContext.tasks.map((task, index) => (
                                <div key={task.id} className="bg-[#FDFDFD] p-5 rounded-3xl border border-slate-100 shadow-sm relative group hover:border-violet-200 transition-colors">
                                    <div className="mb-5 flex gap-3 items-center">
                                        <input type="text" value={task.name} onChange={(e) => updateTask(task.id, 'name', e.target.value)} placeholder="输入事项名称 (如: 写年度总结)" className="w-full bg-transparent border-b-2 border-slate-100 pb-2 text-lg font-bold text-slate-800 focus:border-violet-400 outline-none placeholder:text-slate-300 placeholder:font-normal transition-colors" />
                                        <button onClick={() => handleSmartEstimate(task.id, index)} className="p-3 bg-violet-50 rounded-2xl text-violet-500 hover:bg-violet-100 active:scale-90 transition-all shadow-sm" title="AI 智能估时">
                                            {estimatingIndex === index ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-slate-400 pl-1">计划耗时</span>
                                            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                                                <div className="flex-1 flex items-center justify-center">
                                                    <input type="number" value={task.durationHour} onChange={(e) => updateTask(task.id, 'durationHour', e.target.value)} placeholder="0" className="w-full text-center bg-transparent text-lg font-bold text-slate-700 outline-none" />
                                                    <span className="text-xs text-slate-400 mr-2">时</span>
                                                </div>
                                                <div className="w-px h-6 bg-slate-200"></div>
                                                <div className="flex-1 flex items-center justify-center">
                                                    <input type="number" value={task.durationMin} onChange={(e) => updateTask(task.id, 'durationMin', e.target.value)} placeholder="0" className="w-full text-center bg-transparent text-lg font-bold text-slate-700 outline-none" />
                                                    <span className="text-xs text-slate-400 mr-2">分</span>
                                                </div>
                                                <div className="w-px h-6 bg-slate-200"></div>
                                                <div className="flex-1 flex items-center justify-center">
                                                    <input type="number" value={task.durationSec} onChange={(e) => updateTask(task.id, 'durationSec', e.target.value)} placeholder="0" className="w-full text-center bg-transparent text-lg font-bold text-slate-700 outline-none" />
                                                    <span className="text-xs text-slate-400 mr-2">秒</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-slate-400 pl-1">工作流模式</span>
                                            <div className="relative">
                                                <select value={task.workflowId} onChange={(e) => updateTask(task.id, 'workflowId', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-10 text-base text-slate-600 font-medium outline-none appearance-none">
                                                    <option value="">🚫 普通任务 (不绑定)</option>
                                                    {userContext.pomodoroSettings.map(s => <option key={s.id} value={s.id}>⏱ {s.name} ({s.work}m/{s.rest}m)</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"/>
                                            </div>
                                        </div>
                                    </div>
                                    {userContext.tasks.length > 1 && <button onClick={() => removeTask(task.id)} className="absolute -top-3 -right-3 bg-white text-rose-400 border border-rose-100 rounded-full p-2 shadow-md opacity-100 hover:bg-rose-50 transition-all"><X className="w-5 h-5"/></button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/40 border border-white">
                        <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2"><Timer className="w-5 h-5 text-blue-500" /> 工作流预设</h3>
                        <button onClick={addPomodoro} className="text-xs text-blue-500 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full font-bold transition-colors">+ 新增</button>
                        </div>
                        <div className="space-y-4">
                            {userContext.pomodoroSettings.map((s) => (
                                <div key={s.id} className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-50">
                                    <input value={s.name} onChange={(e) => updatePomodoro(s.id, 'name', e.target.value)} className="w-full sm:w-32 bg-transparent text-base font-bold text-slate-700 outline-none border-b-2 border-transparent focus:border-blue-200 placeholder:text-slate-300" placeholder="名称" />
                                    <div className="flex gap-3 w-full">
                                        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400">忙</span>
                                            <input type="number" value={s.work} onChange={(e) => updatePomodoro(s.id, 'work', e.target.value)} className="w-full text-center text-lg font-bold text-slate-700 outline-none bg-transparent" />
                                            <span className="text-xs font-bold text-slate-300">m</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400">休</span>
                                            <input type="number" value={s.rest} onChange={(e) => updatePomodoro(s.id, 'rest', e.target.value)} className="w-full text-center text-lg font-bold text-slate-700 outline-none bg-transparent" />
                                            <span className="text-xs font-bold text-slate-300">m</span>
                                        </div>
                                    </div>
                                    {userContext.pomodoroSettings.length > 1 && <button onClick={() => removePomodoro(s.id)} className="text-slate-300 hover:text-red-400 p-2"><Trash2 className="w-5 h-5"/></button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold py-5 rounded-[2rem] shadow-2xl shadow-slate-300 active:scale-95 transition-all flex items-center justify-center gap-3 text-xl">
                        {isAnalyzing ? <Loader2 className="w-7 h-7 animate-spin"/> : <Sparkles className="w-7 h-7"/>}
                        {isAnalyzing ? "正在精心编织..." : "生成今日行动指南"}
                    </button>
                </section>
            )}
          </div>
        )}

        {/* Report View */}
        {activeTab === 'report' && analysisResult && (
          <div className="space-y-8 animate-in slide-in-from-bottom-12 pb-40 fade-in">
            
            {/* Daily Reviews */}
            <div className="bg-white rounded-[2.5rem] p-7 shadow-lg shadow-slate-200/50 border border-white">
               <div className="flex items-center justify-between mb-8 bg-slate-50 p-1.5 rounded-2xl">
                  <button onClick={() => setReviewTab('dayBefore')} className={`flex-1 text-sm font-bold py-3.5 rounded-xl transition-all ${reviewTab==='dayBefore'?'bg-white shadow-sm text-slate-800':'text-slate-400'}`}>前天</button>
                  <button onClick={() => setReviewTab('yesterday')} className={`flex-1 text-sm font-bold py-3.5 rounded-xl transition-all ${reviewTab==='yesterday'?'bg-white shadow-sm text-amber-600':'text-slate-400'}`}>昨天</button>
                  <button onClick={() => setReviewTab('today')} className={`flex-1 text-sm font-bold py-3.5 rounded-xl transition-all ${reviewTab==='today'?'bg-white shadow-sm text-indigo-600':'text-slate-400'}`}>今天</button>
               </div>
               {(() => {
                   const review = getCurrentReview();
                   if (!review) return <div className="text-center text-slate-400 py-12 text-lg font-medium">暂无该日数据</div>;
                   return (
                       <div className="animate-in fade-in zoom-in-95 duration-500">
                           <div className="text-center mb-8">
                               <h4 className="text-xl font-bold text-slate-700 flex items-center justify-center gap-3"><Calendar className="w-6 h-6 text-slate-400" />{review.date}</h4>
                           </div>
                           
                           <SimplePieChart data={review.stats} />

                           <div className="mt-10 bg-[#F8FAFC] p-6 rounded-3xl border border-slate-50 text-base text-slate-600 leading-8 text-justify tracking-wide">
                               {review.analysis}
                           </div>
                       </div>
                   );
               })()}
            </div>

            {/* Today's Plan */}
            {analysisResult.today_plan && (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-white overflow-hidden">
                    <div className="p-8 bg-gradient-to-br from-[#E0F2F1] to-[#E8EAF6] relative">
                        <div className="flex items-center justify-between mb-5 opacity-80">
                            <div className="flex items-center gap-2">
                                <Sunrise className="w-6 h-6 text-slate-700" />
                                <span className="text-base font-bold uppercase tracking-wider text-slate-700">{analysisResult.today_plan.date}</span>
                            </div>
                            
                            {/* BGM 推荐 */}
                            <div className="flex items-center gap-2">
                                {bgmAdvice && <span className="text-xs bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-indigo-600 font-bold animate-in fade-in shadow-sm">{bgmAdvice}</span>}
                                <button onClick={handleGetBGM} disabled={bgmLoading} className="bg-white/80 p-2.5 rounded-full text-indigo-600 shadow-sm active:scale-90 hover:bg-white transition-all">
                                    {bgmLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Music className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <p className="text-lg font-medium leading-relaxed text-slate-800">"{analysisResult.today_plan.overall_advice}"</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {analysisResult.today_plan.blocks?.map((block, bIdx) => (
                            <div key={bIdx} className="relative pl-6 border-l-4 border-slate-100">
                                <div className={`p-6 rounded-3xl ${getBlockStyle(block.type)} transition-transform hover:scale-[1.01] relative group shadow-sm`}>
                                    
                                    <button 
                                        onClick={() => handleDeleteBlock(bIdx)}
                                        className="absolute -top-3 -right-3 bg-white text-slate-300 hover:text-red-400 border border-slate-100 rounded-full p-2.5 shadow-md z-10"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2 bg-white/60 px-3.5 py-2 rounded-2xl text-base font-mono font-bold opacity-90 backdrop-blur-sm shadow-sm">
                                            <Clock className="w-5 h-5" /> {block.time}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(block.type === 'focus' || block.type === 'routine') && !breakdownStates[bIdx] && (
                                                <button onClick={() => handleMagicBreakdown(block, bIdx)} className="bg-white/70 p-2.5 rounded-xl text-indigo-500 shadow-sm active:scale-90 hover:bg-white transition-all">
                                                    {loadingBreakdown === bIdx ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                                </button>
                                            )}
                                            <span className="text-xs font-bold uppercase opacity-60 bg-white/50 px-3 py-1.5 rounded-full tracking-wide">{block.type}</span>
                                        </div>
                                    </div>
                                    
                                    <h4 className="font-bold text-xl mb-3 text-slate-800/90">{block.activity}</h4>

                                    {block.sub_schedule && block.sub_schedule.length > 0 ? (
                                        <div className="space-y-3 mt-5 bg-white/50 p-5 rounded-2xl border border-white/20">
                                            {block.sub_schedule.map((sub, sIdx) => (
                                                <div key={sIdx} className="flex gap-4 text-sm opacity-90 items-start">
                                                    <span className="font-mono opacity-60 min-w-[75px] pt-0.5 font-bold">{sub.time}</span>
                                                    <div className="flex-1">
                                                        <span className={`leading-relaxed font-medium ${sub.label.includes('过渡') ? 'text-indigo-600 font-bold' : ''}`}>{sub.label}</span>
                                                    </div>
                                                    {sub.label.includes('过渡') && <MoveRight className="w-5 h-5 text-indigo-400 mt-0.5"/>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-base opacity-80 leading-relaxed font-medium">{block.desc}</p>
                                    )}

                                    {block.actionable_tips && block.actionable_tips.length > 0 && (
                                        <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap gap-2.5">
                                            {block.actionable_tips.map((tip, tIdx) => (
                                                <span key={tIdx} className="text-sm font-bold px-3.5 py-2 bg-white/70 rounded-xl flex items-center gap-2 text-slate-600 shadow-sm">
                                                    {block.type === 'rest' ? <Heart className="w-4 h-4 text-emerald-500"/> : <CheckCircle className="w-4 h-4 opacity-50"/>}
                                                    {tip}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {breakdownStates[bIdx] && (
                                        <div className="mt-5 bg-white/90 p-5 rounded-2xl text-sm space-y-3 border border-white shadow-sm animate-in fade-in">
                                            <div className="text-xs font-bold text-indigo-500 flex items-center gap-2 mb-3 uppercase tracking-wider"><Sparkles className="w-4 h-4"/> 魔法微步骤</div>
                                            {breakdownStates[bIdx].map((step, i) => (
                                                <div key={i} className="flex gap-3 text-slate-700 items-start">
                                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-300 shrink-0"></div>
                                                    <span className="leading-relaxed font-medium">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Future Diary */}
            {analysisResult.today_plan && (
                <div ref={diaryRef} className="bg-gradient-to-br from-slate-800 to-indigo-950 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                        <Feather className="w-48 h-48 -mr-8 -mt-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold flex items-center gap-3"><Moon className="w-7 h-7 text-indigo-300" /> 今晚的日记</h3>
                            <button onClick={handleFutureDiary} disabled={diaryLoading} className="text-sm bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 border border-white/10">
                                {diaryLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                {diaryContent ? '重写' : '预演'}
                            </button>
                        </div>
                        {diaryContent ? (
                            <div className="bg-white/10 rounded-3xl p-7 text-lg leading-9 tracking-wide font-medium text-indigo-50 animate-in fade-in slide-in-from-bottom-4 font-serif">
                                {diaryContent}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-indigo-200/60 text-base font-medium">点击生成按钮，提前感受今晚完成任务后的满足感...</div>
                        )}
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-center pb-12">
                <button onClick={handleSavePlan} className="bg-slate-800 text-white font-bold py-5 px-12 rounded-full shadow-2xl shadow-slate-300 active:scale-95 transition-all flex items-center gap-3 text-lg hover:bg-slate-900">
                    <Save className="w-6 h-6" /> 保存并完成
                </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Status Bar */}
      {(userContext.physicalState.length > 0 || userContext.mentalState.length > 0) && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 animate-in slide-in-from-bottom-20 fade-in duration-700">
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-6 py-3.5 flex items-center gap-4 text-sm font-bold text-slate-600">
                  {userContext.physicalState.length > 0 && (
                      <div className="flex gap-1.5">{userContext.physicalState.slice(0,2).map(s=><span key={s} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">{s}</span>)}</div>
                  )}
                  {(userContext.physicalState.length > 0 && userContext.mentalState.length > 0) && <div className="w-px h-5 bg-slate-300"></div>}
                  {userContext.mentalState.length > 0 && (
                      <div className="flex gap-1.5">{userContext.mentalState.slice(0,2).map(s=><span key={s} className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">{s}</span>)}</div>
                  )}
              </div>
              <button onClick={handleEnergyShield} disabled={shieldLoading} className="bg-rose-500 text-white p-4 rounded-full shadow-xl shadow-rose-200 active:scale-90 transition-transform hover:bg-rose-600 ring-4 ring-rose-100">
                  {shieldLoading ? <Loader2 className="w-6 h-6 animate-spin"/> : <ShieldCheck className="w-6 h-6"/>}
              </button>
          </div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}