import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { RamModal } from "../components/RamModal";
import { FeatureFlagsGrid } from "../components/FeatureFlags";
import { computeFeatures } from "../lib/features";

export default function Device() {
  const { device, score, effectiveRam, needsRamModal, phase } = useBenchmarkStore();
  const { run, continueAfterRam } = useBenchmark();

  const features =
    device && effectiveRam !== null && score
      ? computeFeatures(device, effectiveRam, score.final_score)
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Device Info</h1>
        <p className="text-[#64748b] text-sm mt-1">All detected hardware and browser capabilities.</p>
      </div>

      {!device && phase === "idle" && (
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-8 text-center">
          <p className="text-[#64748b] text-sm mb-4">Run a benchmark to detect your device.</p>
          <button
            onClick={run}
            className="px-6 py-2.5 bg-[#22c55e] text-black font-semibold rounded-lg hover:bg-[#16a34a] transition-colors text-sm"
          >
            Run Benchmark
          </button>
        </div>
      )}

      {device && (
        <>
          <Section title="Processor">
            <Row label="Logical Cores" value={String(device.cores)} />
            <Row label="Architecture" value={device.arch} />
            <Row label="Apple Silicon" value={device.is_apple_silicon ? "Yes" : "No"} />
          </Section>

          <Section title="Memory">
            <Row
              label="System RAM"
              value={
                effectiveRam !== null
                  ? `${effectiveRam} GB`
                  : "Not available"
              }
            />
            <Row
              label="Source"
              value={
                device.ram_source === "manual"
                  ? "User-selected"
                  : "navigator.deviceMemory (browser estimate)"
              }
              muted
            />
            <Row
              label="Unified Memory"
              value={device.unified_memory ? "Yes — VRAM = RAM" : "No"}
            />
          </Section>

          <Section title="Graphics">
            <Row label="Renderer" value={device.gpu_renderer} />
            <Row label="Vendor" value={device.gpu_vendor} />
            <Row label="WebGL2" value={device.webgl2_available ? "Supported" : "Not available"} />
            <Row label="WebGPU" value={device.webgpu_available ? "Supported" : "Not available"} />
            {device.webgpu_adapter_name && (
              <Row label="WebGPU Adapter" value={device.webgpu_adapter_name} />
            )}
          </Section>

          <Section title="Platform">
            <Row label="OS" value={device.os} />
            <Row label="Screen" value={`${device.screen_width}×${device.screen_height}`} />
            <Row label="Pixel Ratio" value={String(device.device_pixel_ratio)} />
          </Section>

          <Section title="Runtime Capabilities">
            <Row label="WebAssembly" value={device.wasm_supported ? "Yes" : "No"} />
            <Row label="WASM SIMD" value={device.simd_supported ? "Yes" : "No"} />
            <Row label="SharedArrayBuffer" value={device.threads_supported ? "Yes" : "No"} />
          </Section>

          {device.battery_level !== null && (
            <Section title="Battery">
              <Row label="Level" value={`${device.battery_level}%`} />
              <Row
                label="Status"
                value={device.battery_charging ? "Charging" : "On Battery"}
              />
              {device.battery_warning && (
                <Row label="Warning" value="Low battery — plug in before loading large models" muted />
              )}
            </Section>
          )}

          <Section title="User Agent">
            <div className="px-4 py-3">
              <p className="font-mono text-xs text-[#64748b] break-all">{device.user_agent}</p>
            </div>
          </Section>

          {features && (
            <div>
              <h3 className="text-sm font-medium text-[#64748b] uppercase tracking-wider mb-3">
                Feature Flags
              </h3>
              <FeatureFlagsGrid flags={features} />
            </div>
          )}
        </>
      )}

      <RamModal open={needsRamModal} onSelect={continueAfterRam} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1f1f1f] bg-[#0e0e0e]">
        <p className="text-xs font-mono text-[#64748b] uppercase tracking-wider">{title}</p>
      </div>
      <div className="divide-y divide-[#1a1a1a]">{children}</div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-start px-4 py-2.5 text-sm gap-4">
      <span className="text-[#64748b] flex-shrink-0">{label}</span>
      <span className={`font-mono text-right break-all ${muted ? "text-[#444]" : "text-white"}`}>{value}</span>
    </div>
  );
}
