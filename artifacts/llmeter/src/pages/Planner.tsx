import { useState } from "react";
import { useBenchmarkStore } from "../store/benchmarkStore";
import { planLoadingStrategy } from "../lib/planner";
import { MODELS } from "../lib/models";

export default function Planner() {
  const { effectiveRam, perf } = useBenchmarkStore();

  const ram = effectiveRam ?? 8;
  const disk_read = perf?.storage.read_mb_s ?? 100;

  const [modelSize, setModelSize] = useState(4.5);
  const [customRam, setCustomRam] = useState(ram);

  const usable_ram = customRam * 0.70;
  const plan = planLoadingStrategy(modelSize, usable_ram, disk_read);

  const RISK_COLOR = {
    low: "#22c55e",
    medium: "#eab308",
    high: "#ef4444",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Loading Strategy Planner</h1>
        <p className="text-[#64748b] text-sm mt-1">
          Plans how a model would be loaded into memory. Does not download real weights.
        </p>
      </div>

      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#64748b] uppercase tracking-wider block mb-2">
              Model Size (GB)
            </label>
            <input
              type="number"
              min={0.5}
              max={70}
              step={0.5}
              value={modelSize}
              onChange={(e) => setModelSize(Number(e.target.value))}
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#333]"
            />
            <p className="text-xs text-[#444] mt-1">GGUF file size on disk</p>
          </div>
          <div>
            <label className="text-xs text-[#64748b] uppercase tracking-wider block mb-2">
              System RAM (GB)
            </label>
            <input
              type="number"
              min={1}
              max={256}
              step={1}
              value={customRam}
              onChange={(e) => setCustomRam(Number(e.target.value))}
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#333]"
            />
          </div>
        </div>

        {/* Quick model selector */}
        <div>
          <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">Quick Select</p>
          <div className="flex flex-wrap gap-2">
            {MODELS.flatMap((m) =>
              Object.entries(m.quants).map(([, q]) => ({
                label: `${m.name} ${q.key}`,
                gb: q.ram_gb,
              }))
            )
              .filter((_, i) => i % 3 === 1)
              .slice(0, 8)
              .map((x) => (
                <button
                  key={x.label}
                  onClick={() => setModelSize(x.gb)}
                  className="text-xs px-2 py-1 rounded border border-[#1f1f1f] text-[#64748b] hover:text-white hover:border-[#333] transition-colors font-mono"
                >
                  {x.gb}GB
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Plan result */}
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
          <p className="text-sm font-medium text-white">Loading Plan</p>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded border"
            style={{
              color: RISK_COLOR[plan.risk],
              borderColor: RISK_COLOR[plan.risk] + "44",
              backgroundColor: RISK_COLOR[plan.risk] + "11",
            }}
          >
            {plan.risk.toUpperCase()} RISK
          </span>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          <Row label="Strategy" value={plan.strategy === "direct" ? "Direct Load" : "Chunked Load"} />
          <Row label="Chunks" value={String(plan.chunks)} />
          <Row label="Chunk Size" value={`${plan.chunk_size_gb} GB`} />
          <Row label="Usable RAM" value={`${usable_ram.toFixed(1)} GB (70% of ${customRam}GB)`} />
          <Row label="Worst Case RAM" value={`${plan.worst_case_ram_gb} GB`} />
          <Row label="Estimated Load Time" value={`~${plan.est_load_time_sec}s`} />
          <Row
            label="Failure Probability"
            value={`${Math.round(plan.failure_probability * 100)}%`}
            color={RISK_COLOR[plan.risk]}
          />
          <Row
            label="Disk Read Speed"
            value={`${disk_read.toFixed(0)} MB/s (IndexedDB measured)`}
            muted
          />
        </div>
      </div>

      {plan.strategy === "chunked" && (
        <div className="bg-yellow-950/30 border border-yellow-800/30 rounded-xl p-4">
          <p className="text-sm text-yellow-300">
            Chunked loading required. The model will be loaded in {plan.chunks} chunks of{" "}
            {plan.chunk_size_gb} GB each. Expect {Math.round((1 - 0.8) * 100)}% speed penalty
            versus direct loading.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  color,
}: {
  label: string;
  value: string;
  muted?: boolean;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-3 text-sm">
      <span className="text-[#64748b]">{label}</span>
      <span className="font-mono" style={{ color: color ?? (muted ? "#444" : "#f1f5f9") }}>
        {value}
      </span>
    </div>
  );
}
