'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, BrainCircuit, User, GraduationCap, Timer } from "lucide-react";

export default function Home() {
  const { setTheme, theme } = useTheme();
  const [name, setName] = useState("");
  const router = useRouter();

  const startQuiz = (mode: "tutor" | "exam") => {
    if (!name.trim()) {
      alert("Please enter your name first!");
      return;
    }
    router.push(`/quiz?name=${encodeURIComponent(name)}&mode=${mode}`);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 p-6 font-sans">
      
      {/* --- FLAT THEME TOGGLE --- */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 p-2 rounded-md border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* --- FLAT ENTRY CARD --- */}
      <div className="w-full max-w-md rounded-xl bg-card border border-border p-8">
        
        {/* --- ALIGNED HEADER (Matches Quiz Page) --- */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
            <BrainCircuit size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-foreground leading-none mb-2">
            Quizzy
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            BCH 201 • Biochemistry
          </p>
        </div>

        {/* --- FLAT INPUT FIELD --- */}
        <div className="mb-6">
          <label className="mb-2 text-sm font-bold text-muted-foreground flex items-center gap-2">
            <User size={16} /> ENTER YOUR NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. PFIRE"
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-foreground font-normal placeholder:text-muted-foreground placeholder:opacity-30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* --- FLAT ACTION BUTTONS --- */}
        <div className="space-y-3">
          <button
            onClick={() => startQuiz("tutor")}
            className="w-full rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <GraduationCap size={20} strokeWidth={2.5} /> Start Tutor Mode
          </button>
          
          <button
            onClick={() => startQuiz("exam")}
            className="w-full rounded-md border border-red-600 bg-red-600/10 px-4 py-3 font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white flex items-center justify-center gap-2"
          >
            <Timer size={20} strokeWidth={2.5} /> Start Exam Mode
          </button>
        </div>

      </div>
    </main>
  );
}