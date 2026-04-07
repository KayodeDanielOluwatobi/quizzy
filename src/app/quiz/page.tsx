'use client';

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase"; 
import { Sun, Moon, ChevronRight, ChevronLeft, CheckCircle2, XCircle, BrainCircuit, Loader2, Timer, BookOpen } from "lucide-react";

// ⚠️ MASTER EXAM SETTINGS ⚠️
const EXAM_DURATION_MINUTES = 60; // 1 hour for 1000 questions? Omo, change this to what the client wants!
const TOTAL_EXAM_QUESTIONS = 1000; 

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Dynamic URL Parameters
  const name = searchParams.get("name") || "Comrade";
  const mode = searchParams.get("mode") || "exam"; 
  const courseCode = searchParams.get("course") || "ANA 205";
  const courseTitle = searchParams.get("title") || "Gross Anatomy of Lower Limbs";

  // --- 1. SUPABASE STATE ---
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [isFetchingDB, setIsFetchingDB] = useState(true);

  // --- 2. QUIZ STATE & MEMORY ---
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); 
  const [currentQ, setCurrentQ] = useState(0); 
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({}); 

  // --- 3. TUTOR STATE ---
  const [hasChecked, setHasChecked] = useState(false);

  // --- 4. TIMER STATE ---
  const TOTAL_SECONDS = EXAM_DURATION_MINUTES * 60;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // --- AUTOSAVE SYSTEM ---
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

  // --- FETCH ALL SECTIONS DYNAMICALLY ---
  useEffect(() => {
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_code', courseCode)
        .order('id', { ascending: true });

      if (error) console.error("DB Error:", error);

      if (data && data.length > 0) {
        if (mode === "exam") {
          // If total questions requested is higher than DB, limit it to DB size to prevent crashes
          const dbTotal = data.reduce((acc, sec) => acc + sec.questions.length, 0);
          const limit = Math.min(TOTAL_EXAM_QUESTIONS, dbTotal);
          const limitPerSection = Math.ceil(limit / data.length);
          
          const randomizedExamData = data.map(section => {
            const shuffledQuestions = [...section.questions].sort(() => 0.5 - Math.random());
            return { ...section, questions: shuffledQuestions.slice(0, limitPerSection) };
          });
          setSectionsData(randomizedExamData);
          localStorage.setItem("boggle_examData", JSON.stringify(randomizedExamData)); 
        } else {
          setSectionsData(data);
        }
      }
      setIsFetchingDB(false);
    };
    fetchQuiz();
  }, [mode, courseCode]);

  // --- DERIVED METRICS ---
  const totalQuestions = useMemo(() => sectionsData.reduce((acc, sec) => acc + sec.questions.length, 0), [sectionsData]);
  const flatQuestions = useMemo(() => sectionsData.reduce((acc, sec) => [...acc, ...sec.questions], []), [sectionsData]);
  
  const absoluteQuestionIndex = useMemo(() => {
    if (sectionsData.length === 0) return 0;
    let count = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      count += sectionsData[i].questions.length;
    }
    return count + currentQ + 1;
  }, [sectionsData, currentSectionIndex, currentQ]);

  const activeSection = sectionsData.length > 0 ? sectionsData[currentSectionIndex] : null;
  const question = activeSection ? activeSection.questions[currentQ] : null;
  const selectedAnswer = userAnswers[absoluteQuestionIndex - 1] || null;

  // --- SMART TIMER LOGIC ---
  useEffect(() => {
    if (sectionsData.length > 0 && mode === "exam" && timeLeft === null) {
      setTimeLeft(TOTAL_SECONDS); 
    }
  }, [sectionsData, mode, TOTAL_SECONDS, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev ? prev - 1 : 0)), 1000);
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

  const getTimerStyles = () => {
    if (timeLeft === null) return 'bg-muted text-foreground';
    const percentage = timeLeft / TOTAL_SECONDS;
    if (percentage > 0.5) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'; 
    if (percentage > 0.15) return 'bg-amber-500/10 text-amber-600 border-amber-500/20'; 
    return 'bg-red-500 text-white border-red-600 animate-pulse'; 
  };

  // --- HANDLE OPTION CLICKS ---
  const handleMcqSelect = (option: string) => {
    if (hasChecked && mode === "tutor") return; 
    setUserAnswers(prev => ({ ...prev, [absoluteQuestionIndex - 1]: option }));
  };

  const handleMtfSelect = (statementIndex: number, value: "T" | "F") => {
    if (hasChecked && mode === "tutor") return; 
    setUserAnswers(prev => {
      const currentMtfAnswers = (prev[absoluteQuestionIndex - 1] as any) || {};
      return {
        ...prev,
        [absoluteQuestionIndex - 1]: { ...currentMtfAnswers, [statementIndex]: value }
      };
    });
  };

  // --- NAVIGATION CONTROLS ---
  const handleNext = () => {
    if (!activeSection) return;
    setHasChecked(false); 

    if (currentQ < activeSection.questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else if (currentSectionIndex < sectionsData.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQ(0);
    } 
  };

  const handlePrevious = () => {
    setHasChecked(false);

    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQ(sectionsData[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const jumpToQuestion = (targetAbsoluteIndex: number) => {
    setHasChecked(false); 
    let count = 0;
    for (let s = 0; s < sectionsData.length; s++) {
      const sectionLength = sectionsData[s].questions.length;
      if (targetAbsoluteIndex < count + sectionLength) {
        setCurrentSectionIndex(s);
        setCurrentQ(targetAbsoluteIndex - count);
        return;
      }
      count += sectionLength;
    }
  };

  const jumpToSection = (index: number) => {
    setHasChecked(false); 
    setCurrentSectionIndex(index);
    setCurrentQ(0); 
  };

  const handleFinish = () => {
    let finalScore = 0;
    
    // Advanced Scoring Algorithm for mixed MCQ/MTF
    flatQuestions.forEach((q: any, idx: number) => {
      const userPick = userAnswers[idx];
      
      if (!userPick) return; // Skipped question
      
      if (q.type === 'mtf') {
        // Partial marking: e.g. 5 options. Each correct option is worth 1/5 points
        let correctStatements = 0;
        q.correct.forEach((c: string, i: number) => {
          if (userPick[i] === c) correctStatements += 1;
        });
        finalScore += (correctStatements / q.options.length);
      } else {
        // Standard MCQ
        if (userPick === q.correct) finalScore += 1;
      }
    });

    localStorage.removeItem("boggle_timeLeft");

    // Math.round to avoid weird decimals like 95.6000000001
    router.push(`/results?name=${encodeURIComponent(name)}&mode=${mode}&score=${Math.round(finalScore)}&total=${totalQuestions}`);
  };

  const checkAnswer = () => {
    // Prevent checking if MTF isn't fully answered
    if (question.type === 'mtf') {
      const answeredCount = selectedAnswer ? Object.keys(selectedAnswer).length : 0;
      if (answeredCount < question.options.length) {
        alert("Comrade, answer all True/False options before checking!");
        return;
      }
    } else if (!selectedAnswer) return;

    setHasChecked(true); 
  };

  if (isFetchingDB) return <main className="flex min-h-screen items-center justify-center bg-background"><Loader2 size={40} className="animate-spin text-primary" /></main>;
  if (!activeSection || !question) return <main className="flex min-h-screen items-center justify-center">No questions found.</main>;

  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground transition-colors duration-300 p-4 md:p-6 font-sans">
      
      {mode === "exam" && timeLeft !== null && (
        <div className={`w-full max-w-3xl mb-4 px-6 py-4 rounded-xl border flex items-center justify-between transition-colors duration-500 ${getTimerStyles()}`}>
          <div className="flex items-center gap-3">
            <Timer size={24} strokeWidth={2.5} />
            <span className="font-black text-sm uppercase tracking-widest">Time Remaining</span>
          </div>
          <span className="font-mono text-3xl font-black tabular-nums tracking-wider leading-none">{formatTime(timeLeft)}</span>
        </div>
      )}

      <header className="w-full max-w-3xl mb-6 flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
            <BrainCircuit size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-muted-foreground uppercase">{activeSection.course_code}</h1>
            <p className="text-lg md:text-xl font-extrabold leading-none text-foreground mt-0.5 line-clamp-1">{courseTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-black tracking-wider uppercase rounded-md hidden md:block ${mode === 'tutor' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-600'}`}>
            {mode === 'tutor' ? 'Tutor' : 'Exam'}
          </span>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="w-full max-w-3xl mb-8 overflow-x-auto no-scrollbar pb-1">
        <div className="flex gap-2 min-w-max">
          {sectionsData.map((section, index) => (
            <button 
              key={section.id} 
              onClick={() => jumpToSection(index)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 border cursor-pointer hover:bg-muted
                ${index === currentSectionIndex ? "bg-primary text-primary-foreground border-primary" : index < currentSectionIndex ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-card text-muted-foreground border-border"}`}
            >
              {index < currentSectionIndex && <CheckCircle2 size={14} />} {section.section_title}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl flex-1 flex flex-col justify-start">
        <div className="mb-6 flex flex-col md:flex-row md:items-start gap-3">
          <span className="flex items-center justify-center bg-primary text-primary-foreground font-black text-xl rounded-md h-10 w-10 shrink-0">
            {absoluteQuestionIndex}
          </span>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {question.type === 'mtf' ? 'Multiple True / False' : 'Multiple Choice'}
            </p>
            <h2 className="text-lg md:text-2xl font-bold text-foreground leading-relaxed text-left">
              {question.question}
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          
          {/* --- RENDER MCQ --- */}
          {(!question.type || question.type === "mcq") && question.options.map((option: string) => (
            <button 
              key={option} 
              onClick={() => handleMcqSelect(option)} 
              disabled={hasChecked} 
              className={`p-4 rounded-lg border text-left font-medium text-base transition-all flex justify-between items-center 
                ${!hasChecked 
                  ? (selectedAnswer === option ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "border-border bg-card hover:bg-muted text-foreground") 
                  : (option === question.correct ? "border-green-500 bg-green-500/10 text-green-600" : selectedAnswer === option ? "border-red-500 bg-red-500/10 text-red-600" : "border-border bg-card text-muted-foreground opacity-50 cursor-not-allowed")}`}
            >
              <span>{option}</span>
            </button>
          ))}

          {/* --- RENDER MTF --- */}
          {question.type === "mtf" && question.options.map((statement: string, idx: number) => {
            const userPick = selectedAnswer ? selectedAnswer[idx] : null; 
            const correctPick = question.correct[idx];

            let rowStyle = "border-border bg-card text-foreground hover:border-primary/30";
            if (hasChecked) {
              if (userPick === correctPick) rowStyle = "border-green-500 bg-green-500/10 text-green-600";
              else if (userPick) rowStyle = "border-red-500 bg-red-500/10 text-red-600";
              else rowStyle = "border-border bg-card text-muted-foreground opacity-50";
            }

            return (
              <div key={idx} className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${rowStyle}`}>
                <span className="font-medium text-sm md:text-base flex-1 pr-4">{String.fromCharCode(65 + idx)}. {statement}</span>
                
                <div className="flex items-center gap-2 shrink-0 bg-background/50 p-1 rounded-lg border border-border">
                  <button 
                    onClick={() => handleMtfSelect(idx, "T")}
                    disabled={hasChecked}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all border 
                      ${userPick === "T" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-transparent border-transparent hover:bg-muted"}`}
                  >
                    True
                  </button>
                  <button 
                    onClick={() => handleMtfSelect(idx, "F")}
                    disabled={hasChecked}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all border 
                      ${userPick === "F" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-transparent border-transparent hover:bg-muted"}`}
                  >
                    False
                  </button>
                </div>
              </div>
            );
          })}

        </div>

        {/* --- CHECK BUTTON (TUTOR MODE) --- */}
        {mode === "tutor" && !hasChecked && (
          <button 
            onClick={checkAnswer} 
            className="mt-6 w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          >
            Check Answer
          </button>
        )}

        {/* --- DYNAMIC EXPLANATION OUTPUT (INSTANT) --- */}
        {mode === "tutor" && hasChecked && (
          <div className={`mt-6 p-5 rounded-lg border transition-all animate-in fade-in slide-in-from-bottom-2
            ${(!question.type || question.type === "mcq") 
              ? (selectedAnswer === question.correct ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20')
              : 'bg-muted/50 border-border'}`} // MTF just shows neutral explanation box
          >
            {(!question.type || question.type === "mcq") && (
              <>
                <div className={`flex items-center gap-2 mb-3 font-black text-lg
                  ${selectedAnswer === question.correct ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}
                >
                  {selectedAnswer === question.correct ? <CheckCircle2 size={22} strokeWidth={2.5} /> : <XCircle size={22} strokeWidth={2.5} />} 
                  {selectedAnswer === question.correct ? "Correct!" : "Incorrect!"}
                </div>
                {selectedAnswer !== question.correct && (
                  <p className="text-sm font-medium text-foreground mb-4 bg-background/50 p-3 rounded-md border border-border">
                    The right answer is: <span className="font-bold text-green-600 dark:text-green-500">{question.correct}</span>
                  </p>
                )}
              </>
            )}

            <div className={`${(!question.type || question.type === "mcq") ? 'border-t border-border/50 pt-4 mt-2' : ''}`}>
              <div className="flex items-center gap-2 mb-2 text-foreground font-bold text-xs uppercase tracking-wider">
                <BookOpen size={14} className="text-primary" /> Explanation
              </div>
              <p className="text-sm md:text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {question.explanation || "No explanation provided for this question."}
              </p>
            </div>
          </div>
        )}

        {/* --- INLINE NAVIGATION --- */}
        <div className="w-full flex justify-between items-center mt-6">
          <div className="w-1/3 flex justify-start">
            <button onClick={handlePrevious} disabled={absoluteQuestionIndex === 1} className={`px-5 py-2.5 rounded-md font-bold flex items-center gap-2 border border-border bg-card text-foreground transition-all hover:bg-muted ${absoluteQuestionIndex > 1 ? "" : "opacity-0 pointer-events-none"}`}>
              <ChevronLeft size={18} strokeWidth={2.5} /> Prev
            </button>
          </div>
          <div className="w-1/3 flex justify-center text-sm font-bold text-muted-foreground">
            {absoluteQuestionIndex} / {totalQuestions}
          </div>
          <div className="w-1/3 flex justify-end">
            {absoluteQuestionIndex === totalQuestions ? (
              <button onClick={handleFinish} className="px-5 py-2.5 rounded-md font-bold flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all shadow-md">
                <CheckCircle2 size={18} strokeWidth={2.5} /> Finish
              </button>
            ) : (
              <button 
                onClick={handleNext} 
                className={`px-5 py-2.5 rounded-md font-bold flex items-center gap-2 transition-all bg-foreground text-background hover:opacity-90 shadow-md`}
              >
                Next <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- EXAM MAP --- */}
      <div className="w-full max-w-3xl mt-12 pt-6 border-t border-border">
        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Exam Progress Map</p>
        <div className="flex flex-wrap gap-2">
          {flatQuestions.map((q: any, idx: number) => {
            const isCurrent = idx === absoluteQuestionIndex - 1;
            
            // Logic to determine if a question is fully answered
            let isAnswered = false;
            if (q.type === 'mtf') {
               const answers = userAnswers[idx];
               isAnswered = answers && Object.keys(answers).length === q.options.length;
            } else {
               isAnswered = !!userAnswers[idx];
            }

            return (
              <button
                key={idx}
                onClick={() => jumpToQuestion(idx)}
                className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold border transition-all cursor-pointer hover:bg-muted
                  ${isCurrent ? "bg-primary text-primary-foreground border-primary scale-110 shadow-md z-10" : isAnswered ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-card text-muted-foreground border-border"}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return <Suspense><QuizContent /></Suspense>;
}