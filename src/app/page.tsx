'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { BrainCircuit, Play, User, BookOpen, GraduationCap, Sun, Moon } from "lucide-react";

// 📚 ADD YOUR COURSES HERE
const AVAILABLE_COURSES = [
  { code: "BCH 201", title: "Biochemistry" },
  { code: "GLT 000", title: "Gluteal Region" },
  
];

export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("");
  const [mode, setMode] = useState("exam");
  const [selectedCourse, setSelectedCourse] = useState(AVAILABLE_COURSES[0]);

  const handleStart = () => {
    if (!name.trim()) {
      alert("Comrade, please enter your name!");
      return;
    }

    // Push Name, Mode, Course Code, and Course Title to the URL
    router.push(
      `/quiz?name=${encodeURIComponent(name)}&mode=${mode}&course=${encodeURIComponent(selectedCourse.code)}&title=${encodeURIComponent(selectedCourse.title)}`
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 p-6 font-sans">

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-8 md:p-10 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="bg-primary/10 p-4 rounded-xl mb-6">
          <BrainCircuit size={48} className="text-primary" strokeWidth={2} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground ">Quizzy</h1>
        <p className="text-muted-foreground mb-8 text-sm font-medium uppercase tracking-widest">Select your battle</p>

        {/* 1. Name Input */}
        <div className="w-full mb-6">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <User size={14} /> Student Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Peace"
            className="w-full rounded-md border border-input bg-background px-4 py-3.5 text-foreground font-medium placeholder:text-muted-foreground placeholder:opacity-30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* 2. Course Selection Grid */}
        <div className="w-full mb-6">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <BookOpen size={14} /> Select Course
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_COURSES.map((course) => (
              <button
                key={course.code}
                onClick={() => setSelectedCourse(course)}
                className={`flex flex-col text-left p-4 rounded-lg border transition-all 
                  ${selectedCourse.code === course.code ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-foreground hover:bg-muted'}`}
              >
                <span className="font-black text-sm uppercase tracking-wider">{course.code}</span>
                <span className="text-xs font-medium mt-1 opacity-80 line-clamp-1">{course.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Mode Selection */}
        <div className="w-full mb-8">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <GraduationCap size={14} /> Exam Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("exam")}
              className={`py-3 rounded-lg font-bold transition-all border ${mode === 'exam' ? 'bg-red-500/10 border-red-500/50 text-red-600' : 'bg-background border-border text-foreground hover:bg-muted'}`}
            >
              Strict Exam (30m)
            </button>
            <button
              onClick={() => setMode("tutor")}
              className={`py-3 rounded-lg font-bold transition-all border ${mode === 'tutor' ? 'bg-blue-500/10 border-blue-500/50 text-blue-600' : 'bg-background border-border text-foreground hover:bg-muted'}`}
            >
              Tutor Mode (Untimed)
            </button>
          </div>
        </div>

        {/* 4. Start Button */}
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-4 font-black text-lg transition-all hover:opacity-90 active:scale-95 shadow-md uppercase tracking-wider"
        >
          <Play size={20} fill="currentColor" /> Enter Portal
        </button>

      </div>
    </main>
  );
}