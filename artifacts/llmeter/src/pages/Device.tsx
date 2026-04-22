import { useBenchmarkStore } from "../store/benchmarkStore";
import { useBenchmark } from "../hooks/useBenchmark";
import { RamModal } from "../components/RamModal";
import { FeatureFlagsGrid } from "../components/FeatureFlags";
import { computeFeatures } from "../lib/features";
import { CopyButton } from "../components/CopyButton";
import { downloadJSON, downloadText } from "../lib/export";

function buildDeviceText(device: ReturnType<typeof useBenchmarkStore>["device"], effectiveRam: number | null) {
  if (!device) return "";
  return `DEVICE INFO
${"─".repeat(40)}
RAM           : ${effectiveRam !== null ? (device.ram_source === "manual" ? `${effectiveRam} GB (user-selected)` : (device.ram_heuristic_applied ? `~${effectiveRam} GB estimated` : `~${effectiveRam} GB (browser estimate, actual may be higher)`)) : "N/A"}
CPU Cores     : ${device.cores}
Architecture  : ${device.arch}
OS            : ${device.os}
Apple Silicon : ${device.is_apple_silicon ? "Yes" : "No"}
Unified Mem   : ${device.unified_memory ? "Yes" : "No"}
GPU Renderer  : ${device.gpu_renderer}
GPU Vendor    : ${device.gpu_vendor}
WebGPU        : ${device.webgpu_available ? "Yes" : "No"}${device.webgpu_adapter_name ? ` (${device.webgpu_adapter_name})` : ""}
WebGL2        : ${device.webgl2_available ? "Yes" : "No"}
WASM          : ${device.wasm_supported ? "Yes" : "No"}
WASM SIMD     : ${device.simd_supported ? "Yes" : "No"}
SharedArrayBuf: ${device.threads_supported ? "Yes" : "No"}
Screen        : ${device.screen_width}×${device.screen_height} @${device.device_pixel_ratio}x
Battery       : ${device.battery_level !== null ? `${device.battery_level}% (${device.battery_charging ? "charging" : "on battery"})` : "N/A"}
User Agent    : ${device.user_agent}`;
}

