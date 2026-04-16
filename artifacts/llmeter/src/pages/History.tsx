import { useState, useEffect } from "react";
import { loadHistory, clearHistory, exportHistory, type BenchmarkRun } from "../lib/history";
import { buildShareUrl } from "../lib/share";

export default function History() {
  const [history, setHistory] = useState<BenchmarkRun[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Clear all benchmark history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llmeter-history.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (run: BenchmarkRun) => {
    const url = buildShareUrl(run);
    navigator.clipboard.writeText(url);
    setCopied(run.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">History</h1>
          <p className="text-[#64748b] text-sm mt-1">Last {history.length} benchmark runs.</p>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-sm border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
              >
                Export JSON
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
        {history.map((run) => (
          <div
            key={run.id}
            className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p
                    className="font-mono text-2xl font-bold"
                    style={{
                      color:
                        run.final_score >= 70
                          ? "#22c55e"
                          : run.final_score >= 50
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  >
                    {run.final_score}
                  </p>
                  <p className="text-xs text-[#64748b]">{run.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {run.ram_gb}GB RAM · {run.cores} cores · {run.arch}
                  </p>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    {new Date(run.timestamp).toLocaleString()}
                  </p>
                  {run.tps_low > 0 && (
                    <p className="text-xs text-[#64748b] mt-0.5 font-mono">
                      ~{run.tps_low}–{run.tps_high} tok/s
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleShare(run)}
                className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
              >
                {copied === run.id ? "Copied!" : "Share"}
              </button>
            </div>
            {run.top_fits.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {run.top_fits.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2 py-0.5 rounded bg-green-950/30 border border-green-800/30 text-green-400 font-mono"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
