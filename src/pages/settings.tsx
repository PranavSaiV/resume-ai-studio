import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, BarChart3, Settings as SettingsIcon, LogOut, User, Home, BookOpen
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: false },
  { icon: FileText, label: "My Resumes", href: "/dashboard", active: false },
  { icon: Sparkles, label: "AI Assistant", href: "/assistant", active: false },
  { icon: BarChart3, label: "Analytics", href: "/analytics", active: false },
  { icon: BookOpen, label: "Skill Prep", href: "/skill-prep", active: false },
  { icon: SettingsIcon, label: "Settings", href: "/settings", active: true },
];

export default function Settings() {
  const router = useRouter();
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");

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
            <h2 className="text-3xl font-display font-bold text-foreground">Settings</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage your account preferences and integrations.</p>
          </div>
          
          <div className="glass-card p-6 max-w-[600px]">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                <input type="text" value={userName} readOnly className="glass-input !w-full" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email Address</label>
                <input type="email" value={userEmail} readOnly className="glass-input !w-full opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
