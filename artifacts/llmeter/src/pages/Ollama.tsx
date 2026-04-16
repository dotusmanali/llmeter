import { useState, useEffect } from "react";
import { useBenchmarkStore } from "../store/benchmarkStore";
import { computeFits, MODELS } from "../lib/models";
import { FitBadge } from "../components/FitBadge";
import { WarningBanner } from "../components/WarningBanner";

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1e9;
  return `${gb.toFixed(2)} GB`;
}

export default function Ollama() {
  const { score, effectiveRam } = useBenchmarkStore();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installedModels, setInstalledModels] = useState<OllamaModel[]>([]);
  const [tab, setTab] = useState<"installed" | "recommended" | "too_large">("installed");
  const [copied, setCopied] = useState(false);

  const COMMAND = "OLLAMA_ORIGINS=* ollama serve";

  const ram = effectiveRam ?? 8;
  const sc = score?.final_score ?? 0;
  const fits = computeFits(ram, sc);

  const recommendedModels = MODELS.filter((m) => {
    const installed = installedModels.some((i) => i.name.startsWith(m.ollama_name || m.name.toLowerCase()));
    if (installed) return false;
    return fits.some((f) => f.model.name === m.name && f.fit !== "no");
  });

  const tooLargeModels = MODELS.filter((m) =>
    fits.filter((f) => f.model.name === m.name).every((f) => f.fit === "no")
  );

  async function connect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:11434/api/tags", {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { models: OllamaModel[] };
      setInstalledModels(data.models || []);
      setConnected(true);
    } catch (e) {
      setError("Could not connect to Ollama. Make sure it is running with CORS enabled.");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    connect();
  }, []);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ollama</h1>
        <p className="text-[#64748b] text-sm mt-1">
          Manage local Ollama models and get fit-based recommendations.
        </p>
      </div>

      {/* Connection panel */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
        <p className="text-sm text-white mb-1">
          To read your installed models, run this command first:
        </p>
        <div className="flex items-center gap-2 mt-3">
          <code className="flex-1 font-mono text-sm bg-[#0a0a0a] border border-[#1f1f1f] px-4 py-2 rounded-lg text-[#22c55e]">
            {COMMAND}
          </code>
          <button
            onClick={handleCopyCommand}
            className="px-3 py-2 bg-[#1f1f1f] text-sm text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={connect}
            disabled={loading}
            className="px-3 py-2 bg-[#22c55e] text-black text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50"
          >
            {loading ? "Connecting…" : "Connect"}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-[#22c55e]" : "bg-[#333]"}`} />
          <span className="text-sm text-[#64748b]">
            {connected ? `Connected — ${installedModels.length} model(s) found` : "Not connected"}
          </span>
        </div>
      </div>

      {error && (
        <WarningBanner
          type="yellow"
          message={error}
          copyText={COMMAND}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1f1f1f]">
        {(["installed", "recommended", "too_large"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#22c55e] text-white"
                : "border-transparent text-[#64748b] hover:text-white"
            }`}
          >
            {t === "installed" ? "Installed" : t === "recommended" ? "Recommended" : "Too Large"}
          </button>
        ))}
      </div>

      {/* Installed */}
      {tab === "installed" && (
        <div className="space-y-2">
          {!connected && (
            <p className="text-[#64748b] text-sm">Connect to Ollama to see installed models.</p>
          )}
          {connected && installedModels.length === 0 && (
            <p className="text-[#64748b] text-sm">No models installed yet.</p>
          )}
          {installedModels.map((m) => {
            const matchedFit = fits.find((f) =>
              m.name.toLowerCase().includes(f.model.ollama_name?.replace(":", "") ?? "")
            );
            return (
              <div
                key={m.name}
                className="bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-sm text-white">{m.name}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{formatBytes(m.size)}</p>
                </div>
                {matchedFit && <FitBadge fit={matchedFit.fit} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommended */}
      {tab === "recommended" && (
        <div className="space-y-2">
          {recommendedModels.length === 0 && (
            <p className="text-[#64748b] text-sm">
              No recommendations available. Run a benchmark first.
            </p>
          )}
          {recommendedModels.map((m) => {
            const bestFit = fits
              .filter((f) => f.model.name === m.name && f.fit !== "no")
              .sort((a, b) => {
                const q = ["high", "good", "balanced", "medium", "low"];
                return q.indexOf(a.quality) - q.indexOf(b.quality);
              })[0];
            const pullCmd = `ollama pull ${m.ollama_name}`;
            return (
              <div
                key={m.name}
                className="bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white text-sm">{m.name}</p>
                    {bestFit && (
                      <p className="text-xs text-[#64748b] mt-0.5">
                        Best quant: {bestFit.key} · {bestFit.ram_gb}GB
                      </p>
                    )}
                  </div>
                  {bestFit && <FitBadge fit={bestFit.fit} />}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs bg-[#0a0a0a] border border-[#1f1f1f] px-3 py-1.5 rounded text-[#22c55e]">
                    {pullCmd}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(pullCmd)}
                    className="text-xs px-2 py-1.5 bg-[#1f1f1f] text-[#64748b] hover:text-white rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Too Large */}
      {tab === "too_large" && (
        <div className="space-y-2">
          {tooLargeModels.map((m) => {
            const smallest = Object.values(m.quants).sort((a, b) => a.ram_gb - b.ram_gb)[0];
            return (
              <div
                key={m.name}
                className="bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-white text-sm">{m.name}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Smallest quant needs {smallest.ram_gb}GB · You have ~{(ram * 0.7).toFixed(1)}GB usable
                  </p>
                </div>
                <FitBadge fit="no" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
