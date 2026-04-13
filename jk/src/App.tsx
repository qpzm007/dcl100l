/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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
  orderAmount: number; // 발주금액 추가
  categories: string[]; // 다중 선택 분류 (Notion Style)
  priority: number;
  p3Amount: number;
}

interface SortConfig {
  key: keyof CompanyData;
  direction: 'asc' | 'desc';
}

// ─────────────────────────── 초기 데이터 (데이터 마이그레이션 대응) ───────────────────────────
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
  { id: 20, name: "AMERICAN DEFENSE", balance: 860940, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 21, name: "피엔테크", balance: 2843940, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 22, name: "대흥사", balance: 397194785, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 23, name: "나암테크", balance: 340695136, orderAmount: 0, category: "POP UP외", priority: 0, p3Amount: 0 },
  { id: 24, name: "옵토헬", balance: 28050000, orderAmount: 0, category: "POP UP", priority: 3, p3Amount: 20000000 },
  { id: 25, name: "아태일렉트로닉스", balance: 31785644, orderAmount: 0, category: "발칸외", priority: 3, p3Amount: 20000000 },
  { id: 27, name: "QINGDAO LASENCE CO LTD(CN)", balance: 482126, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 28, name: "와이엠테크", balance: 847000, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 29, name: "CMC ELECTRONICS INC", balance: 19371150, orderAmount: 0, category: "", priority: 0, p3Amount: 0 },
  { id: 30, name: "엔이테크", balance: 660000, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 31, name: "제네랄옵틱스", balance: 107905050, orderAmount: 0, category: "발칸", priority: 0, p3Amount: 0 },
  { id: 32, name: "신성테크놀로지", balance: 6289250, orderAmount: 0, category: "K6", priority: 2, p3Amount: 0 },
  { id: 33, name: "예놉틱코리아", balance: 63756000, orderAmount: 0, category: "드론카메라", priority: 0, p3Amount: 0 },
  { id: 34, name: "케이오에이치테크놀러지", balance: 33000, orderAmount: 0, category: "SCOPE", priority: 1, p3Amount: 0 },
  { id: 36, name: "건영정밀조각", balance: 1279330, orderAmount: 0, category: "K6", priority: 1, p3Amount: 0 },
  { id: 37, name: "ALLIED WIRE AND CABLE", balance: 139041, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 39, name: "FOCTEK PHOTONICS, INC", balance: 2224095, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 40, name: "엠케이메탈", balance: 2101250, orderAmount: 0, category: "MSP1", priority: 1, p3Amount: 0 },
  { id: 42, name: "원우이엔지", balance: 3206973, orderAmount: 0, category: "드론카메라", priority: 1, p3Amount: 0 },
  { id: 43, name: "명성화학", balance: 63011900, orderAmount: 0, category: "", priority: 3, p3Amount: 30000000 },
  { id: 44, name: "JIANGSU SHONG MICROFIBER TECHNOLOGY CO LTD", balance: 5431613, orderAmount: 0, category: "", priority: 0, p3Amount: 0 },
  { id: 45, name: "LEI MING TAO", balance: 4261653, orderAmount: 0, category: "", priority: 0, p3Amount: 0 },
  { id: 46, name: "DW MOLDS CO LTD", balance: 3551377, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 47, name: "153메탈", balance: 15500309, orderAmount: 0, category: "원자재", priority: 3, p3Amount: 10000000 },
  { id: 48, name: "HANZHOU(한주광학)", balance: 4161210, orderAmount: 0, category: "", priority: 2, p3Amount: 0 },
  { id: 49, name: "탑전자", balance: 5628850, orderAmount: 0, category: "K6외", priority: 2, p3Amount: 0 },
  { id: 50, name: "볼트판매센터", balance: 3253600, orderAmount: 0, category: "부자재", priority: 1, p3Amount: 0 },
  { id: 51, name: "이화테크", balance: 3762000, orderAmount: 0, category: "DCL120", priority: 1, p3Amount: 0 },
  { id: 52, name: "제니알테크", balance: 140335, orderAmount: 0, category: "SCOPE", priority: 1, p3Amount: 0 },
  { id: 53, name: "SHINKWANG CO LTD(KR)", balance: 4475000, orderAmount: 0, category: "", priority: 0, p3Amount: 0 },
  { id: 54, name: "유남옵틱스", balance: 442633950, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 55, name: "케이엠아이텍", balance: 9646120, orderAmount: 0, category: "열영상대구경", priority: 0, p3Amount: 0 },
  { id: 56, name: "투에스디", balance: 73689028, orderAmount: 0, category: "DCL120", priority: 0, p3Amount: 0 },
  { id: 57, name: "다원 테크놀로지", balance: 1592635, orderAmount: 0, category: "K6", priority: 1, p3Amount: 0 },
  { id: 58, name: "엔티피", balance: 361722100, orderAmount: 0, category: "POP UP", priority: 3, p3Amount: 100000000 },
  { id: 59, name: "베이직옵틱스", balance: 148717956, orderAmount: 0, category: "외주가공비", priority: 3, p3Amount: 50000000 },
  { id: 60, name: "서인테크", balance: 465428135, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 61, name: "신보", balance: 161952450, orderAmount: 0, category: "발칸", priority: 0, p3Amount: 0 },
  { id: 62, name: "대한볼트", balance: 6215000, orderAmount: 0, category: "5.56mm외", priority: 2, p3Amount: 0 },
  { id: 63, name: "SEOIN TECH GLOBAL LIMITED(HK)", balance: 180451588, orderAmount: 0, category: "", priority: 0, p3Amount: 0 },
  { id: 64, name: "키프코우주항공", balance: 145199104, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 65, name: "환화", balance: 26383300, orderAmount: 0, category: "5.56mm", priority: 0, p3Amount: 0 },
  { id: 66, name: "하나SR", balance: 865700, orderAmount: 0, category: "5.56mm", priority: 1, p3Amount: 0 },
  { id: 67, name: "중원테크", balance: 148276014, orderAmount: 0, category: "5.56mm외", priority: 0, p3Amount: 0 },
  { id: 68, name: "동양프리시전", balance: 28970830, orderAmount: 0, category: "SCOPE외", priority: 3, p3Amount: 20000000 },
  { id: 69, name: "티엘씨", balance: 209895690, orderAmount: 0, category: "POP UP외", priority: 3, p3Amount: 100000000 },
  { id: 70, name: "남해전자", balance: 7641700, orderAmount: 0, category: "MLAD-3", priority: 2, p3Amount: 0 },
  { id: 72, name: "하나에이엠티", balance: 22671000, orderAmount: 0, category: "SCOPE", priority: 0, p3Amount: 0 },
  { id: 73, name: "마인드텍 (MINDTEC)", balance: 3740000, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 75, name: "다인경금속", balance: 16658875, orderAmount: 0, category: "드론카메라", priority: 3, p3Amount: 10000000 },
  { id: 77, name: "GUANGZHOU YUEXIU DISTRICT SHENGTU", balance: 1836672, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 78, name: "케이씨티", balance: 7756462, orderAmount: 0, category: "발칸", priority: 2, p3Amount: 0 },
  { id: 80, name: "세화알미늄", balance: 2654080, orderAmount: 0, category: "원자재", priority: 1, p3Amount: 0 },
  { id: 81, name: "세인", balance: 7603200, orderAmount: 0, category: "POP UP외", priority: 2, p3Amount: 0 },
  { id: 82, name: "우성바이오산업", balance: 4535000, orderAmount: 0, category: "POP UP", priority: 2, p3Amount: 0 },
  { id: 83, name: "아더산업", balance: 5727500, orderAmount: 0, category: "POP UP", priority: 2, p3Amount: 0 },
  { id: 84, name: "우신테크", balance: 8140000, orderAmount: 0, category: "POP UP", priority: 2, p3Amount: 0 },
  { id: 85, name: "파워소스코리아", balance: 14070100, orderAmount: 0, category: "발칸", priority: 0, p3Amount: 0 },
  { id: 86, name: "코리아시스템", balance: 86464026, orderAmount: 0, category: "발칸", priority: 3, p3Amount: 40000000 },
  { id: 87, name: "에이치티씨(HTC Co.,Ltd)", balance: 4581500, orderAmount: 0, category: "발칸", priority: 0, p3Amount: 0 },
  { id: 88, name: "한결테크", balance: 104802500, orderAmount: 0, category: "DCL120외", priority: 0, p3Amount: 0 },
  { id: 90, name: "엠지텍", balance: 231000, orderAmount: 0, category: "", priority: 1, p3Amount: 0 },
  { id: 92, name: "명신기계", balance: 407880, orderAmount: 0, category: "SCOPE", priority: 1, p3Amount: 0 },
];

