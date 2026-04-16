export interface LoadingPlan {
  strategy: "direct" | "chunked";
  chunks: number;
  chunk_size_gb: number;
  est_load_time_sec: number;
  worst_case_ram_gb: number;
  failure_probability: number;
  risk: "low" | "medium" | "high";
}

export function planLoadingStrategy(
  model_size_gb: number,
  usable_ram_gb: number,
  disk_read_mb_s: number
): LoadingPlan {
  const overhead = 0.35;
  const safe_ram = usable_ram_gb - overhead;
  const spike = model_size_gb * 1.25;

  let strategy: "direct" | "chunked";
  let chunks: number;
  let chunk_size: number;

  if (spike <= safe_ram) {
    strategy = "direct";
    chunks = 1;
    chunk_size = model_size_gb;
  } else {
    chunk_size = safe_ram * 0.75;
    chunks = Math.ceil(model_size_gb / chunk_size);
    strategy = "chunked";
  }

  const load_time_sec =
    (model_size_gb / chunks) / (disk_read_mb_s / 1000) * chunks * 1.15;

  const failure_prob = Math.max(
    0,
    (spike - safe_ram) / (safe_ram + 0.1)
  );

  return {
    strategy,
    chunks,
    chunk_size_gb: +(model_size_gb / chunks).toFixed(2),
    est_load_time_sec: Math.round(load_time_sec),
    worst_case_ram_gb: +Math.min(spike, usable_ram_gb * 0.95).toFixed(1),
    failure_probability: +Math.min(failure_prob, 0.95).toFixed(2),
    risk: failure_prob > 0.6 ? "high" : failure_prob > 0.35 ? "medium" : "low",
  };
}
