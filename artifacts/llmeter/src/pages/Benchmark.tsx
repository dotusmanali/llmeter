import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { RamModal } from "../components/RamModal";

export default function Benchmark() {
  const { phase, cpuProgress, perf, device, effectiveRam, needsRamModal } =
    useBenchmarkStore();
  const { run, continueAfterRam } = useBenchmark();
  const running = ["detecting", "cpu", "memory", "storage", "gpu", "scoring"].includes(phase);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Benchmark</h1>
        <p className="text-[#64748b] text-sm mt-1">
          Raw results from all benchmark phases.
        </p>
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
          <Section title="JS Compute Benchmark">
            <Row label="Operations/sec" value={`${(perf.cpu.ops_per_sec / 1000).toFixed(1)}k`} />
            <Row label="CPU Factor" value={perf.cpu_factor.toFixed(3)} />
            <Row label="Benchmark type" value="Math.fround loop (optimized JS)" />
          </Section>
          <Section title="Memory Bandwidth">
            <Row label="Bandwidth" value={`${perf.memory.bandwidth_gb_s.toFixed(2)} GB/s`} />
            <Row label="Memory Factor" value={perf.mem_factor.toFixed(3)} />
            <Row label="Test size" value="128 MB Float32Array" />
          </Section>
          <Section title="IndexedDB Storage">
            <Row label="Write speed" value={`${perf.storage.write_mb_s.toFixed(0)} MB/s`} />
            <Row label="Read speed" value={`${perf.storage.read_mb_s.toFixed(0)} MB/s`} />
            <Row label="Disk Factor" value={perf.disk_factor.toFixed(3)} />
            <Row label="Note" value="Measures IPC/DB overhead, not raw NVMe" muted />
          </Section>
          <Section title="Combined Performance Factor">
            <Row label="real_perf_factor" value={perf.real_perf_factor.toFixed(4)} highlight />
            <Row label="Formula" value="cpu×0.5 + mem×0.35 + disk×0.15" />
          </Section>
          {device && (
            <Section title="GPU Detection">
              <Row label="Renderer" value={device.gpu_renderer} />
              <Row label="Vendor" value={device.gpu_vendor} />
              <Row label="WebGL2" value={device.webgl2_available ? "Yes" : "No"} />
              <Row label="WebGPU" value={device.webgpu_available ? "Yes" : "No"} />
              {device.webgpu_adapter_name && (
                <Row label="WebGPU Adapter" value={device.webgpu_adapter_name} />
              )}
              <Row label="Unified Memory" value={device.unified_memory ? "Yes (Apple Silicon)" : "No"} />
            </Section>
          )}
          <Section title="RAM">
            <Row label="System RAM" value={`${effectiveRam} GB`} />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1f1f1f] bg-[#0e0e0e]">
        <p className="text-xs font-mono text-[#64748b] uppercase tracking-wider">{title}</p>
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
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
      <span className="text-[#64748b]">{label}</span>
      <span
        className={`font-mono ${
          highlight ? "text-[#22c55e]" : muted ? "text-[#444]" : "text-white"
        }`}
      >
        {value}
      </span>
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