export default function Device() {
  const { device, score, effectiveRam, needsRamModal, phase } = useBenchmarkStore();
  const { run, continueAfterRam } = useBenchmark();

  const features =
    device && effectiveRam !== null && score
      ? computeFeatures(device, effectiveRam, score.final_score)
      : null;

  const deviceText = buildDeviceText(device, effectiveRam);

  const handleDownloadJSON = () => {
    if (!device) return;
    downloadJSON({ device, effectiveRam, score }, "llmeter-device-info.json");
  };

  const handleDownloadText = () => {
    if (!device) return;
    downloadText(deviceText, "llmeter-device-info.txt");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Device Info</h1>
          <p className="text-[#64748b] text-sm mt-1">All detected hardware and browser capabilities.</p>
        </div>
        {device && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton
              text={deviceText}
              label="Copy All"
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg"
            />
            <button
              onClick={handleDownloadText}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
            >
              .txt
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] text-[#64748b] hover:text-white rounded-lg transition-colors"
            >
              .json
            </button>
          </div>
        )}
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
          <Section
            title="Processor"
            copyText={`Cores: ${device.cores} | Arch: ${device.arch} | Apple Silicon: ${device.is_apple_silicon ? "Yes" : "No"}`}
          >
            <Row label="Logical Cores" value={String(device.cores)} copyVal={String(device.cores)} />
            <Row label="Architecture" value={device.arch} copyVal={device.arch} />
            <Row label="Apple Silicon" value={device.is_apple_silicon ? "Yes" : "No"} />
          </Section>

          <Section
            title="Memory"
            copyText={`RAM: ${effectiveRam ?? "N/A"} GB | Source: ${device.ram_source} | Unified: ${device.unified_memory ? "Yes" : "No"}`}
          >
            <Row
              label="System RAM"
              value={effectiveRam !== null ? (device.ram_source === "manual" ? `${effectiveRam} GB` : (device.ram_heuristic_applied ? `~${effectiveRam} GB estimated` : `~${effectiveRam} GB (browser estimate, actual may be higher)`)) : "Not available"}
              copyVal={effectiveRam !== null ? `${effectiveRam} GB` : ""}
            />
            <Row
              label="Source"
              value={
                device.ram_source === "manual"
                  ? "User-selected"
                  : (device.ram_heuristic_applied ? "Heuristic applied" : "navigator.deviceMemory (browser estimate)")
              }
              muted
            />
            <Row
              label="Unified Memory"
              value={device.unified_memory ? "Yes — VRAM = RAM" : "No"}
            />
          </Section>

          <Section
            title="Graphics"
            copyText={`GPU: ${device.gpu_renderer} | Vendor: ${device.gpu_vendor} | WebGL2: ${device.webgl2_available} | WebGPU: ${device.webgpu_available}`}
          >
            <Row label="Renderer" value={device.gpu_renderer} copyVal={device.gpu_renderer} />
            <Row label="Vendor" value={device.gpu_vendor} copyVal={device.gpu_vendor} />
            <Row label="WebGL2" value={device.webgl2_available ? "Supported" : "Not available"} />
            <Row label="WebGPU" value={device.webgpu_available ? "Supported" : "Not available"} />
            {device.webgpu_adapter_name && (
              <Row label="WebGPU Adapter" value={device.webgpu_adapter_name} copyVal={device.webgpu_adapter_name} />
            )}
          </Section>

          <Section
            title="Platform"
            copyText={`OS: ${device.os} | Screen: ${device.screen_width}×${device.screen_height} | DPR: ${device.device_pixel_ratio}`}
          >
            <Row label="OS" value={device.os} copyVal={device.os} />
            <Row label="Screen" value={`${device.screen_width}×${device.screen_height}`} />
            <Row label="Pixel Ratio" value={String(device.device_pixel_ratio)} />
          </Section>

          <Section
            title="Runtime Capabilities"
            copyText={`WASM: ${device.wasm_supported} | SIMD: ${device.simd_supported} | SharedArrayBuffer: ${device.threads_supported}`}
          >
            <Row label="WebAssembly" value={device.wasm_supported ? "Yes" : "No"} />
            <Row label="WASM SIMD" value={device.simd_supported ? "Yes" : "No"} />
            <Row label="SharedArrayBuffer" value={device.threads_supported ? "Yes" : "No"} />
          </Section>

          {device.battery_level !== null && (
            <Section title="Battery" copyText={`Battery: ${device.battery_level}% | Charging: ${device.battery_charging}`}>
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

          <Section title="User Agent" copyText={device.user_agent}>
            <div className="px-4 py-3 flex items-start gap-3">
              <p className="font-mono text-xs text-[#64748b] break-all flex-1">{device.user_agent}</p>
              <CopyButton
                text={device.user_agent}
                iconOnly
                className="text-[#333] hover:text-[#64748b] flex-shrink-0 mt-0.5"
              />
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

function Section({
  title,
  children,
  copyText,
}: {
  title: string;
  children: React.ReactNode;
  copyText?: string;
}) {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-[#1f1f1f] bg-[#0e0e0e] flex items-center justify-between">
        <p className="text-xs font-mono text-[#64748b] uppercase tracking-wider">{title}</p>
        {copyText && (
          <CopyButton
            text={copyText}
            iconOnly
            className="text-[#2a2a2a] hover:text-[#64748b]"
          />
        )}
      </div>
      <div className="divide-y divide-[#1a1a1a]">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  copyVal,
}: {
  label: string;
  value: string;
  muted?: boolean;
  copyVal?: string;
}) {
  return (
    <div className="flex justify-between items-start px-4 py-2.5 text-sm gap-4 group">
      <span className="text-[#64748b] flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-right break-all ${muted ? "text-[#444]" : "text-white"}`}>{value}</span>
        {copyVal && (
          <CopyButton
            text={copyVal}
            iconOnly
            className="text-[#2a2a2a] hover:text-[#64748b] opacity-0 group-hover:opacity-100 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}
