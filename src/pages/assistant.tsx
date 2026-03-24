import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, BarChart3, Settings as SettingsIcon, LogOut, User, Home, Send, BookOpen
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
  { icon: FileText, label: "My Resumes", href: "/dashboard", active: false },
  { icon: Sparkles, label: "AI Assistant", href: "/assistant", active: true },
  { icon: BarChart3, label: "Analytics", href: "/analytics", active: false },
  { icon: BookOpen, label: "Skill Prep", href: "/skill-prep", active: false },
  { icon: SettingsIcon, label: "Settings", href: "/settings", active: false },
];

export default function Assistant() {
  const router = useRouter();
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<{role: "user"|"ai", text: string}[]>([
    { role: "ai", text: "Hello! I am your SkillForge AI Assistant. How can I help you improve your resume today?" }
  ]);
  const [loading, setLoading] = React.useState(false);

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
  }, [router]);

  async function handleLogout() {
    localStorage.removeItem("userId");
    router.push("/");
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId") || "";
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "user-id": userId },
        body: JSON.stringify({ message: msg, resumeId: "" })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: "ai", text: data.reply || "I couldn't generate a response." }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: `Error: ${data.error || data.message || "Failed to process request."}` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "ai", text: `Connection Error: ${e.message || "Failed to connect to the AI."}` }]);
    } finally {
      setLoading(false);
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
          <img src="/image_7.png" alt="Anvil Logo" className="w-8 h-8 filter brightness-110 drop-shadow-[0_0_8px_hsl(var(--neon-blue)/0.8)]" />
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
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Log out">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col z-10 h-screen overflow-hidden">
        <div className="px-8 py-8 flex-shrink-0">
          <h2 className="text-3xl font-display font-bold text-foreground">AI Assistant</h2>
          <p className="text-muted-foreground text-sm mt-1">Chat with Gemini about your resume or for general advice.</p>
        </div>
        
        <div className="flex-1 flex flex-col px-8 pb-8 overflow-hidden max-w-[1000px] w-full mx-auto">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-4 rounded-xl max-w-[80%] ${
                  m.role === "user" 
                    ? "bg-[var(--neon-indigo)]/20 border border-[var(--neon-indigo)]/50 text-white shadow-[0_0_15px_hsl(var(--neon-indigo)/0.15)]" 
                    : "bg-[hsl(235,30%,12%)] border border-white/10 text-gray-200 backdrop-blur-md shadow-inner"
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-xl bg-[hsl(235,30%,12%)] border border-white/10 flex gap-1.5 items-center backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-[var(--neon-indigo)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--neon-indigo)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--neon-indigo)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-muted-foreground ml-2 font-medium">Typing...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..." 
              className="glass-input !w-full !pr-14 !py-4 rounded-xl"
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
