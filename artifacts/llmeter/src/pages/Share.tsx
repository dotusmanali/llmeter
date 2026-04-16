import { useEffect, useState } from "react";
import { decodeReport } from "../lib/share";
import { ScoreGauge } from "../components/ScoreGauge";
import type { BenchmarkRun } from "../lib/history";
import type { Tier } from "../lib/scoring";

export default function Share() {
  const [run, setRun] = useState<Partial<BenchmarkRun> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("r");
    if (!r) {
      setError(true);
      return;
    }
    const decoded = decodeReport(r);
    if (!decoded) {
      setError(true);
      return;
    }
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

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Shared Result</h1>
        {run.timestamp && (
          <p className="text-[#64748b] text-sm mt-1">
            Captured {new Date(run.timestamp).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <ScoreGauge score={run.final_score ?? 0} tier={tier} size={140} />
        <div className="space-y-2 text-sm">
          {run.ram_gb && (
            <div className="flex gap-4">
              <span className="text-[#64748b]">RAM</span>
              <span className="font-mono text-white">{run.ram_gb} GB</span>
            </div>
          )}
          {run.cores && (
            <div className="flex gap-4">
              <span className="text-[#64748b]">Cores</span>
              <span className="font-mono text-white">{run.cores}</span>
            </div>
          )}
          {run.arch && (
            <div className="flex gap-4">
              <span className="text-[#64748b]">Arch</span>
              <span className="font-mono text-white">{run.arch}</span>
            </div>
          )}
          {run.gpu_renderer && (
            <div className="flex gap-4">
              <span className="text-[#64748b]">GPU</span>
              <span className="font-mono text-white">{run.gpu_renderer}</span>
            </div>
          )}
          {run.tps_low !== undefined && run.tps_high !== undefined && (
            <div className="flex gap-4">
              <span className="text-[#64748b]">Est. tok/s</span>
              <span className="font-mono text-white">
                {run.tps_low}–{run.tps_high}
              </span>
            </div>
          )}
        </div>
      </div>

      {run.top_fits && run.top_fits.length > 0 && (
        <div>
          <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Top Fits</p>
          <div className="flex flex-wrap gap-2">
            {run.top_fits.map((f) => (
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

      <div className="border-t border-[#1f1f1f] pt-4">
        <p className="text-xs text-[#333] text-center">
          Results from LLMeter — browser-based LLM compatibility benchmark
        </p>
      </div>
    </div>
  );
}
