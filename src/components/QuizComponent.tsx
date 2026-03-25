import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, Sparkles, Youtube } from 'lucide-react';

import { Question, questionBank } from '../lib/questionBank';

interface QuizProps {
  domain?: string;
  topic?: string;
}

export function QuizComponent({ domain, topic }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [score, setScore] = useState(0);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  
  const [quizFinished, setQuizFinished] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [mockQuestions, setMockQuestions] = useState<Question[]>([]);

  React.useEffect(() => {
    // Filter questions based on domain and topic
    let pool = questionBank;
    if (domain) {
      pool = pool.filter(q => q.domain === domain);
    }
    if (topic && topic.trim() !== '') {
      const filtered = pool.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
      if (filtered.length > 0) pool = filtered; // fallback to domain if topic has zero matches
    }
    
    // Randomise questions on mount
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setMockQuestions(shuffled.slice(0, 5));
  }, [domain, topic]);

  if (mockQuestions.length === 0) return null;

  const question = mockQuestions[currentIndex];

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);

    if (selectedOption === question.correctAnswer) {
      setScore(s => s + 1);
    } else {
      if (!wrongTopics.includes(question.topic)) {
        setWrongTopics(prev => [...prev, question.topic]);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      await fetchAiSuggestions(wrongTopics);
      saveScoreToDB();
    }
  };

  const saveScoreToDB = async () => {
    const accuracy = Math.round((score / mockQuestions.length) * 100);
    // Overwrite local storage to sync natively alongside the DB call so analytics renders visually.
    const savedScores = JSON.parse(localStorage.getItem("quizScores") || "{}");
    savedScores["aptitude_latest"] = accuracy;
    localStorage.setItem("quizScores", JSON.stringify(savedScores));
    
    try {
      await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-id': localStorage.getItem('userId') || '' },
        body: JSON.stringify({ score: accuracy })
      });
    } catch (e) {
      console.error("Failed to save score");
    }
  };

  const fetchAiSuggestions = async (topics: string[]) => {
    if (topics.length === 0) {
      setAiSuggestion("Perfect score! Keep up the great work.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/quiz-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics })
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion);
    } catch (e) {
      setAiSuggestion("Failed to load AI analysis suggestions.");
    }
    setAiLoading(false);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setWrongTopics([]);
    setQuizFinished(false);
    setAiSuggestion(null);
    
    
    // Randomise questions again
    let pool = questionBank;
    if (domain) {
      pool = pool.filter(q => q.domain === domain);
    }
    if (topic && topic.trim() !== '') {
      const filtered = pool.filter(q => q.topic.toLowerCase().includes(topic.toLowerCase()));
      if (filtered.length > 0) pool = filtered;
    }
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setMockQuestions(shuffled.slice(0, 5));
  };

  if (quizFinished) {
    const accuracy = Math.round((score / mockQuestions.length) * 100);
    return (
      <div className="glass-card p-10 max-w-2xl mx-auto w-full relative overflow-hidden">
        <h2 className="text-2xl font-bold font-display text-center mb-6">Results Summary</h2>
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]">
            {accuracy}%
          </div>
          <p className="text-muted-foreground mt-2 uppercase tracking-widest text-sm font-semibold">Overall Accuracy</p>
        </div>

        <div className="bg-[hsl(235,30%,12%)] rounded-xl p-6 border border-white/10 relative overflow-hidden mb-10 shadow-inner">
          <h3 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 mb-4 text-[var(--neon-indigo)]">
            <Sparkles className="h-4 w-4" /> SkillForge Suggestion
          </h3>
          {aiLoading ? (
             <div className="flex items-center gap-3 text-sm text-gray-400">
               <div className="w-5 h-5 border-2 border-[var(--neon-indigo)] border-t-transparent rounded-full animate-spin" />
               Analyzing your weak points via AI...
             </div>
          ) : (
            <div className="space-y-4 relative z-10">
              <p className="text-sm leading-relaxed text-gray-300 font-medium">
                {aiSuggestion || "We analyzed your results. Focus evenly on the topics displayed!"}
              </p>
              {wrongTopics.length > 0 && (
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(wrongTopics[0] + ' programming crash course')}`} target="_blank" rel="noreferrer" 
                   className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 mt-2 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                  <Youtube className="h-4 w-4" /> Recommended Resource
                </a>
              )}
            </div>
          )}
        </div>

        <button onClick={handleRetry} className="cta-button w-full flex items-center justify-center gap-2 shadow-2xl shadow-[var(--neon-indigo)]/20">
          <RefreshCw className="h-4 w-4" /> Retry Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto w-full relative z-10">
      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">Question {currentIndex + 1} of {mockQuestions.length}</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--neon-indigo)]/10 text-[var(--neon-indigo)] font-bold border border-[var(--neon-indigo)]/30 shadow-[0_0_10px_hsl(var(--neon-indigo)/0.15)]">
          {question.topic}
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-8 leading-snug">{question.text}</h2>

      <div className="space-y-4 mb-8">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          
          let optionClass = "border-white/10 hover:border-[var(--neon-indigo)]/40 hover:bg-[var(--neon-indigo)]/5";
          let icon = null;

          if (isSubmitted) {
            if (isCorrect) {
              optionClass = "border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)]";
              icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
            } else if (isSelected && !isCorrect) {
              optionClass = "border-red-500/50 bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]";
              icon = <XCircle className="h-5 w-5 text-red-500" />;
            } else {
              optionClass = "border-white/5 opacity-40 bg-transparent";
            }
          } else if (isSelected) {
            optionClass = "border-[var(--neon-indigo)] bg-[var(--neon-indigo)]/10 shadow-[0_0_20px_hsl(var(--neon-indigo)/0.15)] text-white";
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => setSelectedOption(option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex justify-between items-center font-medium ${optionClass}`}
            >
              <span>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
        {!isSubmitted ? (
          <button 
            disabled={!selectedOption} 
            onClick={handleSubmit} 
            className="cta-button !w-auto !px-10 !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={handleNext} 
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-semibold border border-white/20"
          >
            Next Question <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
