import { useState } from "react";
import { useBenchmarkStore } from "../store/benchmarkStore";
import { MODELS, computeFits } from "../lib/models";
import { FitBadge } from "../components/FitBadge";
import { planLoadingStrategy } from "../lib/planner";

export default function Compare() {
  const { score, effectiveRam, perf } = useBenchmarkStore();
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [quantA, setQuantA] = useState("");
  const [quantB, setQuantB] = useState("");

  const ram = effectiveRam ?? 8;
  const sc = score?.final_score ?? 0;
  const disk = perf?.storage.read_mb_s ?? 100;
  const fits = computeFits(ram, sc);

  const mA = MODELS.find((m) => m.name === modelA);
  const mB = MODELS.find((m) => m.name === modelB);
  const qA = mA && quantA ? mA.quants[quantA] : null;
  const qB = mB && quantB ? mB.quants[quantB] : null;
  const fitA = fits.find((f) => f.model.name === modelA && f.key === quantA) ?? null;
  const fitB = fits.find((f) => f.model.name === modelB && f.key === quantB) ?? null;
  const planA = qA ? planLoadingStrategy(qA.ram_gb, ram * 0.7, disk) : null;
  const planB = qB ? planLoadingStrategy(qB.ram_gb, ram * 0.7, disk) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Compare</h1>
        <p className="text-[#64748b] text-sm mt-1">Model vs model side-by-side comparison.</p>
      </div>

      {/* Model selectors */}
      <div className="grid sm:grid-cols-2 gap-4">
        <ModelSelector
          label="Model A"
          model={modelA}
          quant={quantA}
          onModel={(v) => { setModelA(v); setQuantA(""); }}
          onQuant={setQuantA}
          accentColor="#22c55e"
        />
        <ModelSelector
          label="Model B"
          model={modelB}
          quant={quantB}
          onModel={(v) => { setModelB(v); setQuantB(""); }}
          onQuant={setQuantB}
          accentColor="#3b82f6"
        />
      </div>

      {/* Comparison table */}
      {qA && qB && planA && planB && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[160px_1fr_1fr] border-b border-[#1f1f1f]">
            <div className="px-4 py-3 border-r border-[#1f1f1f]" />
            <div className="px-4 py-3 border-r border-[#1f1f1f]">
              <p className="text-xs text-[#64748b] mb-0.5">Model A</p>
              <p className="text-sm font-medium text-[#22c55e]">{modelA}</p>
              <p className="font-mono text-xs text-[#64748b]">{quantA.toUpperCase()}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-[#64748b] mb-0.5">Model B</p>
              <p className="text-sm font-medium text-[#3b82f6]">{modelB}</p>
              <p className="font-mono text-xs text-[#64748b]">{quantB.toUpperCase()}</p>
            </div>
          </div>

          {[
            {
              label: "RAM Required",
              a: `${qA.ram_gb} GB`,
              b: `${qB.ram_gb} GB`,
              win: qA.ram_gb <= qB.ram_gb ? "a" : "b",
              winLabel: "lower",
            },
            {
              label: "Quality",
              a: qA.quality,
              b: qB.quality,
              win: qualityRank(qA.quality) <= qualityRank(qB.quality) ? "a" : "b",
              winLabel: "higher",
            },
            {
              label: "Fit Status",
              aEl: fitA ? <FitBadge fit={fitA.fit} /> : <span className="text-[#333] text-xs">—</span>,
              bEl: fitB ? <FitBadge fit={fitB.fit} /> : <span className="text-[#333] text-xs">—</span>,
              win: fitRank(fitA?.fit) <= fitRank(fitB?.fit) ? "a" : "b",
              winLabel: "better",
            },
            {
              label: "Load Strategy",
              a: planA.strategy,
              b: planB.strategy,
              win: planA.strategy === "direct" && planB.strategy !== "direct" ? "a" :
                   planB.strategy === "direct" ? "b" : "tie",
              winLabel: "direct",
            },
            {
              label: "Est. Load Time",
              a: `~${planA.est_load_time_sec}s`,
              b: `~${planB.est_load_time_sec}s`,
              win: planA.est_load_time_sec <= planB.est_load_time_sec ? "a" : "b",
              winLabel: "faster",
            },
            {
              label: "Fail Risk",
              a: `${Math.round(planA.failure_probability * 100)}%`,
              b: `${Math.round(planB.failure_probability * 100)}%`,
              win: planA.failure_probability <= planB.failure_probability ? "a" : "b",
              winLabel: "lower",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[160px_1fr_1fr] border-b border-[#1a1a1a]"
            >
              <div className="px-4 py-3 border-r border-[#1a1a1a]">
                <span className="text-xs text-[#64748b]">{row.label}</span>
              </div>
              <Cell value={row.aEl ?? row.a} winner={row.win === "a"} />
              <Cell value={row.bEl ?? row.b} winner={row.win === "b"} last />
            </div>
          ))}
        </div>
      )}

      {(!qA || !qB) && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8 text-center">
          <p className="text-[#64748b] text-sm">Select two models with quants to compare.</p>
        </div>
      )}
    </div>
  );
}

function qualityRank(q: string): number {
  const o = ["high", "good", "balanced", "medium", "low"];
  const i = o.indexOf(q);
  return i === -1 ? 99 : i;
}

function fitRank(f?: string): number {
  if (f === "likely") return 0;
  if (f === "maybe") return 1;
  return 2;
}

function ModelSelector({
  label, model, quant, onModel, onQuant, accentColor,
}: {
  label: string;
  model: string;
  quant: string;
  onModel: (v: string) => void;
  onQuant: (v: string) => void;
  accentColor: string;
}) {
  const m = MODELS.find((x) => x.name === model);
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: accentColor }}>
        {label}
      </p>
      <select
        value={model}
        onChange={(e) => onModel(e.target.value)}
        className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-sm text-white rounded-lg px-3 py-2 focus:outline-none"
      >
        <option value="">Select model…</option>
        {MODELS.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>
      {m && (
        <select
          value={quant}
          onChange={(e) => onQuant(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-sm text-white rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="">Select quant…</option>
          {Object.entries(m.quants).map(([k, q]) => (
            <option key={k} value={k}>
              {q.key} — {q.ram_gb}GB ({q.quality})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function Cell({
  value,
  winner,
  last,
}: {
  value: React.ReactNode;
  winner: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 flex items-center ${!last ? "border-r border-[#1a1a1a]" : ""} ${
        winner ? "bg-[#0d1a0f]" : ""
      }`}
    >
      <span className="font-mono text-sm text-white">{value}</span>
      {winner && (
        <span className="ml-2 text-xs text-[#22c55e]">✓</span>
      )}
    </div>
  );
}
