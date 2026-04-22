import { useState } from "react";

interface Props {
  open: boolean;
  onSelect: (gb: number) => void;
}

const RAM_OPTIONS = [4, 8, 16, 32, 64, 128];

export function RamModal({ open, onSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-2">RAM Detection Unavailable</h2>
        <p className="text-[#64748b] text-sm mb-6 leading-relaxed">
          Your browser (Safari or Firefox) blocks the RAM detection API for privacy reasons.
          Please select your total system RAM to continue. This is used only for scoring — no data leaves your device.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {RAM_OPTIONS.map((gb) => (
            <button
              key={gb}
              onClick={() => setSelected(gb)}
              className={`py-3 rounded-lg border font-mono text-sm transition-all ${
                selected === gb
                  ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
                  : "border-[#1f1f1f] text-[#64748b] hover:border-[#333] hover:text-white"
              }`}
            >
              {gb} GB
            </button>
          ))}
        </div>
        <button
          disabled={selected === null}
          onClick={() => selected && onSelect(selected)}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            selected
              ? "bg-[#22c55e] text-black hover:bg-[#16a34a]"
              : "bg-[#1f1f1f] text-[#64748b] cursor-not-allowed"
          }`}
        >
          Continue Benchmark
        </button>
      </div>
    </div>
  );
}
