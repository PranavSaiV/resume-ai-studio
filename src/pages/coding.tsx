import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { ArrowLeft, Play, CheckCircle, XCircle } from "lucide-react";

export default function CodingModule() {
  const router = useRouter();
  const [code, setCode] = React.useState("function solve() {\n  // Write your code here to reverse the array in-place\n  \n}");
  const [evaluating, setEvaluating] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const problem = {
    title: "Reverse a String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    testCases: ["['h','e','l','l','o'] -> ['o','l','l','e','h']"]
  };

  async function handleRun() {
    setEvaluating(true);
    setResult(null);
    try {
      const res = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          questionTitle: problem.title, 
          questionDescription: problem.description, 
          testCases: problem.testCases 
        })
      });
      const data = await res.json();
      setResult(data);
      if (data.score) {
        // Save score locally for analytics synchronization
        const savedScores = JSON.parse(localStorage.getItem("quizScores") || "{}");
        savedScores["coding_latest"] = Math.max(savedScores["coding_latest"] || 0, data.score);
        localStorage.setItem("quizScores", JSON.stringify(savedScores));
        // Mock DB post
        await fetch("/api/submit-quiz", { method: "POST" });
      }
    } catch (e) {
      console.error(e);
    }
    setEvaluating(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/analytics")} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-bold text-lg text-white">{problem.title}</h1>
        </div>
        <button onClick={handleRun} disabled={evaluating} className="cta-button !w-auto !px-6 !py-2 flex gap-2 items-center text-sm font-semibold">
          {evaluating ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
          {evaluating ? "Evaluating..." : "Verify"}
        </button>
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

          {/* Result view */}
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`mt-8 p-6 rounded-xl border ${result.status === "Passed" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <div className="flex items-center gap-3 mb-3">
                {result.status === "Passed" ? <CheckCircle className="h-7 w-7 text-green-500" /> : <XCircle className="h-7 w-7 text-red-500" />}
                <h4 className={`text-xl font-black ${result.status === "Passed" ? "text-green-500" : "text-red-500"}`}>{result.status}</h4>
              </div>
              <p className="text-3xl font-black mb-4 text-white">{result.score || 0}/100 <span className="text-sm font-normal text-gray-400">Pts</span></p>
              <p className="text-sm text-gray-300 leading-relaxed p-3 bg-black/30 rounded-lg">{result.feedback}</p>
            </motion.div>
          )}
        </div>

        {/* Right: Monaco Editor */}
        <div className="flex-1 right-editor">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, formatOnPaste: true }}
          />
        </div>
      </div>
    </div>
  );
}
