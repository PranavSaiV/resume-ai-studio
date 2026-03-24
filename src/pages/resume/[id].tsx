import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Plus, Trash2, Download, X, Sparkles,
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Wrench,
} from "lucide-react";

interface PersonalInfo { name: string; email: string; phone: string; location: string; summary?: string; }
interface ExperienceItem { id: string; company: string; role: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; institution: string; degree: string; startDate: string; endDate: string; }

type TemplateStyle = "modern" | "executive" | "technical";

const defaultPersonalInfo: PersonalInfo = { name: "", email: "", phone: "", location: "", summary: "" };
const uid = () => Math.random().toString(36).slice(2, 9);

const templateColors: Record<TemplateStyle, { accent: string; heading: string }> = {
  modern: { accent: "#6366f1", heading: "#1e1b4b" },
  executive: { accent: "#0f766e", heading: "#134e4a" },
  technical: { accent: "#2563eb", heading: "#1e3a5f" },
};

const orbConfigs = [
  { className: "w-[500px] h-[500px] -top-32 -right-32", color: "var(--neon-blue)", animate: { x: [0, 40, 0], y: [0, 30, 0] }, duration: 14 },
  { className: "w-[400px] h-[400px] bottom-0 -left-24", color: "var(--neon-purple)", animate: { x: [0, -30, 0], y: [0, -40, 0] }, duration: 18 },
];

