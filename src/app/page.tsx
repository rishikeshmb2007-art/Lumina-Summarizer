"use client";
import FileUpload from "@/components/FileUpload";
import CheatsheetModal from "@/components/CheatsheetModal";
import React, { useState } from "react";
import {
  Sparkles, BookOpen, Layers, MessageSquare, Zap, CheckCircle2,
  RefreshCw, Network, BrainCircuit, Copy, Check, FileDown,
  RotateCw, Clock, BarChart2, ShieldCheck, Flame, ArrowRight, FileText, Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [inputNote, setInputNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "cards" | "mindmap">("summary");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cheatsheet States
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [cheatsheetData, setCheatsheetData] = useState<any>(null);
  const [loadingCheatsheet, setLoadingCheatsheet] = useState(false);

  const samplePrompts = [
    { label: "Banker's Algorithm", text: "The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources." },
    { label: "ReLU Activation", text: "The Rectified Linear Unit (ReLU) is an activation function defined as f(x) = max(0, x). It introduces non-linearity without causing vanishing gradient problems during backpropagation in deep neural networks." },
    { label: "OS Page Replacement", text: "Page replacement algorithms like LRU (Least Recently Used) and FIFO decide which memory page to page out when a new page needs to be allocated in an operating system." }
  ];

  // Helper to detect if input string is a valid YouTube URL
  const isYouTubeUrl = (url: string) => {
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    return ytRegex.test(url.trim());
  };

  // Helper to resolve YouTube transcript automatically
  const resolveInputText = async (input: string): Promise<string | null> => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (isYouTubeUrl(trimmed)) {
      try {
        const ytRes = await fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });

        const ytData = await ytRes.json();

        if (!ytRes.ok || !ytData.success) {
          alert(ytData.error || "Failed to extract YouTube transcript.");
          return null;
        }

        return ytData.text;
      } catch (err) {
        console.error("YouTube Fetch Error:", err);
        alert("Could not connect to YouTube transcript service.");
        return null;
      }
    }

    return trimmed;
  };

  const handleGenerate = async (overrideText?: string) => {
    const rawInput = overrideText || inputNote;
    if (!rawInput.trim()) return;

    if (overrideText) setInputNote(overrideText);
    setLoading(true);
    setSummaryData(null);
    setCardIndex(0);
    setIsFlipped(false);

    try {
      const textToProcess = await resolveInputText(rawInput);
      if (!textToProcess) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess, useMock: isMock }),
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

  const handleGenerateCheatsheet = async () => {
    if (!inputNote || inputNote.trim().length === 0) {
      alert("Please enter or upload some content first!");
      return;
    }

    setLoadingCheatsheet(true);

    try {
      const textToProcess = await resolveInputText(inputNote);
      if (!textToProcess) {
        setLoadingCheatsheet(false);
        return;
      }

      const res = await fetch("/api/cheatsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textToProcess }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data) {
        setCheatsheetData(result.data);
        setIsCheatsheetOpen(true);
      } else {
        console.error("Cheatsheet API Error:", result.error);
        alert(result.error || "Failed to generate cheatsheet");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Something went wrong while connecting to the server.");
    } finally {
      setLoadingCheatsheet(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const content = `Title: ${summaryData.title}\n\nKey Points:\n${summaryData.keyPoints?.map((p: string) => `• ${p}`).join("\n")}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const wordCount = inputNote.trim() ? inputNote.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 lg:px-12 py-4 flex justify-between items-center glass-panel sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-pink-500 rounded-2xl text-black shadow-lg shadow-cyan-500/25">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                Lumina AI
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Exam & Study Kit Generator</p>
          </div>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server Ready</span>
          </div>
          <button
            onClick={() => setIsMock(!isMock)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${isMock
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
              }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isMock ? "Demo Fallback Mode" : "Live Gemini AI"}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10 max-w-7xl mx-auto w-full">

        {/* Left Column: Source Input */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col neon-glow relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Study Material Input
              </h2>
              {isYouTubeUrl(inputNote) ? (
                <div className="flex items-center space-x-1 text-[11px] font-mono text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-full">
                  <Video className="w-3 h-3 text-red-400" />
                  <span>YouTube URL Detected</span>
                </div>
              ) : wordCount > 0 && (
                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3 text-cyan-400" /> {wordCount} words</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-fuchsia-400" /> ~{readTime}m read</span>
                </div>
              )}
            </div>

            <FileUpload onTextExtracted={(text) => setInputNote(text)} />

            <textarea
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              placeholder="Paste raw lecture notes, syllabus modules, or a YouTube video link here..."
              className="w-full flex-1 bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400/80 transition-all resize-none text-slate-200 placeholder-slate-600 min-h-[260px] leading-relaxed"
            />

            {/* Quick Sample Chips */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Quick Sample Inputs:</span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGenerate(p.text)}
                    className="px-2.5 py-1 bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-[11px] text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1"
                  >
                    <span>{p.label}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !inputNote.trim()}
                className="sm:col-span-2 py-3.5 px-4 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 hover:opacity-95 text-slate-950 font-black text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-40 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Generate Kit</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateCheatsheet}
                disabled={loadingCheatsheet || !inputNote.trim()}
                className="py-3.5 px-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 border border-pink-500/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 cursor-pointer"
              >
                {loadingCheatsheet ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
                ) : (
                  <FileText className="w-4 h-4 text-pink-400" />
                )}
                <span>Cheatsheet</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Interactive Study Kit */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col min-h-[500px] relative">

            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 mb-6 gap-4">
              <div className="flex space-x-6">
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
                      className={`flex items-center space-x-2 text-sm font-bold pb-1 border-b-2 transition-all ${activeTab === tab.id
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

              {/* Action Toolbar */}
              {summaryData && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all text-xs flex items-center gap-1"
                    title="Copy Summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-all text-xs flex items-center gap-1"
                    title="Print / Save PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {!summaryData && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-4">
                <div className="p-5 bg-slate-900/80 rounded-3xl border border-slate-800/80 shadow-2xl">
                  <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-slate-200 font-bold text-base">Your Workspace is Empty</h3>
                  <p className="text-xs text-slate-500">Paste your study material on the left or select a quick sample to generate notes & 3D flashcards.</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-fuchsia-400" />
                <div>
                  <p className="text-sm font-bold text-slate-200">Analyzing Educational Content...</p>
                  <p className="text-xs text-slate-500 mt-1">Extracting core insights and building 3D flashcards</p>
                </div>
              </div>
            )}

            {/* TAB 1: SMART SUMMARY */}
            {summaryData && activeTab === "summary" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-transparent border border-cyan-500/30 rounded-2xl">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">Core Topic</span>
                  <h3 className="text-xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                    {summaryData.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {summaryData.keyPoints?.map((point: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all">
                      <div className="p-1 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 2: REAL 3D FLIP FLASHCARDS */}
            {summaryData && activeTab === "cards" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center py-4">
                {summaryData.flashcards && summaryData.flashcards.length > 0 ? (
                  <div className="w-full max-w-md flex flex-col items-center">

                    {/* 3D Flippable Card Container */}
                    <div
                      className="w-full h-64 perspective-1000 cursor-pointer"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>

                        {/* FRONT OF CARD */}
                        <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl hover:border-cyan-400 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-black px-3 py-1 bg-cyan-950/80 rounded-full border border-cyan-800">
                              Question Card #{cardIndex + 1}
                            </span>
                            <RotateCw className="w-4 h-4 text-slate-500" />
                          </div>

                          <div className="my-auto text-center">
                            <p className="text-base font-bold text-slate-100 leading-snug">
                              {summaryData.flashcards[cardIndex]?.question}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 text-center font-mono">
                            Click card to flip answer 🔄
                          </p>
                        </div>

                        {/* BACK OF CARD */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border-2 border-fuchsia-500/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-fuchsia-400 uppercase tracking-widest font-black px-3 py-1 bg-fuchsia-950/80 rounded-full border border-fuchsia-800">
                              Verified Answer
                            </span>
                            <RotateCw className="w-4 h-4 text-fuchsia-400" />
                          </div>

                          <div className="my-auto text-center">
                            <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                              {summaryData.flashcards[cardIndex]?.answer}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-500 text-center font-mono">
                            Click card to return to question 🔄
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center space-x-6 mt-6">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex((prev) => (prev > 0 ? prev - 1 : summaryData.flashcards.length - 1));
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-2xl transition-all shadow-md active:scale-95"
                      >
                        Previous
                      </button>

                      <span className="text-xs font-mono font-bold text-slate-400 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                        {cardIndex + 1} / {summaryData.flashcards.length}
                      </span>

                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex((prev) => (prev < summaryData.flashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-2xl transition-all shadow-md active:scale-95"
                      >
                        Next
                      </button>
                    </div>

                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No flashcards generated for this topic.</p>
                )}
              </motion.div>
            )}

            {/* TAB 3: CONCEPT MIND MAP */}
            {summaryData && activeTab === "mindmap" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center shadow-2xl">

                  {/* Central Node */}
                  <div className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-cyan-500/20 text-xs tracking-wide">
                    {summaryData.title || "Core Subject"}
                  </div>

                  <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-fuchsia-500 my-2"></div>

                  {/* Connected Sub-nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {summaryData.keyPoints?.map((point: string, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl text-xs text-slate-300 font-medium text-center shadow-sm hover:border-cyan-400/50 transition-all leading-relaxed">
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

      {/* Printable Cheatsheet Modal */}
      <CheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
        data={cheatsheetData}
      />
    </div>
  );
}