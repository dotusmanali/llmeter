import type { FeatureFlags } from "../lib/features";

interface Props {
  flags: FeatureFlags;
}

const FLAG_LABELS: Array<{ key: keyof FeatureFlags; label: string }> = [
  { key: "memory_mapping", label: "Memory Mapping" },
  { key: "gpu_acceleration", label: "GPU Acceleration" },
  { key: "simd_acceleration", label: "SIMD" },
  { key: "int8_quant", label: "INT8 Quant" },
  { key: "int4_quant", label: "INT4 Quant" },
  { key: "fp16_inference", label: "FP16 Inference" },
  { key: "parallel_loading", label: "Parallel Loading" },
  { key: "streaming_output", label: "Streaming Output" },
  { key: "chunked_loading", label: "Chunked Loading" },
  { key: "context_2048", label: "2K Context" },
  { key: "context_4096", label: "4K Context" },
  { key: "context_8192", label: "8K Context" },
  { key: "context_16384", label: "16K Context" },
];

export function FeatureFlagsGrid({ flags }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FLAG_LABELS.map(({ key, label }) => {
        const on = flags[key];
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono border ${
              on
                ? "bg-green-950/40 border-green-800/50 text-green-400"
                : "bg-[#1a1a1a] border-[#2a2a2a] text-[#64748b]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${on ? "bg-green-400" : "bg-[#333]"}`}
            />
            {label}
          </span>
        );
      })}
    </div>
  );
}
