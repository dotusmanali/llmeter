import type { DeviceInfo } from "./detection";

export interface FeatureFlags {
  memory_mapping: boolean;
  gpu_acceleration: boolean;
  chunked_loading: boolean;
  int8_quant: boolean;
  int4_quant: boolean;
  fp16_inference: boolean;
  parallel_loading: boolean;
  streaming_output: boolean;
  context_2048: boolean;
  context_4096: boolean;
  context_8192: boolean;
  context_16384: boolean;
  simd_acceleration: boolean;
}

export function computeFeatures(
  device: DeviceInfo,
  ram_gb: number,
  score: number
): FeatureFlags {
  return {
    memory_mapping: ram_gb >= 4 && device.os !== "iOS",
    gpu_acceleration: device.webgpu_available || device.webgl2_available || device.unified_memory,
    chunked_loading: true,
    int8_quant: device.simd_supported,
    int4_quant: device.simd_supported && ram_gb >= 4,
    fp16_inference: device.unified_memory || device.webgpu_available,
    parallel_loading: device.cores >= 4 && device.threads_supported,
    streaming_output: true,
    context_2048: score >= 20,
    context_4096: score >= 50,
    context_8192: score >= 70,
    context_16384: score >= 88,
    simd_acceleration: device.simd_supported,
  };
}
