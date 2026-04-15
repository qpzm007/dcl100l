import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Printer, 
  TrendingUp, 
  ChevronDown, 
  Save, 
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Users,
  Plus,
  Trash2,
  Filter,
  ArrowLeft,
  CloudOff,
  Shield,
  Eye,
  Loader2,
  Camera,
  Settings,
  Zap,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

// ─────────────────────────── Firebase 초기화 ───────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAkFBrT8Zibdtaw6iw6Qgp-nrF3wN2V7ek",
  authDomain: "dcl100l.firebaseapp.com",
  projectId: "dcl100l",
  storageBucket: "dcl100l.firebasestorage.app",
  messagingSenderId: "423636580318",
  appId: "1:423636580318:web:316191480f56aa407a0f4f",
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const firestore = getFirestore(firebaseApp);

// ─────────────────────────── 타입 정의 ───────────────────────────
interface CompanyData {
  id: number;
  name: string;
  balance: number;
  orderAmount: number;
  categories: string[];
  priority: number;
  p3Amount: number;
}

interface SortConfig {
  key: keyof CompanyData;
  direction: 'asc' | 'desc';
}

// ─────────────────────────── 초기 데이터 ───────────────────────────
const INITIAL_DATA: any[] = [
  { id: 1, name: "우주기획", balance: 44000, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 2, name: "한성옵틱스", balance: 697036680, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 3, name: "동우인더스트리", balance: 6659706, orderAmount: 0, category: "DCL100,120", priority: 2, p3Amount: 0 },
  { id: 4, name: "진산디케이씨", balance: 6325000, orderAmount: 0, category: "POP UP", priority: 2, p3Amount: 0 },
  { id: 5, name: "신광산업", balance: 5610000, orderAmount: 0, category: "DCL100", priority: 2, p3Amount: 0 },
  { id: 6, name: "쓰리레이저테크놀로", balance: 58024000, orderAmount: 0, category: "MLAD-3", priority: 3, p3Amount: 30000000 },
  { id: 7, name: "진성다이아몬드", balance: 1265000, orderAmount: 0, category: "소모품", priority: 1, p3Amount: 0 },
  { id: 9, name: "반석정밀공업", balance: 275000, orderAmount: 0, category: "소모품", priority: 1, p3Amount: 0 },
  { id: 10, name: "새한광학", balance: 11483600, orderAmount: 0, category: "POP UP", priority: 3, p3Amount: 6000000 },
  { id: 11, name: "디엠테크놀로지", balance: 122870574, orderAmount: 0, category: "POP UP", priority: 3, p3Amount: 30000000 },
  { id: 12, name: "JXP TECH(US)", balance: 3029073, orderAmount: 0, category: "K6", priority: 1, p3Amount: 0 },
  { id: 13, name: "서일테크", balance: 1056000, orderAmount: 0, category: "POP UP", priority: 1, p3Amount: 0 },
  { id: 14, name: "한진금속", balance: 71618250, orderAmount: 0, category: "외주가공비", priority: 0, p3Amount: 0 },
  { id: 15, name: "코파스", balance: 2848353, orderAmount: 0, category: "K6", priority: 1, p3Amount: 0 },
  { id: 16, name: "영물산", balance: 2420000, orderAmount: 0, category: "소모품", priority: 1, p3Amount: 0 },
  { id: 17, name: "에드몬드옵틱스코리아", balance: 626888, orderAmount: 0, category: "연구소", priority: 1, p3Amount: 0 },
  { id: 18, name: "유신특수공구", balance: 88000, orderAmount: 0, category: "소모품", priority: 1, p3Amount: 0 },
  { id: 22, name: "대흥사", balance: 397194785, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 23, name: "나암테크", balance: 340695136, orderAmount: 0, category: "POP UP외", priority: 0, p3Amount: 0 },
  { id: 24, name: "옵토헬", balance: 28050000, orderAmount: 0, category: "POP UP", priority: 3, p3Amount: 20000000 },
  { id: 25, name: "아태일렉트로닉스", balance: 31785644, orderAmount: 0, category: "발칸외", priority: 3, p3Amount: 20000000 },
  { id: 31, name: "제네랄옵틱스", balance: 107905050, orderAmount: 0, category: "발칸", priority: 0, p3Amount: 0 },
  { id: 32, name: "신성테크놀로지", balance: 6289250, orderAmount: 0, category: "K6", priority: 2, p3Amount: 0 },
  { id: 33, name: "예놉틱코리아", balance: 63756000, orderAmount: 0, category: "드론카메라", priority: 0, p3Amount: 0 },
  { id: 55, name: "대정테크", balance: 133221000, orderAmount: 0, category: "POP UP", priority: 0, p3Amount: 0 },
  { id: 57, name: "에스엠정밀", balance: 33261800, orderAmount: 0, category: "DCL100", priority: 3, p3Amount: 20000000 },
  { id: 62, name: "동경프라스틱", balance: 54483750, orderAmount: 0, category: "DCL100", priority: 0, p3Amount: 0 },
  { id: 85, name: "파워소스코리아", balance: 14070100, orderAmount: 0, category: "발칸", priority: 0, p3Amount: 0 },
  { id: 86, name: "코리아시스템", balance: 86464026, orderAmount: 0, category: "발칸", priority: 3, p3Amount: 40000000 },
  { id: 88, name: "한결테크", balance: 104802500, orderAmount: 0, category: "DCL120외", priority: 0, p3Amount: 0 },
];

