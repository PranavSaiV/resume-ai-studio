import * as React from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Mail, Lock, User, ArrowRight, Zap, CheckCircle2, Download, Eye, EyeOff,
} from "lucide-react";

type AuthTab = "login" | "signup";

const features = [
  { icon: Zap, title: "AI-Powered", desc: "Smart suggestions powered by AI", color: "var(--neon-blue)" },
  { icon: CheckCircle2, title: "Professional Templates", desc: "Industry-standard layouts", color: "var(--neon-purple)" },
  { icon: Download, title: "Easy Export", desc: "Download in multiple formats", color: "var(--neon-indigo)" },
];

const orbConfigs = [
  { className: "w-[500px] h-[500px] -top-40 -left-40", color: "var(--neon-blue)", animate: { x: [0, 80, 0], y: [0, 50, 0] }, duration: 14 },
  { className: "w-[600px] h-[600px] top-1/3 -right-48", color: "var(--neon-purple)", animate: { x: [0, -60, 0], y: [0, -70, 0] }, duration: 18 },
  { className: "w-[450px] h-[450px] -bottom-32 left-1/4", color: "var(--neon-indigo)", animate: { x: [0, 50, 0], y: [0, -40, 0] }, duration: 12 },
  { className: "w-[350px] h-[350px] top-1/4 left-1/2", color: "var(--neon-blue)", animate: { x: [0, -30, 0], y: [0, 60, 0] }, duration: 16 },
];

function CyberInput({ name, type = "text", placeholder, icon: Icon, disabled, required, minLength }: {
  name: string; type?: string; placeholder: string; icon: React.ElementType; disabled: boolean; required?: boolean; minLength?: number;
}) {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative group">
      <input
        name={name}
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        className="cyber-input"
        required={required}
        disabled={disabled}
        minLength={minLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors p-1" tabIndex={-1}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        <Icon className={`h-4 w-4 transition-all duration-300 ${focused ? "text-accent drop-shadow-[0_0_6px_hsl(var(--neon-blue)/0.6)]" : "text-muted-foreground"}`} />
      </div>
    </div>
  );
}

function AuthFeedback({ error, success }: { error: string; success: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
          className="p-3 rounded-lg text-sm" style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }}>
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
          className="p-3 rounded-lg text-sm" style={{ background: "hsl(var(--neon-green) / 0.1)", border: "1px solid hsl(var(--neon-green) / 0.3)", color: "hsl(var(--neon-green))" }}>
          {success}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = React.useState<AuthTab>("login");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const router = useRouter();

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("userId", data.userId);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      localStorage.setItem("userId", data.userId);
      setSuccess("Account created! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-background">
      <div className="fixed inset-0" style={{
        background: `radial-gradient(ellipse at 20% 20%, hsl(var(--neon-indigo) / 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 30%, hsl(var(--neon-blue) / 0.06) 0%, transparent 40%),
          hsl(var(--background))`,
      }} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {orbConfigs.map((orb, i) => (
          <motion.div key={i} className={`absolute rounded-full blur-[120px] ${orb.className}`}
            style={{ background: `hsl(${orb.color} / 0.07)` }}
            animate={orb.animate}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-8 py-8">
        <motion.div className="w-full max-w-[1100px]" initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className="relative rounded-3xl overflow-hidden" style={{
            background: "hsl(235 30% 12% / 0.75)", backdropFilter: "blur(40px) saturate(1.3)",
            border: "1px solid hsl(0 0% 100% / 0.12)",
            boxShadow: `0 0 0 1px hsl(0 0% 100% / 0.08), 0 25px 60px -12px hsl(235 45% 6% / 0.8), inset 0 1px 0 hsl(0 0% 100% / 0.06)`,
          }}>
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: "hsl(var(--neon-indigo) / 0.08)" }} />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: "hsl(var(--neon-purple) / 0.06)" }} />

            <div className="grid grid-cols-2">
              {/* Left - Branding */}
              <div className="p-12 lg:p-16 flex flex-col justify-center border-r" style={{ borderColor: "hsl(var(--glass-border))" }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
                  <h1 className="font-display text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
                    <span className="text-gradient">Resume AI</span><br /><span className="text-gradient">Studio</span>
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-sm font-light">
                    Craft professional resumes with AI-powered intelligence. Stand out with beautiful, tailored documents.
                  </p>
                </motion.div>

                <div className="mt-10 space-y-2">
                  {features.map((item, idx) => (
                    <motion.div key={idx} className="feature-item flex items-center gap-4" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.1, duration: 0.5 }} whileHover={{ x: 4 }}>
                      <motion.div className="relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ color: `hsl(${item.color})` }} whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}>
                        <item.icon className="w-5 h-5 relative z-10" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right - Auth form */}
              <div className="p-12 lg:p-16 flex flex-col justify-center">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                  <div className="relative flex gap-8 mb-10">
                    {(["login", "signup"] as const).map((tab) => (
                      <button key={tab} onClick={() => { setActiveTab(tab); setError(""); setSuccess(""); }}
                        className={`relative pb-3 text-sm font-semibold transition-colors duration-200 ${activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}>
                        {tab === "login" ? "Sign In" : "Create Account"}
                        {activeTab === tab && (
                          <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" layoutId="tabIndicator"
                            style={{ background: "linear-gradient(90deg, hsl(var(--neon-blue)), hsl(var(--neon-purple)))", boxShadow: "0 0 10px hsl(var(--neon-blue) / 0.5)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                        )}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "login" ? (
                      <motion.form key="login" onSubmit={onLogin} className="space-y-7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                          <CyberInput name="email" type="email" placeholder="your@example.com" icon={Mail} disabled={isLoading} required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                          <CyberInput name="password" type="password" placeholder="••••••••" icon={Lock} disabled={isLoading} required minLength={6} />
                        </div>
                        <AuthFeedback error={error} success={success} />
                        <button type="submit" className="cta-button flex items-center justify-center gap-2" disabled={isLoading}>
                          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form key="signup" onSubmit={onSignUp} className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                          <CyberInput name="name" type="text" placeholder="John Doe" icon={User} disabled={isLoading} required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                          <CyberInput name="email" type="email" placeholder="your@example.com" icon={Mail} disabled={isLoading} required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                          <CyberInput name="password" type="password" placeholder="••••••••" icon={Lock} disabled={isLoading} required minLength={6} />
                        </div>
                        <AuthFeedback error={error} success={success} />
                        <button type="submit" className="cta-button flex items-center justify-center gap-2" disabled={isLoading}>
                          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <p className="mt-8 text-xs text-muted-foreground text-center">
                    By continuing, you agree to our{" "}
                    <span className="text-primary cursor-pointer hover:underline">Terms</span> &{" "}
                    <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
