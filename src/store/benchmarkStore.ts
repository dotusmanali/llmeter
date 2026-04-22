import { create } from "zustand";
import type { DeviceInfo } from "../lib/detection";
import type { BenchmarkResult } from "../lib/benchmark";
import type { Score } from "../lib/scoring";
import type { BenchmarkRun } from "../lib/history";
import type { TpsEstimate } from "../lib/tps";

export type BenchmarkPhase =
  | "idle"
  | "detecting"
  | "cpu"
  | "memory"
  | "storage"
  | "gpu"
  | "scoring"
  | "done";

export interface BenchmarkState {
  phase: BenchmarkPhase;
  cpuProgress: number;
  device: DeviceInfo | null;
  perf: BenchmarkResult | null;
  score: Score | null;
  tps: TpsEstimate | null;
  effectiveRam: number | null;
  needsRamModal: boolean;
  lastRun: BenchmarkRun | null;
  telemetry: {
    cpu: number[];
    memory: number[];
  };
  setPhase: (phase: BenchmarkPhase) => void;
  setCpuProgress: (pct: number) => void;
  setDevice: (d: DeviceInfo | null) => void;
  setPerf: (p: BenchmarkResult | null) => void;
  setScore: (s: Score | null) => void;
  setTps: (t: TpsEstimate | null) => void;
  setEffectiveRam: (gb: number) => void;
  setNeedsRamModal: (v: boolean) => void;
  setLastRun: (r: BenchmarkRun) => void;
  addTelemetry: (type: "cpu" | "memory", val: number) => void;
  reset: () => void;
}

export const useBenchmarkStore = create<BenchmarkState>((set) => ({
  phase: "idle",
  cpuProgress: 0,
  device: null,
  perf: null,
  score: null,
  tps: null,
  effectiveRam: null,
  needsRamModal: false,
  lastRun: null,
  telemetry: { cpu: [], memory: [] },
  setPhase: (phase) => set({ phase }),
  setCpuProgress: (cpuProgress) => set({ cpuProgress }),
  setDevice: (device) => set({ device }),
  setPerf: (perf) => set({ perf }),
  setScore: (score) => set({ score }),
  setTps: (tps) => set({ tps }),
  setEffectiveRam: (effectiveRam) => set({ effectiveRam }),
  setNeedsRamModal: (needsRamModal) => set({ needsRamModal }),
  setLastRun: (lastRun) => set({ lastRun }),
  addTelemetry: (type, val) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        [type]: [...state.telemetry[type].slice(-29), val], // Keep last 30 points
      },
    })),
  reset: () =>
    set({
      phase: "idle",
      cpuProgress: 0,
      device: null,
      perf: null,
      score: null,
      tps: null,
      effectiveRam: null,
      needsRamModal: false,
      telemetry: { cpu: [], memory: [] },
    }),
}));
