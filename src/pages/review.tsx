import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FileText, Save, ArrowLeft, CheckCircle, Zap } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const [extractedText, setExtractedText] = React.useState("");
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const text = sessionStorage.getItem("reviewText");
    const aiData = sessionStorage.getItem("reviewAnalysis");
    
    if (!text || !aiData) {
      router.push("/dashboard");
      return;
    }
    
    setExtractedText(text);
    setAnalysis(JSON.parse(aiData));
  }, [router]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/resumes/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "user-id": localStorage.getItem("userId") || "" 
        },
        body: JSON.stringify({ analysis })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        sessionStorage.removeItem("reviewText");
        sessionStorage.removeItem("reviewAnalysis");
        router.push(`/resume/${data.id}`);
      } else {
        alert("Failed to save resume");
      }
    } catch (e) {
      alert("Error saving resume");
    }
    setSaving(false);
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground"><ArrowLeft className="h-4 w-4" /></button>
          <div className="font-bold text-lg text-white flex items-center gap-2"><FileText className="h-5 w-5 text-[var(--neon-blue)]" /> Document Review</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="cta-button !w-auto !px-6 !py-2 flex gap-2 items-center text-sm font-semibold">
          {saving ? <div className="w-4 h-4 rounded-full border-2 border-[var(--neon-blue)] border-t-white animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save to Dashboard"}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Extracted Text */}
        <div className="flex-1 border-r border-white/10 flex flex-col">
           <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2 shadow-sm z-10">
             <div className="w-2.5 h-2.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
             <h3 className="text-sm font-semibold tracking-wide text-white">Full Extracted Content</h3>
           </div>
           <div className="flex-1 p-6 overflow-y-auto bg-[hsl(235,20%,8%)] shadow-inner">
             <textarea 
               value={extractedText} 
               onChange={(e) => setExtractedText(e.target.value)}
               className="w-full min-h-[500px] h-full bg-transparent border-none text-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0"
               placeholder="Raw resume content goes here..."
             />
           </div>
        </div>

        {/* Right: AI Feedback */}
        <div className="w-[450px] flex flex-col bg-[hsl(235,30%,10%)]">
           <div className="p-4 border-b border-white/10 bg-black/20 z-10">
             <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2"><Zap className="h-4 w-4 text-[var(--neon-purple)]" /> AI Diagnostics Output</h3>
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto space-y-6">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-[var(--neon-blue)]/30 border shadow-[0_0_20px_hsl(var(--neon-blue)/0.15)] relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10">
                 <Zap className="h-32 w-32 filter blur-sm" />
               </div>
               <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Estimated ATS Match</h4>
               <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] tracking-tighter">
                 {analysis.atsScore}%
               </div>
             </motion.div>

             <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
               <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[var(--neon-green)]" /> Recommended Improvements</h4>
               <ul className="space-y-3">
                 {(analysis.suggestions || []).map((suggestion: string, i: number) => (
                   <li key={i} className="text-sm text-gray-300 leading-relaxed border-l-2 border-[var(--neon-blue)] pl-3 bg-white/5 p-2 rounded-r-lg">
                     {suggestion}
                   </li>
                 ))}
               </ul>
             </motion.div>

             <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
               <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[var(--neon-indigo)]" /> Extracted Skills</h4>
               <div className="flex flex-wrap gap-2">
                 {(analysis.skills || []).map((skill: string, i: number) => (
                   <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[var(--neon-indigo)]/10 border border-[var(--neon-indigo)]/30 text-[var(--neon-indigo)] font-medium">
                     {skill}
                   </span>
                 ))}
               </div>
             </motion.div>
           </div>
        </div>

      </div>
    </div>
  );
}
