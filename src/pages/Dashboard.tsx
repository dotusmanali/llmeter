import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { ScoreGauge } from "../components/ScoreGauge";
import { RamModal } from "../components/RamModal";
import { WarningBanner } from "../components/WarningBanner";
import { computeFits, getBestRecommendations } from "../lib/models";
import { computeFeatures } from "../lib/features";
import { FeatureFlagsGrid } from "../components/FeatureFlags";
import { CopyButton } from "../components/CopyButton";
import { TelemetryGraph } from "../components/TelemetryGraph";
import { HardwareMap } from "../components/HardwareMap";
import { LiveLog } from "../components/LiveLog";
import { downloadJSON, downloadText, formatFullReport } from "../lib/export";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { BootSequence } from "../components/BootSequence";

const TIER_DESC: Record<string, string> = {
  Powerhouse: "Runs 13B+ models comfortably",
  High: "Runs 7B models comfortably",
  Medium: "Runs 3B–7B, chunked for larger",
  Low: "Runs 1B–3B models only",
  Minimal: "TinyLlama or lighter only",
};

function StatCard({ label, value, sub, delay = 0 }: { label: string; value: string; sub?: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-grid opacity-5" />
      <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-widest mb-2 group-hover:text-white transition-colors">{label}</p>
      <p className="font-mono text-xl font-bold text-white tracking-tighter">{value}</p>
      {sub && <p className="text-[10px] font-mono text-[#444] mt-1 uppercase group-hover:text-[#64748b] transition-colors">{sub}</p>}
      <div className="absolute bottom-0 left-0 h-[2px] bg-[#22c55e] w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
}

export default function Dashboard() {
  const { phase, score, tps, device, perf, effectiveRam, needsRamModal, lastRun, telemetry } =
    useBenchmarkStore();
  const { run, continueAfterRam } = useBenchmark();
  const [showBoot, setShowBoot] = useState(true);

  // Skip boot if already seen or if we're not in idle
  useEffect(() => {
    if (phase !== "idle") {
      setShowBoot(false);
    }
  }, [phase]);

  const running = ["detecting", "cpu", "memory", "storage", "gpu", "scoring"].includes(phase);
  const done = phase === "done";

  const fits = done && score && effectiveRam
    ? computeFits(effectiveRam, score.final_score)
    : [];
  const { best_overall, best_quality, fastest } = getBestRecommendations(fits);

  const features =
    done && device && effectiveRam && score
      ? computeFeatures(device, effectiveRam, score.final_score)
      : null;

  const warnings: JSX.Element[] = [];
  if (done && device?.battery_warning) {
    warnings.push(
      <WarningBanner
        key="battery"
        type="orange"
        message="Battery low. Plug in before loading large models."
      />
    );
  }
  if (done && effectiveRam && effectiveRam <= 4 && score && score.final_score < 50) {
    warnings.push(
      <WarningBanner
        key="memory"
        type="yellow"
        message="Limited RAM detected. Close background apps for best results."
      />
    );
  }
  if (done && device && !device.webgpu_available) {
    warnings.push(
      <WarningBanner
        key="webgpu"
        type="blue"
        message="WebGPU not available. Use Chrome or Edge for better GPU detection."
      />
    );
  }

  const reportText = lastRun ? formatFullReport(lastRun) : "";

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {showBoot && <BootSequence onComplete={() => setShowBoot(false)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-6 bg-[#22c55e] opacity-80" />
              ))}
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              LLMeter<span className="text-[#22c55e] not-italic">.node</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[#64748b] font-mono text-[9px] uppercase tracking-[0.3em]">
              Industrial Hardware Diagnostic Interface // Rev. 4.0.2
            </p>
            <div className="h-[1px] w-12 bg-[#1f1f1f]" />
            <span className="font-mono text-[9px] text-[#22c55e] animate-pulse">SYSTEM_STABLE</span>
          </div>
        </div>
        {done && lastRun && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton
              text={reportText}
              label="Export_Report"
              className="px-4 py-2 text-[10px] font-mono border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e] hover:text-black rounded transition-all uppercase tracking-widest industrial-border"
            />
          </div>
        )}
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="space-y-2"
          >
            {warnings}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Action Area */}
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-[1fr_400px] gap-8"
          >
            <div className="bg-[#050505] border border-[#1f1f1f] rounded-2xl p-12 flex flex-col items-center justify-center gap-8 relative overflow-hidden industrial-border min-h-[500px] bg-grid">
              <div className="absolute top-4 left-4 flex gap-1 pointer-events-none opacity-40">
                <div className="w-1 h-4 bg-green" />
                <div className="w-1 h-2 bg-green mt-2" />
                <span className="text-[8px] font-mono text-green ml-2 tracking-widest uppercase">IDLE_STATUS:READY</span>
              </div>
              <div className="absolute top-4 right-4 text-[8px] font-mono text-[#444] pointer-events-none uppercase tracking-widest">
                Port_8080 // Secure_Channel
              </div>
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="scanline opacity-10" />
              
              <div className="relative group cursor-pointer" onClick={run}>
                <div className="w-32 h-32 rounded-full border border-[#22c55e]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-full border border-[#22c55e]/10 animate-ping" />
                  <div className="w-24 h-24 rounded-full bg-[#22c55e]/5 border border-[#22c55e]/30 flex items-center justify-center">
                    <span className="font-mono text-4xl text-[#22c55e] drop-shadow-[0_0_10px_#22c55e]">▶</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4 relative z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] italic">Station_Initialization</h2>
                <div className="flex items-center justify-center gap-4">
                   <div className="h-[1px] w-12 bg-[#22c55e]/30" />
                   <p className="text-[#64748b] font-mono text-[10px] uppercase tracking-widest">Awaiting Command Input</p>
                   <div className="h-[1px] w-12 bg-[#22c55e]/30" />
                </div>
                <p className="text-[#444] font-mono text-[11px] max-w-sm mx-auto leading-relaxed">
                  // SECURE_HARDWARE_AUDIT_PROTOCOL_V4<br/>
                  // [JS_COMPUTE] [RAM_IO] [STORAGE_IPC] [GPU_SCAN]
                </p>
              </div>

              <button
                onClick={run}
                className="relative group px-16 py-5 bg-[#22c55e] text-black font-black uppercase tracking-[0.3em] rounded transition-all hover:bg-white shadow-[0_0_50px_rgba(34,197,94,0.2)]"
              >
                Launch_Diagnostic
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white" />
              </button>

              {lastRun && (
                <div className="mt-8 flex items-center gap-3 opacity-40">
                  <span className="font-mono text-[8px] text-white uppercase">Last_Verified_Score:</span>
                  <span className="font-mono text-[10px] text-[#22c55e] font-bold">{lastRun.final_score}</span>
                  <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                  <span className="font-mono text-[8px] text-white uppercase">{new Date(lastRun.timestamp).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-5" />
                <h3 className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Unit_System_Map</h3>
                <HardwareMap />
              </div>
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border">
                <h3 className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Command_Protocol</h3>
                <ul className="space-y-3 font-mono text-[10px] text-[#444]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#22c55e] mt-1">01</span>
                    <span>HARDWARE IDENTIFICATION (CORES, ARCH, RAM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22c55e] mt-1">02</span>
                    <span>STRESS_TESTING OF JS COMPUTE ENGINE</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22c55e] mt-1">03</span>
                    <span>BANDWIDTH VERIFICATION FOR RAM SUBSYSTEM</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {running && (
          <motion.div 
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-[300px_1fr] gap-6"
          >
            {/* Sidebar Progress */}
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border relative overflow-hidden">
               <div className="absolute inset-0 bg-grid opacity-5" />
               <BenchmarkProgress />
            </div>

            {/* Main Diagnostics Display */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-5" />
                  <h3 className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Hardware_Sync</h3>
                  <HardwareMap />
                </div>
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-grid opacity-5" />
                  <h3 className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Live_Telemetry</h3>
                  <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {phase === "cpu" && (
                        <motion.div key="cpu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <TelemetryGraph data={telemetry.cpu} label="JS_STRESS_LOAD" max={100000} height={100} />
                        </motion.div>
                      )}
                      {phase === "memory" && (
                        <motion.div key="memory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <TelemetryGraph data={telemetry.memory} label="MEM_THROUGHPUT" color="#eab308" max={100} height={100} />
                        </motion.div>
                      )}
                      {["detecting", "storage", "gpu", "scoring"].includes(phase) && (
                         <div className="flex flex-col items-center justify-center gap-4 py-8 opacity-20">
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#22c55e] animate-spin" />
                            <span className="font-mono text-[10px] uppercase">Awaiting_Data_Stream</span>
                         </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Kernel Log at Bottom */}
              <div className="relative">
                <LiveLog />
                <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-none">
                   <span className="text-[8px] font-mono text-[#22c55e] opacity-40 uppercase">Encrypted_Stream_Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {done && score && device && effectiveRam !== null && perf && (
          <motion.div 
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Score & Tier centerpiece */}
            <div className="grid lg:grid-cols-[1fr_450px] gap-8 items-start">
              <div className="bg-[#050505] border border-[#1f1f1f] rounded-2xl p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden industrial-border h-full">
                <div className="absolute inset-0 bg-grid opacity-5" />
                <div className="relative group">
                   <div className="absolute -inset-4 bg-[#22c55e]/5 rounded-full blur-2xl group-hover:bg-[#22c55e]/10 transition-colors" />
                   <ScoreGauge score={score.final_score} tier={score.tier} size={240} />
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="inline-block px-3 py-1 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded text-[#22c55e] text-[10px] font-mono font-bold uppercase mb-4">
                    Certification_Level
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">{score.tier}</h2>
                  <p className="text-[#64748b] font-mono text-xs mt-3 uppercase tracking-widest max-w-sm">{TIER_DESC[score.tier]}</p>
                  
                  <div className="mt-10 grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Est. Tokens/sec</p>
                      <p className="font-mono text-white text-xl font-black italic">
                        {tps ? `${tps.low}–${tps.high}` : "—"}
                        <span className="text-[9px] text-[#64748b] not-italic ml-2 uppercase opacity-50">[{tps?.path}]</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Perf Factor</p>
                      <p className="font-mono text-white text-xl font-black italic">{perf.real_perf_factor.toFixed(3)}×</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Memory BW</p>
                      <p className="font-mono text-white text-xl font-black italic">{perf.memory.bandwidth_gb_s.toFixed(1)} <span className="text-xs text-[#64748b] not-italic uppercase opacity-50">GB/s</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Compute Pwr</p>
                      <p className="font-mono text-white text-xl font-black italic">{(perf.cpu.ops_per_sec / 1000).toFixed(1)}k <span className="text-xs text-[#64748b] not-italic uppercase opacity-50">ops</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-8 industrial-border relative h-full flex flex-col justify-center">
                <div className="absolute inset-0 bg-grid opacity-5" />
                <h3 className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-6">Verified_Hardware_Map</h3>
                <HardwareMap />
                <div className="mt-8 pt-8 border-t border-[#1f1f1f] flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-[#444] uppercase">Kernel_Audit</span>
                    <span className="font-mono text-[10px] text-[#22c55e] font-bold">VERIFIED_STABLE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-[#444] uppercase">Memory_Signature</span>
                    <span className="font-mono text-[10px] text-[#22c55e] font-bold">0x8F2C4E9A</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="RAM"
                value={`${effectiveRam} GB`}
                sub={device.ram_source === "manual" ? "MANUAL" : "BROWSER_EST"}
                delay={0.1}
              />
              <StatCard label="Cores" value={String(device.cores)} sub={device.arch} delay={0.2} />
              <StatCard label="Platform" value={device.os} sub={device.is_apple_silicon ? "SILICON" : "GENERIC"} delay={0.3} />
              <StatCard
                label="Graphics"
                value={device.webgpu_available ? "WEBGPU" : device.webgl2_available ? "WEBGL2" : "NONE"}
                sub={device.unified_memory ? "UNIFIED" : "DEDICATED"}
                delay={0.4}
              />
            </div>

            {/* Score Breakdown Bar Graph */}
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden relative">
               <div className="absolute inset-0 bg-grid opacity-5" />
              <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
                <p className="text-[10px] font-mono text-[#64748b] uppercase tracking-widest">Metric Distribution</p>
              </div>
              <div className="px-6 py-6 grid grid-cols-2 sm:grid-cols-5 gap-6">
                {[
                  { label: "RAM", pts: score.ram_pts, max: 40, color: "#22c55e" },
                  { label: "CPU", pts: score.cpu_pts, max: 20, color: "#22c55e" },
                  { label: "ARCH", pts: score.arch_pts, max: 15, color: "#22c55e" },
                  { label: "ACCEL", pts: score.accel_pts, max: 15, color: "#3b82f6" },
                  { label: "GPU", pts: score.gpu_pts, max: 10, color: "#3b82f6" },
                ].map(({ label, pts, max, color }, i) => (
                  <motion.div 
                    key={label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="text-center"
                  >
                    <p className="text-[10px] font-mono text-[#64748b] mb-2 uppercase tracking-tighter">{label}</p>
                    <p className="font-mono text-sm text-white font-bold">{pts}<span className="text-[#333]">/{max}</span></p>
                    <div className="mt-3 h-1.5 bg-[#0a0a0a] border border-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(pts / max) * 100}%` }}
                        transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                        className="h-full rounded-full shadow-[0_0_10px_currentColor]"
                        style={{ backgroundColor: color, color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendations Row */}
            <div className="grid sm:grid-cols-3 gap-4">
              <RecommendationCard type="Overall" item={best_overall} color="green" delay={0.6} />
              <RecommendationCard type="Quality" item={best_quality} color="yellow" delay={0.7} />
              <RecommendationCard type="Speed" item={fastest} color="blue" delay={0.8} />
            </div>

            {/* Supported Features */}
            {features && (
              <div className="pt-4">
                <h3 className="text-[10px] font-mono text-[#64748b] uppercase tracking-widest mb-4">
                  Feature Support Flags
                </h3>
                <FeatureFlagsGrid flags={features} />
              </div>
            )}

            <div className="flex items-center gap-4 pt-6 border-t border-[#1a1a1a]">
              <button
                onClick={run}
                className="text-[10px] font-mono text-[#444] hover:text-[#22c55e] transition-colors uppercase tracking-widest"
              >
                // System Re-Audit →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <RamModal open={needsRamModal} onSelect={(gb) => continueAfterRam(gb)} />
    </div>
  );
}

function RecommendationCard({ type, item, color, delay }: { type: string; item: any; color: string; delay: number }) {
  if (!item) return null;
  const colorMap: any = {
    green: "text-[#22c55e] border-[#22c55e]/20 bg-green-950/10",
    yellow: "text-[#eab308] border-[#eab308]/20 bg-yellow-950/10",
    blue: "text-[#3b82f6] border-[#3b82f6]/20 bg-blue-950/10",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`border rounded-xl p-5 relative overflow-hidden group ${colorMap[color]}`}
    >
      <div className="absolute inset-0 bg-grid opacity-5" />
      <p className="text-[10px] font-mono uppercase tracking-widest mb-1 opacity-60">Best {type}</p>
      <p className="text-white font-bold text-base tracking-tight">{item.model.name}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="font-mono text-[10px] font-bold uppercase border border-current px-1.5 py-0.5 rounded leading-none">
          {item.key}
        </span>
        <span className="font-mono text-[10px] uppercase opacity-60">
          {item.ram_gb}GB VRAM
        </span>
      </div>
    </motion.div>
  );
}

function BenchmarkProgress() {
  const { phase, cpuProgress } = useBenchmarkStore();

  const steps = [
    { key: "detecting", label: "Device Detection" },
    { key: "cpu", label: "JS Compute Benchmark" },
    { key: "memory", label: "Memory Bandwidth" },
    { key: "storage", label: "IndexedDB Storage" },
    { key: "gpu", label: "GPU Detection" },
    { key: "scoring", label: "Computing Score" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === phase);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Active Audit Lifecycle</h3>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1 h-3 bg-[#22c55e] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
      
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-4">
             <div
                className={`w-3 h-3 rounded-sm flex-shrink-0 border-2 transition-all duration-300 ${
                  done
                    ? "bg-[#22c55e] border-[#22c55e]"
                    : active
                    ? "border-[#22c55e] animate-pulse"
                    : "border-[#1f1f1f] bg-[#0a0a0a]"
                }`}
              />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    done ? "text-[#444]" : active ? "text-white" : "text-[#1f1f1f]"
                  }`}
                >
                  {step.label}
                </span>
                {active && step.key === "cpu" && (
                  <span className="text-[10px] font-mono text-[#22c55e] tabular-nums">{Math.round(cpuProgress)}%</span>
                )}
                {done && <span className="text-[10px] font-mono text-[#22c55e]">SUCCESS</span>}
              </div>
              {active && step.key === "cpu" && (
                <div className="mt-2 h-1 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cpuProgress}%` }}
                    className="h-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
