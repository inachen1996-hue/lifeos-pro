<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>LifeOS Pro - Macaron v2.5</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        macaron: {
                            pink: '#FFC8DD',
                            blue: '#BDE0FE',
                            green: '#C1E7E3',
                            purple: '#E2C2FF',
                            yellow: '#FFF4BD',
                            orange: '#FFD6A5',
                            cream: '#FFF9F5',
                            text: '#5D576B',
                            dark: '#4A4556'
                        }
                    },
                    fontFamily: {
                        sans: ['"Quicksand"', '"Noto Sans SC"', 'sans-serif'],
                        cute: ['"ZCOOL KuaiLe"', 'cursive'],
                    },
                    fontSize: {
                        'xs': '0.85rem',
                        'sm': '0.95rem',
                        'base': '1.05rem',
                        'lg': '1.15rem',
                        'xl': '1.35rem',
                        '2xl': '1.65rem',
                        '3xl': '2.15rem',
                    },
                    animation: {
                        'in': 'fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        'bounce-slow': 'bounce 3s infinite',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0', transform: 'translateY(10px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Babel Standalone -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
        body {
            background-color: #FFF9F5; /* macaron cream */
            color: #5D576B;
            -webkit-tap-highlight-color: transparent;
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        
        /* Prevent iOS Zoom on Inputs */
        input, textarea, select { font-size: 16px !important; }

        /* Range Slider Styling */
        input[type=range] {
            -webkit-appearance: none;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #5D576B;
            margin-top: -10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 6px;
            cursor: pointer;
            background: #EDE0D4;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- Application Logic -->
    <script type="text/babel" data-type="module">
        import * as React from 'https://esm.sh/react@18.2.0';
        import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
        import { 
          Play, Calendar, ClipboardPaste, Activity, BrainCircuit, 
          AlertCircle, Moon, Briefcase, BookOpen, Gamepad2, Car, Coffee, 
          Heart, Sunrise, Snowflake, Plus, X, Timer, List, Sparkles, 
          ShieldCheck, Loader2, Link2, CheckCircle, Settings, ChevronRight, ArrowRight,
          ChevronDown, ChevronUp, RefreshCw, Clock, PieChart as PieIcon, Save, Trash2,
          Music, MoveRight, Wand2, Feather, Archive, History, BarChart3, CalendarDays,
          Battery, BatteryCharging, BatteryFull, BatteryWarning, Lightbulb, Database,
          Layout, BookMarked, Eraser, Zap, Utensils, TrendingUp, TrendingDown, Minus,
          ToggleLeft, ToggleRight, Scale, Sofa, Footprints, Droplets, Edit3,
          Target, ArrowUpRight, ArrowDownRight, PlusCircle, RefreshCcw, Eye, EyeOff, Key,
          Hourglass, Bath, UtensilsCrossed, FileText, Percent, UserCheck, MessageSquarePlus,
          Sun, MoonStar, User, ArrowLeftRight, FileJson, RotateCcw, PenTool, Check, CheckSquare,
          ThermometerSnowflake, Pill, Stethoscope, AlertTriangle, BedDouble, XCircle, TrendingUp as IconTrendingUp,
          Ban
        } from 'https://esm.sh/lucide-react@0.294.0?deps=react@18.2.0';
        import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

        const { useState, useEffect, useRef, useMemo, useCallback } = React;

        // --- Error Boundary ---
        class ErrorBoundary extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false };
          }
          static getDerivedStateFromError(error) { return { hasError: true }; }
          handleReset = () => { localStorage.clear(); window.location.reload(); }
          render() {
            if (this.state.hasError) {
              return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
                  <div className="bg-red-100 p-6 rounded-full"><AlertCircle className="w-12 h-12 text-red-400" /></div>
                  <h3 className="text-xl font-bold">出了一点小问题</h3>
                  <button onClick={this.handleReset} className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg">重置数据</button>
                </div>
              );
            }
            return this.props.children;
          }
        }

        // --- Utilities ---
        const cleanApiKey = (key) => key ? key.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '') : '';
        const validateApiKey = (key) => { const c = cleanApiKey(key); return c.startsWith('AIza') && c.length > 20; };
        const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const getTodayDate = () => formatDate(new Date());
        const getCurrentTimeStr = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        // Strict Date Helpers (Normalized to 00:00:00)
        const normalizeDate = (d) => {
            const newDate = new Date(d);
            newDate.setHours(0, 0, 0, 0);
            return newDate;
        };

        const getMonday = (d) => {
          d = normalizeDate(d);
          var day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
          return new Date(d.setDate(diff));
        };
        
        const getStartOfMonth = () => { 
            const d = new Date(); 
            return new Date(d.getFullYear(), d.getMonth(), 1); 
        };

        // Improved History Context Extraction
        const getHistoryContext = (fullHistory, scope) => {
            if (!fullHistory) return "";
            const lines = fullHistory.split('\n');
            const today = normalizeDate(new Date());
            
            let startDate, endDate;

            // Define ranges clearly
            if (scope === 'today') {
                startDate = today;
                endDate = today;
            } else if (scope === 'yesterday') {
                const y = new Date(today); y.setDate(y.getDate() - 1);
                startDate = y;
                endDate = y;
            } else if (scope === 'weekly') {
                startDate = getMonday(today);
                endDate = today;
            } else if (scope === 'monthly') {
                startDate = getStartOfMonth();
                endDate = today;
            }

            const filteredLines = [];
            const dateRegex = /(\d{4}-\d{1,2}-\d{1,2})/;

            for (let line of lines) {
                const match = line.match(dateRegex);
                if (match) {
                    const lineDate = normalizeDate(match[1]); // Normalize log date
                    // Strict comparison including boundaries
                    if (lineDate.getTime() >= startDate.getTime() && lineDate.getTime() <= endDate.getTime()) {
                        filteredLines.push(line);
                    }
                }
            }
            return filteredLines.join('\n').slice(0, 50000); 
        };

        const getTargetMultiplier = (scope) => {
            const now = new Date();
            if (scope === 'today' || scope === 'yesterday') return 1;
            if (scope === 'weekly') {
                let day = now.getDay(); if (day === 0) day = 7;
                return day;
            }
            if (scope === 'monthly') {
                return now.getDate();
            }
            return 1;
        };

        // Core function to extract logs within ANY date range (used for dual-fetch review)
        const getLogsInDateRange = (fullHistory, startDate, endDate) => {
            if (!fullHistory) return "";
            const lines = fullHistory.split('\n');
            const filteredLines = [];
            const dateRegex = /(\d{4}-\d{1,2}-\d{1,2})/;
            
            // Normalize boundaries
            const s = normalizeDate(startDate).getTime();
            const e = normalizeDate(endDate).getTime();

            for (let line of lines) {
                const match = line.match(dateRegex);
                if (match) {
                    const d = normalizeDate(match[1]).getTime();
                    if (d >= s && d <= e) filteredLines.push(line);
                }
            }
            return filteredLines.join('\n').slice(0, 50000);
        };

        const getDateRangesForScope = (scope) => {
            const today = normalizeDate(new Date());
            let currentStart, currentEnd = today;
            let prevStart, prevEnd;

            if (scope === 'today') {
                currentStart = today;
                prevStart = new Date(today); prevStart.setDate(prevStart.getDate() - 1);
                prevEnd = prevStart;
            } else if (scope === 'yesterday') {
                currentStart = new Date(today); currentStart.setDate(currentStart.getDate() - 1);
                currentEnd = currentStart;
                prevStart = new Date(currentStart); prevStart.setDate(prevStart.getDate() - 1);
                prevEnd = prevStart;
            } else if (scope === 'weekly') {
                currentStart = getMonday(today);
                prevStart = new Date(currentStart); prevStart.setDate(prevStart.getDate() - 7);
                prevEnd = new Date(currentStart); prevEnd.setDate(prevEnd.getDate() - 1);
            } else if (scope === 'monthly') {
                currentStart = getStartOfMonth();
                prevStart = new Date(currentStart); prevStart.setMonth(prevStart.getMonth() - 1);
                prevEnd = new Date(currentStart); prevEnd.setDate(prevEnd.getDate() - 1);
            }
            return { currentStart, currentEnd, prevStart, prevEnd };
        };

        const getDateRangeDisplay = (scope) => {
            const { currentStart, currentEnd } = getDateRangesForScope(scope);
            return `${formatDate(currentStart)} ~ ${formatDate(currentEnd)}`;
        };

        const callGeminiWithRetry = async (model, prompt, retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try { return await model.generateContent(prompt); } 
            catch (error) { if (i === retries - 1) throw error; await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); }
          }
        };

        const parseJSONSafely = (text) => {
          try { return JSON.parse(text); } 
          catch (e) {
            try { return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '')); } 
            catch (e2) { throw new Error("无法解析 AI 返回的数据"); }
          }
        };

        const CATEGORIES = [
            { id: 'work', label: '工作', color: 'bg-macaron-blue', text: 'text-blue-700' },
            { id: 'study', label: '学习', color: 'bg-macaron-green', text: 'text-teal-700' },
            { id: 'rest', label: '休息', color: 'bg-macaron-pink', text: 'text-pink-700' },
            { id: 'sleep', label: '睡眠', color: 'bg-macaron-purple', text: 'text-purple-700' },
            { id: 'life', label: '生活', color: 'bg-macaron-orange', text: 'text-orange-700' },
            { id: 'entertainment', label: '娱乐', color: 'bg-macaron-yellow', text: 'text-yellow-700' },
            { id: 'trash', label: '作废', color: 'bg-slate-200', text: 'text-slate-400' } // Added Trash
        ];

        // --- Components ---
        const AllocationSlider = ({ label, value, onChange, colorBg, icon: Icon }) => (
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${colorBg} text-slate-700 shadow-inner`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-macaron-dark text-base">{label}</span>
              </div>
              <div className="text-right bg-white px-3 py-1 rounded-lg border border-slate-100">
                <span className="font-mono font-black text-slate-700 text-lg">{value}h</span>
              </div>
            </div>
            <input 
              type="range" min="0" max="12" step="0.5" value={value} 
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        );

        const MacaronProgressBar = ({ label, target, actual, colorBg, colorBar }) => {
            const maxVal = Math.max(target, actual, 1);
            const actualPct = (actual / maxVal) * 100;
            const targetPct = (target / maxVal) * 100;

            return (
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <span className="text-base font-bold text-slate-600 flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${colorBar}`}></div>
                            {label}
                        </span>
                        <div className="text-right">
                             <div className="text-base font-black text-slate-700">{actual}h <span className="text-xs font-normal text-slate-400">/ 目标{target}h</span></div>
                        </div>
                    </div>
                    <div className="h-7 w-full bg-slate-100 rounded-2xl relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 bottom-0 border-r-2 border-dashed border-slate-300 z-10" style={{left: `${Math.min(targetPct, 100)}%`}}></div>
                        <div 
                            className={`h-full rounded-r-2xl transition-all duration-1000 ${colorBar} opacity-90`} 
                            style={{width: `${Math.min(actualPct, 100)}%`}}
                        >
                            <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBwNDAgMGwtNDAtNDB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwKSIvPjwvc3ZnPg==')]"></div>
                        </div>
                    </div>
                </div>
            );
        };

        // --- Main App ---
        function App() {
          const [userApiKey, setUserApiKey] = useState('');
          const [showKeyInput, setShowKeyInput] = useState(false);
          const [activePage, setActivePage] = useState('data'); 
          const [loading, setLoading] = useState({ state: false, text: '', progress: 0, taskType: '', scope: '' });
          const [msg, setMsg] = useState({ type: '', text: '' });

          // State: Data
          const [fullHistory, setFullHistory] = useState('');
          const [tempInput, setTempInput] = useState('');
          const [parsedItems, setParsedItems] = useState([]); 
          const [rawLinesBuffer, setRawLinesBuffer] = useState([]); 
          const [categoryMap, setCategoryMap] = useState({}); 
          const [archivedRange, setArchivedRange] = useState(null);

          const [allocations, setAllocations] = useState({
            work: 8, study: 2, rest: 2, sleep: 7, life: 2.5, entertainment: 2.5 
          });
          const [isOrganizing, setIsOrganizing] = useState(false);

          // State: Review
          const [reviewScope, setReviewScope] = useState('today');
          const [reviewResults, setReviewResults] = useState({ today: null, yesterday: null, weekly: null, monthly: null });

          // State: Status
          const [userState, setUserState] = useState({ physical: 'normal', mental: 'calm' });
          const [bioState, setBioState] = useState({
            wakeTime: '08:00', sleepTime: '23:30',
            hadBreakfast: false, hadLunch: false, hadDinner: false,
            washedMorning: false, washedEvening: false
          });
          const [planInput, setPlanInput] = useState('');

          // State: Plan
          const [todayPlan, setTodayPlan] = useState(null);

          // --- Lifecycle ---
          useEffect(() => {
            const savedKey = localStorage.getItem('lifeos_pro_key'); if (savedKey) setUserApiKey(savedKey);
            const savedAlloc = localStorage.getItem('lifeos_pro_allocations_v2'); if (savedAlloc) setAllocations(JSON.parse(savedAlloc));
            const savedHist = localStorage.getItem('lifeos_pro_history_v2'); if (savedHist) setFullHistory(savedHist);
            const savedBio = localStorage.getItem('lifeos_pro_bio_v2'); if (savedBio) setBioState(JSON.parse(savedBio));
            const savedCatMap = localStorage.getItem('lifeos_pro_category_map'); if (savedCatMap) setCategoryMap(JSON.parse(savedCatMap));
          }, []);

          useEffect(() => { localStorage.setItem('lifeos_pro_allocations_v2', JSON.stringify(allocations)); }, [allocations]);
          useEffect(() => { localStorage.setItem('lifeos_pro_history_v2', fullHistory); }, [fullHistory]);
          useEffect(() => { localStorage.setItem('lifeos_pro_bio_v2', JSON.stringify(bioState)); }, [bioState]);
          useEffect(() => { localStorage.setItem('lifeos_pro_category_map', JSON.stringify(categoryMap)); }, [categoryMap]);

          const showToast = (text, type = 'success') => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3000); };
          const toggleBio = (key) => setBioState(prev => ({ ...prev, [key]: !prev[key] }));

          // --- Logic ---

          const parseRawInput = (text) => {
             const lines = text.split('\n');
             const dateRegex = /(\d{4}-\d{1,2}-\d{1,2})/;
             
             const descCleaner = (str) => str
                .replace(/(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\+\d{2}:\d{2})?)|(\d{4}-\d{1,2}-\d{1,2})/g, '') // dates
                .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // emoji
                .replace(/[｜|\[\]\(\)\【\】]/g, '') // symbols
                .trim();

             const allItems = [];
             const uniqueReviewMap = new Map();

             lines.forEach((line, idx) => {
                 if (line.trim().length === 0) return;
                 const match = line.match(dateRegex);
                 const date = match ? match[1] : getTodayDate();
                 const cleanDesc = descCleaner(line);
                 
                 let cat = 'life';
                 if (categoryMap[cleanDesc]) {
                     cat = categoryMap[cleanDesc];
                 } else {
                     if (line.includes('工作') || line.includes('会议') || line.includes('work')) cat = 'work';
                     else if (line.includes('学习') || line.includes('study') || line.includes('阅读')) cat = 'study';
                     else if (line.includes('睡觉') || line.includes('sleep')) cat = 'sleep';
                     else if (line.includes('休息') || line.includes('rest')) cat = 'rest';
                     else if (line.includes('游戏') || line.includes('娱乐')) cat = 'entertainment';
                 }

                 const item = { id: Date.now() + idx, original: line, date: date, desc: cleanDesc, category: cat };
                 allItems.push(item);

                 // De-duplication: only add if description is unique in this batch AND not already categorized
                 if (cleanDesc && !uniqueReviewMap.has(cleanDesc) && !categoryMap[cleanDesc]) {
                     uniqueReviewMap.set(cleanDesc, item);
                 }
             });

             setRawLinesBuffer(allItems);
             setParsedItems(Array.from(uniqueReviewMap.values()));
             
             if(allItems.length === 0) showToast('未能识别有效内容', 'error');
             else if (Array.from(uniqueReviewMap.values()).length === 0) {
                 showToast('所有条目已自动匹配历史分类，可直接归档');
             }
          };

          const updateReviewItemCategory = (id, newCat) => {
              setParsedItems(prev => prev.map(item => item.id === id ? { ...item, category: newCat } : item));
          };

          const handleConfirmArchive = () => {
              if (rawLinesBuffer.length === 0) return;
              const newMap = { ...categoryMap };
              
              // Only update map for non-trash items
              parsedItems.forEach(item => { 
                  if (item.desc && item.category !== 'trash') {
                      newMap[item.desc] = item.category; 
                  }
              });

              let minDate = rawLinesBuffer[0].date, maxDate = rawLinesBuffer[0].date;
              const finalLines = [];
              
              rawLinesBuffer.forEach(item => {
                  // Determine category: User selection > History Map > Auto-guess
                  // Note: parsedItems only contains *some* items. We need to check if user updated it there.
                  const userOverrideItem = parsedItems.find(p => p.desc === item.desc); // Simple match
                  let finalCategory = item.category;

                  if (userOverrideItem) {
                      finalCategory = userOverrideItem.category;
                  } else if (newMap[item.desc]) {
                      finalCategory = newMap[item.desc];
                  }

                  // TRASH LOGIC: If category is trash, SKIP IT
                  if (finalCategory === 'trash') return;

                  const prefix = `[${finalCategory.toUpperCase()}]`; 
                  if (item.date < minDate) minDate = item.date;
                  if (item.date > maxDate) maxDate = item.date;
                  finalLines.push(`${prefix} ${item.original}`);
              });

              setCategoryMap(newMap);
              // Only append if there are valid lines
              if (finalLines.length > 0) {
                  setFullHistory(prev => (prev ? prev + "\n" + finalLines.join('\n') : finalLines.join('\n')));
                  setArchivedRange(`${minDate} ~ ${maxDate}`);
                  showToast(`成功归档 ${finalLines.length} 条记录`);
              } else {
                  showToast('所有条目均已作废，无数据写入');
              }

              setParsedItems([]);
              setRawLinesBuffer([]);
              setTempInput('');
          };
          
          const handleOrganizeData = async () => {
            if (!userApiKey) { setShowKeyInput(true); return; }
            if (!tempInput.trim()) return showToast("请输入内容", "error");
            setIsOrganizing(true);
            try {
              const genAI = new GoogleGenerativeAI(userApiKey);
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
              const prompt = `Task: Format logs to: YYYY-MM-DD: [Time Range] Task (Duration).\nInput: "${tempInput}"\nInfer missing info.`;
              const result = await callGeminiWithRetry(model, prompt);
              setTempInput(result.response.text());
              parseRawInput(result.response.text());
              showToast("整理完成，请下方校对分类");
            } catch (e) { showToast("整理失败", "error"); } 
            finally { setIsOrganizing(false); }
          };

          const generateReview = async (scope = reviewScope) => {
            if (!userApiKey) { setShowKeyInput(true); return; }
            setLoading({ state: true, text: '正在用心分析...', progress: 10, taskType: 'review', scope });
            let p = 10;
            const timer = setInterval(() => { p += 5; if(p>90) p=90; setLoading(prev => ({...prev, progress: p})); }, 200);

            const { currentStart, currentEnd, prevStart, prevEnd } = getDateRangesForScope(scope);
            const currentData = getLogsInDateRange(fullHistory, currentStart, currentEnd);
            const prevData = getLogsInDateRange(fullHistory, prevStart, prevEnd);

            const mapStr = JSON.stringify(categoryMap);

            try {
              const genAI = new GoogleGenerativeAI(userApiKey);
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });
              const prompt = `
                Role: Caring Life Analyst.
                Scope: ${scope.toUpperCase()}
                Targets: ${JSON.stringify(allocations)}
                
                **User Category Map (Habits)**: ${mapStr}
                
                **Data Set 1 (Current Period)**:
                """${currentData}"""
                
                **Data Set 2 (Previous Period for Comparison)**:
                """${prevData}"""
                
                Task: 
                1. Analyze time usage for Current Period.
                2. Compare with Previous Period (Week-over-Week or Month-over-Month).
                3. **SUMMARY Style**: Use declarative sentences to describe objective facts in Chinese (e.g. "本周工作时长达30小时，较上周增加10%").
                
                Output JSON:
                {
                  "summary": "String (Objective Fact)",
                  "actual_allocation": { "work": number, "study": number, "rest": number, "sleep": number, "life": number, "entertainment": number },
                  "insights": ["Insight 1", "Insight 2"],
                  "growth_metric": { "label": "String (e.g. 周环比)", "value": "String (e.g. +10%)", "trend": "up|down|neutral" },
                  "key_metric": { "label": "String", "value": "String" }
                }
              `;
              const result = await callGeminiWithRetry(model, prompt);
              const data = parseJSONSafely(result.response.text());
              setReviewResults(prev => ({ ...prev, [scope]: data }));
              showToast(`${scope}复盘已更新`);
            } catch (e) { showToast('分析失败', 'error'); } 
            finally { clearInterval(timer); setLoading({ state: false, text: '', progress: 0, taskType: '', scope: '' }); }
          };

          const generatePlan = async () => {
            if (!userApiKey) { setShowKeyInput(true); return; }
            setLoading({ state: true, text: '正在编织美好的一天...', progress: 10, taskType: 'plan' });
            let p = 10;
            const timer = setInterval(() => { p += 2; if(p>95) p=95; setLoading(prev => ({...prev, progress: p})); }, 100);
            setActivePage('plan');

            try {
              const genAI = new GoogleGenerativeAI(userApiKey);
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025", generationConfig: { responseMimeType: "application/json" } });

              const isPain = ['back_pain', 'stomach_pain'].includes(userState.physical);
              const isNegativeState = isPain || ['tired'].includes(userState.physical) || ['anxious', 'scattered'].includes(userState.mental);

              const prompt = `
                Current Time: ${getCurrentTimeStr()}, Date: ${getTodayDate()}
                User Bio: ${JSON.stringify(bioState)}
                User State: ${JSON.stringify(userState)}
                User Special Task Request: "${planInput}"
                Targets: ${JSON.stringify(allocations)}
                Language: Chinese (Mandarin)
                
                CRITICAL RULES:
                1. **Special Task Duration = PURE FOCUS TIME**: 
                   - Interpret user's input duration (e.g., "1 hour") as **PURE FOCUS**.
                   - **ADD BREAKS** on top of this time.
                   - Example Calculation: "Work 1h" = 60m focus.
                     * Block Structure: 25m Focus + 5m Break + 25m Focus + 5m Break + 10m Focus.
                     * Total Block Duration: 70 mins.
                2. **Pomodoro Split**:
                   - For ALL Work/Study blocks, generate "sub_blocks".
                   - Pattern: Focus (25m) -> Break (5m).
                   - Insert "15-20min Long Break" after 4 consecutive Focus cycles.
                3. **Sleep Boundary**: Plan strictly ends at ${bioState.sleepTime}.
                4. **Bio-Check**: 
                   - If washedMorning=false, MUST insert "Morning Routine". 
                   - If hadBreakfast/Lunch/Dinner=false and time is appropriate, MUST insert Meal block.
                5. **Pain Management**: If 'back_pain'/'stomach_pain', insert specific relief actions.
                
                Output JSON:
                {
                  "theme_title": "String",
                  "advice": "String",
                  "blocks": [
                    { 
                      "time": "HH:MM - HH:MM", 
                      "category": "work|study|rest|sleep|life|entertainment", 
                      "title": "String", 
                      "desc": "String", 
                      "sub_blocks": [ { "time": "HH:MM", "label": "Focus/Break", "detail": "String" } ],
                      "energy_required": "high|low" 
                    }
                  ]
                }
              `;

              const result = await callGeminiWithRetry(model, prompt);
              setTodayPlan(parseJSONSafely(result.response.text()));
              showToast('今日计划已生成');
            } catch (e) { showToast('生成失败', 'error'); setActivePage('status'); } 
            finally { clearInterval(timer); setLoading({ state: false, text: '', progress: 0, taskType: '' }); }
          };

          const calculatePlanStats = () => {
              if (!todayPlan || !todayPlan.blocks) return null;
              const stats = { work: 0, study: 0, rest: 0, sleep: 0, life: 0, entertainment: 0 };
              todayPlan.blocks.forEach(b => {
                  if (stats[b.category] !== undefined) {
                      const times = b.time.split(/[-~]/);
                      if (times.length === 2) {
                          const [h1, m1] = times[0].split(':').map(Number);
                          const [h2, m2] = times[1].split(':').map(Number);
                          let dur = (h2 + m2/60) - (h1 + m1/60);
                          if (dur < 0) dur += 24;
                          stats[b.category] += dur;
                      }
                  }
              });
              return stats;
          };
          
          const renderPlanAnalysis = () => {
              const stats = calculatePlanStats();
              if (!stats) return null;
              const diffs = [ { k: 'work', l: '工作', t: allocations.work }, { k: 'study', l: '学习', t: allocations.study } ];
              return (
                  <div className="bg-white/80 p-4 rounded-2xl mb-4 border border-macaron-blue/30 shadow-sm flex justify-around">
                      {diffs.map(d => {
                          const actual = stats[d.k];
                          const diff = actual - d.t;
                          return (
                              <div key={d.k} className="text-center">
                                  <div className="text-xs font-bold text-slate-400 uppercase">{d.l}达成率</div>
                                  <div className={`text-lg font-black ${diff >= -0.5 ? 'text-macaron-dark' : 'text-rose-400'}`}>
                                      {actual.toFixed(1)}h <span className="text-xs font-normal text-slate-400">/ {d.t}h</span>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )
          };

          const renderDataPage = () => (
            <div className="space-y-6 animate-in pb-28">
              <div className="bg-gradient-to-br from-macaron-blue/40 to-macaron-purple/40 p-6 rounded-[2rem] border border-white shadow-sm relative">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-macaron-dark flex items-center gap-2">
                      <Target className="w-6 h-6 text-indigo-500"/> 理想配比
                    </h2>
                    <div className="bg-white/50 px-3 py-1 rounded-lg text-sm font-black text-slate-600">
                        Total: {Object.values(allocations).reduce((a,b)=>a+b, 0)}h / 24h
                    </div>
                </div>
                <AllocationSlider label="工作" value={allocations.work} icon={Briefcase} colorBg="bg-macaron-blue" onChange={(v)=>setAllocations({...allocations, work: v})} />
                <AllocationSlider label="学习" value={allocations.study} icon={BookOpen} colorBg="bg-macaron-green" onChange={(v)=>setAllocations({...allocations, study: v})} />
                <AllocationSlider label="休息" value={allocations.rest} icon={Coffee} colorBg="bg-macaron-pink" onChange={(v)=>setAllocations({...allocations, rest: v})} />
                <AllocationSlider label="睡眠" value={allocations.sleep} icon={Moon} colorBg="bg-macaron-purple" onChange={(v)=>setAllocations({...allocations, sleep: v})} />
                <AllocationSlider label="生活" value={allocations.life} icon={Utensils} colorBg="bg-macaron-orange" onChange={(v)=>setAllocations({...allocations, life: v})} />
                <AllocationSlider label="娱乐" value={allocations.entertainment} icon={Gamepad2} colorBg="bg-macaron-yellow" onChange={(v)=>setAllocations({...allocations, entertainment: v})} />
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-xl font-bold text-macaron-dark flex items-center gap-2"><Database className="w-6 h-6 text-slate-400"/> 数据源</h2>
                   <div className="flex gap-2">
                       <button onClick={()=>parseRawInput(tempInput)} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">识别条目</button>
                       <button onClick={handleOrganizeData} disabled={isOrganizing} className="text-xs font-bold bg-macaron-purple text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors flex items-center gap-1">
                         {isOrganizing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>} AI 整理
                       </button>
                   </div>
                </div>
                {archivedRange && (
                    <div className="mb-4 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in">
                        <CheckCircle className="w-4 h-4"/> 已归档: {archivedRange}
                    </div>
                )}
                <textarea 
                  className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-base font-mono text-slate-600 focus:border-macaron-blue outline-none resize-none mb-3"
                  placeholder="粘贴日程 (例如: 2023-10-27: 开会 2h)..."
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                />
                {parsedItems.length > 0 && (
                    <div className="mt-6 border-t border-slate-100 pt-4 animate-in">
                        <h3 className="text-base font-bold text-macaron-dark mb-3 flex items-center gap-2"><PenTool className="w-4 h-4"/> 归类校对 <span className="text-xs font-normal text-slate-400">(自动隐藏已记忆条目)</span></h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {parsedItems.map(item => (
                                <div key={item.id} className={`flex flex-col p-3 rounded-xl border transition-all ${item.category === 'trash' ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex justify-between">
                                        <div className="text-xs text-slate-400 mb-1 font-mono">{item.date}</div>
                                        {/* Added Trash Button */}
                                        <button onClick={() => updateReviewItemCategory(item.id, 'trash')} className={`p-1 rounded-full ${item.category === 'trash' ? 'bg-red-100 text-red-500' : 'text-slate-300 hover:bg-slate-100'}`}>
                                            <Ban className="w-4 h-4"/>
                                        </button>
                                    </div>
                                    <div className={`text-sm font-medium mb-2 truncate ${item.category === 'trash' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.original}</div>
                                    
                                    {/* Hide buttons if trash, or show to allow recovery */}
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar opacity-100 transition-opacity">
                                        {CATEGORIES.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => updateReviewItemCategory(item.id, cat.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${item.category === cat.id ? `${cat.color} ${cat.text} shadow-sm ring-1 ring-inset ring-black/5` : 'bg-white text-slate-400 border border-slate-200'}`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleConfirmArchive} className="w-full mt-4 py-4 bg-macaron-dark text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-300/50">
                            <Save className="w-5 h-5"/> 确认归档并记忆
                        </button>
                    </div>
                )}
                {parsedItems.length === 0 && rawLinesBuffer.length > 0 && (
                     <div className="mt-4 p-4 bg-emerald-50 rounded-2xl text-emerald-600 text-center font-bold text-sm">
                         所有条目均已自动匹配历史习惯，点击下方确认归档
                         <button onClick={handleConfirmArchive} className="mt-2 w-full py-3 bg-emerald-500 text-white rounded-xl">直接归档</button>
                     </div>
                )}
              </div>
            </div>
          );

          const renderReviewPage = () => {
            const isLoading = loading.state && loading.taskType === 'review' && loading.scope === reviewScope;
            const data = reviewResults[reviewScope];
            const dateRangeStr = getDateRangeDisplay(reviewScope);
            const multiplier = getTargetMultiplier(reviewScope);

            return (
            <div className="space-y-6 animate-in pb-28">
              <div className="bg-white p-1.5 rounded-2xl shadow-sm flex gap-1 border border-slate-100 sticky top-24 z-30">
                {['today', 'yesterday', 'weekly', 'monthly'].map(s => (
                  <button key={s} onClick={() => setReviewScope(s)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${reviewScope === s ? 'bg-macaron-purple text-purple-900 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    {s === 'today' ? '今日' : s === 'yesterday' ? '昨日' : s === 'weekly' ? '本周' : '本月'}
                  </button>
                ))}
              </div>

              <div className="text-center -mb-2">
                  <span className="bg-macaron-cream px-4 py-1 rounded-full text-xs font-bold text-macaron-dark border border-macaron-orange/30">
                      📅 {dateRangeStr}
                  </span>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[400px] relative overflow-hidden">
                {isLoading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-20">
                     <Loader2 className="w-12 h-12 text-macaron-purple animate-spin mb-4"/>
                     <p className="text-slate-500 font-bold text-base animate-pulse">{loading.text}</p>
                   </div>
                ) : !data ? (
                  <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                    <div className="w-24 h-24 bg-macaron-cream rounded-full flex items-center justify-center mb-6"><Sparkles className="w-12 h-12 text-macaron-orange"/></div>
                    <p className="text-slate-400 mb-8 font-bold text-lg">生成一份治愈的复盘报告吧</p>
                    <button onClick={() => generateReview(reviewScope)} className="bg-macaron-blue text-blue-900 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">开始生成</button>
                  </div>
                ) : (
                  <div className="p-8 animate-in">
                    <div className="mb-8 space-y-4">
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">{data.growth_metric?.label || "趋势"}</div>
                            <div className={`text-3xl font-black flex items-center gap-2 ${data.growth_metric?.trend === 'up' ? 'text-emerald-500' : data.growth_metric?.trend === 'down' ? 'text-rose-400' : 'text-slate-600'}`}>
                                {data.growth_metric?.trend === 'up' && <IconTrendingUp className="w-6 h-6"/>}
                                {data.growth_metric?.value || "--"}
                            </div>
                        </div>
                        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                             <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">{data.key_metric?.label || "核心指标"}</div>
                             <div className="text-3xl font-black text-purple-800">{data.key_metric?.value}</div>
                        </div>
                    </div>

                    <div className="bg-macaron-cream p-6 rounded-3xl mb-8 border border-orange-100/50 relative">
                        <div className="absolute top-0 left-6 -translate-y-1/2 bg-macaron-orange text-orange-800 px-3 py-1 rounded-full text-xs font-bold">SUMMARY</div>
                        <p className="text-base text-slate-600 leading-relaxed font-medium mt-2">"{data.summary}"</p>
                    </div>

                    {data.insights && (
                        <div className="mb-8 space-y-3">
                            <h4 className="font-bold text-macaron-dark text-base flex items-center gap-2"><Lightbulb className="w-5 h-5 text-macaron-yellow"/> 洞察时刻</h4>
                            {data.insights.map((insight, i) => (
                                <div key={i} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-macaron-purple text-xl leading-none">•</span> {insight}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2">
                      <MacaronProgressBar label="工作" target={allocations.work * multiplier} actual={data.actual_allocation?.work || 0} colorBg="bg-indigo-50" colorBar="bg-macaron-blue" />
                      <MacaronProgressBar label="学习" target={allocations.study * multiplier} actual={data.actual_allocation?.study || 0} colorBg="bg-teal-50" colorBar="bg-macaron-green" />
                      <MacaronProgressBar label="休息" target={allocations.rest * multiplier} actual={data.actual_allocation?.rest || 0} colorBg="bg-pink-50" colorBar="bg-macaron-pink" />
                      <MacaronProgressBar label="睡眠" target={allocations.sleep * multiplier} actual={data.actual_allocation?.sleep || 0} colorBg="bg-slate-50" colorBar="bg-macaron-purple" />
                      <MacaronProgressBar label="生活" target={allocations.life * multiplier} actual={data.actual_allocation?.life || 0} colorBg="bg-orange-50" colorBar="bg-macaron-orange" />
                      <MacaronProgressBar label="娱乐" target={allocations.entertainment * multiplier} actual={data.actual_allocation?.entertainment || 0} colorBg="bg-yellow-50" colorBar="bg-macaron-yellow" />
                    </div>
                    
                    <button onClick={() => generateReview(reviewScope)} className="w-full mt-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4"/> 刷新数据
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          };

          const renderStatusPage = () => {
             const btnClass = (active, color) => `p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${active ? `${color} border-transparent shadow-lg transform scale-105` : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'}`;
             return (
              <div className="space-y-6 animate-in pb-28">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="font-bold text-xl mb-5 text-macaron-dark flex items-center gap-2"><UserCheck className="w-6 h-6 text-macaron-green"/> 生理打卡</h3>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <button onClick={()=>toggleBio('hadBreakfast')} className={btnClass(bioState.hadBreakfast, 'bg-macaron-orange text-orange-900')}><Coffee className="w-6 h-6"/> <span className="text-sm font-bold">早餐</span></button>
                        <button onClick={()=>toggleBio('hadLunch')} className={btnClass(bioState.hadLunch, 'bg-macaron-orange text-orange-900')}><UtensilsCrossed className="w-6 h-6"/> <span className="text-sm font-bold">午餐</span></button>
                        <button onClick={()=>toggleBio('hadDinner')} className={btnClass(bioState.hadDinner, 'bg-macaron-orange text-orange-900')}><Utensils className="w-6 h-6"/> <span className="text-sm font-bold">晚餐</span></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button onClick={()=>toggleBio('washedMorning')} className={btnClass(bioState.washedMorning, 'bg-macaron-blue text-blue-900')}><Bath className="w-6 h-6"/> <span className="text-sm font-bold">晨间洗漱</span></button>
                        <button onClick={()=>toggleBio('washedEvening')} className={btnClass(bioState.washedEvening, 'bg-macaron-blue text-blue-900')}><Sparkles className="w-6 h-6"/> <span className="text-sm font-bold">晚间洗漱</span></button>
                    </div>
                    <p className="text-center text-sm text-slate-400 font-medium bg-slate-50 p-2 rounded-lg">✨ 点亮已经做完的事情，未完成的会自动加入计划哦</p>
                </div>

                <div className="bg-gradient-to-br from-macaron-cream to-macaron-pink/20 p-6 rounded-[2rem] text-macaron-dark shadow-xl border border-white">
                    <h3 className="font-bold text-xl mb-5 flex items-center gap-2"><Activity className="w-6 h-6 text-rose-400"/> 能量状态</h3>
                    
                    {/* Sleep Time Input */}
                    <div className="bg-white/60 p-4 rounded-2xl mb-4 border border-white flex justify-between items-center">
                       <span className="font-bold text-macaron-dark text-sm flex items-center gap-2"><BedDouble className="w-5 h-5 text-macaron-purple"/> 预计入睡</span>
                       <input type="time" value={bioState.sleepTime} onChange={(e)=>setBioState({...bioState, sleepTime:e.target.value})} className="bg-white rounded-xl px-3 py-2 text-slate-600 font-mono font-bold outline-none focus:ring-2 ring-macaron-purple"/>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                            {id:'energetic', icon:'⚡️', label:'充沛', bg:'bg-macaron-yellow'}, 
                            {id:'normal', icon:'🙂', label:'平稳', bg:'bg-macaron-blue'},
                            {id:'back_pain', icon:'🩹', label:'腰痛', bg:'bg-slate-300'}, 
                            {id:'stomach_pain', icon:'🤢', label:'肚子痛', bg:'bg-slate-300'}
                        ].map(o => (
                            <button key={o.id} onClick={()=>setUserState({...userState, physical:o.id})} 
                                className={`p-2 rounded-xl border-2 flex flex-col items-center transition-all ${userState.physical===o.id ? `${o.bg} border-transparent shadow-md text-slate-800` : 'bg-white/50 border-transparent text-slate-400'}`}>
                                <div className="text-2xl mb-1">{o.icon}</div><div className="text-xs font-bold">{o.label}</div>
                            </button>
                        ))}
                    </div>
                     <div className="grid grid-cols-4 gap-2 mb-6">
                        {[
                            {id:'focus', icon:'🧠', label:'专注', bg:'bg-macaron-green'}, 
                            {id:'calm', icon:'🌊', label:'平静', bg:'bg-macaron-blue'},
                            {id:'anxious', icon:'🔥', label:'焦虑', bg:'bg-macaron-orange'}, 
                            {id:'scattered', icon:'😶‍🌫️', label:'涣散', bg:'bg-macaron-purple'}
                        ].map(o => (
                            <button key={o.id} onClick={()=>setUserState({...userState, mental:o.id})} 
                                className={`p-2 rounded-xl border-2 flex flex-col items-center transition-all ${userState.mental===o.id ? `${o.bg} border-transparent shadow-md text-slate-800` : 'bg-white/50 border-transparent text-slate-400'}`}>
                                <div className="text-2xl mb-1">{o.icon}</div><div className="text-xs font-bold">{o.label}</div>
                            </button>
                        ))}
                    </div>

                    <div className="relative mb-6">
                        <MessageSquarePlus className="w-5 h-5 text-slate-400 absolute left-4 top-4"/>
                        <textarea 
                            value={planInput} onChange={(e)=>setPlanInput(e.target.value)}
                            className="w-full h-28 bg-white border-2 border-slate-100 rounded-2xl p-4 pl-12 text-base text-slate-700 placeholder:text-slate-300 outline-none focus:border-macaron-purple"
                            placeholder="今日特别事项 (例如: 晚上8点有约)..."
                        />
                    </div>
                    <button onClick={generatePlan} className="w-full bg-macaron-dark text-white py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-slate-700 transition-colors shadow-lg shadow-purple-200">
                        生成今日计划 <ArrowRight className="w-6 h-6"/>
                    </button>
                </div>
              </div>
             );
          };

          const renderPlanPage = () => {
             if (loading.state && loading.taskType === 'plan') {
                 return (
                     <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                         <div className="w-24 h-24 rounded-full border-4 border-macaron-cream border-t-macaron-purple animate-spin flex items-center justify-center">
                            <span className="font-black text-slate-300 text-xl">{loading.progress}%</span>
                         </div>
                         <p className="text-slate-400 font-bold animate-pulse text-lg">{loading.text}</p>
                     </div>
                 )
             }
             if (!todayPlan) return <div className="flex flex-col items-center justify-center h-[50vh] text-center"><div className="bg-white p-8 rounded-full shadow-sm mb-6"><Layout className="w-16 h-16 text-macaron-blue"/></div><p className="text-slate-400 font-bold text-lg">请先在[状态]页打卡</p><button onClick={()=>setActivePage('status')} className="text-macaron-purple font-bold mt-4 text-base bg-purple-50 px-6 py-2 rounded-full">去打卡</button></div>;

             return (
                 <div className="space-y-6 animate-in pb-28">
                     {renderPlanAnalysis()}

                     <div className="bg-gradient-to-r from-macaron-purple/30 to-macaron-blue/30 p-8 rounded-[2.5rem] relative overflow-hidden">
                         <h2 className="text-2xl font-black text-slate-700 mb-3 relative z-10">{todayPlan.theme_title}</h2>
                         <p className="text-slate-600 font-medium italic relative z-10 text-base">"{todayPlan.advice}"</p>
                         <Footprints className="absolute -bottom-4 -right-4 w-40 h-40 text-white/40 rotate-12"/>
                     </div>

                     <div className="space-y-4">
                         {todayPlan.blocks?.map((b, i) => {
                             const borderColor = 
                                b.category === 'work' ? 'border-l-macaron-blue' :
                                b.category === 'study' ? 'border-l-macaron-green' :
                                b.category === 'rest' ? 'border-l-macaron-pink' :
                                'border-l-slate-300';
                             return (
                                 <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-50 shadow-sm border-l-8 ${borderColor}`}>
                                     <div className="flex justify-between items-center mb-2">
                                         <span className="font-mono font-black text-slate-700 text-xl">{b.time}</span>
                                         <span className="text-xs font-bold uppercase bg-slate-50 px-2 py-1 rounded text-slate-400">{b.category}</span>
                                     </div>
                                     <h4 className="font-bold text-slate-800 text-xl mb-1">{b.title}</h4>
                                     <p className="text-base text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">{b.desc}</p>
                                     
                                     {/* Render Sub Blocks (Pomodoro Timeline) */}
                                     {b.sub_blocks && b.sub_blocks.length > 0 && (
                                         <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                                             {b.sub_blocks.map((sb, sbi) => (
                                                 <div key={sbi} className="flex gap-3 items-center">
                                                     <div className="font-mono text-xs text-slate-400 w-20 text-right shrink-0">{sb.time}</div>
                                                     <div className={`w-2 h-2 rounded-full shrink-0 ${sb.label.includes('Focus') ? 'bg-macaron-blue' : 'bg-macaron-green'}`}></div>
                                                     <div className="text-sm font-medium text-slate-600">{sb.detail || sb.label}</div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}

                                     {b.energy_required==='high' && <div className="mt-3 text-sm text-rose-400 flex items-center gap-1 font-bold"><Zap className="w-4 h-4"/> 高能时刻</div>}
                                 </div>
                             )
                         })}
                     </div>
                     <button onClick={() => { setTodayPlan(null); setActivePage('status'); }} className="w-full py-5 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 rounded-2xl">
                        <RefreshCcw className="w-4 h-4"/> 重新生成
                     </button>
                 </div>
             )
          };

          const NavBtn = ({ page, icon: Icon, label }) => (
            <button onClick={() => setActivePage(page)} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all duration-300 ${activePage === page ? 'text-slate-800 -translate-y-2' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className={`p-3 rounded-2xl transition-all ${activePage === page ? 'bg-macaron-purple shadow-lg shadow-purple-200' : 'bg-transparent'}`}>
                    {loading.state && loading.taskType === page ? <Loader2 className="w-6 h-6 animate-spin"/> : <Icon className={`w-6 h-6 ${activePage === page ? 'text-purple-900' : ''}`}/>}
                </div>
                <span className="text-xs font-bold">{label}</span>
            </button>
          );

          return (
            <div className="min-h-screen font-sans text-slate-800 pb-safe">
              <header className="fixed top-0 inset-x-0 h-24 bg-macaron-cream/90 backdrop-blur-md z-40 flex items-center justify-between px-6 pt-2">
                 <div className="flex items-center gap-3">
                    <div className="bg-slate-800 text-white p-2.5 rounded-xl"><BrainCircuit className="w-6 h-6"/></div>
                    <div className="flex flex-col">
                        <span className="font-cute text-2xl text-slate-700 tracking-wider leading-none">LifeOS</span>
                        <span className="text-macaron-purple text-[10px] font-sans font-bold bg-purple-100 px-1.5 py-0.5 rounded self-start mt-1">Macaron v2.5</span>
                    </div>
                 </div>
                 <button onClick={() => setShowKeyInput(true)} className="p-3 bg-white rounded-full text-slate-400 shadow-sm"><Settings className="w-6 h-6"/></button>
              </header>

              <main className="pt-28 px-5 max-w-md mx-auto">
                 {activePage === 'data' && renderDataPage()}
                 {activePage === 'review' && renderReviewPage()}
                 {activePage === 'status' && renderStatusPage()}
                 {activePage === 'plan' && renderPlanPage()}
              </main>

              <nav className="fixed bottom-8 inset-x-6 max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-2xl shadow-slate-200/50 z-[100] flex justify-between items-center border border-white/50 ring-1 ring-slate-900/5">
                <NavBtn page="data" icon={Database} label="记录" />
                <NavBtn page="review" icon={PieIcon} label="复盘" />
                <NavBtn page="status" icon={UserCheck} label="状态" />
                <NavBtn page="plan" icon={CalendarDays} label="计划" />
              </nav>

              {showKeyInput && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-6 animate-in">
                  <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl">
                    <h3 className="font-bold text-xl mb-6">设置 API Key</h3>
                    <input type="password" value={userApiKey} onChange={(e) => setUserApiKey(cleanApiKey(e.target.value))} className="w-full bg-slate-50 p-5 rounded-2xl mb-6 text-base outline-none focus:ring-2 ring-macaron-purple" placeholder="输入 Gemini Key"/>
                    <div className="flex gap-3">
                       <button onClick={() => { localStorage.removeItem('lifeos_pro_key'); setUserApiKey(''); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">清除</button>
                       <button onClick={() => { if(validateApiKey(userApiKey)) { localStorage.setItem('lifeos_pro_key', userApiKey); setShowKeyInput(false); showToast('Key 已保存'); } else { showToast('格式无效', 'error'); } }} className="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-bold">保存</button>
                    </div>
                    <button onClick={() => setShowKeyInput(false)} className="w-full mt-6 text-sm text-slate-400 font-bold">关闭</button>
                  </div>
                </div>
              )}
              
              {msg.text && <div className="fixed top-28 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[70] bg-slate-800 text-white text-base animate-in flex items-center gap-2">
                  {msg.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400"/> : <CheckCircle className="w-5 h-5 text-emerald-400"/>}
                  {msg.text}
              </div>}
            </div>
          );
        }

        const root = createRoot(document.getElementById('root'));
        root.render(<ErrorBoundary><App /></ErrorBoundary>);
    </script>
</body>
</html>