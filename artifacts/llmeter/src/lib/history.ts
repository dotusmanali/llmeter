export interface BenchmarkRun {
  id: string;
  timestamp: number;
  final_score: number;
  tier: string;
  ram_gb: number;
  cores: number;
  arch: string;
  gpu_renderer: string;
  tps_low: number;
  tps_high: number;
  top_fits: string[];
  perf_factor?: number;
}

const KEY = "llmeter_history";
const MAX_RUNS = 10;

export function loadHistory(): BenchmarkRun[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BenchmarkRun[];
  } catch {
    return [];
  }
}

export function saveRun(run: BenchmarkRun): void {
  const history = loadHistory();
  const updated = [run, ...history.filter((r) => r.id !== run.id)].slice(
    0,
    MAX_RUNS
  );
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}

export function exportHistory(): string {
  return JSON.stringify(loadHistory(), null, 2);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
