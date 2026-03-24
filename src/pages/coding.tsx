import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { ArrowLeft, Play, Terminal } from "lucide-react";

export default function CodingModule() {
  const router = useRouter();
  const [code, setCode] = React.useState("function solve() {\n  // Write your code here\n  console.log('Hello World!');\n}\nsolve();");
  const [language, setLanguage] = React.useState("javascript");
  const [evaluating, setEvaluating] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
  ];

  const problem = {
    title: "Reverse a String",
    topic: "Array",
    description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    testCases: ["['h','e','l','l','o'] -> ['o','l','l','e','h']"]
  };

  async function handleRun() {
    setEvaluating(true);
    setResult({ output: "Running...", status: "Running" });
    try {
      const res = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          language: language,
          questionTitle: problem.title,
          questionDescription: problem.description,
          testCases: problem.testCases
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.message || "Failed to evaluate code");
      }

      setResult({
        status: data.status === "Passed" || data.status === "Success" ? "Success" : "Failed",
        output: data.feedback || "Evaluated correctly without specific feedback.",
      });
    } catch (e: any) {
      setResult({ status: "Error", output: e.message || String(e) });
    }
    setEvaluating(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/analytics")} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-bold text-lg text-white">{problem.title}</h1>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] uppercase tracking-wider ml-2">{problem.topic}</span>
          <div className="flex gap-3 items-center border-l pl-4 border-white/10 ml-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <a href={`https://leetcode.com/problemset/all/?search=${encodeURIComponent(problem.topic)}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[#FFA116]/30 text-[#FFA116] bg-[#FFA116]/5 hover:bg-[#FFA116]/10 rounded-lg font-semibold text-sm transition-colors shadow-sm shadow-[#FFA116]/10">
            Solve on LeetCode
          </a>
          <button onClick={handleRun} disabled={evaluating} className="cta-button !w-auto !px-6 !py-2 flex gap-2 items-center text-sm font-semibold shadow-lg shadow-[var(--neon-blue)]/20">
            {evaluating ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            {evaluating ? "Evaluating..." : "Run Code"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Description */}
        <div className="w-[400px] border-r border-white/10 p-6 overflow-y-auto" style={{ background: "hsl(235, 30%, 8%)" }}>
          <h2 className="text-xl font-display font-bold text-[var(--neon-blue)] mb-4">Problem Description</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-8">{problem.description}</p>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--neon-purple)] mb-3">Test Cases</h3>
          <pre className="bg-black/50 p-4 rounded-lg text-xs text-green-400 font-mono border border-white/5 whitespace-pre-wrap">
            {problem.testCases.join("\n")}
          </pre>
        </div>

        {/* Right: Monaco Editor + Output Terminal */}
        <div className="flex-1 right-editor flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, formatOnPaste: true }}
            />
          </div>
          
          {/* Output Terminal */}
          <div className="h-64 border-t border-white/10 bg-black flex flex-col">
             <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
               <Terminal className="h-4 w-4 text-[var(--neon-blue)]" />
               <span className="text-xs font-semibold text-white tracking-widest uppercase">Output Terminal</span>
               {result && result.status !== "Running" && (
                 <span className={`ml-auto text-xs font-bold uppercase tracking-wider ${result.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
                   Status: {result.status}
                 </span>
               )}
             </div>
             <div className="flex-1 p-4 overflow-y-auto">
                <pre className={`font-mono text-sm whitespace-pre-wrap ${result?.status === 'Failed' || result?.status === 'Error' ? 'text-red-400' : 'text-[var(--neon-green)]'}`}>
                  {result?.output || "Run code to see output..."}
                </pre>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
