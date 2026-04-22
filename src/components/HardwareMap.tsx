import { motion } from "framer-motion";
import { useBenchmarkStore } from "../store/benchmarkStore";

export function HardwareMap() {
  const { phase } = useBenchmarkStore();

  const activeColor = "#22c55e";
  const inactiveColor = "#1a1a1a";
  const borderColor = "#1f1f1f";

  const getStatusColor = (steps: string[]) => {
    return steps.includes(phase) ? activeColor : inactiveColor;
  };

  const getStrokeOpacity = (steps: string[]) => {
    return steps.includes(phase) ? 1 : 0.2;
  };

  return (
    <div className="relative aspect-video w-full max-w-lg mx-auto bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden p-4 industrial-border group">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      
      {/* Thermal Stress Overlay */}
      <motion.div 
        animate={{ 
          opacity: ["cpu", "memory", "gpu"].includes(phase) ? [0, 0.15, 0.05] : 0,
          scale: ["cpu", "memory", "gpu"].includes(phase) ? [1, 1.2, 1] : 1
        }}
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(239,68,68,0.2)_0%,transparent_70%)] pointer-events-none z-0"
      />
      
      <svg viewBox="0 0 400 240" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.05)]">
        {/* Motherboard Base with Blueprint Grid */}
        <rect x="20" y="20" width="360" height="200" rx="4" fill="#0d0d0d" stroke={borderColor} strokeWidth="2" />
        <path d="M 20 70 L 380 70 M 20 120 L 380 120 M 20 170 L 380 170" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
        <path d="M 110 20 L 110 220 M 200 20 L 200 220 M 290 20 L 290 220" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5" />
        
        {/* CPU Socket */}
        <motion.rect 
          x="140" y="60" width="60" height="60" rx="2" 
          fill={getStatusColor(["cpu", "detecting"])} 
          stroke={activeColor}
          strokeWidth="1"
          animate={{ 
            fillOpacity: ["cpu", "detecting"].includes(phase) ? [0.1, 0.4, 0.1] : 0.05,
            strokeOpacity: ["cpu", "detecting"].includes(phase) ? [1, 0.5, 1] : 0.3,
            scale: ["cpu", "detecting"].includes(phase) ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ originX: "170px", originY: "90px" }}
        />
        <text x="170" y="93" textAnchor="middle" fontSize="10" fill={activeColor} className="font-mono font-black uppercase tracking-tighter opacity-80 pointer-events-none">CPU</text>
        <path d="M 140 60 L 130 50 M 200 60 L 210 50 M 140 120 L 130 130 M 200 120 L 210 130" stroke={activeColor} strokeWidth="0.5" strokeOpacity="0.3" />

        {/* RAM Slots */}
        <div className="ram-slots">
          {[0, 1, 2, 3].map((i) => (
            <motion.rect
              key={i}
              x={220 + i * 12} y="50" width="6" height="80" rx="1"
              fill={getStatusColor(["memory"])}
              stroke={activeColor}
              strokeWidth="0.5"
              animate={{ 
                fillOpacity: phase === "memory" ? [0.1, 0.4, 0.1] : 0.05,
                strokeOpacity: phase === "memory" ? 1 : 0.2,
                y: phase === "memory" ? [50, 48, 50] : 50
              }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
          <text x="242" y="140" textAnchor="middle" fontSize="6" fill={activeColor} className="font-mono opacity-50 uppercase">Memory</text>
        </div>

        {/* GPU Slot */}
        <motion.rect 
          x="60" y="150" width="120" height="25" rx="1" 
          fill={getStatusColor(["gpu"])} 
          stroke={activeColor}
          strokeWidth="1"
          animate={{ 
            fillOpacity: phase === "gpu" ? [0.1, 0.3, 0.1] : 0.05,
            strokeOpacity: phase === "gpu" ? 1 : 0.2
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <text x="120" y="167" textAnchor="middle" fontSize="8" fill={activeColor} className="font-mono font-bold uppercase tracking-tighter opacity-80">GPU_CORE</text>

        {/* Storage / M.2 Slot */}
        <motion.rect 
          x="260" y="160" width="80" height="15" rx="1" 
          fill={getStatusColor(["storage"])} 
          stroke={activeColor}
          strokeWidth="1"
          animate={{ 
            fillOpacity: phase === "storage" ? [0.1, 0.3, 0.1] : 0.05,
            strokeOpacity: phase === "storage" ? 1 : 0.2
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <text x="300" y="171" textAnchor="middle" fontSize="6" fill={activeColor} className="font-mono opacity-50 uppercase">SSD_NVME</text>

        {/* Bus Traces (Lines) with diagnostic pulse */}
        <g stroke={activeColor} strokeWidth="0.5" fill="none">
          {/* CPU to RAM */}
          <motion.path 
            d="M 200 90 L 220 90 M 200 80 L 220 80 M 200 100 L 220 100" 
            strokeOpacity={getStrokeOpacity(["memory", "cpu"])}
            animate={{ strokeDashoffset: [0, -20] }}
            strokeDasharray="4 4"
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          />
          {/* CPU to GPU */}
          <motion.path 
            d="M 140 100 L 120 100 L 120 150 M 140 110 L 110 110 L 110 150" 
            strokeOpacity={getStrokeOpacity(["gpu", "cpu"])}
            animate={{ strokeDashoffset: [0, -24] }}
            strokeDasharray="6 6"
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
          {/* CPU to Storage */}
          <motion.path 
            d="M 170 120 L 170 200 L 260 200 L 260 175" 
            strokeOpacity={getStrokeOpacity(["storage", "cpu"])}
            animate={{ strokeDashoffset: [0, -30] }}
            strokeDasharray="8 8"
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* Diagnostic Metadata Labels */}
        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <text x="140" y="55" fontSize="5" fill={activeColor} className="font-mono uppercase opacity-40">Core_Temp: 42.4C</text>
           <text x="140" y="48" fontSize="5" fill={activeColor} className="font-mono uppercase opacity-40">Vcore: 1.18V</text>
           <text x="220" y="45" fontSize="5" fill={activeColor} className="font-mono uppercase opacity-40">ECC: ENABLED</text>
           <text x="220" y="38" fontSize="5" fill={activeColor} className="font-mono uppercase opacity-40">Clock: 3200MT/s</text>
           <text x="60" y="145" fontSize="5" fill={activeColor} className="font-mono uppercase opacity-40">PCIe: x16_GEN4</text>
           <text x="60" y="138" fontSize="5" fill={activeColor} className="font-mono uppercase opacity-40">Bandwidth: 32GB/s</text>
        </g>

        {/* Voltage Ripple Traces */}
        <motion.path 
          d="M 20 200 L 380 200" 
          stroke={activeColor} 
          strokeWidth="0.5" 
          strokeOpacity="0.05"
          animate={{ strokeDashoffset: [0, 40] }}
          strokeDasharray="2 10"
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Status Indicators */}
        <circle cx="40" cy="40" r="2" fill={phase === "done" ? activeColor : "#333"} />
        <text x="48" y="42" fontSize="6" fill="#666" className="font-mono uppercase">System_Active</text>
        
        <circle cx="40" cy="52" r="2" fill={["cpu", "memory", "storage", "gpu"].includes(phase) ? activeColor : "#333"} className={["cpu", "memory", "storage", "gpu"].includes(phase) ? "animate-pulse" : ""} />
        <text x="48" y="54" fontSize="6" fill="#666" className="font-mono uppercase">Data_Transfer</text>
      </svg>

      {/* Real-time Telemetry Overlay Snippet */}
      <div className="absolute bottom-4 left-4 font-mono text-[8px] text-[#444] uppercase tracking-widest leading-relaxed">
        <div>Bus_Clock: 3200MHz</div>
        <div>Voltage: 1.25V</div>
        <div className="text-[#22c55e]">State: {phase.toUpperCase()}</div>
      </div>
      
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
        <span className="font-mono text-[8px] text-[#22c55e] uppercase">Live_Feed</span>
      </div>
    </div>
  );
}
