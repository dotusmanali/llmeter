import type { DeviceInfo } from "./detection";
import type { BenchmarkResult } from "./benchmark";

export type Tier =
  | "Powerhouse"
  | "High"
  | "Medium"
  | "Low"
  | "Minimal";

export interface Score {
  base_score: number;
  final_score: number;
  tier: Tier;
  ram_pts: number;
  cpu_pts: number;
  arch_pts: number;
  accel_pts: number;
  gpu_pts: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getTier(s: number): Tier {
  if (s >= 90) return "Powerhouse";
  if (s >= 70) return "High";
  if (s >= 50) return "Medium";
  if (s >= 30) return "Low";
  return "Minimal";
}

export function computeScore(
  device: DeviceInfo,
  ram_gb: number,
  perf: BenchmarkResult | null
): Score {
  let base_score = 0;

  let ram_pts = 0;
  if (ram_gb >= 16) ram_pts = 40;
  else if (ram_gb >= 8) ram_pts = 30;
  else if (ram_gb >= 6) ram_pts = 22;
  else if (ram_gb >= 4) ram_pts = 14;
  else if (ram_gb >= 2) ram_pts = 7;
  else ram_pts = 2;

  const cores = device.cores;
  let cpu_pts = 0;
  if (cores >= 10) cpu_pts = 20;
  else if (cores >= 8) cpu_pts = 17;
  else if (cores >= 6) cpu_pts = 13;
  else if (cores >= 4) cpu_pts = 9;
  else cpu_pts = 4;

  const arch_pts = ["arm64", "aarch64", "x86_64"].includes(device.arch) ? 15 : 5;

  let accel_pts = 0;
  if (device.simd_supported) accel_pts += 8;
  if (device.threads_supported) accel_pts += 4;
  if (device.wasm_supported) accel_pts += 3;

  let gpu_pts = 0;
  if (device.unified_memory) gpu_pts = 10;
  else if (device.webgpu_available) gpu_pts = 9;
  else if (device.webgl2_available) gpu_pts = 5;

  base_score = ram_pts + cpu_pts + arch_pts + accel_pts + gpu_pts;

  const rpf = perf?.real_perf_factor ?? 1.0;
  const final_score = Math.round(clamp(base_score, 0, 100) * rpf);

  return {
    base_score,
    final_score,
    tier: getTier(final_score),
    ram_pts,
    cpu_pts,
    arch_pts,
    accel_pts,
    gpu_pts,
  };
}