// 데이터 마이그레이션 헬퍼
function migrateData(raw: any[]): CompanyData[] {
  return raw.map(item => {
    // category (string) -> categories (string[])
    let tags: string[] = [];
    if (Array.isArray(item.categories)) {
      tags = item.categories;
    } else if (typeof item.category === 'string' && item.category.trim()) {
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

// 빈 ID 채우기 (92개)
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

// ─────────────────────────── Firebase CRUD ───────────────────────────
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
  } catch {
    return null;
  }
}

async function saveToFirebase(companies: CompanyData[]): Promise<void> {
  const ref = doc(firestore, FUND_DOC_PATH.collection, FUND_DOC_PATH.doc);
  await setDoc(ref, { companies, updatedAt: new Date().toISOString() });
}

// ─────────────────────────── 메인 앱 ───────────────────────────
const App: React.FC = () => {
  // 권한: localStorage에서 읽음 (수불 앱과 공유)
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  // 데이터 상태
  const [data, setData] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 필터/검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'balance', direction: 'desc' });
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPriorityFilterOpen, setIsPriorityFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);

  // 데이터 로드 (Firebase 우선, 없으면 초기값)
  useEffect(() => {
    setIsLoading(true);
    loadFromFirebase().then(fbData => {
      if (fbData && fbData.length > 0) {
        setData(migrateData(fbData));
      } else {
        setData(buildCompleteData(migrateData(INITIAL_DATA)));
      }
    }).finally(() => setIsLoading(false));
  }, []);

  // 자동 저장 (관리자 전용, debounce 800ms)
  const triggerSave = useCallback((companies: CompanyData[]) => {
    if (!isAdmin) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(async () => {
      try {
        await saveToFirebase(companies);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 800);
  }, [isAdmin]);

  // 수불관리로 돌아가기
  const goToInventory = () => {
    // 상대경로로 index.html (한 단계 위)
    window.location.href = '../index.html';
  };

  const allAvailableCategories = useMemo(() => {
    const cats = new Set<string>();
    data.forEach(d => {
      d.categories?.forEach(c => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [data]);

  // 태그 색상 생성기 (Notion-like)
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-red-50 text-red-700 border-red-100',
      'bg-blue-50 text-blue-700 border-blue-100',
      'bg-emerald-50 text-emerald-700 border-emerald-100',
      'bg-amber-50 text-amber-700 border-amber-100',
      'bg-indigo-50 text-indigo-700 border-indigo-100',
      'bg-purple-50 text-purple-700 border-purple-100',
      'bg-pink-50 text-pink-700 border-pink-100',
      'bg-slate-50 text-slate-700 border-slate-100',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleAddCompany = () => {
    if (!isAdmin) return;
    const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    const newCompany: CompanyData = { 
      id: newId, 
      name: "새로운 업체", 
      balance: 0, 
      orderAmount: 0,
      categories: [], 
      priority: 0, 
      p3Amount: 0 
    };
    const next = [newCompany, ...data];
    setData(next);
    triggerSave(next);
  };

  const handleDeleteCompany = (id: number) => {
    if (!isAdmin) return;
    if (window.confirm("정말 이 업체를 삭제하시겠습니까?")) {
      const next = data.filter(item => item.id !== id);
      setData(next);
      triggerSave(next);
    }
  };

  const handleUpdateField = (id: number, field: keyof CompanyData, value: string | number) => {
    if (!isAdmin) return;
    const next = data.map(item => item.id === id ? { ...item, [field]: value } : item);
    setData(next);
    triggerSave(next);
  };

  const parseNumber = (val: string) => parseInt(val.replace(/,/g, '')) || 0;

  const requestSort = (key: keyof CompanyData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: keyof CompanyData) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUpNarrowWide className="w-3 h-3 ml-1 text-indigo-600" />
      : <ArrowDownWideNarrow className="w-3 h-3 ml-1 text-indigo-600" />;
  };

  const handlePriorityChange = (id: number, newPriority: string) => {
    if (!isAdmin) return;
    const next = data.map(item => {
      if (item.id === id) {
        const priorityInt = parseInt(newPriority);
        return { ...item, priority: priorityInt, p3Amount: priorityInt === 3 ? (item.p3Amount || 0) : 0 };
      }
      return item;
    });
    setData(next);
    triggerSave(next);
  };

  const handleAmountChange = (id: number, amount: string) => {
    if (!isAdmin) return;
    const next = data.map(item => item.id === id ? { ...item, p3Amount: parseInt(amount) || 0 } : item);
    setData(next);
    triggerSave(next);
  };

  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.categories.some(c => c.toLowerCase().includes(searchLower));

      let matchesQuickFilter = true;
      if (filterType === 'p1') matchesQuickFilter = item.priority === 1;
      else if (filterType === 'p2') matchesQuickFilter = item.priority === 2;
      else if (filterType === 'p3') matchesQuickFilter = item.priority === 3;
      else if (filterType === 'none') matchesQuickFilter = item.priority === 0;

      const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(item.priority);
      
      const matchesCategory = selectedCategories.length === 0 || 
        (selectedCategories.includes("미분류") && item.categories.length === 0) ||
        item.categories.some(c => selectedCategories.includes(c));

      return matchesSearch && matchesQuickFilter && matchesPriority && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, filterType, sortConfig, selectedPriorities, selectedCategories]);

  const processedStats = useMemo(() => ({
    count: processedData.length,
    subtotalBalance: processedData.reduce((acc, curr) => acc + curr.balance, 0),
    subtotalOrder: processedData.reduce((acc, curr) => acc + (curr.orderAmount || 0), 0),
    subtotalPlanned: processedData.reduce((acc, curr) => {
      if (curr.priority === 1 || curr.priority === 2) return acc + curr.balance;
      if (curr.priority === 3) return acc + (curr.p3Amount || 0);
      return acc;
    }, 0)
  }), [processedData]);

  const stats = useMemo(() => {
    const p1 = data.filter(i => i.priority === 1).reduce((acc, curr) => acc + curr.balance, 0);
    const p2 = data.filter(i => i.priority === 2).reduce((acc, curr) => acc + curr.balance, 0);
    const p3 = data.filter(i => i.priority === 3).reduce((acc, curr) => acc + (curr.p3Amount || 0), 0);
    return {
      totalBalance: data.reduce((acc, curr) => acc + curr.balance, 0),
      totalOrder: data.reduce((acc, curr) => acc + (curr.orderAmount || 0), 0),
      p1Total: p1, p2Total: p2, p3Total: p3,
      grandTotalPlanned: p1 + p2 + p3
    };
  }, [data]);

  const formatKrw = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

  const priorityOptions = [
    { value: 0, label: '미분류', color: 'text-slate-400 border-slate-200 bg-slate-50' },
    { value: 1, label: '소액 정산', color: 'text-blue-600 border-blue-200 bg-blue-50' },
    { value: 2, label: '업무 원활화', color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
    { value: 3, label: '전략적 부분지급', color: 'text-amber-600 border-amber-200 bg-amber-50' },
  ];

  // ── 로딩 화면 ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">자금계획 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── 비로그인 화면 ──
  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-4 border border-slate-200">
          <CloudOff className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-xl font-black text-slate-800">접근 권한 없음</h1>
          <p className="text-slate-500 text-sm">수불관리 시스템에 먼저 로그인해야 합니다.</p>
          <button
            onClick={goToInventory}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            수불관리 로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 p-2 md:p-4 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* 인쇄 관련 스타일 */}
      <style>{`
        @media print {
          body, html { height: auto !important; overflow: visible !important; }
          .min-h-screen, .h-screen { height: auto !important; min-h-screen: none !important; overflow: visible !important; }
          .max-w-7xl { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .overflow-hidden, .overflow-y-auto { overflow: visible !important; max-height: none !important; height: auto !important; }
          .flex-grow { flex-grow: 0 !important; }
          .rounded-2xl, .shadow-sm { border-radius: 0 !important; box-shadow: none !important; border: none !important; }
          .p-2, .md:p-4 { padding: 0 !important; }
          .space-y-3 > * + * { margin-top: 20px !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; }
          .sticky { position: static !important; }
        }
      `}</style>

      {/* 태그 입력기 컴포넌트 */}
      <script dangerouslySetInnerHTML={{ __html: "" }} />

      <div className="max-w-7xl mx-auto space-y-3 h-full flex flex-col pb-2">

        {/* 헤더 & 요약 통합 바 */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-200 no-print"
        >
          {/* 타이틀 및 이동 버튼 */}
          <div className="flex items-center gap-4">
            <button
              onClick={goToInventory}
              className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200"
              title="수불관리로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">협력업체 자금계획</h1>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  총 {data.length}개 업체
                </span>
                {isAdmin ? (
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Shield className="w-2.5 h-2.5" /> 관리자
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Eye className="w-2.5 h-2.5" /> 읽기전용
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 핵심 요약 (띠 형태) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
              {[
                { label: '소액', val: stats.p1Total, bg: 'bg-white', text: 'text-blue-700' },
                { label: '업무', val: stats.p2Total, bg: 'bg-white', text: 'text-emerald-700' },
                { label: '전략', val: stats.p3Total, bg: 'bg-white', text: 'text-amber-700' }
              ].map(s => (
                <div key={s.label} className={`${s.bg} ${s.text} px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm shrink-0`}>
                  <span className="text-[10px] font-bold uppercase opacity-60">{s.label}</span>
                  <span className="text-sm font-black tabular-nums">₩{formatKrw(s.val)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">전체 발주 총액</span>
                <span className="text-lg font-black text-slate-600 tabular-nums">₩{formatKrw(stats.totalOrder)}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">전체 미수금 총액</span>
                <span className="text-lg font-black text-slate-600 tabular-nums">₩{formatKrw(stats.totalBalance)}</span>
              </div>
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex flex-col items-end shadow-lg ring-4 ring-indigo-500/10">
                <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-tighter">금회 지급 계획 총액</span>
                <span className="text-lg font-black tabular-nums">₩{formatKrw(stats.grandTotalPlanned)}</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* 컨트롤 패널 */}
        <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-2 rounded-2xl border border-slate-200 no-print">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="업체명 검색..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(searchTerm || filterType !== 'all') && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-[10px] font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-lg">{processedStats.count}개 발견</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto flex-1 md:flex-none">
              {['all', 'p1', 'p2', 'p3', 'none'].map((id) => (
                <button
                  key={id}
                  onClick={() => setFilterType(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filterType === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {id === 'all' ? '전체' : id === 'p1' ? '소액' : id === 'p2' ? '업무' : id === 'p3' ? '전략' : '미분류'}
                </button>
              ))}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    saveToFirebase(data)
                      .then(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); })
                      .catch(() => setSaveStatus('error'));
                    setSaveStatus('saving');
                  }}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-emerald-500 transition-all shadow-sm active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  저장
                </button>
                <button
                  onClick={handleAddCompany}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-indigo-500 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  추가
                </button>
              </div>
            )}
            <button
              onClick={() => window.print()}
              className="bg-slate-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-slate-600 transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄
            </button>
          </div>
        </div>

        {/* 메인 테이블 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-grow bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0"
        >
          <div className="overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-grow">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="bg-slate-50 border-b border-slate-100 shadow-sm">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors w-80" onClick={() => requestSort('name')}>
                    <div className="flex items-center">업체명 {renderSortIcon('name')}</div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-56">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center cursor-pointer hover:text-indigo-600" onClick={() => requestSort('categories' as any)}>
                        분류 (다중) {renderSortIcon('categories' as any)}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsCategoryFilterOpen(!isCategoryFilterOpen); setIsPriorityFilterOpen(false); }}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors ${selectedCategories.length > 0 ? 'text-indigo-600 bg-indigo-50' : ''}`}
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                        {isCategoryFilterOpen && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 normal-case font-medium">
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes("미분류")}
                                  onChange={() => setSelectedCategories(prev => prev.includes("미분류") ? prev.filter(c => c !== "미분류") : [...prev, "미분류"])}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>미분류</span>
                              </label>
                              {allAvailableCategories.map(cat => (
                                <label key={cat} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="truncate">{cat}</span>
                                </label>
                              ))}
                            </div>
                            {selectedCategories.length > 0 && (
                              <button
                                onClick={() => setSelectedCategories([])}
                                className="w-full mt-2 text-[10px] text-indigo-600 font-bold py-1 border-t border-slate-100 pt-2 text-center"
                              >
                                필터 초기화
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-indigo-600 transition-colors w-44" onClick={() => requestSort('balance')}>
                    <div className="flex items-center justify-end">미수 잔액 {renderSortIcon('balance')}</div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-indigo-600 transition-colors w-44" onClick={() => requestSort('orderAmount')}>
                    <div className="flex items-center justify-end">발주 금액 {renderSortIcon('orderAmount')}</div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center cursor-pointer hover:text-indigo-600" onClick={() => requestSort('priority')}>
                        우선순위 선택 {renderSortIcon('priority')}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsPriorityFilterOpen(!isPriorityFilterOpen); setIsCategoryFilterOpen(false); }}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors ${selectedPriorities.length > 0 ? 'text-indigo-600 bg-indigo-50' : ''}`}
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                        {isPriorityFilterOpen && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 normal-case font-medium">
                            <div className="space-y-1">
                              {priorityOptions.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={selectedPriorities.includes(opt.value)}
                                    onChange={() => setSelectedPriorities(prev => prev.includes(opt.value) ? prev.filter(p => p !== opt.value) : [...prev, opt.value])}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              ))}
                            </div>
                            {selectedPriorities.length > 0 && (
                              <button onClick={() => setSelectedPriorities([])} className="w-full mt-2 pt-2 border-t border-slate-100 text-[10px] text-indigo-600 font-bold hover:text-indigo-700">
                                필터 초기화
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">금회 지급액</th>
                  {isAdmin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">관리</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {processedData.map((item) => {
                    const currentOption = priorityOptions.find(o => o.value === item.priority);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">{item.id}</td>
                        <td className="px-6 py-4">
                          {isAdmin ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded px-1 font-bold text-slate-800 text-sm outline-none transition-all"
                            />
                          ) : (
                            <span className="font-bold text-slate-800 text-sm px-1">{item.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                            {item.categories.map(cat => (
                              <span 
                                key={cat} 
                                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 shrink-0 ${getTagColor(cat)}`}
                              >
                                {cat}
                                {isAdmin && (
                                  <button 
                                    onClick={() => {
                                      const nextCats = item.categories.filter(c => c !== cat);
                                      handleUpdateField(item.id, 'categories', nextCats);
                                    }}
                                    className="hover:bg-black/10 rounded px-0.5 transition-colors"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))}
                            {isAdmin && (
                              <input
                                type="text"
                                placeholder="+ 분류"
                                className="bg-transparent border-none outline-none text-[10px] font-medium text-slate-400 focus:text-slate-600 w-16"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim();
                                    if (val && !item.categories.includes(val)) {
                                      handleUpdateField(item.id, 'categories', [...item.categories, val]);
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] font-bold text-slate-400">₩</span>
                            {isAdmin ? (
                              <input
                                type="text"
                                value={formatKrw(item.balance)}
                                onChange={(e) => handleUpdateField(item.id, 'balance', parseNumber(e.target.value))}
                                className="w-32 bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded px-1 text-right font-mono font-bold text-slate-900 text-sm outline-none transition-all"
                              />
                            ) : (
                              <span className="font-mono font-bold text-slate-900 text-sm">{formatKrw(item.balance)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] font-bold text-slate-400">₩</span>
                            {isAdmin ? (
                              <input
                                type="text"
                                value={formatKrw(item.orderAmount || 0)}
                                onChange={(e) => handleUpdateField(item.id, 'orderAmount', parseNumber(e.target.value))}
                                className="w-32 bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded px-1 text-right font-mono font-bold text-slate-900 text-sm outline-none transition-all"
                              />
                            ) : (
                              <span className="font-mono font-bold text-slate-900 text-sm">{formatKrw(item.orderAmount || 0)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className="relative inline-block w-44">
                              <select
                                value={item.priority}
                                onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                                disabled={!isAdmin}
                                className={`w-full appearance-none px-4 py-2 rounded-xl text-xs font-bold border outline-none transition-all cursor-pointer pr-10 focus:ring-2 focus:ring-opacity-50 
                                  ${currentOption?.color} 
                                  ${item.priority === 1 ? 'focus:ring-blue-200' : item.priority === 2 ? 'focus:ring-emerald-200' : item.priority === 3 ? 'focus:ring-amber-200' : 'focus:ring-slate-200'}
                                  ${!isAdmin ? 'cursor-not-allowed opacity-80' : ''}`}
                              >
                                {priorityOptions.map(opt => (
                                  <option key={opt.value} value={opt.value} className="bg-white text-slate-900">{opt.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.priority === 3 ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-[10px] font-bold text-amber-500">₩</span>
                              {isAdmin ? (
                                <input
                                  type="text"
                                  value={formatKrw(item.p3Amount)}
                                  onChange={(e) => handleAmountChange(item.id, parseNumber(e.target.value).toString())}
                                  className="w-28 bg-amber-50 border border-amber-200 text-amber-700 text-right font-mono font-bold text-xs px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                                />
                              ) : (
                                <span className="font-mono font-bold text-amber-700 text-xs">₩{formatKrw(item.p3Amount)}</span>
                              )}
                            </div>
                          ) : item.priority === 1 || item.priority === 2 ? (
                            <motion.span
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`font-black text-xs ${item.priority === 1 ? 'text-blue-600' : 'text-emerald-600'}`}
                            >
                              ₩{formatKrw(item.balance)}
                            </motion.span>
                          ) : (
                            <span className="text-slate-300 font-bold text-xs">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteCompany(item.id)}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default App;
