"use client";

import React, { useState } from "react";
import { Sparkles, BookOpen, Layers, MessageSquare, Zap, CheckCircle2, RefreshCw, Network, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [inputNote, setInputNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "cards" | "mindmap">("summary");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMock, setIsMock] = useState(false);

  const handleGenerate = async () => {
    if (!inputNote.trim()) return;

    setLoading(true);
    setSummaryData(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputNote, useMock: isMock }),
      });

      const data = await res.json();
      if (data.data) {
        setSummaryData(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 px-8 py-4 flex justify-between items-center glass-panel sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-xl text-black shadow-lg shadow-cyan-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
              Lumina AI
            </span>
            <span className="ml-2 text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Workspace
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMock(!isMock)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            isMock
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
          }`}
        >
          {isMock ? "Demo Offline Engine" : "Live API Engine"}
        </button>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full">
        {/* Input Column */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col neon-glow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Source Educational Material
              </h2>
            </div>

            <textarea
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              placeholder="Paste raw lecture notes, transcripts, or syllabus modules here..."
              className="w-full flex-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none text-slate-200 placeholder-slate-600 min-h-[300px]"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !inputNote.trim()}
              className="mt-5 w-full py-4 px-6 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 hover:opacity-90 text-slate-950 font-bold text-sm tracking-wide rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Study Kit...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>Generate AI Study Kit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col min-h-[450px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-800/80 pb-4 mb-6 space-x-8">
              {[
                { id: "summary", label: "Smart Summary", icon: Layers },
                { id: "cards", label: "Interactive Flashcards", icon: MessageSquare },
                { id: "mindmap", label: "Concept Mind Map", icon: Network },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 text-sm font-semibold pb-1 border-b-2 transition-all ${
                      activeTab === tab.id
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {!summaryData && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-sm max-w-sm">Paste notes on the left and hit generate to construct your visual revision kit.</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-fuchsia-400" />
                <p className="text-sm font-medium">Extracting core concepts & structuring flashcards...</p>
              </div>
            )}

            {/* Tab 1: Summary */}
            {summaryData && activeTab === "summary" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {summaryData.title}
                </h3>
                <div className="space-y-3">
                  {summaryData.keyPoints?.map((point: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tab 2: Flashcards */}
            {summaryData && activeTab === "cards" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center py-6">
                {summaryData.flashcards && summaryData.flashcards.length > 0 ? (
                  <>
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-md h-56 cursor-pointer bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-cyan-400 shadow-2xl relative"
                    >
                      <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-3 px-3 py-1 bg-cyan-950 rounded-full border border-cyan-800">
                        {isFlipped ? "Answer" : "Question (Click to Flip)"}
                      </span>
                      <p className="text-base font-semibold text-slate-100 leading-snug">
                        {isFlipped ? summaryData.flashcards[cardIndex]?.answer : summaryData.flashcards[cardIndex]?.question}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 mt-6">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex((prev) => (prev > 0 ? prev - 1 : summaryData.flashcards.length - 1));
                        }}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-mono text-slate-500">
                        {cardIndex + 1} / {summaryData.flashcards.length}
                      </span>
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex((prev) => (prev < summaryData.flashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No flashcards available for this section.</p>
                )}
              </motion.div>
            )}

            {/* Tab 3: Mind Map */}
            {summaryData && activeTab === "mindmap" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg bg-slate-950/80 border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center shadow-2xl">
                  <div className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 font-extrabold rounded-2xl text-center shadow-lg shadow-cyan-500/20 mb-4 text-sm">
                    {summaryData.title || "Core Subject"}
                  </div>

                  <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-fuchsia-500 mb-4"></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {summaryData.keyPoints?.map((point: string, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 font-medium text-center shadow-sm hover:border-cyan-400/50 transition-all">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}