// 데이터 마이그레이션 헬퍼
function migrateData(raw: any[]): CompanyData[] {
  return raw.map(item => {
    let tags: string[] = [];
    if (Array.isArray(item.categories)) tags = item.categories;
    else if (typeof item.category === 'string' && item.category.trim()) {
      tags = item.category.split(/[,/]/).map((s: string) => s.trim()).filter(Boolean);
    }
    return {
      id: item.id,
      name: item.name || "",
      balance: item.balance || 0,
      orderAmount: item.orderAmount || 0,
      categories: tags,
      priority: item.priority || 0,
      p3Amount: item.p3Amount || 0
    };
  });
}

function buildCompleteData(base: CompanyData[]): CompanyData[] {
  const existingIds = base.map(d => d.id);
  const result = [...base];
  for (let i = 1; i <= 92; i++) {
    if (!existingIds.includes(i)) {
      result.push({ id: i, name: `기타 협력사 (ID ${i})`, balance: 0, orderAmount: 0, categories: [], priority: 0, p3Amount: 0 });
    }
  }
  return result;
}

const FUND_DOC_PATH = { collection: 'fundPlan', doc: 'companies' };

async function loadFromFirebase(): Promise<CompanyData[] | null> {
  try {
    const ref = doc(firestore, FUND_DOC_PATH.collection, FUND_DOC_PATH.doc);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      return d.companies as CompanyData[];
    }
    return null;
  } catch { return null; }
}

async function saveToFirebase(companies: CompanyData[]): Promise<void> {
  const ref = doc(firestore, FUND_DOC_PATH.collection, FUND_DOC_PATH.doc);
  await setDoc(ref, { companies, updatedAt: new Date().toISOString() });
}

