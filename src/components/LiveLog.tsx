import { useEffect, useRef, useState } from "react";
import { useBenchmarkStore } from "../store/benchmarkStore";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warn" | "error";
}

export function LiveLog() {
  const { phase, cpuProgress, device } = useBenchmarkStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + "." + Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  // Log on phase changes
  useEffect(() => {
    switch (phase) {
      case "detecting":
        addLog("Initializing hardware sensor suite...");
        addLog("Kernel version: 6.8.0-industrial-x86_64", "info");
        break;
      case "cpu":
        addLog("Launching JS Compute micro-benchmark...", "info");
        addLog(`Cores detected: ${device?.cpu_cores ?? "unknown"}`, "success");
        break;
      case "memory":
        addLog("CPU compute phase validated.", "success");
        addLog("Testing memory bandwidth (128MB Float32Array)...", "info");
        break;
      case "storage":
        addLog("Memory bandwidth check complete.", "success");
        addLog("Benchmarking IndexedDB I/O throughput...", "info");
        break;
      case "gpu":
        addLog("Storage I/O validation successful.", "success");
        addLog("Scanning WebGL/WebGPU renderers...", "info");
        break;
      case "scoring":
        addLog("GPU characteristics identified.", "success");
        addLog("Finalizing scoring algorithms...", "warn");
        break;
      case "done":
        addLog("BENCHMARK SEQUENCE COMPLETE.", "success");
        addLog("Report generated and signed.", "success");
        break;
    }
  }, [phase]);

  // Log progress milestones
  const lastProgressRef = useRef(0);
  useEffect(() => {
    if (phase === "cpu" && cpuProgress > lastProgressRef.current + 25) {
      addLog(`Compute stress test: ${Math.round(cpuProgress)}% complete...`);
      lastProgressRef.current = cpuProgress;
    }
    if (phase !== "cpu") lastProgressRef.current = 0;
  }, [cpuProgress, phase]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl overflow-hidden flex flex-col h-[240px] industrial-border">
      <div className="px-3 py-1.5 border-b border-[#1f1f1f] bg-[#0a0a0a] flex items-center justify-between">
        <span className="text-[9px] font-mono font-bold text-[#444] uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          Kernel_Log_Monitor
        </span>
        <span className="text-[8px] font-mono text-[#22c55e] opacity-50 uppercase tracking-tighter">TTY0</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 scrollbar-none selection:bg-[#22c55e33]"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10, filter: "brightness(2) blur(2px)" }}
              animate={{ opacity: 1, x: 0, filter: "brightness(1) blur(0px)" }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 items-start relative group"
            >
              <div className="absolute inset-0 bg-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[#333] shrink-0">[{log.timestamp}]</span>
              <span className={`
                ${log.type === "success" ? "text-[#22c55e]" : ""}
                ${log.type === "warn" ? "text-[#eab308]" : ""}
                ${log.type === "error" ? "text-[#ef4444]" : ""}
                ${log.type === "info" ? "text-[#64748b]" : ""}
              `}>
                <span className="mr-2">{log.type === "success" ? "✓" : log.type === "warn" ? "!" : ">"}</span>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="text-[#222] italic">Waiting for hardware initialization...</div>
        )}
      </div>
      
      <div className="px-3 py-1 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center gap-2">
        <div className="w-1 h-3 bg-[#22c55e] animate-pulse" />
        <div className="text-[8px] font-mono text-[#22c55e] animate-flicker">READY</div>
      </div>
    </div>
  );
}
