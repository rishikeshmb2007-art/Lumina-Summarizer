"use client";

import React, { useEffect, useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300); // Slight delay at 100%
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07090e] text-slate-100 font-sans select-none"
        >
          {/* Glowing Background Glow Effects */}
          <div className="absolute w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-500" />

          {/* Central Logo & Icon */}
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-pink-500 rounded-3xl text-black shadow-2xl shadow-cyan-500/30"
            >
              <BrainCircuit className="w-10 h-10 animate-bounce" />
            </motion.div>

            {/* Brand Title */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                Lumina AI
              </h1>
              <p className="text-xs font-mono text-slate-400 tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                INITIALIZING STUDY ENGINE
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-64 space-y-2">
              <div className="h-1.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>

              {/* Progress Percentage */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>SYSTEM_BOOT</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}