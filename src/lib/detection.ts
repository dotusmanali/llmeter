export interface DeviceInfo {
  ram_gb: number | null;
  ram_source: "api" | "manual";
  cores: number;
  arch: string;
  os: string;
  gpu_renderer: string;
  gpu_vendor: string;
  webgpu_available: boolean;
  webgpu_adapter_name: string;
  wasm_supported: boolean;
  simd_supported: boolean;
  threads_supported: boolean;
  webgl2_available: boolean;
  unified_memory: boolean;
  is_apple_silicon: boolean;
  battery_level: number | null;
  battery_charging: boolean | null;
  battery_warning: boolean;
  screen_width: number;
  screen_height: number;
  device_pixel_ratio: number;
  user_agent: string;
  ram_heuristic_applied: boolean;
}

function detectOS(ua: string): string {
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(navigator.platform || ua)) return "macOS";
  if (/Win/.test(navigator.platform || ua)) return "Windows";
  if (/Linux/.test(navigator.platform || ua)) return "Linux";
  return "Unknown";
}

function detectArch(ua: string): string {
  if (/arm64|aarch64|Apple Silicon/i.test(ua)) return "arm64";
  if (/armv8|arm/i.test(ua)) return "arm";
  if (/x86_64|x86-64|WOW64|Win64|amd64/i.test(ua)) return "x86_64";
  if (/i686|i386/i.test(ua)) return "x86";
  const os = detectOS(ua);
  if (os === "macOS" && /Mac/.test(ua)) {
    if (/Intel/.test(ua)) return "x86_64";
    return "arm64";
  }
  return "x86_64";
}

function detectSIMD(): boolean {
  if (typeof WebAssembly !== "object") return false;
  try {
    const simdBytes = new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10,
      10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
    ]);
    return WebAssembly.validate(simdBytes);
  } catch {
    return false;
  }
}

function detectGPU(): { renderer: string; vendor: string; webgl2: boolean } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return { renderer: "Unknown", vendor: "Unknown", webgl2: false };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return { renderer: "Unknown", vendor: "Unknown", webgl2: true };
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string;
    return { renderer: renderer || "Unknown", vendor: vendor || "Unknown", webgl2: true };
  } catch {
    return { renderer: "Unknown", vendor: "Unknown", webgl2: false };
  }
}

export async function detectDevice(): Promise<DeviceInfo> {
  const ua = navigator.userAgent;
  const os = detectOS(ua);
  let arch = detectArch(ua);

  const { renderer, vendor, webgl2 } = detectGPU();

  if (os === 'Android') {
    if (
      vendor === 'ARM' ||
      renderer.includes('Mali') ||
      renderer.includes('Adreno') ||
      renderer.includes('PowerVR') ||
      renderer.includes('Immortalis')
    ) {
      arch = 'arm64';
    }
  }

  const cores = navigator.hardwareConcurrency || 2;
  let rawMem = (navigator as { deviceMemory?: number }).deviceMemory;
  let ram_heuristic_applied = false;

  if (
    typeof rawMem === "number" &&
    (renderer.includes('Mali') || 
     renderer.includes('Adreno') || 
     vendor === 'ARM') &&
    cores >= 8 &&
    rawMem === 4
  ) {
    rawMem = 6;
    ram_heuristic_applied = true;
  }

  const ram_gb = typeof rawMem === "number" ? rawMem : null;

  const is_apple_silicon =
    /Mac/.test(navigator.platform || ua) &&
    /Apple/.test(vendor) &&
    cores >= 8;

  const unified_memory = is_apple_silicon;

  let webgpu_available = false;
  let webgpu_adapter_name = "";
  if ("gpu" in navigator) {
    try {
      const adapter = await (navigator as { gpu: { requestAdapter: () => Promise<{ name?: string } | null> } }).gpu.requestAdapter();
      if (adapter) {
        webgpu_available = true;
        webgpu_adapter_name = (adapter as { name?: string }).name || "";
      }
    } catch {
      webgpu_available = false;
    }
  }

  const wasm_supported = typeof WebAssembly === "object";
  let simd_supported = detectSIMD();
  simd_supported = simd_supported || (arch === 'arm64');
  const threads_supported = typeof SharedArrayBuffer !== "undefined";

  let battery_level: number | null = null;
  let battery_charging: boolean | null = null;
  let battery_warning = false;

  if ("getBattery" in navigator) {
    try {
      const battery = await (navigator as { getBattery: () => Promise<{ level: number; charging: boolean }> }).getBattery();
      battery_level = Math.round(battery.level * 100);
      battery_charging = battery.charging;
      battery_warning = !battery.charging && battery.level < 0.30;
    } catch {
      // iOS blocks this API
    }
  }

  return {
    ram_gb,
    ram_source: ram_gb !== null ? "api" : "manual",
    cores,
    arch,
    os,
    gpu_renderer: renderer,
    gpu_vendor: vendor,
    webgpu_available,
    webgpu_adapter_name,
    wasm_supported,
    simd_supported,
    threads_supported,
    webgl2_available: webgl2,
    unified_memory,
    is_apple_silicon,
    battery_level,
    battery_charging,
    battery_warning,
    screen_width: screen.width,
    screen_height: screen.height,
    device_pixel_ratio: window.devicePixelRatio,
    user_agent: ua,
    ram_heuristic_applied,
  };
}
