import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, BarChart3, Settings as SettingsIcon, LogOut, User, Home, BookOpen, CheckCircle
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
  { icon: Sparkles, label: "AI Assistant", href: "/assistant", active: false },
  { icon: BarChart3, label: "Analytics", href: "/analytics", active: false },
  { icon: BookOpen, label: "Skill Prep", href: "/skill-prep", active: true },
  { icon: SettingsIcon, label: "Settings", href: "/settings", active: false },
];

import { QuizComponent } from "../components/QuizComponent";

export default function SkillPrep() {
  const router = useRouter();
  const { domain, topic } = router.query;

  const domainStr = typeof domain === 'string' ? domain : undefined;
  const topicStr = typeof topic === 'string' ? topic : undefined;

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
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
              <item.icon className={`h-4 w-4 ${item.active ? "text-[var(--neon-blue)]" : ""}`} /> {item.label}
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto z-10 p-8 flex flex-col items-center pt-16">
        <div className="w-full max-w-2xl px-4 text-center mb-8">
           <h2 className="text-3xl font-display font-bold text-foreground mb-3">Skill Preparation Quiz</h2>
           <p className="text-muted-foreground text-sm">Assess your programming knowledge and receive AI feedback on your weak points.</p>
        </div>
        
        <QuizComponent domain={domainStr} topic={topicStr} />
      </main>
    </div>
  );
}
