import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { RamModal } from "../components/RamModal";
import { CopyButton } from "../components/CopyButton";
import { downloadJSON, downloadText } from "../lib/export";

export default function Benchmark() {
  const { phase, cpuProgress, perf, device, effectiveRam, needsRamModal, lastRun } =
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

RAM          : ${effectiveRam} GB (${device.ram_source === "manual" ? "user-selected" : "browser estimate"})`
    : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Benchmark</h1>
          <p className="text-[#64748b] text-sm mt-1">Raw results from all benchmark phases.</p>
        </div>
        {phase === "done" && perf && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton
              text={benchmarkText}
              label="Copy All"
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg"
            />
            <button
              onClick={() => downloadText(benchmarkText, "llmeter-benchmark.txt")}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
            >
              .txt
            </button>
            <button
              onClick={() => lastRun && downloadJSON(lastRun.perf_raw ?? perf, "llmeter-benchmark.json")}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
            >
              .json
            </button>
          </div>
        )}
      </div>

      {phase === "idle" && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8 text-center">
          <button
            onClick={run}
            className="px-8 py-3 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Start Benchmark
          </button>
        </div>
      )}

      {running && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
          <StepRow step="detecting" label="Device Detection" current={phase} />
          <StepRow step="cpu" label="JS Compute Benchmark" current={phase} progress={cpuProgress} />
          <StepRow step="memory" label="Memory Bandwidth" current={phase} />
          <StepRow step="storage" label="IndexedDB Storage" current={phase} />
          <StepRow step="gpu" label="GPU Detection" current={phase} />
          <StepRow step="scoring" label="Computing Score" current={phase} />
        </div>
      )}

      {phase === "done" && perf && (
        <div className="space-y-4">
          <Section
            title="JS Compute Benchmark"
            copyText={`Ops/sec: ${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k | CPU Factor: ${perf.cpu_factor.toFixed(3)}`}
          >
            <Row label="Operations/sec" value={`${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k`} copyVal={`${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k`} />
            <Row label="CPU Factor" value={perf.cpu_factor.toFixed(3)} />
            <Row label="Benchmark type" value="Math.fround loop (optimized JS)" muted />
          </Section>

          <Section
            title="Memory Bandwidth"
            copyText={`Bandwidth: ${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s | Mem Factor: ${perf.mem_factor.toFixed(3)}`}
          >
            <Row label="Bandwidth" value={`${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s`} copyVal={`${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s`} />
            <Row label="Memory Factor" value={perf.mem_factor.toFixed(3)} />
            <Row label="Test size" value="128 MB Float32Array" muted />
          </Section>

          <Section
            title="IndexedDB Storage"
            copyText={`Write: ${perf.storage.write_mb_s.toFixed(0)} MB/s | Read: ${perf.storage.read_mb_s.toFixed(0)} MB/s | Disk Factor: ${perf.disk_factor.toFixed(3)}`}
          >
            <Row label="Write speed" value={`${perf.storage.write_mb_s.toFixed(0)} MB/s`} copyVal={`${perf.storage.write_mb_s.toFixed(0)} MB/s`} />
            <Row label="Read speed" value={`${perf.storage.read_mb_s.toFixed(0)} MB/s`} copyVal={`${perf.storage.read_mb_s.toFixed(0)} MB/s`} />
            <Row label="Disk Factor" value={perf.disk_factor.toFixed(3)} />
            <Row label="Note" value="Measures IPC/DB overhead, not raw NVMe speed" muted />
          </Section>

          <Section
            title="Combined Performance Factor"
            copyText={`real_perf_factor: ${perf.real_perf_factor.toFixed(4)} | Formula: cpu×0.5 + mem×0.35 + disk×0.15`}
          >
            <Row label="real_perf_factor" value={perf.real_perf_factor.toFixed(4)} highlight copyVal={perf.real_perf_factor.toFixed(4)} />
            <Row label="Formula" value="cpu×0.5 + mem×0.35 + disk×0.15" muted />
          </Section>

          {device && (
            <Section
              title="GPU Detection"
              copyText={`GPU: ${device.gpu_renderer} | Vendor: ${device.gpu_vendor} | WebGL2: ${device.webgl2_available} | WebGPU: ${device.webgpu_available}${device.unified_memory ? " | Unified Memory" : ""}`}
            >
              <Row label="Renderer" value={device.gpu_renderer} copyVal={device.gpu_renderer} />
              <Row label="Vendor" value={device.gpu_vendor} copyVal={device.gpu_vendor} />
              <Row label="WebGL2" value={device.webgl2_available ? "Yes" : "No"} />
              <Row label="WebGPU" value={device.webgpu_available ? "Yes" : "No"} />
              {device.webgpu_adapter_name && (
                <Row label="WebGPU Adapter" value={device.webgpu_adapter_name} copyVal={device.webgpu_adapter_name} />
              )}
              <Row label="Unified Memory" value={device.unified_memory ? "Yes (Apple Silicon)" : "No"} />
            </Section>
          )}

          <Section
            title="RAM"
            copyText={`RAM: ${effectiveRam} GB | Source: ${device?.ram_source === "manual" ? "user-selected" : "navigator.deviceMemory"}`}
          >
            <Row label="System RAM" value={`${effectiveRam} GB`} copyVal={`${effectiveRam} GB`} />
            <Row
              label="Source"
              value={
                device?.ram_source === "manual"
                  ? "User-selected (browser API unavailable)"
                  : "navigator.deviceMemory (browser estimate)"
              }
              muted
            />
          </Section>
        </div>
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
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
        <p className="text-xs font-mono text-[#64748b] uppercase tracking-wider">{title}</p>
        {copyText && (
          <CopyButton
            text={copyText}
            iconOnly
            className="text-[#2a2a2a] hover:text-[#64748b]"
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
    <div className="flex justify-between items-center px-4 py-2.5 text-sm group">
      <span className="text-[#64748b]">{label}</span>
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
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex-shrink-0 border flex items-center justify-center text-xs ${
          done
            ? "bg-[#22c55e] border-[#22c55e] text-black"
            : active
            ? "border-[#22c55e] pulse-dot text-[#22c55e]"
            : "border-[#2a2a2a] text-[#333]"
        }`}
      >
        {done ? "✓" : ""}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${done ? "text-[#64748b]" : active ? "text-white" : "text-[#333]"}`}>
            {label}
          </span>
          {active && progress !== undefined && (
            <span className="text-xs font-mono text-[#64748b]">{Math.round(progress)}%</span>
          )}
        </div>
        {active && progress !== undefined && (
          <div className="mt-1.5 h-1 bg-[#1a1a1a] rounded overflow-hidden">
            <div
              className="h-full bg-[#22c55e] transition-all progress-animated"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