export default function ResumeEditor() {
  const router = useRouter();
  const { id: resumeId } = router.query;
  const resolvedId = typeof resumeId === "string" ? resumeId : (Array.isArray(resumeId) ? resumeId[0] : "");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [template, setTemplate] = React.useState<TemplateStyle>("modern");

  const [title, setTitle] = React.useState("Untitled Resume");
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>(defaultPersonalInfo);
  const [experience, setExperience] = React.useState<ExperienceItem[]>([]);
  const [education, setEducation] = React.useState<EducationItem[]>([]);
  const [skills, setSkills] = React.useState<string[]>([]);
  const [newSkill, setNewSkill] = React.useState("");

  const [targetJobRole, setTargetJobRole] = React.useState("");
  const [analysisResult, setAnalysisResult] = React.useState<any>(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  const [showExportModal, setShowExportModal] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<"pdf"|"docx">("pdf");
  const [exportSections, setExportSections] = React.useState({ personalInfo: true, experience: true, education: true, skills: true });

  React.useEffect(() => {
    async function load() {
      if (!resolvedId) return;
      const userId = localStorage.getItem("userId");
      if (!userId) { router.push("/"); return; }

      const res = await fetch(`/api/resumes/${resolvedId}`, { headers: { "user-id": userId } });
      if (!res.ok) { router.push("/dashboard"); return; }
      
      const data = await res.json();
      if (!data) { router.push("/dashboard"); return; }

      setTitle(data.title || "Untitled Resume");
      
      const c = data.content || {};
      const pi = (data.personalInfo && Object.keys(data.personalInfo).length > 0) ? data.personalInfo : c.personalInfo;
      setPersonalInfo(pi && typeof pi === "object" ? { ...defaultPersonalInfo, ...pi } : defaultPersonalInfo);
      
      const exp = (data.experience && data.experience.length > 0) ? data.experience : (c.experience || []);
      setExperience(exp.map((e: any) => ({ ...e, id: e.id || uid() })));
      
      const edu = (data.education && data.education.length > 0) ? data.education : (c.education || []);
      setEducation(edu.map((e: any) => ({ ...e, id: e.id || uid() })));
      
      const sk = (data.skills && data.skills.length > 0) ? data.skills : (c.skills || []);
      setSkills(sk);
      setLoading(false);
    }
    if (router.isReady) load();
  }, [resolvedId, router]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const userId = localStorage.getItem("userId");
    
    const res = await fetch(`/api/resumes/${resolvedId}`, {
      method: "PUT",
      headers: { "user-id": userId || "", "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        personalInfo,
        experience,
        education,
        skills,
      })
    });

    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  async function handleAnalyze() {
    if (!targetJobRole.trim()) return alert("Please enter a Target Job Role");
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          jobDescription: targetJobRole, 
          resumeData: { personalInfo, experience, education, skills }
        })
      });
      const data = await res.json();
      setAnalysisResult(data);
      if (data.atsScore) localStorage.setItem("latestAtsScore", data.atsScore.toString());
    } catch(e) { console.error(e); }
    setAnalyzing(false);
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/export-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: exportFormat,
          sections: exportSections,
          resume: { title, personalInfo, experience, education, skills }
        })
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'resume'}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (e) { alert("Failed to export resume"); }
  }

  function updatePersonal<K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) {
    setPersonalInfo((prev) => ({ ...prev, [key]: value }));
  }

  function addExperience() { setExperience((prev) => [...prev, { id: uid(), company: "", role: "", startDate: "", endDate: "", description: "" }]); }
  function updateExperience(id: string, field: keyof ExperienceItem, value: string) { setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))); }
  function removeExperience(id: string) { setExperience((prev) => prev.filter((e) => e.id !== id)); }

  function addEducation() { setEducation((prev) => [...prev, { id: uid(), institution: "", degree: "", startDate: "", endDate: "" }]); }
  function updateEducation(id: string, field: keyof EducationItem, value: string) { setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))); }
  function removeEducation(id: string) { setEducation((prev) => prev.filter((e) => e.id !== id)); }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) { setSkills((prev) => [...prev, trimmed]); setNewSkill(""); }
  }
  function removeSkill(skill: string) { setSkills((prev) => prev.filter((s) => s !== skill)); }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="w-10 h-10 rounded-full border-2 border-transparent" style={{ borderTopColor: "hsl(var(--neon-blue))" }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  const tc = templateColors[template];

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-background">
      <div className="fixed inset-0" style={{
        background: `radial-gradient(ellipse at 20% 20%, hsl(var(--neon-indigo) / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, hsl(var(--neon-purple) / 0.06) 0%, transparent 50%), hsl(var(--background))`,
      }} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {orbConfigs.map((orb, i) => (
          <motion.div key={i} className={`absolute rounded-full blur-[120px] ${orb.className}`}
            style={{ background: `hsl(${orb.color} / 0.04)` }}
            animate={orb.animate} transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.012]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b"
          style={{ borderColor: "hsl(var(--glass-border))", background: "hsl(235 30% 8% / 0.6)", backdropFilter: "blur(30px)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 rounded-lg hover:bg-accent/10 transition-colors" title="Back">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none outline-none text-lg font-display font-bold text-foreground placeholder:text-muted-foreground" placeholder="Resume title..." />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "hsl(var(--glass-bg))" }}>
              {(["modern", "executive", "technical"] as TemplateStyle[]).map((t) => (
                <button key={t} onClick={() => setTemplate(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${template === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={template === t ? { background: "hsl(var(--glass-hover))", boxShadow: "inset 0 0 0 1px hsl(var(--neon-indigo) / 0.2)" } : {}}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => setShowExportModal(true)} className="p-2 rounded-lg hover:bg-accent/10 transition-colors bg-[hsl(var(--glass-bg))] flex flex-row items-center gap-2 px-3 text-sm text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" /> Export
            </button>
            <button onClick={handleSave} disabled={saving} className="cta-button !w-auto flex items-center gap-2 !px-5 !py-2 text-sm">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
            </button>
          </div>
        </header>

        {/* Two-column editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Form */}
          <div className="w-[480px] flex-shrink-0 overflow-y-auto border-r" style={{ borderColor: "hsl(var(--glass-border))" }}>
            <div className="p-6 space-y-8">
              <Section icon={Sparkles} title="AI Optimization">
                <FormField label="Target Job Role" value={targetJobRole} onChange={setTargetJobRole} placeholder="e.g. Frontend Developer" />
                <button onClick={handleAnalyze} disabled={analyzing} className="mt-3 w-full bg-[var(--neon-purple)] hover:opacity-90 text-white text-sm font-semibold rounded-lg py-2 transition-opacity flex items-center justify-center gap-2">
                  {analyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {analyzing ? "Analyzing..." : "Analyze ATS & Optimize"}
                </button>
                {analysisResult && (
                  <div className="mt-4 p-4 rounded-lg bg-black/30 border border-white/10 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">ATS Score</h4>
                      <p className="text-xl font-bold text-[var(--neon-green)]">{analysisResult.atsScore}%</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mt-2">Suggestions</h4>
                      <ul className="list-disc pl-4 mt-1 text-xs text-muted-foreground space-y-1">
                        {(analysisResult.suggestions || []).map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mt-2">Extracted Skills</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(analysisResult.skills || analysisResult.extractedSkills || []).map((k: string) => <span key={k} className="text-[10px] px-2 py-0.5 bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] rounded-full">{k}</span>)}
                      </div>
                    </div>
                  </div>
                )}
              </Section>
              
              <Section icon={User} title="Personal Information">
                <FormField label="Full Name" value={personalInfo.name} onChange={(v) => updatePersonal("name", v)} placeholder="John Doe" />
                <FormField label="Email" value={personalInfo.email} onChange={(v) => updatePersonal("email", v)} placeholder="john@example.com" />
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Phone" value={personalInfo.phone} onChange={(v) => updatePersonal("phone", v)} placeholder="+1 234 567 890" />
                  <FormField label="Location" value={personalInfo.location} onChange={(v) => updatePersonal("location", v)} placeholder="New York, NY" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Professional Summary</label>
                  <textarea value={personalInfo.summary || ""} onChange={(e) => updatePersonal("summary", e.target.value)}
                    placeholder="A brief professional summary..." rows={3}
                    className="cyber-input !border-b-0 !border !border-border !rounded-lg !p-3 resize-none" style={{ borderBottom: "1px solid hsl(var(--border))" }} />
                </div>
              </Section>

              <Section icon={Briefcase} title="Experience" onAdd={addExperience} addLabel="Add Experience">
                {experience.map((exp) => (
                  <div key={exp.id} className="glass-card p-4 space-y-3 relative group">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                    <FormField label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, "company", v)} placeholder="Company name" />
                    <FormField label="Role" value={exp.role} onChange={(v) => updateExperience(exp.id, "role", v)} placeholder="Job title" />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, "startDate", v)} placeholder="Jan 2022" />
                      <FormField label="End Date" value={exp.endDate} onChange={(v) => updateExperience(exp.id, "endDate", v)} placeholder="Present" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                      <textarea value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                        placeholder="Key responsibilities..." rows={3}
                        className="cyber-input !border-b-0 !border !border-border !rounded-lg !p-3 resize-none" style={{ borderBottom: "1px solid hsl(var(--border))" }} />
                    </div>
                  </div>
                ))}
              </Section>

              <Section icon={GraduationCap} title="Education" onAdd={addEducation} addLabel="Add Education">
                {education.map((edu) => (
                  <div key={edu.id} className="glass-card p-4 space-y-3 relative group">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                    <FormField label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, "institution", v)} placeholder="University name" />
                    <FormField label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, "degree", v)} placeholder="B.S. Computer Science" />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Start" value={edu.startDate} onChange={(v) => updateEducation(edu.id, "startDate", v)} placeholder="2018" />
                      <FormField label="End" value={edu.endDate} onChange={(v) => updateEducation(edu.id, "endDate", v)} placeholder="2022" />
                    </div>
                  </div>
                ))}
              </Section>

              <Section icon={Wrench} title="Skills">
                <div className="flex gap-2">
                  <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter" className="cyber-input flex-1" />
                  <button onClick={addSkill} className="p-2 rounded-lg hover:bg-accent/10 transition-colors text-muted-foreground">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{
                      background: "hsl(var(--neon-indigo) / 0.1)", color: "hsl(var(--neon-indigo))", border: "1px solid hsl(var(--neon-indigo) / 0.2)",
                    }}>
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </Section>
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center" style={{ background: "hsl(235 20% 14% / 0.5)" }}>
            <div className="w-[650px] sticky top-0">
              <motion.div className="bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{ minHeight: "842px", boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}
                initial={{ opacity: 0, rotateY: -2 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.6 }}>
                <div className="p-10 text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {/* Header */}
                  <div className="mb-6 border-b-2 pb-4" style={{ borderColor: tc.accent }}>
                    <h1 className="text-2xl font-bold" style={{ color: tc.heading }}>{personalInfo.name || "Your Name"}</h1>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      {personalInfo.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" style={{ color: tc.accent }} />{personalInfo.email}</span>}
                      {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" style={{ color: tc.accent }} />{personalInfo.phone}</span>}
                      {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: tc.accent }} />{personalInfo.location}</span>}
                    </div>
                    {personalInfo.summary && <p className="mt-3 text-sm text-gray-700 leading-relaxed">{personalInfo.summary}</p>}
                  </div>

                  {/* Experience */}
                  {experience.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: tc.accent }}>Experience</h2>
                      <div className="space-y-4">
                        {experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-semibold text-sm" style={{ color: tc.heading }}>{exp.role || "Role"}</h3>
                              <span className="text-xs text-gray-500">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>
                            </div>
                            <p className="text-sm text-gray-600 italic">{exp.company || "Company"}</p>
                            {exp.description && <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: tc.accent }}>Education</h2>
                      <div className="space-y-3">
                        {education.map((edu) => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-semibold text-sm" style={{ color: tc.heading }}>{edu.degree || "Degree"}</h3>
                              <span className="text-xs text-gray-500">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</span>
                            </div>
                            <p className="text-sm text-gray-600">{edu.institution || "Institution"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: tc.accent }}>Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="px-2.5 py-1 rounded text-xs font-medium" style={{
                            background: `${tc.accent}15`, color: tc.accent, border: `1px solid ${tc.accent}30`,
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!personalInfo.name && experience.length === 0 && education.length === 0 && skills.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                      <p className="text-sm">Start filling in your details on the left</p>
                      <p className="text-xs mt-1">Your resume will appear here in real-time</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[hsl(235,30%,12%)] border border-white/10 p-6 rounded-xl w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-foreground">Export Resume</h3>
              <button onClick={() => setShowExportModal(false)} className="p-1 rounded-md hover:bg-white/10"><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Format</label>
                <div className="flex gap-2">
                  <button onClick={() => setExportFormat("pdf")} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${exportFormat === "pdf" ? "bg-[var(--neon-blue)] border-[var(--neon-blue)] text-white" : "border-white/20 text-muted-foreground hover:bg-white/5"}`}>PDF</button>
                  <button onClick={() => setExportFormat("docx")} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${exportFormat === "docx" ? "bg-[var(--neon-blue)] border-[var(--neon-blue)] text-white" : "border-white/20 text-muted-foreground hover:bg-white/5"}`}>DOCX</button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Sections to Include</label>
                <div className="space-y-2">
                  {[
                    { id: 'personalInfo', label: "Personal Information" },
                    { id: 'experience', label: "Experience" },
                    { id: 'education', label: "Education" },
                    { id: 'skills', label: "Skills" }
                  ].map((sec) => (
                    <label key={sec.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={exportSections[sec.id as keyof typeof exportSections]} 
                        onChange={(e) => setExportSections(prev => ({ ...prev, [sec.id]: e.target.checked }))}
                        className="rounded border-white/20 bg-black/30 w-4 h-4 text-[var(--neon-blue)] focus:ring-[var(--neon-blue)]"
                      />
                      <span className="text-sm text-foreground">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowExportModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleExport} className="cta-button !w-auto !px-6 !py-2 text-sm flex items-center gap-2"><Download className="h-4 w-4" /> Download</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

function Section({ icon: Icon, title, children, onAdd, addLabel }: {
  icon: React.ElementType; title: string; children: React.ReactNode; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</h3>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> {addLabel}
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="cyber-input" />
    </div>
  );
}
