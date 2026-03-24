import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText } from 'lucide-react';

interface Props {
  initialText: string;
  onConfirm: (text: string) => void;
  loading: boolean;
}

export function ResumeEditor({ initialText, onConfirm, loading }: Props) {
  const [text, setText] = React.useState(initialText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[hsl(235,40%,10%)] border border-white/10 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] flex items-center justify-center shadow-[0_0_15px_hsl(var(--neon-blue)/0.5)]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1 tracking-wide">Verify Extracted Resume Details</h2>
              <p className="text-sm text-gray-400">Please review and edit any optical extraction errors to ensure our ATS AI gives you accurate results.</p>
            </div>
          </div>
          <button onClick={() => onConfirm(text)} disabled={loading} className="cta-button !w-auto !px-8 !py-3 flex items-center gap-2 !rounded-xl">
            {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? "Analyzing Context & Saving..." : "Confirm & Analyze"}
          </button>
        </div>
        <div className="flex-1 p-6 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,hsl(var(--neon-purple)/0.03),transparent)]">
          <textarea
            className="w-full h-full p-6 bg-black/40 border border-white/5 rounded-xl text-gray-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-[var(--neon-blue)] transition-colors shadow-inner"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </motion.div>
    </div>
  );
}