const App: React.FC = () => {
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  const [data, setData] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'balance', direction: 'desc' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'visual'>('dashboard');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [pendingAiImage, setPendingAiImage] = useState<string | null>(null);
  const [customAiInstruction, setCustomAiInstruction] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    loadFromFirebase().then(fbData => {
      if (fbData && fbData.length > 0) setData(migrateData(fbData));
      else setData(buildCompleteData(migrateData(INITIAL_DATA)));
    }).finally(() => setIsLoading(false));
  }, []);

  const processImageWithGemini = async (base64Image: string, userInstruction?: string) => {
    const apiKey = localApiKey || import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("API 키가 없습니다. 설정(Settings)에서 입력해주세요.");
    }
    const genAI = new GoogleGenAI({ apiKey });
    const prompt = `이 이미지는 미수금 현황표입니다. JSON 배열로 추출하세요. [{"name":"업체명","balance":100,"orderAmount":50}]. ${userInstruction || ""}`;
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } }] }]
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error("분석 실패");
    return JSON.parse(jsonMatch[0]);
  };

  const performImageAiAnalysis = async (file: File | Blob) => {
    if (!isAdmin) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAiImage(reader.result as string);
      setCustomAiInstruction("");
    };
    reader.readAsDataURL(file);
  };

  const executeAiAnalysis = async () => {
    if (!pendingAiImage) return;
    setIsAiProcessing(true);
    setAiError(null);
    try {
      const extractedData = await processImageWithGemini(pendingAiImage, customAiInstruction);
      const nextData = [...data];
      
      // 1. 추출 데이터 중복 합산 (업체명 기준)
      const consolidated = extractedData.reduce((acc: any, curr: any) => {
        const name = curr.name.trim();
        if (!acc[name]) acc[name] = { ...curr, balance: 0, orderAmount: 0 };
        acc[name].balance += (curr.balance || 0);
        acc[name].orderAmount += (curr.orderAmount || 0);
        return acc;
      }, {} as any);

      // 2. 데이터 업데이트 및 신규 추가
      Object.values(consolidated).forEach((newItem: any) => {
        const index = nextData.findIndex(d => d.name.trim() === newItem.name.trim());
        if (index !== -1) {
          // 기존 업체 업데이트
          nextData[index] = {
            ...nextData[index],
            balance: newItem.balance ?? nextData[index].balance,
            orderAmount: newItem.orderAmount ?? nextData[index].orderAmount
          };
        } else if (customAiInstruction.includes("신규") || customAiInstruction.includes("추가")) {
          // 신규 업체 추가 (사용자가 '신규' 또는 '추가'를 언급했을 때만)
          const maxId = Math.max(...nextData.map(d => d.id), 92);
          nextData.push({
            id: maxId + 1,
            name: newItem.name.trim(),
            balance: newItem.balance || 0,
            orderAmount: newItem.orderAmount || 0,
            categories: ["신규추가"],
            priority: 0,
            p3Amount: 0
          });
        }
      });

      setData(nextData);
      triggerSave(nextData);
      setPendingAiImage(null);
      alert("AI 분석 및 데이터 반영 완료");
    } catch (err: any) { setAiError(err.message); }
    finally { setIsAiProcessing(false); }
  };

  const handleAiExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await performImageAiAnalysis(file);
  };

  useEffect(() => {
    if (!isAdmin || currentView !== 'dashboard') return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) { performImageAiAnalysis(blob); break; }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAdmin, currentView, data]);

  const triggerSave = useCallback((companies: CompanyData[]) => {
    if (!isAdmin) return;
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveToFirebase(companies);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch { setSaveStatus('error'); }
    }, 800);
  }, [isAdmin]);

  const updateCompany = (id: number, field: keyof CompanyData, value: any) => {
    if (!isAdmin) return;
    const nextData = data.map(d => d.id === id ? { ...d, [field]: value } : d);
    setData(nextData);
    triggerSave(nextData);
  };

  const toggleCategory = (id: number, category: string) => {
    if (!isAdmin) return;
    const nextData = data.map(d => {
      if (d.id === id) {
        const categories = d.categories.includes(category)
          ? d.categories.filter(c => c !== category)
          : [...d.categories, category];
        return { ...d, categories };
      }
      return d;
    });
    setData(nextData);
    triggerSave(nextData);
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm) result = result.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterType !== 'all') {
      const p = parseInt(filterType.replace('p', ''));
      result = result.filter(d => d.priority === (isNaN(p) ? 0 : p));
    }
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, searchTerm, filterType, sortConfig]);

  const stats = useMemo(() => {
    const totalBalance = data.reduce((sum, d) => sum + d.balance, 0);
    const p1Total = data.filter(d => d.priority === 1).reduce((sum, d) => sum + d.balance, 0);
    const p2Total = data.filter(d => d.priority === 2).reduce((sum, d) => sum + d.balance, 0);
    const p3Total = data.filter(d => d.priority === 3).reduce((sum, d) => sum + d.p3Amount, 0);
    const grandTotalPlanned = p1Total + p2Total + p3Total;
    return { totalBalance, p1Total, p2Total, p3Total, grandTotalPlanned };
  }, [data]);

  const formatKrw = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-bold">로딩 중...</div>;

  return (
    <div className="h-screen bg-slate-50 p-4 font-sans text-slate-900 overflow-hidden flex flex-col gap-4">
      <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href='../index.html'} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors" title="재고 관리 보드로 돌아가기"><ArrowLeft/></button>
          <h1 className="text-xl font-black">협력업체 자금계획</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-right">
            <div className="text-[9px] font-bold opacity-70">집행 계획 합계</div>
            <div className="text-xl font-black tabular-nums">₩ {formatKrw(stats.grandTotalPlanned)}</div>
          </div>
          <button onClick={() => setCurrentView(currentView === 'dashboard' ? 'visual' : 'dashboard')} className="p-2.5 border rounded-xl"><TrendingUp/></button>
          <button onClick={() => window.print()} className="p-2.5 bg-slate-900 text-white rounded-xl"><Printer/></button>
          {isAdmin && <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 border rounded-xl"><Settings/></button>}
        </div>
      </header>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="업체 검색..." className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 pr-2">
            <input type="file" ref={fileInputRef} onChange={handleAiExcelUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Camera className="w-5 h-5"/></button>
            <div className="text-[8px] font-black opacity-30 leading-tight">Paste<br/>Ctrl+V</div>
          </div>
        )}
      </div>

        <div className="flex-grow bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
          {currentView === 'dashboard' ? (
            <div className="overflow-auto flex-grow">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-50 border-b z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">업체명</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">분류</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center w-32">우선순위</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right w-48">미수잔액</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right w-48">집행 계획</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(item => (
                    <tr key={item.id} className="border-b hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-[10px] font-black text-slate-300">{item.id}</td>
                      <td className="px-6 py-4">
                        {isAdmin ? <input value={item.name} onChange={e => updateCompany(item.id, 'name', e.target.value)} className="w-full bg-transparent font-black outline-none" /> : <span className="font-black">{item.name}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.categories.map(c => <span key={c} className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold">{c}</span>)}
                          {isAdmin && <button onClick={() => {const n = window.prompt("분류 추가"); if(n) toggleCategory(item.id, n)}} className="px-1 text-slate-300">+</button>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select value={item.priority} disabled={!isAdmin} onChange={e => updateCompany(item.id, 'priority', parseInt(e.target.value))} className="text-[10px] font-black p-1 rounded-lg border">
                          <option value={0}>-</option>
                          <option value={1}>P1</option>
                          <option value={2}>P2</option>
                          <option value={3}>P3</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin ? <input type="number" value={item.balance} onChange={e => updateCompany(item.id, 'balance', parseInt(e.target.value))} className="w-full text-right bg-slate-50 rounded px-2 font-mono font-bold" /> : <span className="font-mono font-bold">₩{formatKrw(item.balance)}</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-indigo-600">
                        {item.priority === 3 ? (isAdmin ? <input type="number" value={item.p3Amount} onChange={e => updateCompany(item.id, 'p3Amount', parseInt(e.target.value))} className="w-full text-right bg-amber-50 rounded font-mono" /> : `₩${formatKrw(item.p3Amount)}`) : (item.priority === 1 || item.priority === 2 ? `₩${formatKrw(item.balance)}` : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-auto flex-grow p-8 bg-slate-50/50">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* 상단 요약 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">총 미수금</div>
                    <div className="text-2xl font-black">₩{formatKrw(stats.totalBalance)}</div>
                  </div>
                  <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
                    <div className="text-[10px] font-bold opacity-70 uppercase mb-1">총 집행 계획</div>
                    <div className="text-2xl font-black">₩{formatKrw(stats.grandTotalPlanned)}</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div className="text-[10px] font-black text-indigo-500 uppercase mb-1">P1 + P2 (즉시)</div>
                    <div className="text-2xl font-black">₩{formatKrw(stats.p1Total + stats.p2Total)}</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <div className="text-[10px] font-black text-amber-500 uppercase mb-1">P3 (조정분)</div>
                    <div className="text-2xl font-black">₩{formatKrw(stats.p3Total)}</div>
                  </div>
                </div>

                {/* 차트 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 분류별 집행 계획 차트 */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black">분류별 집행 계획 현황</h3>
                      <TrendingUp className="text-slate-300" />
                    </div>
                    <div className="space-y-4">
                      {Object.entries(
                        data.reduce((acc: any, d) => {
                          const planned = d.priority === 3 ? d.p3Amount : (d.priority === 1 || d.priority === 2 ? d.balance : 0);
                          if (planned > 0) {
                            const cat = d.categories[0] || "기타";
                            acc[cat] = (acc[cat] || 0) + planned;
                          }
                          return acc;
                        }, {})
                      ).sort((a: any, b: any) => b[1] - a[1]).map(([cat, amount]: any, idx) => {
                        const maxAmount = Math.max(...Object.values(data.reduce((acc: any, d) => {
                          const planned = d.priority === 3 ? d.p3Amount : (d.priority === 1 || d.priority === 2 ? d.balance : 0);
                          const c = d.categories[0] || "기타";
                          acc[c] = (acc[c] || 0) + planned;
                          return acc;
                        }, {})) as any);
                        const width = (amount / maxAmount) * 100;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-black">
                              <span>{cat}</span>
                              <span className="text-indigo-600">₩{formatKrw(amount)}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${width}%` }} 
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 우선순위별 분포 */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black">우선순위별 집행 비중</h3>
                      <Filter className="text-slate-300" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center gap-8">
                      {[
                        { label: 'P1 (Critical)', val: stats.p1Total, color: 'bg-rose-500' },
                        { label: 'P2 (High)', val: stats.p2Total, color: 'bg-amber-500' },
                        { label: 'P3 (Planned)', val: stats.p3Total, color: 'bg-indigo-500' }
                      ].map((item, idx) => {
                        const percent = stats.grandTotalPlanned > 0 ? (item.val / stats.grandTotalPlanned) * 100 : 0;
                        return (
                          <div key={item.label} className="flex items-center gap-6">
                            <div className={`w-3 h-12 ${item.color} rounded-full`} />
                            <div className="flex-grow">
                              <div className="flex justify-between items-end mb-1">
                                <span className="text-[11px] font-black">{item.label}</span>
                                <span className="text-sm font-black">{percent.toFixed(1)}%</span>
                              </div>
                              <div className="text-lg font-black text-slate-400">₩{formatKrw(item.val)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm flex flex-col gap-6">
              <h3 className="text-xl font-black">AI API 설정</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gemini API Key</label>
                <input type="password" value={localApiKey} onChange={e => setLocalApiKey(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-500" placeholder="AIza..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsSettingsOpen(false)} className="flex-1 font-bold text-slate-500">닫기</button>
                <button onClick={() => {localStorage.setItem('gemini_api_key', localApiKey); setIsSettingsOpen(false); alert("저장됨")}} className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-black">저장하기</button>
              </div>
            </div>
          </motion.div>
        )}
        {pendingAiImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[2100] flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <img src={pendingAiImage} className="w-full rounded-3xl shadow-lg border" />
              <div className="flex flex-col gap-6 h-full">
                <div className="flex flex-wrap gap-2">
                  {["신규 업체도 추가해줘", "미수금만 업데이트해줘", "전체 초기화 후 반영", "품명 누락 없이 추출"].map(chip => (
                    <button
                      key={chip}
                      onClick={() => setCustomAiInstruction(prev => prev ? `${prev}, ${chip}` : chip)}
                      className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-sm font-bold transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
                <textarea value={customAiInstruction} onChange={e => setCustomAiInstruction(e.target.value)} className="w-full flex-grow p-6 bg-slate-50 border-2 rounded-[2rem] outline-none text-lg" placeholder="추가 요청사항을 입력하거나 위 버튼을 눌러보세요" />
                <div className="flex gap-4">
                  <button onClick={() => setPendingAiImage(null)} className="flex-1 text-slate-400 font-bold">취소</button>
                  <button onClick={executeAiAnalysis} disabled={isAiProcessing} className="flex-[2] bg-indigo-600 text-white p-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                    {isAiProcessing ? "분석 중..." : "AI 분석 시작하기"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
