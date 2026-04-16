import { useState, useEffect } from "react";
import { loadHistory, clearHistory, exportHistory, type BenchmarkRun } from "../lib/history";
import { buildShareUrl } from "../lib/share";
import { CopyButton } from "../components/CopyButton";
import { downloadJSON, downloadText, formatFullReport, copyToClipboard } from "../lib/export";

export default function History() {
  const [history, setHistory] = useState<BenchmarkRun[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Clear all benchmark history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleExportAll = () => {
    const json = exportHistory();
    downloadJSON(JSON.parse(json), "llmeter-history.json");
  };

  const handleShareUrl = async (run: BenchmarkRun) => {
    const url = buildShareUrl(run);
    await copyToClipboard(url);
    setShareMsg(run.id + "-url");
    setTimeout(() => setShareMsg(null), 2000);
  };

  const handleDownloadRun = (run: BenchmarkRun) => {
    downloadJSON(run, `llmeter-run-${run.id}.json`);
  };

  const handleDownloadText = (run: BenchmarkRun) => {
    downloadText(formatFullReport(run), `llmeter-run-${run.id}.txt`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">History</h1>
          <p className="text-[#64748b] text-sm mt-1">Last {history.length} benchmark runs stored locally.</p>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportAll}
                className="px-3 py-1.5 text-sm border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
              >
                Export All
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm border border-red-900/50 text-red-400 hover:text-red-300 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {history.length === 0 && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8 text-center">
          <p className="text-[#64748b] text-sm">No benchmark history yet. Run a benchmark to see results here.</p>
        </div>
      )}

      <div className="space-y-3">
        {history.map((run) => {
          const expanded = expandedId === run.id;
          const scoreColor =
            run.final_score >= 70 ? "#22c55e" : run.final_score >= 50 ? "#eab308" : "#ef4444";

          const likelyFits = run.all_fits
            ? run.all_fits.filter((f) => f.fit === "likely")
            : [];
          const maybeFits = run.all_fits
            ? run.all_fits.filter((f) => f.fit === "maybe")
            : [];

          return (
            <div
              key={run.id}
              className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden"
            >
              {/* Header row */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setExpandedId(expanded ? null : run.id)}
                    className="flex items-center gap-4 text-left flex-1 min-w-0"
                  >
                    <div className="text-center flex-shrink-0">
                      <p className="font-mono text-2xl font-bold" style={{ color: scoreColor }}>
                        {run.final_score}
                      </p>
                      <p className="text-xs text-[#64748b]">{run.tier}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {run.ram_gb}GB RAM · {run.cores} cores · {run.arch}
                        {run.device_info?.os ? ` · ${run.device_info.os}` : ""}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {new Date(run.timestamp).toLocaleString()}
                      </p>
                      {run.tps_low > 0 && (
                        <p className="text-xs text-[#64748b] mt-0.5 font-mono">
                          ~{run.tps_low}–{run.tps_high} tok/s
                          {run.tps_info ? ` (${run.tps_info.path})` : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-[#333] ml-auto flex-shrink-0">{expanded ? "▲" : "▼"}</span>
                  </button>
                </div>

                {/* Top fits preview */}
                {run.top_fits.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {run.top_fits.slice(0, 5).map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded bg-green-950/30 border border-green-800/30 text-green-400 font-mono"
                      >
                        {f}
                      </span>
                    ))}
                    {run.top_fits.length > 5 && (
                      <span className="text-xs text-[#444]">+{run.top_fits.length - 5} more</span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleShareUrl(run)}
                    className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
                  >
                    {shareMsg === run.id + "-url" ? "URL Copied!" : "Share URL"}
                  </button>
                  <CopyButton
                    text={formatFullReport(run)}
                    label="Copy Report"
                    className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg"
                  />
                  <button
                    onClick={() => handleDownloadText(run)}
                    className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
                  >
                    .txt
                  </button>
                  <button
                    onClick={() => handleDownloadRun(run)}
                    className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
                  >
                    .json
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div className="border-t border-[#1a1a1a] divide-y divide-[#1a1a1a]">
                  {/* Device info */}
                  {run.device_info && (
                    <DetailSection title="Device Info">
                      <DetailGrid>
                        <DRow label="OS" value={run.device_info.os} />
                        <DRow label="RAM" value={`${run.ram_gb} GB`} />
                        <DRow label="Cores" value={String(run.cores)} />
                        <DRow label="Arch" value={run.arch} />
                        <DRow label="GPU" value={run.gpu_renderer || "Unknown"} />
                        <DRow label="WebGPU" value={run.device_info.webgpu_available ? "Yes" : "No"} />
                        <DRow label="WebGL2" value={run.device_info.webgl2_available ? "Yes" : "No"} />
                        <DRow label="SIMD" value={run.device_info.simd_supported ? "Yes" : "No"} />
                        <DRow label="Threads" value={run.device_info.threads_supported ? "Yes" : "No"} />
                        <DRow label="Unified Mem" value={run.device_info.unified_memory ? "Yes" : "No"} />
                        <DRow label="Screen" value={`${run.device_info.screen_width}×${run.device_info.screen_height}`} />
                      </DetailGrid>
                    </DetailSection>
                  )}

                  {/* Benchmark results */}
                  {run.perf_raw && (
                    <DetailSection title="Benchmark Results">
                      <DetailGrid>
                        <DRow label="Perf Factor" value={`${run.perf_raw.real_perf_factor.toFixed(3)}×`} highlight />
                        <DRow label="CPU Ops/sec" value={`${(run.perf_raw.cpu.ops_per_sec / 1000).toFixed(1)}k`} />
                        <DRow label="Memory BW" value={`${run.perf_raw.memory.bandwidth_gb_s.toFixed(2)} GB/s`} />
                        <DRow label="IDB Write" value={`${run.perf_raw.storage.write_mb_s.toFixed(0)} MB/s`} />
                        <DRow label="IDB Read" value={`${run.perf_raw.storage.read_mb_s.toFixed(0)} MB/s`} />
                        <DRow label="CPU Factor" value={run.perf_raw.cpu_factor.toFixed(3)} />
                        <DRow label="Mem Factor" value={run.perf_raw.mem_factor.toFixed(3)} />
                        <DRow label="Disk Factor" value={run.perf_raw.disk_factor.toFixed(3)} />
                      </DetailGrid>
                    </DetailSection>
                  )}

                  {/* Score breakdown */}
                  {run.score_breakdown && (
                    <DetailSection title="Score Breakdown">
                      <DetailGrid>
                        <DRow label="RAM" value={`${run.score_breakdown.ram_pts}/40`} />
                        <DRow label="CPU" value={`${run.score_breakdown.cpu_pts}/20`} />
                        <DRow label="Arch" value={`${run.score_breakdown.arch_pts}/15`} />
                        <DRow label="Accel" value={`${run.score_breakdown.accel_pts}/15`} />
                        <DRow label="GPU" value={`${run.score_breakdown.gpu_pts}/10`} />
                        <DRow label="Base" value={`${run.score_breakdown.base_score}/100`} />
                        <DRow label="Final" value={`${run.final_score}`} highlight />
                      </DetailGrid>
                    </DetailSection>
                  )}

                  {/* Likely models */}
                  {likelyFits.length > 0 && (
                    <DetailSection title={`Models Likely to Run (${likelyFits.length})`}>
                      <div className="px-4 py-3 flex flex-wrap gap-2">
                        {likelyFits.map((f) => (
                          <span
                            key={`${f.model}-${f.quant}`}
                            className="text-xs px-2.5 py-1 rounded-lg bg-green-950/40 border border-green-800/40 text-green-400 font-mono"
                          >
                            {f.model} {f.quant}{" "}
                            <span className="text-green-700">{f.ram_gb}GB</span>
                          </span>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                  {/* Maybe models */}
                  {maybeFits.length > 0 && (
                    <DetailSection title={`Marginal Fits (${maybeFits.length})`}>
                      <div className="px-4 py-3 flex flex-wrap gap-2">
                        {maybeFits.map((f) => (
                          <span
                            key={`${f.model}-${f.quant}`}
                            className="text-xs px-2.5 py-1 rounded-lg bg-yellow-950/30 border border-yellow-800/30 text-yellow-400 font-mono"
                          >
                            {f.model} {f.quant}{" "}
                            <span className="text-yellow-700">{f.ram_gb}GB</span>
                          </span>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                  {/* TPS info */}
                  {run.tps_info && (
                    <DetailSection title="Token Speed Estimate">
                      <DetailGrid>
                        <DRow label="Low estimate" value={`${run.tps_low} tok/s`} />
                        <DRow label="High estimate" value={`${run.tps_high} tok/s`} />
                        <DRow label="Path" value={run.tps_info.path} />
                        <DRow label="Bottleneck" value={run.tps_info.limiting_factor} />
                      </DetailGrid>
                    </DetailSection>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0e0e0e]">
      <p className="px-4 py-2 text-xs font-mono text-[#333] uppercase tracking-wider border-b border-[#1a1a1a]">
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
