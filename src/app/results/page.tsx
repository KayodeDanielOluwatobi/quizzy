'use client';

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, BrainCircuit, CheckCircle2, XCircle, Search, Eye, AlertCircle } from "lucide-react";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Data
  const name = searchParams.get("name") || "Comrade";
  const mode = searchParams.get("mode") || "exam";
  const score = parseInt(searchParams.get("score") || "0", 10);
  const total = parseInt(searchParams.get("total") || "3", 10);

  // --- REVIEW SYSTEM STATE ---
  const [showReview, setShowReview] = useState(false);
  const [examData, setExamData] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // Fetch Exam Paper from Memory
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("boggle_examData");
      const savedAnswers = localStorage.getItem("boggle_userAnswers");
      
      if (savedData) setExamData(JSON.parse(savedData));
      if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  const flatQuestions = useMemo(() => {
    return examData.reduce((acc, section) => [...acc, ...section.questions], []);
  }, [examData]);

  const cleanUpAndRoute = (path: string) => {
    localStorage.removeItem("boggle_userAnswers");
    localStorage.removeItem("boggle_examData");
    localStorage.removeItem("boggle_currentSection");
    localStorage.removeItem("boggle_currentQ");
    router.push(path);
  };

  // --- SCORE METRICS ---
  const percentage = Math.round((score / total) * 100);
  const incorrect = total - score;

  let grade = "";
  let verdict = "";
  let accentColor = "";

  if (percentage >= 80) {
    grade = "A";
    verdict = "Distinction! Omo, you are a god. 👑";
    accentColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  } else if (percentage >= 60) {
    grade = "B";
    verdict = "Solid effort. You know your stuff, but keep reading. 📚";
    accentColor = "text-blue-600 bg-blue-500/10 border-blue-500/20";
  } else if (percentage >= 50) {
    grade = "C";
    verdict = "You scraped by. Comrade, we need to do better next time. 😅";
    accentColor = "text-amber-600 bg-amber-500/10 border-amber-500/20";
  } else {
    grade = "F";
    verdict = "Ah ah! You fumbled this one. See me in my office. 🥲";
    accentColor = "text-red-600 bg-red-500/10 border-red-500/20";
  }

  return (
    <div className={`w-full ${showReview ? 'max-w-4xl' : 'max-w-lg'} transition-all duration-500 rounded-xl bg-card border border-border p-8 md:p-10 flex flex-col items-center`}>
      
      <div className="flex flex-col items-center text-center mb-10 w-full">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="text-primary" size={24} strokeWidth={2.5} />
          <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Quizzy Analytics</span>
        </div>
        <h1 className="text-3xl font-black text-foreground uppercase tracking-tight leading-none mb-1">
          Exam Report
        </h1>
      </div>

      <div className={`w-full flex ${showReview ? 'flex-col md:flex-row gap-8 items-start' : 'flex-col items-center'}`}>
        
        {/* --- LEFT COLUMN: THE SCORE CARD --- */}
        <div className={`w-full ${showReview ? 'md:w-1/3' : 'w-full'} flex flex-col items-center`}>
          <div className="w-full bg-muted/30 border border-border rounded-xl p-8 flex flex-col items-center mb-6">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Final Score for {name}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-7xl font-black tabular-nums tracking-tighter text-foreground leading-none">{percentage}</span>
              <span className="text-3xl font-bold text-muted-foreground">%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mt-4">
              <div className={`h-full rounded-full transition-all duration-1000 ${percentage >= 50 ? 'bg-primary' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-3 mb-8">
            <div className="flex flex-col items-center p-4 bg-card border border-border rounded-md">
              <CheckCircle2 size={18} className="text-green-500 mb-2" strokeWidth={2.5} />
              <span className="text-2xl font-black tabular-nums">{score}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Correct</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-card border border-border rounded-md">
              <XCircle size={18} className="text-red-500 mb-2" strokeWidth={2.5} />
              <span className="text-2xl font-black tabular-nums">{incorrect}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Missed</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-4 border rounded-md ${accentColor}`}>
              <span className="text-3xl font-black leading-none mt-1">{grade}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Grade</span>
            </div>
          </div>

          <div className="w-full px-4 py-3 bg-muted/50 border border-border rounded-md mb-8 text-center">
            <p className="text-sm font-semibold text-foreground leading-relaxed">{verdict}</p>
          </div>

          <div className="w-full space-y-3">
            {mode === "exam" && flatQuestions.length > 0 && (
              <button
                onClick={() => setShowReview(!showReview)}
                className={`w-full flex items-center justify-center gap-2 rounded-md px-4 py-3.5 font-bold transition-all border 
                  ${showReview ? 'bg-muted text-foreground border-border' : 'bg-foreground text-background border-transparent hover:opacity-90'}`}
              >
                {showReview ? <ArrowLeft size={18} /> : <Eye size={18} />} 
                {showReview ? "Hide Review" : "Review My Answers"}
              </button>
            )}
            <button onClick={() => cleanUpAndRoute("/")} className="w-full flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3.5 font-bold text-foreground transition-all hover:bg-muted">
              <ArrowLeft size={18} strokeWidth={2.5} /> Return to Dashboard
            </button>
          </div>
        </div>

        {/* --- RIGHT COLUMN: THE EXAM REVIEW LOG --- */}
        {showReview && (
          <div className="w-full md:w-2/3 h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="sticky top-0 bg-card z-10 pb-4 border-b border-border mb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Search size={18} className="text-primary" /> Exam Breakdown
              </h2>
              <p className="text-xs font-medium text-muted-foreground mt-1">Review your selections against the correct answers.</p>
            </div>

            {flatQuestions.map((q: any, idx: number) => {
              const userPick = userAnswers[idx];
              const isCorrect = userPick === q.correct;
              const isUnanswered = !userPick;

              return (
                <div key={idx} className={`p-5 rounded-lg border transition-all ${isCorrect ? 'bg-green-500/5 border-green-500/20' : isUnanswered ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <h3 className="text-sm md:text-base font-bold text-foreground leading-snug mb-4">
                    <span className="text-muted-foreground mr-1">{idx + 1}.</span> {q.question}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle2 size={16} className="text-green-600 mt-0.5" /> : isUnanswered ? <AlertCircle size={16} className="text-amber-600 mt-0.5" /> : <XCircle size={16} className="text-red-600 mt-0.5" />}
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Answer:</span>
                        <p className={`text-sm font-medium ${isCorrect ? 'text-green-700 dark:text-green-500' : isUnanswered ? 'text-amber-700 dark:text-amber-500' : 'text-red-700 dark:text-red-500'}`}>
                          {userPick || "No Answer Selected"}
                        </p>
                      </div>
                    </div>

                    {!isCorrect && (
                      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border/50">
                        <CheckCircle2 size={16} className="text-green-600 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correct Answer:</span>
                          <p className="text-sm font-medium text-foreground">{q.correct}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 p-6 font-sans">
      <Suspense fallback={<div className="text-sm font-bold animate-pulse text-muted-foreground uppercase tracking-widest">Processing Results...</div>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}