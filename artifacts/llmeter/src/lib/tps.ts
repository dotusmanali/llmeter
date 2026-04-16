import type { DeviceInfo } from "./detection";
import type { BenchmarkResult } from "./benchmark";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export interface TpsEstimate {
  low: number;
  high: number;
  path: "GPU" | "CPU";
  limiting_factor: string;
}

export function estimateTPS(
  device: DeviceInfo,
  perf: BenchmarkResult,
  contextSize: number,
  chunked: boolean
): TpsEstimate {
  const { cores, simd_supported, threads_supported, webgpu_available, unified_memory } = device;
  const { bandwidth_gb_s, real_perf_factor } = perf;

  let cpu_tps = cores * 2.0 * real_perf_factor;
  if (simd_supported) cpu_tps *= 1.5;
  if (threads_supported) cpu_tps *= 1.2;

  const mem_mult = clamp(bandwidth_gb_s / 25.0, 0.5, 1.5);
  cpu_tps *= mem_mult;

  let gpu_tps = 0;
  if (unified_memory) gpu_tps = cpu_tps * 3.0;
  else if (webgpu_available) gpu_tps = cpu_tps * 2.5;

  let effective = Math.max(cpu_tps, gpu_tps);

  if (contextSize > 8192) effective *= 0.55;
  else if (contextSize > 4096) effective *= 0.70;
  else if (contextSize > 2048) effective *= 0.85;

  if (chunked) effective *= 0.80;

  const limiting_factor = mem_mult < 0.8 ? "memory bandwidth" : "compute";

  return {
    low: Math.round(effective * 0.65),
    high: Math.round(effective * 1.20),
    path: gpu_tps > cpu_tps ? "GPU" : "CPU",
    limiting_factor,
  };
}
