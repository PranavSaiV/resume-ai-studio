import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Plus, Trash2, Download, X, Sparkles,
  User, Briefcase, GraduationCap, Wrench, FolderGit2, Mail, Phone, MapPin
} from "lucide-react";

interface PersonalInfo { name: string; email: string; phone: string; location: string; summary?: string; }
interface ExperienceItem { id: string; company: string; role: string; startDate: string; endDate: string; description: string; }
interface EducationItem { id: string; institution: string; degree: string; startDate: string; endDate: string; }
interface ProjectItem { id: string; name: string; description: string; link: string; }

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

export default function ResumeBuilder() {
  const router = useRouter();

  const [saving, setSaving] = React.useState(false);
  const [template, setTemplate] = React.useState<TemplateStyle>("modern");

  const [title, setTitle] = React.useState("New Generated Resume");
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>(defaultPersonalInfo);
  const [experience, setExperience] = React.useState<ExperienceItem[]>([]);
  const [education, setEducation] = React.useState<EducationItem[]>([]);
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [skills, setSkills] = React.useState<string[]>([]);
  const [newSkill, setNewSkill] = React.useState("");

  const [analysisResult, setAnalysisResult] = React.useState<any>(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  const [showExportModal, setShowExportModal] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<"pdf"|"docx">("pdf");
  const [exportSections, setExportSections] = React.useState({ personalInfo: true, experience: true, education: true, skills: true, projects: true });

  async function handleSave() {
    setSaving(true);
    const userId = localStorage.getItem("userId");
    if (!userId) { router.push("/"); return; }

    const contentData = analysisResult || {};

    try {
      const res = await fetch(`/api/resumes`, {
        method: "POST",
        headers: { "user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      
      if (res.ok && data.id) {
        await fetch(`/api/resumes/${data.id}`, {
          method: "PUT",
          headers: { "user-id": userId, "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            personalInfo,
            experience,
            education,
            skills,
            projects,
            content: contentData
          })
        });
        router.push("/dashboard");
      }
    } catch (e) {
      alert("Failed to save to Dashboard");
    }
    setSaving(false);
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeData: { personalInfo, experience, education, skills, projects }
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
          resume: { title, personalInfo, experience, education, skills, projects }
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

  function addProject() { setProjects((prev) => [...prev, { id: uid(), name: "", description: "", link: "" }]); }
  function updateProject(id: string, field: keyof ProjectItem, value: string) { setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))); }
  function removeProject(id: string) { setProjects((prev) => prev.filter((p) => p.id !== id)); }

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) { setSkills((prev) => [...prev, trimmed]); setNewSkill(""); }
  }
  function removeSkill(skill: string) { setSkills((prev) => prev.filter((s) => s !== skill)); }

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
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save to Dashboard"}
            </button>
          </div>
        </header>

        {/* Two-column editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Form */}
          <div className="w-[500px] flex-shrink-0 overflow-y-auto border-r" style={{ borderColor: "hsl(var(--glass-border))" }}>
            <div className="p-6 space-y-8">
              <Section icon={Sparkles} title="AI Analysis">
                <button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] hover:opacity-90 text-white text-sm font-semibold rounded-lg py-3 transition-opacity flex items-center justify-center gap-2 shadow-[0_4px_15px_hsl(var(--neon-blue)/0.3)]">
                  {analyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {analyzing ? "Analyzing..." : "Analyze & Optimize"}
                </button>
                {analysisResult && (
                  <div className="mt-4 p-5 rounded-xl bg-black/40 border border-[var(--neon-blue)]/30 space-y-4 shadow-inner">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ATS Score Match</h4>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)]">{analysisResult.atsScore}%</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3 mb-2">Improvement Tips</h4>
                      <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1.5">
                        {(analysisResult.suggestions || []).map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </Section>
              
              <Section icon={User} title="Personal Details">
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
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-[var(--neon-blue)] transition-colors resize-none" />
                </div>
              </Section>

              <Section icon={Briefcase} title="Work Experience" onAdd={addExperience} addLabel="Add Experience">
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
                        placeholder="Key responsibilities and achievements..." rows={3}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-[var(--neon-blue)] transition-colors resize-none" />
                    </div>
                  </div>
                ))}
              </Section>

              <Section icon={GraduationCap} title="Education Qualifications" onAdd={addEducation} addLabel="Add Education">
                {education.map((edu) => (
                  <div key={edu.id} className="glass-card p-4 space-y-3 relative group">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                    <FormField label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, "institution", v)} placeholder="University name" />
                    <FormField label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, "degree", v)} placeholder="Degree and major" />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Start Date" value={edu.startDate} onChange={(v) => updateEducation(edu.id, "startDate", v)} placeholder="Sep 2018" />
                      <FormField label="End Date" value={edu.endDate} onChange={(v) => updateEducation(edu.id, "endDate", v)} placeholder="May 2022" />
                    </div>
                  </div>
                ))}
              </Section>

              <Section icon={FolderGit2} title="Projects" onAdd={addProject} addLabel="Add Project">
                {projects.map((proj) => (
                  <div key={proj.id} className="glass-card p-4 space-y-3 relative group">
                    <button onClick={() => removeProject(proj.id)} className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                    <FormField label="Project Name" value={proj.name} onChange={(v) => updateProject(proj.id, "name", v)} placeholder="Awesome App" />
                    <FormField label="Project Link" value={proj.link} onChange={(v) => updateProject(proj.id, "link", v)} placeholder="https://github.com/..." />
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                      <textarea value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                        placeholder="What you built and technologies used..." rows={3}
                        className="w-full bg-black/20 border border-white/5 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-[var(--neon-blue)] transition-colors resize-none" />
                    </div>
                  </div>
                ))}
              </Section>

              <Section icon={Wrench} title="Skills">
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--glass-bg))] border border-white/10 text-sm">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="Add a skill (e.g. React, Python)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-[var(--neon-blue)] transition-colors" />
                  <button onClick={addSkill} className="px-5 py-3 rounded-lg bg-[hsl(var(--glass-bg))] border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">Add</button>
                </div>
              </Section>
            </div>
          </div>

          {/* Right: Preview Document Rendering Space */}
          <div className="flex-1 overflow-y-auto bg-black/20 p-8 flex justify-center">
            <div className="w-full max-w-[800px] bg-white rounded-lg shadow-2xl overflow-hidden min-h-[1056px]" style={{ color: tc.heading }}>
              <div className="p-10 space-y-6">
                {(personalInfo.name || personalInfo.email || personalInfo.phone) ? (
                   <div className="border-b-2 pb-6" style={{ borderColor: tc.accent }}>
                     <h1 className="text-4xl font-black tracking-tight" style={{ color: tc.heading }}>{personalInfo.name || "Your Name"}</h1>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm" style={{ color: tc.heading }}>
                       {personalInfo.email && <span className="flex items-center gap-1 opacity-80"><Mail className="h-3 w-3" /> {personalInfo.email}</span>}
                       {personalInfo.phone && <span className="flex items-center gap-1 opacity-80"><Phone className="h-3 w-3" /> {personalInfo.phone}</span>}
                       {personalInfo.location && <span className="flex items-center gap-1 opacity-80"><MapPin className="h-3 w-3" /> {personalInfo.location}</span>}
                     </div>
                   </div>
                ) : (
                  <div className="border-b-2 pb-6 text-center text-gray-300" style={{ borderColor: tc.accent }}>
                    Start filling in Personal Details on the left...
                  </div>
                )}
                
                {personalInfo.summary && (
                  <div>
                    <p className="text-sm leading-relaxed opacity-90">{personalInfo.summary}</p>
                  </div>
                )}

                {experience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-3 uppercase tracking-wider" style={{ color: tc.accent }}>Experience</h2>
                    <div className="space-y-4">
                      {experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold">{exp.role || "Role"}</h3>
                            <span className="text-sm opacity-80 font-medium">{exp.startDate || "Start"} - {exp.endDate || "End"}</span>
                          </div>
                          <div className="text-sm font-medium opacity-90 mb-2">{exp.company || "Company"}</div>
                          {exp.description && <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-3 uppercase tracking-wider mt-6" style={{ color: tc.accent }}>Education</h2>
                    <div className="space-y-4">
                      {education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-baseline">
                          <div>
                            <h3 className="font-bold">{edu.degree || "Degree"}</h3>
                            <div className="text-sm opacity-90">{edu.institution || "Institution"}</div>
                          </div>
                          <span className="text-sm opacity-80 font-medium">{edu.startDate || "Start"} - {edu.endDate || "End"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-3 uppercase tracking-wider mt-6" style={{ color: tc.accent }}>Projects</h2>
                    <div className="space-y-4">
                      {projects.map(proj => (
                        <div key={proj.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold">{proj.name || "Project Name"}</h3>
                            <span className="text-sm opacity-80 font-medium text-blue-500">{proj.link || ""}</span>
                          </div>
                          {proj.description && <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-3 uppercase tracking-wider mt-6" style={{ color: tc.accent }}>Skills</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {skills.map(s => <span key={s} className="text-sm opacity-90 font-medium">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
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
                    { id: 'personalInfo', label: "Personal Details" },
                    { id: 'experience', label: "Work Experience" },
                    { id: 'education', label: "Education" },
                    { id: 'projects', label: "Projects" },
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

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} 
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-[var(--neon-blue)] transition-colors" />
    </div>
  );
}
