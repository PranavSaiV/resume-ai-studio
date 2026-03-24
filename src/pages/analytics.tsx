import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, BarChart3, Settings as SettingsIcon, LogOut, User, Home,
  Target, Code, BrainCircuit, BookOpen
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
  { icon: Sparkles, label: "AI Assistant", href: "/assistant", active: false },
  { icon: BarChart3, label: "Analytics", href: "/analytics", active: true },
  { icon: BookOpen, label: "Skill Prep", href: "/skill-prep", active: false },
  { icon: SettingsIcon, label: "Settings", href: "/settings", active: false },
  { icon: SettingsIcon, label: "Settings", href: "/settings", active: false },
];

export default function Analytics() {
  const router = useRouter();
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  
  const [readinessScore, setReadinessScore] = React.useState(0);
  const [quizzes, setQuizzes] = React.useState([
    { id: 1, type: "coding", title: "Two Sum", score: 0, maxScore: 100 },
    { id: 2, type: "coding", title: "Reverse Linked List", score: 0, maxScore: 100 },
    { id: 3, type: "aptitude", title: "Pattern Recognition", score: 0, maxScore: 100 },
    { id: 4, type: "aptitude", title: "Logical Reasoning", score: 0, maxScore: 100 },
  ]);

  React.useEffect(() => {
    async function load() {
      const userId = localStorage.getItem("userId");
      if (!userId) { router.push("/"); return; }
      const userRes = await fetch("/api/auth/me", { headers: { "user-id": userId } });
      if (!userRes.ok) { router.push("/"); return; }
      const user = await userRes.json();
      setUserEmail(user.email || "");
      setUserName(user.name || user.email?.split("@")[0] || "User");
    }
    load();
    
    const savedScores = JSON.parse(localStorage.getItem("quizScores") || "{}");
    const updatedQuizzes = quizzes.map(q => {
      const defaultScore = q.type === "aptitude" ? savedScores["aptitude_latest"] : savedScores["coding_latest"];
      const s = savedScores[q.id] || defaultScore || 0;
      return { ...q, score: s > 100 ? 100 : s };
    });
    setQuizzes(updatedQuizzes);
    
    // Readiness Score computation
    let totalScore = updatedQuizzes.reduce((acc, q) => acc + q.score, 0);
    const maxPossScore = quizzes.length * 100;
    const addedScore = (totalScore / maxPossScore) * 60; // Up to 60 bonus points
    setReadinessScore(Math.floor(40 + addedScore)); // Base 40
  }, [router]);

  async function handleLogout() {
    localStorage.removeItem("userId");
    router.push("/");
  }

  function handleTakeQuiz(id: number) {
    const qType = quizzes.find(q => q.id === id)?.type;
    if (qType === "coding") {
      router.push("/coding");
    } else {
      router.push("/skill-prep");
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-background flex">
      <div className="fixed inset-0" style={{
        background: `radial-gradient(ellipse at 20% 20%, hsl(var(--neon-indigo) / 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, hsl(var(--neon-purple) / 0.08) 0%, transparent 50%), hsl(var(--background))`,
      }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "40px 40px",
      }} />

      {/* Sidebar */}
      <motion.aside className="w-[260px] flex-shrink-0 flex flex-col border-r z-10"
        style={{ borderColor: "hsl(var(--glass-border))", background: "hsl(235 30% 8% / 0.6)", backdropFilter: "blur(30px)" }}>
        <div className="p-6 pb-4 flex items-center gap-3">
          <img src="/forge.png" alt="Anvil Logo" className="w-8 h-8 filter brightness-110 drop-shadow-[0_0_8px_hsl(var(--neon-blue)/0.8)]" />
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight leading-none"><span className="text-gradient">SkillForge</span></h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">Studio</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {sidebarItems.map((item, idx) => (
            <motion.button key={idx}
              onClick={() => item.href && router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={item.active ? { background: "hsl(var(--glass-hover))", boxShadow: "inset 0 0 0 1px hsl(var(--neon-indigo) / 0.2)" } : {}}
              whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
              <item.icon className={`h-4 w-4 transition-colors ${item.active ? "text-accent" : "text-muted-foreground group-hover:text-foreground"}`} />
              {item.label}
              {item.active && (
                <motion.div className="absolute left-0 w-[3px] h-5 rounded-r-full" style={{ background: "linear-gradient(180deg, hsl(var(--neon-blue)), hsl(var(--neon-indigo)))" }} layoutId="sidebarActive" />
              )}
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "hsl(var(--glass-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--glass-hover))" }}>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Log out">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto z-10 w-full">
        <div className="max-w-[1200px] mx-auto px-8 py-8 w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground">Analytics & Skill Prep</h2>
            <p className="text-muted-foreground text-sm mt-1">Check your readiness score and practice your skills.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div className="glass-card p-6 flex flex-col items-center justify-center col-span-1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--neon-blue)]" /> Overall Readiness
              </h3>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-800" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-[var(--neon-blue)]" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * readinessScore) / 100} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold">{readinessScore}%</span>
                  <span className="text-xs text-muted-foreground mt-1">Score</span>
                </div>
              </div>
            </motion.div>

            <motion.div className="col-span-1 md:col-span-2 space-y-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-[var(--neon-purple)]" /> Coding Quizzes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzes.filter(q => q.type === "coding").map(q => (
                  <div key={q.id} className="glass-card p-4 group">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm text-foreground">{q.title}</h4>
                      <span className="text-xs text-muted-foreground">{q.score}/{q.maxScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-[var(--neon-purple)]" style={{ width: `${(q.score / q.maxScore) * 100}%` }} />
                    </div>
                    <button onClick={() => handleTakeQuiz(q.id)} className="text-xs text-primary px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors w-full">
                      {q.score > 0 ? "Retake Quiz" : "Take Quiz"}
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-8 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[var(--neon-indigo)]" /> Aptitude Quizzes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzes.filter(q => q.type === "aptitude").map(q => (
                  <div key={q.id} className="glass-card p-4 group">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm text-foreground">{q.title}</h4>
                      <span className="text-xs text-muted-foreground">{q.score}/{q.maxScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-[var(--neon-indigo)]" style={{ width: `${(q.score / q.maxScore) * 100}%` }} />
                    </div>
                    <button onClick={() => handleTakeQuiz(q.id)} className="text-xs text-primary px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors w-full">
                      {q.score > 0 ? "Retake Quiz" : "Take Quiz"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
