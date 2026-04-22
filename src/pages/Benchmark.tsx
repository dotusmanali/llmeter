import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { RamModal } from "../components/RamModal";
import { CopyButton } from "../components/CopyButton";
import { TelemetryGraph } from "../components/TelemetryGraph";
import { HardwareMap } from "../components/HardwareMap";
import { LiveLog } from "../components/LiveLog";
import { downloadJSON, downloadText } from "../lib/export";
import { motion, AnimatePresence } from "framer-motion";

export default function Benchmark() {
  const { phase, cpuProgress, perf, device, effectiveRam, needsRamModal, lastRun, telemetry } =
    useBenchmarkStore();
  const { run, continueAfterRam } = useBenchmark();
  const running = ["detecting", "cpu", "memory", "storage", "gpu", "scoring"].includes(phase);

  const benchmarkText = perf && device
    ? `BENCHMARK RESULTS
${"─".repeat(40)}
Perf Factor  : ${perf.real_perf_factor.toFixed(4)}x
CPU Factor   : ${perf.cpu_factor.toFixed(3)}
Mem Factor   : ${perf.mem_factor.toFixed(3)}
Disk Factor  : ${perf.disk_factor.toFixed(3)}

JS COMPUTE
Ops/sec      : ${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k

MEMORY BANDWIDTH
Bandwidth    : ${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s
Test size    : 128 MB Float32Array

INDEXEDDB STORAGE (IPC overhead, not raw SSD)
Write speed  : ${perf.storage.write_mb_s.toFixed(0)} MB/s
Read speed   : ${perf.storage.read_mb_s.toFixed(0)} MB/s

GPU
Renderer     : ${device.gpu_renderer}
Vendor       : ${device.gpu_vendor}
WebGL2       : ${device.webgl2_available ? "Yes" : "No"}
WebGPU       : ${device.webgpu_available ? "Yes" : "No"}

RAM          : ${effectiveRam !== null ? (device?.ram_source === "manual" ? `${effectiveRam} GB (user-selected)` : (device?.ram_heuristic_applied ? `~${effectiveRam} GB estimated` : `~${effectiveRam} GB (browser estimate, actual may be higher)`)) : "N/A"}`
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1].map(i => (
                <div key={i} className="w-1.5 h-6 bg-[#22c55e] opacity-80" />
              ))}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Audit<span className="text-[#22c55e] not-italic">.station</span>
            </h1>
          </div>
          <p className="text-[#64748b] font-mono text-[9px] mt-2 uppercase tracking-[0.3em]">
            Hardware Telemetry & Performance Validation Unit
          </p>
        </div>
        {phase === "done" && perf && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton
              text={benchmarkText}
              label="Sync_Data"
              className="px-3 py-1.5 text-[10px] border border-[#1f1f1f] text-[#64748b] hover:text-white rounded font-mono uppercase tracking-widest industrial-border"
            />
            <button
              onClick={() => downloadText(benchmarkText, "llmeter-benchmark.txt")}
              className="px-3 py-1.5 text-[10px] border border-[#1f1f1f] text-[#64748b] hover:text-white rounded transition-colors font-mono uppercase tracking-widest industrial-border"
            >
              .TXT
            </button>
          </div>
        )}
      </div>

      {phase === "idle" && (
        <div className="bg-[#050505] border border-[#1f1f1f] rounded-2xl p-20 text-center relative overflow-hidden industrial-border">
          <div className="absolute inset-0 bg-grid opacity-5" />
          <div className="scanline opacity-10" />
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 border border-[#22c55e]/30 rounded-full mx-auto flex items-center justify-center animate-pulse">
               <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full" />
            </div>
            <button
              onClick={run}
              className="relative px-20 py-5 bg-[#22c55e] text-black font-black uppercase tracking-[0.4em] rounded transition-all hover:bg-white shadow-[0_0_40px_rgba(34,197,94,0.2)]"
            >
              Initialize_Test
            </button>
            <div className="flex flex-col gap-2">
               <p className="text-[#444] text-[10px] font-mono tracking-widest uppercase">
                Standby for sensor calibration
              </p>
              <div className="h-[1px] w-32 bg-[#1f1f1f] mx-auto" />
            </div>
          </div>
        </div>
      )}

      {running && (
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 relative">
          {/* Data Stream Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-px h-full bg-green animate-data-stream" style={{ animationDelay: "0s" }} />
            <div className="absolute top-0 left-2/4 w-px h-full bg-green animate-data-stream" style={{ animationDelay: "1s" }} />
            <div className="absolute top-0 left-3/4 w-px h-full bg-green animate-data-stream" style={{ animationDelay: "2s" }} />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 space-y-6 relative overflow-hidden industrial-border">
              <div className="absolute top-0 right-0 p-4 opacity-20 font-mono text-[8px] text-white uppercase pointer-events-none">
                SECURE_ENVIRONMENT // ANALYZING
              </div>
              <div className="absolute inset-0 bg-grid opacity-5" />
              
              <StepRow step="detecting" label="Device Detection" current={phase} />
              <StepRow step="cpu" label="JS Compute Benchmark" current={phase} progress={cpuProgress} />
              
              <AnimatePresence mode="wait">
                {phase === "cpu" && (
                  <motion.div 
                    key="cpu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <TelemetryGraph data={telemetry.cpu} label="JS_OPS_SEC" max={100000} height={120} />
                  </motion.div>
                )}
              </AnimatePresence>

              <StepRow step="memory" label="Memory Bandwidth" current={phase} />
              
              <AnimatePresence mode="wait">
                {phase === "memory" && (
                  <motion.div 
                    key="memory"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <TelemetryGraph data={telemetry.memory} label="GB_S_BANDWIDTH" color="#eab308" max={100} height={120} />
                  </motion.div>
                )}
              </AnimatePresence>

              <StepRow step="storage" label="IndexedDB Storage" current={phase} />
              <StepRow step="gpu" label="GPU Detection" current={phase} />
              <StepRow step="scoring" label="Computing Score" current={phase} />
            </div>

            <LiveLog />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border relative overflow-hidden">
               <div className="absolute inset-0 bg-grid opacity-5" />
               <h3 className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Unit_Map_Sync</h3>
               <HardwareMap />
            </div>
            
            <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl p-6 industrial-border">
               <h3 className="text-[10px] font-mono text-[#22c55e] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                 Diagnostic_Queue
               </h3>
               <div className="space-y-3 opacity-40">
                  <div className="h-1 bg-[#1f1f1f] w-full" />
                  <div className="h-1 bg-[#1f1f1f] w-3/4" />
                  <div className="h-1 bg-[#1f1f1f] w-1/2" />
               </div>
            </div>
          </div>
        </div>
      )}

      {phase === "done" && perf && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="grid lg:grid-cols-[1fr_350px] gap-8"
        >
          <div className="space-y-6">
            <Section
              title="Audit_Result: JS_COMPUTE"
              copyText={`Ops/sec: ${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k | CPU Factor: ${perf.cpu_factor.toFixed(3)}`}
            >
              <Row label="Operations/sec" value={`${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k`} copyVal={`${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k`} />
              <Row label="CPU Factor" value={perf.cpu_factor.toFixed(3)} />
              <Row label="Signature" value="Math.fround loop (optimized JS)" muted />
            </Section>

            <Section
              title="Audit_Result: MEMORY_BANDWIDTH"
              copyText={`Bandwidth: ${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s | Mem Factor: ${perf.mem_factor.toFixed(3)}`}
            >
              <Row label="Throughput" value={`${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s`} copyVal={`${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s`} />
              <Row label="Memory Factor" value={perf.mem_factor.toFixed(3)} />
              <Row label="Test Buffer" value="128 MB Float32Array" muted />
            </Section>

            <Section
              title="Audit_Result: STORAGE_IPC"
              copyText={`Write: ${perf.storage.write_mb_s.toFixed(0)} MB/s | Read: ${perf.storage.read_mb_s.toFixed(0)} MB/s | Disk Factor: ${perf.disk_factor.toFixed(3)}`}
            >
              <Row label="Write speed" value={`${perf.storage.write_mb_s.toFixed(0)} MB/s`} copyVal={`${perf.storage.write_mb_s.toFixed(0)} MB/s`} />
              <Row label="Read speed" value={`${perf.storage.read_mb_s.toFixed(0)} MB/s`} copyVal={`${perf.storage.read_mb_s.toFixed(0)} MB/s`} />
              <Row label="Disk Factor" value={perf.disk_factor.toFixed(3)} />
              <Row label="Protocol" value="IndexedDB Transaction Burst" muted />
            </Section>

            <Section
              title="Final_Metric: COMBINED_FACTOR"
              copyText={`real_perf_factor: ${perf.real_perf_factor.toFixed(4)} | Formula: cpu×0.5 + mem×0.35 + disk×0.15`}
            >
              <Row label="real_perf_factor" value={perf.real_perf_factor.toFixed(4)} highlight copyVal={perf.real_perf_factor.toFixed(4)} />
              <Row label="Weighting" value="0.5c | 0.35m | 0.15d" muted />
            </Section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-6 industrial-border relative overflow-hidden sticky top-24">
              <div className="absolute inset-0 bg-grid opacity-5" />
              <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">Static_Unit_Map</h3>
              <HardwareMap />
              <div className="mt-6 pt-6 border-t border-[#1f1f1f] space-y-4">
                 <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-[#444] uppercase">Auth_Stamp</span>
                    <span className="text-[9px] font-mono text-[#22c55e]">PASS</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-[#444] uppercase">Hash_ID</span>
                    <span className="text-[9px] font-mono text-[#22c55e] truncate ml-4">#8F2C4E</span>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <RamModal open={needsRamModal} onSelect={continueAfterRam} />
    </div>
  );
}

function Section({
  title,
  children,
  copyText,
}: {
  title: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  return (
    <div className="bg-[#050505] border border-[#1f1f1f] rounded-xl overflow-hidden industrial-border">
      <div className="px-4 py-2 border-b border-[#1f1f1f] bg-[#0a0a0a] flex items-center justify-between">
        <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">{title}</p>
        {copyText && (
          <CopyButton
            text={copyText}
            iconOnly
            className="text-[#2a2a2a] hover:text-[#22c55e]"
          />
        )}
      </div>
      <div className="divide-y divide-[#1a1a1a]">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  highlight,
  copyVal,
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
  copyVal?: string;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-3 text-sm group transition-colors hover:bg-white/[0.02]">
      <span className="text-[#64748b] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`font-mono ${
            highlight ? "text-[#22c55e]" : muted ? "text-[#444]" : "text-white"
          }`}
        >
          {value}
        </span>
        {copyVal && (
          <CopyButton
            text={copyVal}
            iconOnly
            className="text-[#2a2a2a] hover:text-[#64748b] opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  );
}

function StepRow({
  step,
  label,
  current,
  progress,
}: {
  step: string;
  label: string;
  current: string;
  progress?: number;
}) {
  const steps = ["detecting", "cpu", "memory", "storage", "gpu", "scoring", "done"];
  const ci = steps.indexOf(current);
  const si = steps.indexOf(step);
  const done = ci > si;
  const active = ci === si;

  return (
    <div className="flex items-center gap-4 relative">
      <div
        className={`w-4 h-4 rounded-sm flex-shrink-0 border-2 transition-all duration-300 flex items-center justify-center ${
          done
            ? "bg-[#22c55e] border-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            : active
            ? "border-[#22c55e] animate-pulse"
            : "border-[#2a2a2a]"
        }`}
      >
        {done && <span className="text-[10px] text-black font-bold">OK</span>}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${done ? "text-[#444]" : active ? "text-white" : "text-[#2a2a2a]"}`}>
            {label}
          </span>
          {active && progress !== undefined && (
            <span className="text-[10px] font-mono text-[#22c55e] tabular-nums">{Math.round(progress)}%</span>
          )}
        </div>
        {active && progress !== undefined && (
          <div className="mt-2 h-1 bg-[#1a1a1a] rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
