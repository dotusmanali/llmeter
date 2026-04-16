import { useState } from "react";
import { useBenchmarkStore } from "../store/benchmarkStore";
import { computeFits, MODELS, USE_CASE_MAP } from "../lib/models";
import { FitBadge } from "../components/FitBadge";
import type { Fit } from "../lib/models";

const GOAL_OPTIONS = [
  { value: "", label: "All Goals" },
  { value: "chat", label: "Chat" },
  { value: "coding", label: "Coding" },
  { value: "reasoning", label: "Reasoning" },
  { value: "roleplay", label: "Roleplay" },
  { value: "fast_local", label: "Fast Local" },
  { value: "multilingual", label: "Multilingual" },
];

const FIT_OPTIONS: Array<{ value: Fit | ""; label: string }> = [
  { value: "", label: "All Fits" },
  { value: "likely", label: "Likely" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No Fit" },
];

const FAMILY_OPTIONS = [
  { value: "", label: "All Families" },
  { value: "llama", label: "Llama" },
  { value: "mistral", label: "Mistral" },
  { value: "gemma", label: "Gemma" },
  { value: "phi", label: "Phi" },
  { value: "qwen", label: "Qwen" },
];

export default function Models() {
  const { score, effectiveRam } = useBenchmarkStore();
  const [goal, setGoal] = useState("");
  const [fitFilter, setFitFilter] = useState<Fit | "">("");
  const [familyFilter, setFamilyFilter] = useState("");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const ram = effectiveRam ?? 8;
  const sc = score?.final_score ?? 0;

  const allFits = computeFits(ram, sc);

  const goalModelNames = goal ? USE_CASE_MAP[goal] ?? [] : [];

  const filteredModels = MODELS.filter((m) => {
    if (goal && !goalModelNames.includes(m.name)) return false;
    if (familyFilter && m.family !== familyFilter) return false;
    if (fitFilter) {
      const bestFit = allFits
        .filter((f) => f.model.name === m.name)
        .find((f) => f.fit === fitFilter);
      if (!bestFit) return false;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Model Table</h1>
        <p className="text-[#64748b] text-sm mt-1">
          All supported models with quant profiles.{" "}
          {!score && (
            <span className="text-[#eab308]">Run a benchmark for fit assessment.</span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={goal} onChange={setGoal} options={GOAL_OPTIONS} />
        <Select
          value={fitFilter}
          onChange={(v) => setFitFilter(v as Fit | "")}
          options={FIT_OPTIONS}
        />
        <Select value={familyFilter} onChange={setFamilyFilter} options={FAMILY_OPTIONS} />
      </div>

      {/* Model rows */}
      <div className="space-y-2">
        {filteredModels.map((model) => {
          const modelFits = allFits.filter((f) => f.model.name === model.name);
          const expanded = expandedModel === model.name;

          return (
            <div
              key={model.name}
              className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden"
            >
              <button
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-[#131313] transition-colors text-left"
                onClick={() =>
                  setExpandedModel(expanded ? null : model.name)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{model.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1f1f1f] text-[#64748b] font-mono">
                      {model.family}
                    </span>
                    {model.use_cases.map((uc) => (
                      <span
                        key={uc}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a2e] text-[#3b82f6] font-mono"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Min score: {model.min_score}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {modelFits.filter((f) => f.fit === "likely").length > 0 && (
                    <FitBadge fit="likely" />
                  )}
                  {modelFits.filter((f) => f.fit === "likely").length === 0 &&
                    modelFits.filter((f) => f.fit === "maybe").length > 0 && (
                      <FitBadge fit="maybe" />
                    )}
                  {modelFits.every((f) => f.fit === "no") && (
                    <FitBadge fit="no" />
                  )}
                  <span className="text-[#444] text-sm">{expanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-[#1f1f1f]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1a1a]">
                        {["Quant", "RAM Required", "Quality", "Fit", "Fail Risk"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-2 text-left text-xs text-[#64748b] font-normal"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                      {modelFits.map((mf) => (
                        <tr key={mf.key} className="hover:bg-[#131313]">
                          <td className="px-4 py-2.5 font-mono text-white">
                            {mf.key}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[#f1f5f9]">
                            {mf.ram_gb} GB
                          </td>
                          <td className="px-4 py-2.5">
                            <QualityBadge quality={mf.quality} />
                          </td>
                          <td className="px-4 py-2.5">
                            <FitBadge fit={mf.fit} />
                          </td>
                          <td className="px-4 py-2.5 font-mono">
                            <RiskBar prob={mf.failure_probability} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#111] border border-[#1f1f1f] text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#333]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function QualityBadge({ quality }: { quality: string }) {
  const map: Record<string, string> = {
    low: "text-[#ef4444]",
    medium: "text-[#f97316]",
    balanced: "text-[#eab308]",
    good: "text-[#22c55e]",
    high: "text-[#22c55e]",
  };
  return (
    <span className={`font-mono text-xs capitalize ${map[quality] ?? "text-white"}`}>
      {quality}
    </span>
  );
}

function RiskBar({ prob }: { prob: number }) {
  const pct = Math.round(prob * 100);
  const color =
    prob > 0.6 ? "#ef4444" : prob > 0.35 ? "#eab308" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#1a1a1a] rounded overflow-hidden">
        <div
          className="h-full rounded"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}
