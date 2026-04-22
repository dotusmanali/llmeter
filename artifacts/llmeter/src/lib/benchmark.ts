export interface BenchmarkResult {
  cpu: { ops_per_sec: number };
  memory: { bandwidth_gb_s: number };
  storage: { write_mb_s: number; read_mb_s: number };
  real_perf_factor: number;
  cpu_factor: number;
  mem_factor: number;
  disk_factor: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export async function runCPUBenchmark(
  onProgress?: (pct: number) => void
): Promise<{ ops_per_sec: number }> {
  const duration = 3000;
  const start = performance.now();
  let ops = 0;

  return new Promise((resolve) => {
    function tick() {
      const elapsed = performance.now() - start;
      if (elapsed >= duration) {
        resolve({ ops_per_sec: ops / (elapsed / 1000) });
        return;
      }
      for (let i = 0; i < 100000; i++) {
        Math.fround(i * 1.23456);
      }
      ops++;
      onProgress?.(Math.min(99, (elapsed / duration) * 100));
      setTimeout(tick, 0);
    }
    tick();
  });
}

export async function runMemoryBenchmark(): Promise<{ bandwidth_gb_s: number }> {
  const SIZE = 32 * 1024 * 1024;
  const buf = new Float32Array(SIZE);
  buf.fill(1.0);
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i];
  const elapsed = (performance.now() - start) / 1000;
  void sum;
  return { bandwidth_gb_s: (buf.byteLength / 1e9) / elapsed };
}

function openIDB(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("bench")) {
        db.createObjectStore("bench");
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function idbWrite(db: IDBDatabase, data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bench", "readwrite");
    const store = tx.objectStore("bench");
    const req = store.put(data, "test");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbRead(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("bench", "readonly");
    const store = tx.objectStore("bench");
    const req = store.get("test");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function runStorageBenchmark(): Promise<{
  write_mb_s: number;
  read_mb_s: number;
}> {
  try {
    const SIZE = 20 * 1024 * 1024;
    const data = new Uint8Array(SIZE).fill(42);
    const db = await openIDB("llmeter-bench");

    const writeStart = performance.now();
    await idbWrite(db, data);
    const writeTime = performance.now() - writeStart;

    const readStart = performance.now();
    await idbRead(db);
    const readTime = performance.now() - readStart;

    db.close();

    return {
      write_mb_s: (SIZE / 1e6) / (writeTime / 1000),
      read_mb_s: (SIZE / 1e6) / (readTime / 1000),
    };
  } catch {
    return { write_mb_s: 50, read_mb_s: 80 };
  }
}

export function computePerfFactor(
  cpu_ops: number,
  bandwidth: number,
  read_mb_s: number
): { cpu_factor: number; mem_factor: number; disk_factor: number; real_perf_factor: number } {
  // disk_factor baseline uses 150 MB/s to reflect IPC/IndexedDB overhead realism
  // (raw NVMe is 3000+ but browser IPC bottleneck caps measurable throughput)
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const mem_min  = isMobile ? 0.55 : 0.40;

  const cpu_factor = clamp(cpu_ops / 50000, 0.5, 2.0);
  const mem_factor = clamp(bandwidth / 20.0, mem_min, 1.8);
  const disk_factor = clamp(read_mb_s / 150, 0.3, 1.5);
  
  let real_perf_factor =
    cpu_factor * 0.5 + mem_factor * 0.35 + disk_factor * 0.15;
    
  if (isMobile) {
    real_perf_factor = (cpu_factor * 0.45) + 
                       (mem_factor * 0.40) + 
                       (disk_factor * 0.15);
  }
  
  return { cpu_factor, mem_factor, disk_factor, real_perf_factor };
}
