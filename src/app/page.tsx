"use client";
import FileUpload from "@/components/FileUpload";
import CheatsheetModal from "@/components/CheatsheetModal";
import PageLoader from "@/components/PageLoader";
import React, { useState, useEffect } from "react";
import {
  Sparkles, BookOpen, Layers, MessageSquare, Zap, CheckCircle2,
  RefreshCw, Network, BrainCircuit, Copy, Check, FileDown,
  RotateCw, Clock, BarChart2, ShieldCheck, Flame, ArrowRight, FileText, Video,
  LayoutDashboard, History, Bookmark, Activity,
  Shuffle, Award, ChevronRight, Compass, Command, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [inputNote, setInputNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "cards" | "mindmap">("summary");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Sidebar Section & History
  const [activeNav, setActiveNav] = useState<"workspace" | "explore" | "history" | "bookmarks">("workspace");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);
  const [savedKitsHistory, setSavedKitsHistory] = useState<any[]>([]);
  const [bookmarkedCards, setBookmarkedCards] = useState<any[]>([]);

  // Cheatsheet States
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [cheatsheetData, setCheatsheetData] = useState<any>(null);
  const [loadingCheatsheet, setLoadingCheatsheet] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const samplePrompts = [
    { label: "Banker's Algorithm", text: "The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources." },
    { label: "ReLU Activation", text: "The Rectified Linear Unit (ReLU) is an activation function defined as f(x) = max(0, x). It introduces non-linearity without causing vanishing gradient problems during backpropagation in deep neural networks." },
    { label: "OS Page Replacement", text: "Page replacement algorithms like LRU (Least Recently Used) and FIFO decide which memory page to page out when a new page needs to be allocated in an operating system." }
  ];

  const explorePresets = [
    { title: "Operating System Algorithms", desc: "Banker's, LRU, FIFO, Deadlock Avoidance", cardsCount: 6, snippet: "Comprehensive OS resource allocation notes." },
    { title: "Deep Neural Networks & ReLU", desc: "Activation functions, vanishing gradients, backpropagation", cardsCount: 8, snippet: "Core AI/ML deep learning architecture principles." },
    { title: "DBMS Normalization (1NF to BCNF)", desc: "Functional dependencies, relational integrity, keys", cardsCount: 5, snippet: "Database design and normalization techniques." }
  ];

  const isYouTubeUrl = (url: string) => {
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    return ytRegex.test(url.trim());
  };

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
    setMasteredCards([]);

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
        setSavedKitsHistory((prev) => [
          { id: Date.now(), title: data.data.title, data: data.data, date: new Date().toLocaleDateString() },
          ...prev
        ]);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data) {
        setCheatsheetData(result.data);
        setIsCheatsheetOpen(true);
      } else {
        alert(result.error || "Failed to generate cheatsheet");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Something went wrong while connecting to the server.");
    } finally {
      setLoadingCheatsheet(false);
    }
  };

  const toggleMastered = (idx: number) => {
    setMasteredCards((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleBookmarkCurrentCard = () => {
    if (!summaryData?.flashcards?.[cardIndex]) return;
    const currentCard = summaryData.flashcards[cardIndex];
    const exists = bookmarkedCards.some((c) => c.question === currentCard.question);

    if (exists) {
      setBookmarkedCards((prev) => prev.filter((c) => c.question !== currentCard.question));
    } else {
      setBookmarkedCards((prev) => [...prev, { ...currentCard, topic: summaryData.title }]);
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

  const navItems = [
    { id: "workspace", label: "Workspace", icon: LayoutDashboard },
    { id: "explore", label: "Explore Decks", icon: Compass },
    { id: "history", label: "Kit History", icon: History },
    { id: "bookmarks", label: "Saved Cards", icon: Bookmark },
  ];

  return (
    <>
      <AnimatePresence>
        {isInitialLoading && <PageLoader />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#06080d] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="fixed top-1/2 -right-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Sidebar Navigation */}
        <aside className={`${isSidebarCollapsed ? "w-20" : "w-64"} hidden lg:flex flex-col border-r border-slate-800/80 bg-[#07090e]/80 backdrop-blur-2xl p-4 transition-all duration-300 z-40 sticky top-0 h-screen justify-between`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-pink-500 rounded-2xl text-black shadow-lg shadow-cyan-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                {!isSidebarCollapsed && (
                  <span className="font-black text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                    Lumina AI
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? "" : "rotate-180"}`} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id as any)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "px-3.5"} py-2.5 rounded-2xl text-xs font-bold transition-all relative ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/15 to-fuchsia-500/15 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-3">{item.label}</span>}
                    {isActive && (
                      <motion.div layoutId="navGlow" className="absolute left-0 w-1 h-5 bg-cyan-400 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {!isSidebarCollapsed && (
            <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-emerald-400" /> System Active</span>
                <span className="text-cyan-400">Ready</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full" />
              </div>
            </div>
          )}
        </aside>

        {/* Main Content View */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <header className="border-b border-slate-800/80 px-6 lg:px-10 py-3.5 flex justify-between items-center bg-[#07090e]/60 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5 capitalize">
                <Command className="w-3 h-3 text-cyan-400" /> {activeNav} View
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine Connected</span>
              </div>

              <button
                onClick={() => setIsMock(!isMock)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-2 ${
                  isMock
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{isMock ? "Demo Engine" : "Gemini 1.5 Pro"}</span>
              </button>
            </div>
          </header>

          {/* VIEW 1: WORKSPACE */}
          {activeNav === "workspace" && (
            <>
              <section className="px-6 lg:px-10 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Synthesized Kits", val: summaryData ? "01" : "00", unit: "ready", icon: Sparkles, color: "text-cyan-400" },
                    { label: "Retention Score", val: summaryData ? "94%" : "--", unit: "target", icon: Award, color: "text-fuchsia-400" },
                    { label: "Flashcards Active", val: summaryData?.flashcards?.length || 0, unit: "cards", icon: MessageSquare, color: "text-pink-400" },
                    { label: "Mastery Progress", val: `${masteredCards.length}/${summaryData?.flashcards?.length || 0}`, unit: "done", icon: CheckCircle2, color: "text-emerald-400" },
                  ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{m.label}</p>
                          <div className="flex items-baseline space-x-1.5 mt-1">
                            <span className="text-xl font-black text-slate-100">{m.val}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{m.unit}</span>
                          </div>
                        </div>
                        <div className={`p-2.5 bg-slate-900 rounded-xl ${m.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-10 max-w-7xl w-full">
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  <div className="p-6 bg-[#090c14]/80 border border-slate-800/90 rounded-3xl flex-1 flex flex-col backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" /> Source Material
                      </h2>
                      {isYouTubeUrl(inputNote) ? (
                        <div className="flex items-center space-x-1 text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-full">
                          <Video className="w-3 h-3 text-red-400" />
                          <span>YouTube Detected</span>
                        </div>
                      ) : wordCount > 0 && (
                        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3 text-cyan-400" /> {wordCount} words</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-fuchsia-400" /> ~{readTime}m</span>
                        </div>
                      )}
                    </div>

                    <FileUpload onTextExtracted={(text) => setInputNote(text)} />

                    <textarea
                      value={inputNote}
                      onChange={(e) => setInputNote(e.target.value)}
                      placeholder="Paste lecture notes, syllabus content, or YouTube video link..."
                      className="w-full flex-1 bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 text-xs focus:outline-none focus:border-cyan-400/80 transition-all resize-none text-slate-200 placeholder-slate-600 min-h-[220px] leading-relaxed font-mono"
                    />

                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Preset Topics</span>
                      <div className="flex flex-wrap gap-1.5">
                        {samplePrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleGenerate(p.text)}
                            className="px-2.5 py-1 bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-[11px] text-slate-300 transition-all flex items-center gap-1"
                          >
                            <span>{p.label}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                      <button
                        onClick={() => handleGenerate()}
                        disabled={loading || !inputNote.trim()}
                        className="sm:col-span-2 py-3.5 px-4 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 hover:opacity-95 text-slate-950 font-black text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-40"
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
                        className="py-3.5 px-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 text-pink-300 border border-pink-500/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
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

                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="p-6 bg-[#090c14]/80 border border-slate-800/90 rounded-3xl flex-1 flex flex-col min-h-[480px] backdrop-blur-xl relative shadow-2xl">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 mb-6 gap-4">
                      <div className="flex space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                        {[
                          { id: "summary", label: "Summary", icon: Layers },
                          { id: "cards", label: "3D Flashcards", icon: MessageSquare },
                          { id: "mindmap", label: "Mind Map", icon: Network },
                        ].map((tab) => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isActive
                                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* COPY AND RESTORED PDF BUTTON */}
                      {summaryData && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleCopy}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 text-xs flex items-center gap-1.5"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>

                          <button
                            onClick={handleExportPDF}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 text-xs flex items-center gap-1.5"
                            title="Export PDF / Print"
                          >
                            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                            <span>PDF</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {!summaryData && !loading && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-4">
                        <div className="p-5 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl">
                          <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                        </div>
                        <div className="max-w-xs space-y-1">
                          <h3 className="text-slate-200 font-bold text-sm">Workspace Ready</h3>
                          <p className="text-xs text-slate-500">Provide input on the left panel to synthesize structured study materials.</p>
                        </div>
                      </div>
                    )}

                    {loading && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
                        <RefreshCw className="w-10 h-10 animate-spin text-fuchsia-400" />
                        <div>
                          <p className="text-sm font-bold text-slate-200">Processing Study Material...</p>
                          <p className="text-xs text-slate-500 mt-1">Extracting core concepts and building flashcards</p>
                        </div>
                      </div>
                    )}

                    {summaryData && activeTab === "summary" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
                        <div className="p-4 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-transparent border border-cyan-500/30 rounded-2xl">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">Core Subject</span>
                          <h3 className="text-lg font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                            {summaryData.title}
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          {summaryData.keyPoints?.map((point: string, idx: number) => (
                            <div key={idx} className="flex items-start space-x-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all">
                              <div className="p-1 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0 mt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">{point}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {summaryData && activeTab === "cards" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center py-2">
                        {summaryData.flashcards && summaryData.flashcards.length > 0 ? (
                          <div className="w-full max-w-md flex flex-col items-center space-y-4">

                            <div className="w-full flex items-center justify-between px-2">
                              <button
                                onClick={() => toggleMastered(cardIndex)}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                  masteredCards.includes(cardIndex)
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                    : "bg-slate-900 text-slate-400 border border-slate-800"
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{masteredCards.includes(cardIndex) ? "Mastered" : "Mark Mastered"}</span>
                              </button>

                              <button
                                onClick={toggleBookmarkCurrentCard}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                                  bookmarkedCards.some(c => c.question === summaryData.flashcards[cardIndex]?.question)
                                    ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                                    : "bg-slate-900 text-slate-400 border-slate-800"
                                }`}
                              >
                                <Bookmark className="w-3 h-3" />
                                <span>Save Card</span>
                              </button>

                              <button
                                onClick={() => {
                                  const randomIdx = Math.floor(Math.random() * summaryData.flashcards.length);
                                  setIsFlipped(false);
                                  setCardIndex(randomIdx);
                                }}
                                className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200"
                                title="Shuffle Card"
                              >
                                <Shuffle className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div
                              className="w-full h-60 perspective-1000 cursor-pointer"
                              onClick={() => setIsFlipped(!isFlipped)}
                            >
                              <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>
                                <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-2xl hover:border-cyan-400">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-black px-2.5 py-0.5 bg-cyan-950/80 rounded-full border border-cyan-800">
                                      Card #{cardIndex + 1}
                                    </span>
                                    <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                                  </div>

                                  <p className="my-auto text-center font-bold text-sm text-slate-100 leading-snug">
                                    {summaryData.flashcards[cardIndex]?.question}
                                  </p>

                                  <p className="text-[10px] text-slate-500 text-center font-mono">
                                    Click card to reveal answer 🔄
                                  </p>
                                </div>

                                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border-2 border-fuchsia-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-fuchsia-400 uppercase tracking-widest font-black px-2.5 py-0.5 bg-fuchsia-950/80 rounded-full border border-fuchsia-800">
                                      Answer Key
                                    </span>
                                    <RotateCw className="w-3.5 h-3.5 text-fuchsia-400" />
                                  </div>

                                  <p className="my-auto text-center font-medium text-xs text-slate-200 leading-relaxed">
                                    {summaryData.flashcards[cardIndex]?.answer}
                                  </p>

                                  <p className="text-[10px] text-slate-500 text-center font-mono">
                                    Click card to flip back 🔄
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => {
                                  setIsFlipped(false);
                                  setCardIndex((prev) => (prev > 0 ? prev - 1 : summaryData.flashcards.length - 1));
                                }}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl"
                              >
                                Prev
                              </button>

                              <span className="text-xs font-mono text-slate-400">
                                {cardIndex + 1} / {summaryData.flashcards.length}
                              </span>

                              <button
                                onClick={() => {
                                  setIsFlipped(false);
                                  setCardIndex((prev) => (prev < summaryData.flashcards.length - 1 ? prev + 1 : 0));
                                }}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl"
                              >
                                Next
                              </button>
                            </div>

                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">No flashcards available.</p>
                        )}
                      </motion.div>
                    )}

                    {summaryData && activeTab === "mindmap" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center p-2">
                        <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl p-5 flex flex-col items-center shadow-2xl">
                          <div className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 text-slate-950 font-black rounded-xl text-center text-xs tracking-wide shadow-lg">
                            {summaryData.title || "Core Topic"}
                          </div>

                          <div className="w-0.5 h-5 bg-gradient-to-b from-cyan-400 to-fuchsia-500 my-1.5" />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                            {summaryData.keyPoints?.map((point: string, idx: number) => (
                              <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-medium text-center leading-relaxed">
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
            </>
          )}

          {/* VIEW 2: EXPLORE DECKS */}
          {activeNav === "explore" && (
            <main className="p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" /> Explore Featured Study Kits
                </h2>
                <p className="text-xs text-slate-400">Select pre-built academic decks to load into your main workspace.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {explorePresets.map((item, i) => (
                  <div key={i} className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 bg-cyan-950 rounded-full border border-cyan-800">
                        {item.cardsCount} Cards Included
                      </span>
                      <h3 className="font-bold text-sm text-slate-200">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleGenerate(item.snippet);
                        setActiveNav("workspace");
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-cyan-500 hover:text-black border border-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Load into Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </main>
          )}

          {/* VIEW 3: KIT HISTORY */}
          {activeNav === "history" && (
            <main className="p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-fuchsia-400" /> Generated Kits Log
                  </h2>
                  <p className="text-xs text-slate-400">Reopen previous study kits generated in this active session.</p>
                </div>
                {savedKitsHistory.length > 0 && (
                  <button
                    onClick={() => setSavedKitsHistory([])}
                    className="px-3 py-1.5 bg-red-950/40 text-red-400 border border-red-800/50 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                )}
              </div>

              {savedKitsHistory.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-3xl space-y-2">
                  <p className="text-sm font-bold text-slate-300">No History Saved Yet</p>
                  <p className="text-xs text-slate-500">Generate a study kit in the workspace to view it saved here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedKitsHistory.map((kit) => (
                    <div key={kit.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-cyan-300">{kit.title}</h3>
                        <p className="text-[11px] font-mono text-slate-500">Generated on {kit.date}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSummaryData(kit.data);
                          setActiveNav("workspace");
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-xl border border-slate-800 text-slate-200"
                      >
                        Reopen Kit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </main>
          )}

          {/* VIEW 4: SAVED CARDS */}
          {activeNav === "bookmarks" && (
            <main className="p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-cyan-400" /> Bookmarked Flashcards
                </h2>
                <p className="text-xs text-slate-400">Review all flashcards saved during your study sessions.</p>
              </div>

              {bookmarkedCards.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/60 border border-slate-800 rounded-3xl space-y-2">
                  <p className="text-sm font-bold text-slate-300">No Cards Bookmarked</p>
                  <p className="text-xs text-slate-500">Click "Save Card" while studying flashcards in the workspace to save them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedCards.map((card, i) => (
                    <div key={i} className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                      <span className="text-[10px] font-mono text-cyan-400 px-2.5 py-0.5 bg-cyan-950 rounded-full border border-cyan-800">
                        {card.topic || "Saved Flashcard"}
                      </span>
                      <p className="text-xs font-bold text-slate-200">Q: {card.question}</p>
                      <p className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </main>
          )}

        </div>

        <CheatsheetModal
          isOpen={isCheatsheetOpen}
          onClose={() => setIsCheatsheetOpen(false)}
          data={cheatsheetData}
        />
      </div>
    </>
  );
}