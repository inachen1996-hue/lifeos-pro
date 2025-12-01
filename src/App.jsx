import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Calendar, ClipboardPaste, Activity, BrainCircuit, 
  AlertCircle, Moon, Briefcase, BookOpen, Gamepad2, Car, Coffee, 
  Heart, Sunrise, Snowflake, Plus, X, Timer, List, Sparkles, 
  ShieldCheck, Loader2, Link2, CheckCircle, Settings, ChevronRight, ArrowRight,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 图标映射
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes('睡') || cat.includes('sleep')) return <Moon className="w-4 h-4" />;
  if (cat.includes('工') || cat.includes('work')) return <Briefcase className="w-4 h-4" />;
  if (cat.includes('学') || cat.includes('study') || cat.includes('读')) return <BookOpen className="w-4 h-4" />;
  if (cat.includes('娱') || cat.includes('play') || cat.includes('game')) return <Gamepad2 className="w-4 h-4" />;
  if (cat.includes('通') || cat.includes('commute')) return <Car className="w-4 h-4" />;
  if (cat.includes('吃') || cat.includes('eat') || cat.includes('饭')) return <Coffee className="w-4 h-4" />;
  if (cat.includes('复') || cat.includes('recovery')) return <Heart className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

// 马卡龙色系样式
const getBlockStyle = (type) => {
  switch (type) {
    case 'focus': return 'bg-[#E0F7FA]/80 border-[#B2EBF2] text-cyan-800 shadow-sm'; // 薄荷蓝
    case 'rest': return 'bg-[#E8F5E9]/80 border-[#C8E6C9] text-emerald-800 shadow-sm'; // 抹茶绿
    case 'recovery': return 'bg-[#FCE4EC]/80 border-[#F8BBD0] text-pink-800 shadow-sm'; // 樱花粉
    case 'routine': return 'bg-[#FFF3E0]/80 border-[#FFE0B2] text-orange-800 shadow-sm'; // 奶油橘
    case 'fun': return 'bg-[#F3E5F5]/80 border-[#E1BEE7] text-purple-800 shadow-sm'; // 香芋紫
    default: return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

export default function App() {
  const [dataInput, setDataInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  
  // UI 状态
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [step, setStep] = useState(1); // 1: Calendar, 2: Status, 3: Plan

  // 功能状态
  const [breakdownStates, setBreakdownStates] = useState({}); 
  const [loadingBreakdown, setLoadingBreakdown] = useState(null); 
  const [shieldLoading, setShieldLoading] = useState(false);
  const [shieldAdvice, setShieldAdvice] = useState(null);

  // 用户上下文
  const [userContext, setUserContext] = useState({
    currentActivity: '',
    physicalState: [], 
    mentalState: [],   
    sleepTime: '23:00',
    // 更新：增加 durationHour 字段
    tasks: [{ id: Date.now(), name: '', durationHour: '', durationMin: '', durationSec: '', workflowId: '' }],
    pomodoroSettings: [
      { id: 1, name: '通用专注', work: 25, rest: 5 },
      { id: 2, name: '深度学习', work: 45, rest: 10 }
    ]
  });

  const [expandedDays, setExpandedDays] = useState({}); 
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const textareaRef = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  // 初始化加载
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_lifeos_key');
    if (savedKey) {
        setUserApiKey(savedKey);
        setShowKeyInput(false);
    } else {
        setShowKeyInput(true);
    }

    const savedContext = localStorage.getItem('gemini_lifeos_context');
    if (savedContext) {
        try {
            const parsed = JSON.parse(savedContext);
            setUserContext(prev => ({ ...prev, ...parsed }));
        } catch (e) { console.error("Context load failed"); }
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

  // 滚动到新步骤
  useEffect(() => {
      if (step === 2 && step2Ref.current) {
          step2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (step === 3 && step3Ref.current) {
          step3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

  // Task & Workflow Logic
  const addTask = () => setUserContext(prev => ({...prev, tasks: [...prev.tasks, { id: Date.now(), name: '', durationHour: '', durationMin: '', durationSec: '', workflowId: '' }]}));
  const removeTask = (id) => { if(userContext.tasks.length > 1) setUserContext(prev => ({...prev, tasks: prev.tasks.filter(t => t.id !== id)})) };
  const updateTask = (id, f, v) => setUserContext(prev => ({...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, [f]: v } : t)}));
  
  const addPomodoro = () => setUserContext(prev => ({...prev, pomodoroSettings: [...prev.pomodoroSettings, { id: Date.now(), name: '新预设', work: 25, rest: 5 }]}));
  const removePomodoro = (id) => setUserContext(prev => ({...prev, pomodoroSettings: prev.pomodoroSettings.filter(p => p.id !== id)}));
  const updatePomodoro = (id, f, v) => setUserContext(prev => ({...prev, pomodoroSettings: prev.pomodoroSettings.map(p => p.id === id ? { ...p, [f]: v } : p)}));

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDataInput(text);
      showMessage("已粘贴！", "success");
    } catch (err) {
      showMessage("无法自动读取，请点击输入框手动粘贴", "error");
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  // Gemini API Logic
  const handleMagicBreakdown = async (block, index) => {
      const finalKey = userApiKey;
      if (!finalKey) return showMessage("需要 API Key", "error");
      setLoadingBreakdown(index);
      try {
          const genAI = new GoogleGenerativeAI(finalKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
          const prompt = `拆解任务: "${block.activity}"。状态: 身体${userContext.physicalState}, 精神${userContext.mentalState}。返回3-5个极简微步骤字符串数组JSON。`;
          const result = await model.generateContent(prompt);
          const steps = JSON.parse(result.response.text());
          setBreakdownStates(prev => ({...prev, [index]: steps}));
      } catch (e) { showMessage("拆解失败", "error"); } finally { setLoadingBreakdown(null); }
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
          const prompt = `用户状态告急：身体${userContext.physicalState}，精神${userContext.mentalState}。给出一个1分钟能做的急救建议（呼吸/拉伸/心理暗示），50字以内，语气温柔。`;
          const result = await model.generateContent(prompt);
          setShieldAdvice(result.response.text());
      } catch (e) { showMessage("启动失败", "error"); } finally { setShieldLoading(false); }
  };

  const handleAnalyze = async () => {
      if (!dataInput.trim()) return showMessage("请先粘贴日历数据", "error");
      if (!userApiKey) return showMessage("请配置 API Key", "error");
      setIsAnalyzing(true); setBreakdownStates({});
      try {
          const genAI = new GoogleGenerativeAI(userApiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
          const todayStr = new Date().toLocaleDateString();
          const structuredTasks = userContext.tasks.filter(t => t.name.trim()).map(t => {
              const flow = userContext.pomodoroSettings.find(p => String(p.id) === String(t.workflowId));
              // 构造时分秒
              const durationStr = `${t.durationHour || 0}时${t.durationMin || 0}分${t.durationSec || 0}秒`;
              return `- 事项: "${t.name}", 耗时: "${durationStr}" ${flow ? `(绑定: ${flow.name} ${flow.work}m/${flow.rest}m)` : ''}`;
          }).join('\n');
          const prompt = `你是一位敏锐的时间管理专家。今天是 ${todayStr}。
          日历数据: ${dataInput}
          状态: 身体${userContext.physicalState}，精神${userContext.mentalState}，预计睡觉${userContext.sleepTime}。
          待办Plan: ${structuredTasks || "无"}
          逻辑: 1.严格执行Plan中绑定的工作流时长。2.负面状态必须插入[心情提升]或[身体修复]活动。3.凌晨归前一天。
          返回JSON: { "daily_reviews": [{ "date": "string", "is_yesterday": bool, "stats": [{"category": "string", "percentage": number, "duration": "string"}], "analysis": "string" }], "today_plan": { "date": "string", "overall_advice": "string", "blocks": [{ "time": "HH:MM-HH:MM", "type": "focus|rest|routine|fun|recovery", "activity": "string", "desc": "string", "sub_schedule": [{"time":"HH:MM-HH:MM", "label":"string"}], "actionable_tips": ["string"] }] } }`;
          const result = await model.generateContent(prompt);
          let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
          const first = text.indexOf('{'), last = text.lastIndexOf('}');
          if (first !== -1 && last !== -1) text = text.substring(first, last+1);
          setAnalysisResult(JSON.parse(text));
          setActiveTab('report');
      } catch (e) { console.error(e); showMessage("分析出错，请重试", "error"); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-slate-700 font-sans pb-32 selection:bg-rose-100 selection:text-rose-900">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-30 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-rose-300 to-orange-300 p-1.5 rounded-lg shadow-sm">
                <BrainCircuit className="text-white w-4 h-4" />
            </div>
            <h1 className="text-base font-bold text-slate-700 tracking-tight">Gemini LifeOS</h1>
          </div>
          {activeTab === 'report' && (
             <button onClick={() => { setActiveTab('input'); setStep(1); }} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
               新的一天
             </button>
          )}
      </div>

      <main className="pt-20 px-4 max-w-md mx-auto space-y-6">
        
        {/* API Key 卡片 (马卡龙风格) */}
        <div className="bg-white/60 rounded-3xl shadow-sm border border-slate-100 overflow-hidden backdrop-blur-sm">
            {showKeyInput ? (
                <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-slate-400">Gemini API Key</label>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] text-rose-400 flex items-center bg-rose-50 px-2 py-1 rounded-full">
                            获取 Key <ChevronRight className="w-3 h-3" />
                        </a>
                    </div>
                    <input 
                        type="password" 
                        value={userApiKey}
                        onChange={handleKeyChange}
                        placeholder="AIza..."
                        className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all" 
                    />
                    {userApiKey && (
                        <button onClick={() => setShowKeyInput(false)} className="mt-4 w-full bg-gradient-to-r from-rose-400 to-orange-400 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-rose-100">
                            保存
                        </button>
                    )}
                </div>
            ) : (
                <div onClick={() => setShowKeyInput(true)} className="p-3 px-4 flex items-center justify-between active:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">已连接大脑</span>
                    </div>
                    <Settings className="w-4 h-4 text-slate-300" />
                </div>
            )}
        </div>

        {/* 状态消息 */}
        {statusMsg.text && (
          <div className={`fixed top-16 left-4 right-4 z-40 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2 ${
            statusMsg.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
            {statusMsg.text}
          </div>
        )}

        {/* 能量护盾弹窗 */}
        {shieldAdvice && (
          <div className="fixed top-20 left-4 right-4 z-50 animate-bounce-in">
             <div className="bg-white/95 backdrop-blur-xl border border-rose-100 p-5 rounded-3xl shadow-2xl ring-1 ring-rose-100 flex items-start gap-4">
                 <div className="bg-rose-50 p-2 rounded-full text-rose-400"><ShieldCheck className="w-6 h-6" /></div>
                 <div className="flex-1">
                    <h4 className="font-bold text-rose-500 text-sm mb-1">能量急救</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{shieldAdvice}</p>
                 </div>
                 <button onClick={() => setShieldAdvice(null)} className="text-slate-300 p-1 hover:text-slate-500"><X className="w-4 h-4" /></button>
             </div>
          </div>
        )}

        {activeTab === 'input' && (
          <div className="space-y-8 pb-10">
            
            {/* Step 1: 日历数据 */}
            <section className={`transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-60 scale-95'}`}>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="bg-rose-100 text-rose-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            日历数据
                        </h3>
                        {!dataInput && (
                            <button onClick={handlePaste} className="text-[10px] bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full font-bold active:scale-95 transition-transform border border-slate-100">
                                粘贴
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            placeholder="请运行 iOS 快捷指令..."
                            className="w-full h-24 bg-[#F8F9FA] border-0 rounded-2xl p-4 text-xs text-slate-600 focus:ring-2 focus:ring-rose-200 outline-none resize-none placeholder:text-slate-300"
                        />
                        {dataInput && <div className="absolute bottom-3 right-3 text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> 已获取</div>}
                    </div>
                    {step === 1 && dataInput && (
                        <button onClick={() => setStep(2)} className="mt-4 w-full bg-slate-800 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                            下一步：确认状态 <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </section>

            {/* Step 2: 状态录入 */}
            {step >= 2 && (
                <section ref={step2Ref} className="animate-in slide-in-from-bottom-8 duration-500 fade-in">
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                            <span className="bg-amber-100 text-amber-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            <h3 className="text-sm font-bold text-slate-700">当前状态</h3>
                        </div>
                        
                        {/* 正在做 */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 pl-1">正在做什么?</label>
                            <input 
                                type="text"
                                value={userContext.currentActivity}
                                onChange={(e) => setUserContext({...userContext, currentActivity: e.target.value})}
                                placeholder="如: 发呆、坐地铁"
                                className="w-full bg-[#F8F9FA] border-0 rounded-2xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                            />
                        </div>

                        {/* 身体 & 精神 */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-2 pl-1">身体感受</label>
                                <div className="flex flex-wrap gap-2">
                                        {[{l:"⚡️充沛",v:"充沛",c:"indigo"},{l:"🙂正常",v:"正常",c:"slate"},{l:"🥱疲惫",v:"疲惫",c:"amber"},{l:"💥腰痛",v:"腰痛",c:"rose"},{l:"🤕头痛",v:"头痛",c:"rose"}].map(opt => (
                                            <button key={opt.v} onClick={() => toggleState('physicalState', opt.v)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                    userContext.physicalState.includes(opt.v)
                                                    ? `bg-${opt.c}-50 border-${opt.c}-200 text-${opt.c}-500 shadow-sm ring-1 ring-${opt.c}-100`
                                                    : 'bg-[#F8F9FA] border-transparent text-slate-400 hover:bg-slate-100'
                                                }`}>
                                                {opt.l}
                                            </button>
                                        ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 block mb-2 pl-1">精神状态</label>
                                <div className="flex flex-wrap gap-2">
                                        {[{l:"🧠专注",v:"专注",c:"violet"},{l:"🌊平静",v:"平静",c:"sky"},{l:"😐一般",v:"一般",c:"slate"},{l:"🔥焦虑",v:"焦虑",c:"orange"},{l:"🕳️空虚",v:"空虚",c:"gray"},{l:"😶‍🌫️涣散",v:"涣散",c:"stone"}].map(opt => (
                                            <button key={opt.v} onClick={() => toggleState('mentalState', opt.v)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                    userContext.mentalState.includes(opt.v)
                                                    ? `bg-${opt.c}-50 border-${opt.c}-200 text-${opt.c}-500 shadow-sm ring-1 ring-${opt.c}-100`
                                                    : 'bg-[#F8F9FA] border-transparent text-slate-400 hover:bg-slate-100'
                                                }`}>
                                                {opt.l}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* 预估睡觉 (移动到这里) */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 pl-1">预估睡觉时间</label>
                            <input 
                                type="time"
                                value={userContext.sleepTime}
                                onChange={(e) => setUserContext({...userContext, sleepTime: e.target.value})}
                                className="w-full bg-[#F8F9FA] border-0 rounded-2xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>

                        {step === 2 && (
                            <button onClick={() => setStep(3)} className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                下一步：完善计划 <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* Step 3: 计划与工作流 */}
            {step >= 3 && (
                <section ref={step3Ref} className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in">
                    
                    {/* 任务清单 */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="bg-violet-100 text-violet-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                今日计划
                            </h3>
                            <button onClick={addTask} className="text-[10px] font-bold text-violet-500 bg-violet-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                                <Plus className="w-3 h-3" /> 加一项
                            </button>
                        </div>
                        <div className="space-y-4">
                            {userContext.tasks.map((task, index) => (
                                <div key={task.id} className="bg-[#FDFDFD] p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] relative group">
                                    <div className="mb-3">
                                        <input type="text" value={task.name} onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                                            placeholder="事项名称 (如: 写报告)" className="w-full bg-transparent border-b border-slate-100 pb-2 text-sm font-medium focus:border-violet-300 outline-none placeholder:text-slate-300" />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {/* 时分秒输入框 */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 shrink-0">计划时间</span>
                                            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1.5 border border-slate-100 flex-1">
                                                <input type="number" value={task.durationHour} onChange={(e) => updateTask(task.id, 'durationHour', e.target.value)}
                                                    placeholder="0" className="w-full text-center bg-transparent text-xs outline-none text-slate-600" />
                                                <span className="text-[10px] text-slate-400">时</span>
                                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                                <input type="number" value={task.durationMin} onChange={(e) => updateTask(task.id, 'durationMin', e.target.value)}
                                                    placeholder="0" className="w-full text-center bg-transparent text-xs outline-none text-slate-600" />
                                                <span className="text-[10px] text-slate-400">分</span>
                                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                                <input type="number" value={task.durationSec} onChange={(e) => updateTask(task.id, 'durationSec', e.target.value)}
                                                    placeholder="0" className="w-full text-center bg-transparent text-xs outline-none text-slate-600" />
                                                <span className="text-[10px] text-slate-400 mr-1">秒</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <select value={task.workflowId} onChange={(e) => updateTask(task.id, 'workflowId', e.target.value)}
                                                className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-[10px] text-slate-500 outline-none appearance-none">
                                                <option value="">默认番茄钟</option>
                                                {userContext.pomodoroSettings.map(s => <option key={s.id} value={s.id}>{s.name} ({s.work}m/{s.rest}m)</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {userContext.tasks.length > 1 && <button onClick={() => removeTask(task.id)} className="absolute -top-2 -right-2 bg-white text-rose-300 border border-rose-100 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 工作流配置 */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Timer className="w-4 h-4 text-blue-400" /> 工作流预设
                        </h3>
                        <button onClick={addPomodoro} className="text-[10px] text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full font-bold">+ 预设</button>
                        </div>
                        <div className="space-y-3">
                            {userContext.pomodoroSettings.map((s) => (
                                <div key={s.id} className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-50">
                                    <input value={s.name} onChange={(e) => updatePomodoro(s.id, 'name', e.target.value)} className="w-20 bg-transparent text-xs font-bold text-slate-600 outline-none border-b border-transparent focus:border-blue-200" />
                                    
                                    {/* 忙碌时间输入 */}
                                    <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5 shadow-sm border border-slate-100">
                                        <span className="text-[10px] text-slate-400">忙</span>
                                        <input type="number" value={s.work} onChange={(e) => updatePomodoro(s.id, 'work', e.target.value)} className="w-8 text-center text-xs font-bold text-slate-600 outline-none bg-transparent" />
                                        <span className="text-[10px] text-slate-300">m</span>
                                    </div>

                                    {/* 休息时间输入 */}
                                    <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5 shadow-sm border border-slate-100">
                                        <span className="text-[10px] text-slate-400">休</span>
                                        <input type="number" value={s.rest} onChange={(e) => updatePomodoro(s.id, 'rest', e.target.value)} className="w-8 text-center text-xs font-bold text-slate-600 outline-none bg-transparent" />
                                        <span className="text-[10px] text-slate-300">m</span>
                                    </div>

                                    {userContext.pomodoroSettings.length > 1 && <button onClick={() => removePomodoro(s.id)} className="text-slate-300 ml-auto p-1"><X className="w-3 h-3"/></button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold py-4 rounded-3xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                        {isAnalyzing ? "正在编织你的一天..." : "生成今日行动指南"}
                    </button>
                </section>
            )}
          </div>
        )}

        {/* 报告展示区域 */}
        {activeTab === 'report' && analysisResult && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 pb-20 fade-in">
            {/* Daily Reviews */}
            {analysisResult.daily_reviews?.map((day, idx) => (
               <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4" onClick={() => toggleDay(day.date)}>
                     <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${day.is_yesterday ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-700">{day.date} {day.is_yesterday && "复盘"}</span>
                     </div>
                     {expandedDays[day.date] ? <ChevronUp className="w-4 h-4 text-slate-300"/> : <ChevronDown className="w-4 h-4 text-slate-300"/>}
                  </div>
                  {expandedDays[day.date] && (
                     <div className="space-y-4 animate-in fade-in">
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                           {day.stats.map((item, sIdx) => (
                              <div key={sIdx} className="flex-shrink-0 bg-[#F8FAFC] p-3 rounded-2xl min-w-[90px] border border-slate-50">
                                 <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">{getCategoryIcon(item.category)} {item.category}</div>
                                 <div className="font-bold text-sm text-slate-700">{item.duration}</div>
                                 <div className="text-[10px] text-slate-300 mt-1">{item.percentage}%</div>
                              </div>
                           ))}
                        </div>
                        <p className="text-xs text-slate-500 leading-7 bg-[#F8FAFC] p-4 rounded-2xl border border-slate-50">{day.analysis}</p>
                     </div>
                  )}
               </div>
            ))}

            {/* Today's Plan */}
            {analysisResult.today_plan && (
                <div className="bg-white rounded-3xl shadow-lg shadow-indigo-50/50 border border-indigo-50/50 overflow-hidden">
                    <div className="p-6 bg-gradient-to-br from-[#E0F2F1] to-[#E8EAF6]">
                        <div className="flex items-center gap-2 mb-3 opacity-60">
                            <Sunrise className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{analysisResult.today_plan.date}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-700">"{analysisResult.today_plan.overall_advice}"</p>
                    </div>

                    <div className="p-5 space-y-5">
                        {analysisResult.today_plan.blocks.map((block, bIdx) => (
                            <div key={bIdx} className="relative pl-4 border-l-2 border-slate-100">
                                <div className={`p-4 rounded-2xl ${getBlockStyle(block.type)} transition-transform hover:scale-[1.01]`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 bg-white/50 px-2.5 py-1 rounded-lg text-xs font-mono font-bold opacity-80 backdrop-blur-sm">
                                            <Clock className="w-3 h-3" /> {block.time}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(block.type === 'focus' || block.type === 'routine') && !breakdownStates[bIdx] && (
                                                <button onClick={() => handleMagicBreakdown(block, bIdx)} className="bg-white/60 p-1.5 rounded-lg text-indigo-400 shadow-sm active:scale-90">
                                                    {loadingBreakdown === bIdx ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                                                </button>
                                            )}
                                            <span className="text-[10px] font-bold uppercase opacity-50 bg-white/40 px-2 py-1 rounded-full">{block.type}</span>
                                        </div>
                                    </div>
                                    
                                    <h4 className="font-bold text-sm mb-2 text-slate-800/90">{block.activity}</h4>
                                    
                                    {block.sub_schedule ? (
                                        <div className="space-y-2 mt-3 bg-white/40 p-3 rounded-xl">
                                            {block.sub_schedule.map((sub, sIdx) => (
                                                <div key={sIdx} className="flex gap-3 text-xs opacity-90">
                                                    <span className="font-mono opacity-50 min-w-[60px]">{sub.time}</span>
                                                    <span>{sub.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs opacity-80 leading-relaxed font-medium">{block.desc}</p>
                                    )}

                                    {breakdownStates[bIdx] && (
                                        <div className="mt-3 bg-white/80 p-3 rounded-xl text-xs space-y-2 border border-white/50 animate-in fade-in">
                                            <div className="text-[10px] font-bold text-indigo-400 flex items-center gap-1"><Sparkles className="w-3 h-3"/> 魔法微步骤</div>
                                            {breakdownStates[bIdx].map((step, i) => (
                                                <div key={i} className="flex gap-2 text-slate-600"><span className="text-indigo-300">•</span> {step}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </main>

      {/* 底部悬浮栏 (智能隐藏) */}
      {(userContext.physicalState.length > 0 || userContext.mentalState.length > 0) && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-5 py-2.5 flex items-center gap-3 text-xs font-bold text-slate-600">
                  {userContext.physicalState.length > 0 && (
                      <div className="flex gap-1">
                          {userContext.physicalState.slice(0,2).map(s=><span key={s} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{s}</span>)}
                      </div>
                  )}
                  {(userContext.physicalState.length > 0 && userContext.mentalState.length > 0) && (
                      <div className="w-px h-3 bg-slate-200"></div>
                  )}
                  {userContext.mentalState.length > 0 && (
                      <div className="flex gap-1">
                          {userContext.mentalState.slice(0,2).map(s=><span key={s} className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{s}</span>)}
                      </div>
                  )}
              </div>
              <button onClick={handleEnergyShield} disabled={shieldLoading} className="bg-rose-400 text-white p-3 rounded-full shadow-lg shadow-rose-200 active:scale-90 transition-transform hover:bg-rose-500">
                  {shieldLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShieldCheck className="w-5 h-5"/>}
              </button>
          </div>
      )}
    </div>
  );
}