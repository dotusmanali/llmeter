import { useCallback } from "react";
import { useBenchmarkStore } from "../store/benchmarkStore";
import { detectDevice } from "../lib/detection";
import {
  runCPUBenchmark,
  runMemoryBenchmark,
  runStorageBenchmark,
  computePerfFactor,
} from "../lib/benchmark";
import { computeScore } from "../lib/scoring";
import { estimateTPS } from "../lib/tps";
import { computeFits } from "../lib/models";
import { saveRun, generateId } from "../lib/history";

export function useBenchmark() {
  const store = useBenchmarkStore();

  const run = useCallback(async () => {
    store.reset();

    store.setPhase("detecting");
    const device = await detectDevice();
    store.setDevice(device);

    // RAM fallback: if deviceMemory is unavailable, require manual selection
    if (device.ram_gb === null) {
      store.setNeedsRamModal(true);
      return;
    }

    await continueAfterRam(device.ram_gb);
  }, []);

  const continueAfterRam = useCallback(async (ram_gb: number) => {
    const device = useBenchmarkStore.getState().device;
    if (!device) return;

    store.setEffectiveRam(ram_gb);
    store.setNeedsRamModal(false);

    store.setPhase("cpu");
    const cpu = await runCPUBenchmark((pct) => store.setCpuProgress(pct));

    store.setPhase("memory");
    const mem = await runMemoryBenchmark();

    store.setPhase("storage");
    const storage = await runStorageBenchmark();

    store.setPhase("gpu");
    await new Promise((r) => setTimeout(r, 400));

    store.setPhase("scoring");
    const perf_data = computePerfFactor(
      cpu.ops_per_sec,
      mem.bandwidth_gb_s,
      storage.read_mb_s
    );

    const perf = { cpu, memory: mem, storage, ...perf_data };
    store.setPerf(perf);

    const score = computeScore(device, ram_gb, perf);
    store.setScore(score);

    const tps = estimateTPS(device, perf, 4096, false);
    store.setTps(tps);

    const fits = computeFits(ram_gb, score.final_score);

    const likelyFits = fits
      .filter((f) => f.fit === "likely")
      .slice(0, 8)
      .map((f) => `${f.model.name} ${f.key}`);

    const allFitsSummary = fits
      .filter((f) => f.fit !== "no")
      .map((f) => ({
        model: f.model.name,
        quant: f.key,
        ram_gb: f.ram_gb,
        quality: f.quality,
        fit: f.fit,
        failure_probability: f.failure_probability,
      }));

    const run = {
      id: generateId(),
      timestamp: Date.now(),
      final_score: score.final_score,
      tier: score.tier,
      ram_gb,
      cores: device.cores,
      arch: device.arch,
      gpu_renderer: device.gpu_renderer,
      tps_low: tps.low,
      tps_high: tps.high,
      top_fits: likelyFits,
      perf_factor: perf_data.real_perf_factor,
      device_info: device,
      perf_raw: perf,
      all_fits: allFitsSummary,
      score_breakdown: {
        base_score: score.base_score,
        ram_pts: score.ram_pts,
        cpu_pts: score.cpu_pts,
        arch_pts: score.arch_pts,
        accel_pts: score.accel_pts,
        gpu_pts: score.gpu_pts,
      },
      tps_info: {
        path: tps.path,
        limiting_factor: tps.limiting_factor,
      },
    };

    saveRun(run);
    store.setLastRun(run);
    store.setPhase("done");
  }, []);

  return { run, continueAfterRam };
}
