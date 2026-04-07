'use client';

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase"; 
import { Sun, Moon, ChevronRight, ChevronLeft, CheckCircle2, XCircle, BrainCircuit, Loader2, Timer, BookOpen, AlertTriangle } from "lucide-react";

// ⚠️ MASTER EXAM SETTINGS ⚠️
const EXAM_DURATION_MINUTES = 60; 
const TOTAL_EXAM_QUESTIONS = 1000; 

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const name = searchParams.get("name") || "Comrade";
  const mode = searchParams.get("mode") || "exam"; 
  const courseCode = searchParams.get("course") || "ANA 205";
  const courseTitle = searchParams.get("title") || "Gross Anatomy of Lower Limbs";

  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [isFetchingDB, setIsFetchingDB] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); 
  const [currentQ, setCurrentQ] = useState(0); 
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({}); 
  const [hasChecked, setHasChecked] = useState(false);

  const TOTAL_SECONDS = EXAM_DURATION_MINUTES * 60;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // --- AUTOSAVE & RESTORE ---
  useEffect(() => {
    if (mode === "exam" && typeof window !== "undefined") {
      const savedTime = localStorage.getItem("boggle_timeLeft");
      const savedAnswers = localStorage.getItem("boggle_userAnswers");
      const savedSection = localStorage.getItem("boggle_currentSection");
      const savedQ = localStorage.getItem("boggle_currentQ");
      if (savedTime) setTimeLeft(parseInt(savedTime, 10));
      if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
      if (savedSection) setCurrentSectionIndex(parseInt(savedSection, 10));
      if (savedQ) setCurrentQ(parseInt(savedQ, 10));
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "exam" && typeof window !== "undefined") {
      localStorage.setItem("boggle_userAnswers", JSON.stringify(userAnswers));
      localStorage.setItem("boggle_currentSection", currentSectionIndex.toString());
      localStorage.setItem("boggle_currentQ", currentQ.toString());
    }
  }, [userAnswers, currentSectionIndex, currentQ, mode]);

  useEffect(() => {
    if (mode === "exam" && timeLeft !== null && typeof window !== "undefined") {
      localStorage.setItem("boggle_timeLeft", timeLeft.toString());
    }
  }, [timeLeft, mode]);

  // --- DB FETCH ---
  useEffect(() => {
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_code', courseCode)
        .order('id', { ascending: true });

      if (data && data.length > 0) {
        if (mode === "exam") {
          const dbTotal = data.reduce((acc, sec) => acc + sec.questions.length, 0);
          const limit = Math.min(TOTAL_EXAM_QUESTIONS, dbTotal);
          const limitPerSection = Math.ceil(limit / data.length);
          const randomized = data.map(section => ({
            ...section,
            questions: [...section.questions].sort(() => 0.5 - Math.random()).slice(0, limitPerSection)
          }));
          setSectionsData(randomized);
          localStorage.setItem("boggle_examData", JSON.stringify(randomized)); 
        } else {
          setSectionsData(data);
        }
      }
      setIsFetchingDB(false);
    };
    fetchQuiz();
  }, [mode, courseCode]);

  const totalQuestions = useMemo(() => sectionsData.reduce((acc, sec) => acc + sec.questions.length, 0), [sectionsData]);
  const flatQuestions = useMemo(() => sectionsData.reduce((acc, sec) => [...acc, ...sec.questions], []), [sectionsData]);
  const absoluteQuestionIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentSectionIndex; i++) count += sectionsData[i].questions.length;
    return count + currentQ + 1;
  }, [sectionsData, currentSectionIndex, currentQ]);

  const activeSection = sectionsData[currentSectionIndex] || null;
  const question = activeSection ? activeSection.questions[currentQ] : null;
  const selectedAnswer = userAnswers[absoluteQuestionIndex - 1] || null;

  // --- TIMER ---
  useEffect(() => {
    if (sectionsData.length > 0 && mode === "exam" && timeLeft === null) setTimeLeft(TOTAL_SECONDS);
  }, [sectionsData, mode, TOTAL_SECONDS, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(p => (p ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
      : `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- HANDLERS ---
  const handleMcqSelect = (opt: string) => { if (!hasChecked || mode === "exam") setUserAnswers(p => ({ ...p, [absoluteQuestionIndex - 1]: opt })); };
  const handleMtfSelect = (idx: number, val: "T" | "F") => {
    if (hasChecked && mode === "tutor") return;
    setUserAnswers(p => {
      const current = p[absoluteQuestionIndex - 1] || {};
      return { ...p, [absoluteQuestionIndex - 1]: { ...current, [idx]: val } };
    });
  };

  const jumpToQuestion = (targetIdx: number) => {
    setHasChecked(false);
    let count = 0;
    for (let s = 0; s < sectionsData.length; s++) {
      const secLen = sectionsData[s].questions.length;
      if (targetIdx < count + secLen) {
        setCurrentSectionIndex(s);
        setCurrentQ(targetIdx - count);
        return;
      }
      count += secLen;
    }
  };

  const handleNext = () => {
    setHasChecked(false);
    if (currentQ < activeSection.questions.length - 1) setCurrentQ(p => p + 1);
    else if (currentSectionIndex < sectionsData.length - 1) { setCurrentSectionIndex(p => p + 1); setCurrentQ(0); }
  };

  const handlePrevious = () => {
    setHasChecked(false);
    if (currentQ > 0) setCurrentQ(p => p - 1);
    else if (currentSectionIndex > 0) {
      const prevIdx = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIdx);
      setCurrentQ(sectionsData[prevIdx].questions.length - 1);
    }
  };

  const handleFinish = () => {
    let finalScore = 0;
    flatQuestions.forEach((q: any, idx: number) => {
      const pick = userAnswers[idx];
      if (!pick) return;
      if (q.type === 'mtf') {
        let qScore = 0;
        const pt = 1 / q.options.length;
        q.correct.forEach((c: string, i: number) => {
          if (pick[i] === c) qScore += pt;
          else if (pick[i]) qScore -= pt;
        });
        finalScore += Math.max(0, qScore);
      } else {
        if (pick === q.correct) finalScore += 1;
      }
    });
    localStorage.removeItem("boggle_timeLeft");
    router.push(`/results?name=${encodeURIComponent(name)}&mode=${mode}&score=${Math.round(finalScore)}&total=${totalQuestions}`);
  };

  if (isFetchingDB) return <main className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></main>;
  if (!question) return null;

  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground p-4 md:p-6 font-sans transition-colors duration-300">
      
      {/* Timer */}
      {mode === "exam" && timeLeft !== null && (
        <div className={`w-full max-w-3xl mb-4 px-6 py-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${timeLeft < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-muted border-border'}`}>
          <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest"><Timer size={18}/> Time Left</div>
          <span className="font-mono text-2xl font-black">{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Header */}
      <header className="w-full max-w-3xl mb-6 flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary text-primary-foreground flex items-center justify-center rounded-lg font-black">{absoluteQuestionIndex}</div>
          <div><p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{activeSection.course_code}</p><p className="font-black text-sm md:text-base leading-none mt-1">{courseTitle}</p></div>
        </div>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 bg-muted rounded-md">{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button>
      </header>

      {/* Warning Box */}
      <div className="w-full max-w-3xl mb-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
        <p className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-tight">Negative marking active (-0.2 per wrong MTF click). Skip if unsure.</p>
      </div>

      <div className="w-full max-w-3xl flex-1 flex flex-col">
        <h2 className="text-lg md:text-2xl font-bold mb-6 leading-relaxed">{question.question}</h2>

        {/* --- OPTIONS AREA --- */}
        <div className="grid grid-cols-1 gap-3 flex-1">
          {(!question.type || question.type === "mcq") && question.options.map((opt: string) => (
            <button key={opt} onClick={() => handleMcqSelect(opt)} disabled={hasChecked} className={`p-4 rounded-lg border text-left font-medium transition-all ${selectedAnswer === opt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-muted'}`}>
              {opt}
            </button>
          ))}

          {question.type === "mtf" && question.options.map((stmt: string, idx: number) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-card flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-primary/30">
              <span className="text-sm font-medium leading-relaxed">{String.fromCharCode(65+idx)}. {stmt}</span>
              <div className="flex gap-2 shrink-0 bg-background/50 p-1 rounded-lg border border-border">
                {["T", "F"].map(v => (
                  <button key={v} onClick={() => handleMtfSelect(idx, v as any)} disabled={hasChecked} className={`px-4 py-2 rounded-md font-bold text-xs border transition-all ${selectedAnswer?.[idx] === v ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-muted'}`}>
                    {v === "T" ? "True" : "False"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {mode === "tutor" && !hasChecked && (
          <button onClick={() => { if(question.type==='mtf' && Object.keys(selectedAnswer||{}).length < question.options.length) return alert("Please answer all 5 statements before checking!"); setHasChecked(true); }} className="mt-6 w-full py-4 bg-primary text-primary-foreground rounded-lg font-black uppercase shadow-lg transition-transform active:scale-[0.98]">Check Answer</button>
        )}

        {hasChecked && question.explanation && (
          <div className="mt-6 p-5 bg-muted border border-border rounded-lg text-sm italic leading-relaxed whitespace-pre-wrap shadow-inner animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold uppercase tracking-widest text-[10px]"><BookOpen size={14}/> Explanation</div>
            {question.explanation}
          </div>
        )}

        {/* --- NAVIGATION CONTROLS --- */}
        <div className="flex justify-between items-center mt-10 mb-10">
          <button onClick={handlePrevious} disabled={absoluteQuestionIndex === 1} className="px-6 py-2.5 border border-border rounded-md font-bold bg-card text-foreground transition-all hover:bg-muted disabled:opacity-0"><ChevronLeft/></button>
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{absoluteQuestionIndex} / {totalQuestions}</span>
          {absoluteQuestionIndex === totalQuestions ? 
            <button onClick={handleFinish} className="px-6 py-2.5 bg-green-600 text-white rounded-md font-bold shadow-md hover:bg-green-700 transition-all">FINISH</button> :
            <button onClick={handleNext} className="px-6 py-2.5 bg-foreground text-background rounded-md font-bold shadow-md hover:opacity-90 transition-all"><ChevronRight/></button>
          }
        </div>

        {/* --- THE LEGENDARY EXAM MAP (ORIGINAL UI) --- */}
        <div className="w-full pt-8 border-t border-border mt-4">
          <p className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Exam Progress Map</p>
          <div className="flex flex-wrap gap-2">
            {flatQuestions.map((q: any, idx: number) => {
              const isCurrent = idx === absoluteQuestionIndex - 1;
              const pick = userAnswers[idx];
              // MTF is only "Answered" if ALL statements are clicked
              const isAnswered = q.type === 'mtf' ? (pick && Object.keys(pick).length === q.options.length) : !!pick;
              
              return (
                <button
                  key={idx}
                  onClick={() => jumpToQuestion(idx)}
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-bold border transition-all
                    ${isCurrent ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg z-10" : isAnswered ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function QuizPage() { return <Suspense><QuizContent /></Suspense>; }