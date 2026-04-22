import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { ScoreGauge } from "../components/ScoreGauge";
import { RamModal } from "../components/RamModal";
import { WarningBanner } from "../components/WarningBanner";
import { computeFits, getBestRecommendations } from "../lib/models";
import { computeFeatures } from "../lib/features";
import { FeatureFlagsGrid } from "../components/FeatureFlags";
import { CopyButton } from "../components/CopyButton";
import { downloadJSON, downloadText, formatFullReport } from "../lib/export";

const TIER_DESC: Record<string, string> = {
  Powerhouse: "Runs 13B+ models comfortably",
  High: "Runs 7B models comfortably",
  Medium: "Runs 3B–7B, chunked for larger",
  Low: "Runs 1B–3B models only",
  Minimal: "TinyLlama or lighter only",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
      <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-[#64748b] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { phase, score, tps, device, perf, effectiveRam, needsRamModal, lastRun } =
    useBenchmarkStore();
  const { run, continueAfterRam } = useBenchmark();

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

  const handleDownloadJSON = () => {
    if (!lastRun) return;
    downloadJSON(lastRun, `llmeter-${lastRun.id}.json`);
  };

  const handleDownloadText = () => {
    if (!lastRun) return;
    downloadText(formatFullReport(lastRun), `llmeter-${lastRun.id}.txt`);
  };

  const reportText = lastRun ? formatFullReport(lastRun) : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Device Benchmark</h1>
          <p className="text-[#64748b] text-sm mt-1">
            Run real micro-benchmarks to see which LLMs your device can handle.
          </p>
        </div>
        {done && lastRun && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton
              text={reportText}
              label="Copy Report"
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg"
            />
            <button
              onClick={handleDownloadText}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
            >
              .txt
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
            >
              .json
            </button>
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && <div className="space-y-2">{warnings}</div>}

      {/* Idle */}
      {phase === "idle" && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1f1f1f] flex items-center justify-center mb-2">
            <span className="font-mono text-2xl text-[#22c55e]">▶</span>
          </div>
          <p className="text-center text-[#64748b] text-sm max-w-sm">
            Runs a 3-second JS compute test, memory bandwidth test, and IndexedDB
            storage test — all locally in your browser. No data leaves your device.
          </p>
          <button
            onClick={run}
            className="px-8 py-3 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Run Benchmark
          </button>
          {lastRun && (
            <p className="text-xs text-[#333]">
              Last run: {new Date(lastRun.timestamp).toLocaleDateString()} — score {lastRun.final_score}
            </p>
          )}
        </div>
      )}

      {/* Running */}
      {running && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8">
          <BenchmarkProgress />
        </div>
      )}

      {/* Results */}
      {done && score && device && effectiveRam !== null && perf && (
        <>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={score.final_score} tier={score.tier} size={160} />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">{score.tier}</h2>
              <p className="text-[#64748b] text-sm mt-1">{TIER_DESC[score.tier]}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <span className="text-[#64748b]">Est. tokens/sec</span>
                <span className="font-mono text-white">
                  {tps ? `${tps.low}–${tps.high}` : "—"}{" "}
                  <span className="text-xs text-[#64748b]">({tps?.path})</span>
                </span>
                <span className="text-[#64748b]">Perf factor</span>
                <span className="font-mono text-white">{perf.real_perf_factor.toFixed(2)}×</span>
                <span className="text-[#64748b]">Memory bandwidth</span>
                <span className="font-mono text-white">{perf.memory.bandwidth_gb_s.toFixed(1)} GB/s</span>
                <span className="text-[#64748b]">CPU ops/sec</span>
                <span className="font-mono text-white">{(perf.cpu.ops_per_sec / 1000).toFixed(1)}k</span>
                <span className="text-[#64748b]">IndexedDB read</span>
                <span className="font-mono text-white">
                  {perf.storage.read_mb_s.toFixed(0)} MB/s{" "}
                  <span className="text-xs text-[#64748b]">(IPC overhead)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="RAM"
              value={`${effectiveRam} GB`}
              sub={device.ram_source === "manual" ? "user-selected" : "browser estimate"}
            />
            <StatCard label="CPU Cores" value={String(device.cores)} sub={device.arch} />
            <StatCard label="OS" value={device.os} sub={device.is_apple_silicon ? "Apple Silicon" : undefined} />
            <StatCard
              label="GPU"
              value={device.webgpu_available ? "WebGPU" : device.webgl2_available ? "WebGL2" : "None"}
              sub={device.unified_memory ? "Unified Memory" : undefined}
            />
          </div>

          {/* Score breakdown */}
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#1f1f1f] flex items-center justify-between">
              <p className="text-xs font-mono text-[#64748b] uppercase tracking-wider">Score Breakdown</p>
              <CopyButton
                text={`Score: ${score.final_score}/100 | RAM: ${score.ram_pts}/40 | CPU: ${score.cpu_pts}/20 | Arch: ${score.arch_pts}/15 | Accel: ${score.accel_pts}/15 | GPU: ${score.gpu_pts}/10`}
                label="Copy"
                className="text-xs text-[#64748b] hover:text-white px-2 py-1 rounded border border-[#1f1f1f]"
              />
            </div>
            <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {[
                { label: "RAM", pts: score.ram_pts, max: 40 },
                { label: "CPU", pts: score.cpu_pts, max: 20 },
                { label: "Arch", pts: score.arch_pts, max: 15 },
                { label: "Accel", pts: score.accel_pts, max: 15 },
                { label: "GPU", pts: score.gpu_pts, max: 10 },
              ].map(({ label, pts, max }) => (
                <div key={label}>
                  <p className="text-xs text-[#64748b] mb-1">{label}</p>
                  <p className="font-mono text-sm text-white">{pts}<span className="text-[#333]">/{max}</span></p>
                  <div className="mt-1.5 h-1 bg-[#1a1a1a] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#22c55e] rounded"
                      style={{ width: `${(pts / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-medium text-[#64748b] uppercase tracking-wider mb-3">
              One-Click Recommendations
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {best_overall && (
                <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-xs text-[#64748b] mb-1">Best Overall</p>
                  <p className="text-white font-medium text-sm">{best_overall.model.name}</p>
                  <p className="font-mono text-xs text-[#22c55e] mt-0.5">{best_overall.key} · {best_overall.ram_gb}GB</p>
                </div>
              )}
              {best_quality && (
                <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-xs text-[#64748b] mb-1">Best Quality</p>
                  <p className="text-white font-medium text-sm">{best_quality.model.name}</p>
                  <p className="font-mono text-xs text-[#eab308] mt-0.5">{best_quality.key} · {best_quality.ram_gb}GB</p>
                </div>
              )}
              {fastest && (
                <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
                  <p className="text-xs text-[#64748b] mb-1">Fastest</p>
                  <p className="text-white font-medium text-sm">{fastest.model.name}</p>
                  <p className="font-mono text-xs text-[#3b82f6] mt-0.5">{fastest.key} · {fastest.ram_gb}GB</p>
                </div>
              )}
            </div>
          </div>

          {/* Likely to run */}
          {fits.filter((f) => f.fit === "likely").length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#64748b] uppercase tracking-wider">
                  Models Likely to Run
                </h3>
                <CopyButton
                  text={fits.filter((f) => f.fit === "likely").map((f) => `${f.model.name} ${f.key} (${f.ram_gb}GB)`).join("\n")}
                  label="Copy list"
                  className="text-xs text-[#64748b] hover:text-white px-2 py-1 rounded border border-[#1f1f1f]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {fits.filter((f) => f.fit === "likely").map((f) => (
                  <span
                    key={`${f.model.name}-${f.key}`}
                    className="text-sm px-3 py-1.5 rounded-lg bg-green-950/30 border border-green-800/30 text-green-400 font-mono"
                  >
                    {f.model.name} <span className="text-green-600">{f.key}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feature flags */}
          {features && (
            <div>
              <h3 className="text-sm font-medium text-[#64748b] uppercase tracking-wider mb-3">
                Supported Features
              </h3>
              <FeatureFlagsGrid flags={features} />
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-[#1a1a1a]">
            <button
              onClick={run}
              className="text-sm text-[#64748b] hover:text-white transition-colors"
            >
              Run again →
            </button>
          </div>
        </>
      )}

      <RamModal open={needsRamModal} onSelect={(gb) => continueAfterRam(gb)} />
    </div>
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
    <div className="space-y-3">
      <p className="text-sm font-medium text-white mb-4">Running benchmarks…</p>
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 border ${
                done
                  ? "bg-[#22c55e] border-[#22c55e]"
                  : active
                  ? "border-[#22c55e] pulse-dot"
                  : "border-[#2a2a2a] bg-[#1a1a1a]"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    done ? "text-[#64748b]" : active ? "text-white" : "text-[#333]"
                  }`}
                >
                  {step.label}
                </span>
                {active && step.key === "cpu" && (
                  <span className="text-xs font-mono text-[#64748b]">{Math.round(cpuProgress)}%</span>
                )}
                {done && <span className="text-xs text-[#22c55e]">✓</span>}
              </div>
              {active && step.key === "cpu" && (
                <div className="mt-1.5 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22c55e] rounded-full transition-all progress-animated"
                    style={{ width: `${cpuProgress}%` }}
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
