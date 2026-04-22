import type { BenchmarkRun } from "./history";

export function encodeReport(run: BenchmarkRun): string {
  // Aggressively minified payload with short keys and integer-rounded floats
  const payload = {
    s: run.final_score,
    r: run.ram_gb,
    c: run.cores,
    a: run.arch.slice(0, 8),
    g: (run.gpu_renderer || "").slice(0, 28),
    t: `${run.tps_low}-${run.tps_high}`,
    f: run.top_fits.slice(0, 3).map((m) => m.slice(0, 16)),
    ts: Math.floor(run.timestamp / 1000),
  };
  return btoa(JSON.stringify(payload));
}

export function decodeReport(encoded: string): Partial<BenchmarkRun> | null {
  try {
    const json = atob(encoded);
    const p = JSON.parse(json) as {
      s?: number; r?: number; c?: number; a?: string;
      g?: string; t?: string; f?: string[]; ts?: number;
    };
    const [tlo, thi] = (p.t || "0-0").split("-").map(Number);
    return {
      final_score: p.s ?? 0,
      ram_gb: p.r ?? 0,
      cores: p.c ?? 0,
      arch: p.a ?? "",
      gpu_renderer: p.g ?? "",
      tps_low: tlo,
      tps_high: thi,
      top_fits: p.f ?? [],
      timestamp: (p.ts ?? 0) * 1000,
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(run: BenchmarkRun): string {
  const encoded = encodeReport(run);
  const base = window.location.origin + window.location.pathname.replace(/\/$/, "");
  const url = `${base}/share?r=${encoded}`;
  // Guard: if URL exceeds 2000 chars, truncate top_fits
  if (url.length > 2000) {
    const trimmed = { ...run, top_fits: run.top_fits.slice(0, 1) };
    const enc2 = encodeReport(trimmed);
    return `${base}/share?r=${enc2}`;
  }
  return url;
}
