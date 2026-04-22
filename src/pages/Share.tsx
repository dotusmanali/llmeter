import { useEffect, useState } from "react";
import { decodeReport } from "../lib/share";
import { ScoreGauge } from "../components/ScoreGauge";
import { CopyButton } from "../components/CopyButton";
import { downloadJSON, downloadText, formatFullReport } from "../lib/export";
import type { BenchmarkRun } from "../lib/history";
import type { Tier } from "../lib/scoring";

export default function Share() {
  const [run, setRun] = useState<Partial<BenchmarkRun> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("r");
    if (!r) { setError(true); return; }
    const decoded = decodeReport(r);
    if (!decoded) { setError(true); return; }
    setRun(decoded);
  }, []);

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <p className="text-[#64748b] text-sm">Invalid or missing share link.</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <p className="text-[#64748b] text-sm">Loading…</p>
      </div>
    );
  }

  const tier = (() => {
    const s = run.final_score ?? 0;
    if (s >= 90) return "Powerhouse";
    if (s >= 70) return "High";
    if (s >= 50) return "Medium";
    if (s >= 30) return "Low";
    return "Minimal";
  })() as Tier;

  const fullRun = run as BenchmarkRun;
  const reportText = formatFullReport(fullRun);
  const likelyFits = run.all_fits?.filter((f) => f.fit === "likely") ?? [];
  const maybeFits = run.all_fits?.filter((f) => f.fit === "maybe") ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Shared Result</h1>
          {run.timestamp && (
            <p className="text-[#64748b] text-sm mt-1">
              Captured {new Date(run.timestamp).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CopyButton
            text={reportText}
            label="Copy Report"
            className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg"
          />
          <button
            onClick={() => downloadText(reportText, "llmeter-shared.txt")}
            className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
          >
            .txt
          </button>
          <button
            onClick={() => downloadJSON(run, "llmeter-shared.json")}
            className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
          >
            .json
          </button>
        </div>
      </div>

      {/* Score card */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <ScoreGauge score={run.final_score ?? 0} tier={tier} size={140} />
        <div className="space-y-2 text-sm w-full">
          {run.ram_gb !== undefined && (
            <InfoRow label="RAM" value={`${run.ram_gb} GB`} />
          )}
          {run.cores !== undefined && (
            <InfoRow label="Cores" value={String(run.cores)} />
          )}
          {run.arch && (
            <InfoRow label="Arch" value={run.arch} />
          )}
          {run.gpu_renderer && (
            <InfoRow label="GPU" value={run.gpu_renderer} />
          )}
          {run.tps_low !== undefined && run.tps_high !== undefined && (
            <InfoRow
              label="Est. tok/s"
              value={`${run.tps_low}–${run.tps_high}${run.tps_info ? ` (${run.tps_info.path})` : ""}`}
            />
          )}
          {run.perf_factor !== undefined && (
            <InfoRow label="Perf factor" value={`${run.perf_factor.toFixed(3)}×`} />
          )}
        </div>
      </div>

      {/* Device info (if available) */}
      {run.device_info && (
        <Section title="Device Info">
          <DetailGrid>
            <DRow label="OS" value={run.device_info.os} />
            <DRow label="GPU Vendor" value={run.device_info.gpu_vendor} />
            <DRow label="WebGPU" value={run.device_info.webgpu_available ? "Yes" : "No"} />
            <DRow label="SIMD" value={run.device_info.simd_supported ? "Yes" : "No"} />
            <DRow label="Unified Mem" value={run.device_info.unified_memory ? "Yes" : "No"} />
            <DRow label="Screen" value={`${run.device_info.screen_width}×${run.device_info.screen_height}`} />
          </DetailGrid>
        </Section>
      )}

      {/* Benchmark results (if available) */}
      {run.perf_raw && (
        <Section title="Benchmark Results">
          <DetailGrid>
            <DRow label="Perf Factor" value={`${run.perf_raw.real_perf_factor.toFixed(3)}×`} highlight />
            <DRow label="CPU Ops/sec" value={`${(run.perf_raw.cpu.ops_per_sec / 1000).toFixed(1)}k`} />
            <DRow label="Memory BW" value={`${run.perf_raw.memory.bandwidth_gb_s.toFixed(2)} GB/s`} />
            <DRow label="IDB Write" value={`${run.perf_raw.storage.write_mb_s.toFixed(0)} MB/s`} />
            <DRow label="IDB Read" value={`${run.perf_raw.storage.read_mb_s.toFixed(0)} MB/s`} />
          </DetailGrid>
        </Section>
      )}

      {/* Score breakdown (if available) */}
      {run.score_breakdown && (
        <Section title="Score Breakdown">
          <DetailGrid>
            <DRow label="RAM" value={`${run.score_breakdown.ram_pts}/40`} />
            <DRow label="CPU" value={`${run.score_breakdown.cpu_pts}/20`} />
            <DRow label="Arch" value={`${run.score_breakdown.arch_pts}/15`} />
            <DRow label="Accel" value={`${run.score_breakdown.accel_pts}/15`} />
            <DRow label="GPU" value={`${run.score_breakdown.gpu_pts}/10`} />
            <DRow label="Final" value={String(run.final_score)} highlight />
          </DetailGrid>
        </Section>
      )}

      {/* Likely models */}
      {(run.top_fits && run.top_fits.length > 0) && (
        <div>
          <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">
            Models Likely to Run ({likelyFits.length > 0 ? likelyFits.length : run.top_fits.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {(likelyFits.length > 0 ? likelyFits.map((f) => `${f.model} ${f.quant}`) : run.top_fits).map((f) => (
              <span
                key={f}
                className="text-sm px-3 py-1 rounded-full bg-green-950/30 border border-green-800/30 text-green-400 font-mono"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Maybe models */}
      {maybeFits.length > 0 && (
        <div>
          <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">
            Marginal Fits ({maybeFits.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {maybeFits.map((f) => (
              <span
                key={`${f.model}-${f.quant}`}
                className="text-sm px-3 py-1 rounded-full bg-yellow-950/30 border border-yellow-800/30 text-yellow-400 font-mono"
              >
                {f.model} {f.quant}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[#1f1f1f] pt-4">
        <p className="text-xs text-[#333] text-center">
          Results from LLMeter — browser-based LLM compatibility benchmark. All estimates only.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-[#64748b] w-20 flex-shrink-0">{label}</span>
      <span className="font-mono text-white">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
      <p className="px-4 py-2 text-xs font-mono text-[#64748b] uppercase tracking-wider border-b border-[#1f1f1f] bg-[#0e0e0e]">
        {title}
      </p>
      {children}
    </div>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
      {children}
    </div>
  );
}

function DRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[#444]">{label}</span>
      <span className={`font-mono text-sm ${highlight ? "text-[#22c55e]" : "text-white"}`}>{value}</span>
    </div>
  );
}
