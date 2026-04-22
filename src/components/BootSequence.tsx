import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LOGS = [
  "INITIALIZING LLMETER KERNEL v0.2.0...",
  "DETECTING HARDWARE ARCHITECTURE...",
  "MAPPING CPU TOPOLOGY: 8 CORES DETECTED",
  "PROBING GPU ACCELERATORS... WEBGPU ENABLED",
  "ALLOCATING MEMORY BUFFER: 256MB",
  "ESTABLISHING TELEMETRY LINK...",
  "SYSTEM READY."
];

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < BOOT_LOGS.length) {
      const timeout = setTimeout(() => {
        setVisibleLogs(prev => [...prev, BOOT_LOGS[index]]);
        setIndex(prev => prev + 1);
      }, 150 + Math.random() * 200);
      return () => clearTimeout(timeout);
    } else {
      const finishTimeout = setTimeout(onComplete, 800);
      return () => clearTimeout(finishTimeout);
    }
  }, [index, onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-3 h-3 bg-green rounded-full animate-pulse" />
          <h1 className="text-xl font-bold tracking-tighter text-white uppercase">
            LLMeter System Boot
          </h1>
        </div>
        
        <div className="space-y-2 border-l border-border pl-4">
          {visibleLogs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 text-sm"
            >
              <span className="text-muted shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={i === BOOT_LOGS.length - 1 ? "text-green font-bold" : "text-foreground"}>
                {log}
              </span>
            </motion.div>
          ))}
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-4 bg-green inline-block ml-1"
          />
        </div>

        <div className="mt-12 w-full bg-muted/10 h-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(index / BOOT_LOGS.length) * 100}%` }}
            className="h-full bg-green shadow-[0_0_10px_#22c55e]"
          />
        </div>
      </div>
    </div>
  );
};
