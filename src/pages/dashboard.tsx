import * as React from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Zap, Download, Clock, BarChart3, Settings, LogOut,
  Search, Trash2, Copy, Eye, ChevronRight, Sparkles, TrendingUp, User, Home, Edit3,
} from "lucide-react";

interface Resume {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const sidebarItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: FileText, label: "My Resumes", active: false },
  { icon: Sparkles, label: "AI Assistant", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const orbConfigs = [
  { className: "w-[600px] h-[600px] -top-48 -right-48", color: "var(--neon-blue)", animate: { x: [0, 60, 0], y: [0, 40, 0] }, duration: 16 },
  { className: "w-[500px] h-[500px] bottom-0 -left-32", color: "var(--neon-purple)", animate: { x: [0, -50, 0], y: [0, -60, 0] }, duration: 20 },
  { className: "w-[400px] h-[400px] top-1/2 left-1/3", color: "var(--neon-indigo)", animate: { x: [0, 40, 0], y: [0, -30, 0] }, duration: 14 },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [resumes, setResumes] = React.useState<Resume[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const userId = localStorage.getItem("userId");
      if (!userId) { router.push("/"); return; }

      const userRes = await fetch("/api/auth/me", { headers: { "user-id": userId } });
      if (!userRes.ok) { router.push("/"); return; }
      const user = await userRes.json();
      setUserEmail(user.email || "");
      setUserName(user.name || user.email?.split("@")[0] || "User");

      const resResumes = await fetch("/api/resumes", { headers: { "user-id": userId } });
      const data = await resResumes.json();

      setResumes(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    localStorage.removeItem("userId");
    router.push("/");
  }

  async function handleCreateResume() {
    if (creating) return;
    setCreating(true);
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const res = await fetch("/api/resumes", { method: "POST", headers: { "user-id": userId, "Content-Type": "application/json" }, body: JSON.stringify({ title: "Untitled Resume" }) });
    const data = await res.json();

    if (res.ok && data) {
      router.push(`/resume/${data.id}`);
    }
    setCreating(false);
  }

  async function handleDeleteResume(resumeId: string) {
    const res = await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
    if (res.ok) setResumes((prev) => prev.filter((r) => r.id !== resumeId));
  }

  async function handleDuplicateResume(resumeId: string) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const res = await fetch(`/api/resumes/${resumeId}/duplicate`, { method: "POST", headers: { "user-id": userId } });
    const data = await res.json();
    if (res.ok && data) setResumes((prev) => [data, ...prev]);
  }

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Resumes", value: String(resumes.length), icon: FileText, color: "var(--neon-blue)" },
    { label: "Active", value: String(resumes.filter((r) => r.is_active).length), icon: TrendingUp, color: "var(--neon-green)" },
    { label: "Downloads", value: "—", icon: Download, color: "var(--neon-purple)" },
    { label: "Views", value: "—", icon: Eye, color: "var(--neon-indigo)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="w-10 h-10 rounded-full border-2 border-transparent" style={{ borderTopColor: "hsl(var(--neon-blue))" }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-background">
      <div className="fixed inset-0" style={{
        background: `radial-gradient(ellipse at 20% 20%, hsl(var(--neon-indigo) / 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, hsl(var(--neon-purple) / 0.08) 0%, transparent 50%), hsl(var(--background))`,
      }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {orbConfigs.map((orb, i) => (
          <motion.div key={i} className={`absolute rounded-full blur-[120px] ${orb.className}`}
            style={{ background: `hsl(${orb.color} / 0.05)` }}
            animate={orb.animate} transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 min-h-screen flex">
        {/* Sidebar */}
        <motion.aside className="w-[260px] flex-shrink-0 flex flex-col border-r"
          style={{ borderColor: "hsl(var(--glass-border))", background: "hsl(235 30% 8% / 0.6)", backdropFilter: "blur(30px)" }}
          initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className="p-6 pb-4">
            <h1 className="font-display text-2xl font-extrabold tracking-tight"><span className="text-gradient">Resume AI</span></h1>
            <p className="text-xs text-muted-foreground mt-0.5">Studio</p>
          </div>
          <nav className="flex-1 px-3 space-y-1 mt-2">
            {sidebarItems.map((item, idx) => (
              <motion.button key={idx}
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
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-8 py-8">
            <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Welcome back{userName ? `, ${userName}` : ""}</h2>
                <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your resumes</p>
              </div>
              <button onClick={handleCreateResume} disabled={creating} className="cta-button !w-auto flex items-center gap-2 !px-6 !py-2.5 text-sm">
                <Plus className="h-4 w-4" /> {creating ? "Creating..." : "New Resume"}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid grid-cols-4 gap-4 mb-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
              {stats.map((stat, idx) => (
                <motion.div key={idx} className="glass-card-hover p-5 group cursor-default" whileHover={{ y: -2, transition: { duration: 0.2 } }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                      style={{ background: `hsl(${stat.color} / 0.1)`, color: `hsl(${stat.color})` }}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Resumes */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Your Resumes</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search resumes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="glass-input !pl-10 !pr-4 !py-2 !text-sm !rounded-lg w-[260px]" />
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {filteredResumes.map((resume, idx) => (
                    <motion.div key={resume.id} className="glass-card-hover p-5 flex items-center gap-5 group cursor-pointer"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }} whileHover={{ x: 3, transition: { duration: 0.15 } }}
                      onClick={() => router.push(`/resume/${resume.id}`)}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: resume.is_active ? "hsl(var(--neon-blue) / 0.12)" : "hsl(var(--glass-hover))",
                          color: resume.is_active ? "hsl(var(--neon-blue))" : "hsl(var(--muted-foreground))",
                        }}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground text-sm truncate">{resume.title}</h4>
                          {resume.is_active && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                              style={{ background: "hsl(var(--neon-green) / 0.12)", color: "hsl(var(--neon-green))", border: "1px solid hsl(var(--neon-green) / 0.2)" }}>
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" /> {timeAgo(resume.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-accent/10 transition-colors" title="Edit"
                          onClick={(e) => { e.stopPropagation(); router.push(`/resume/${resume.id}`); }}>
                          <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-accent/10 transition-colors" title="Duplicate"
                          onClick={(e) => { e.stopPropagation(); handleDuplicateResume(resume.id); }}>
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete"
                          onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume.id); }}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredResumes.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    {resumes.length === 0 ? (
                      <>
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm mb-1">No resumes yet</p>
                        <p className="text-xs opacity-70">Click "New Resume" to get started</p>
                      </>
                    ) : (
                      <>
                        <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No resumes match your search</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div className="mt-8 grid grid-cols-3 gap-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
              {[
                { icon: Zap, title: "AI Optimize", desc: "Enhance your resume with AI", color: "var(--neon-blue)" },
                { icon: Download, title: "Export All", desc: "Download all resumes as PDF", color: "var(--neon-purple)" },
                { icon: Sparkles, title: "Generate New", desc: "Create a resume from scratch", color: "var(--neon-indigo)" },
              ].map((action, idx) => (
                <motion.button key={idx} className="feature-item flex items-center gap-4 text-left group" whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{ background: `hsl(${action.color} / 0.1)`, color: `hsl(${action.color})` }}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{action.title}</h4>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
