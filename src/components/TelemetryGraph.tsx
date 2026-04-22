import { motion } from "framer-motion";
import { useMemo } from "react";

interface Props {
  data: number[];
  label: string;
  color?: string;
  height?: number;
  max?: number;
}

export function TelemetryGraph({ data, label, color = "#22c55e", height = 60, max = 100 }: Props) {
  // Simulate history for the "ghost line" effect
  const historyData = useMemo(() => {
    return data.map(v => v * (0.8 + Math.random() * 0.4));
  }, [data.length > 0]);

  const getPoints = (dataset: number[]) => {
    if (dataset.length === 0) return "";
    const step = 100 / (dataset.length - 1 || 1);
    return dataset
      .map((val, i) => {
        const x = i * step;
        const y = height - (Math.min(val, max) / max) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const points = useMemo(() => getPoints(data), [data, height, max]);
  const historyPoints = useMemo(() => getPoints(historyData), [historyData, height, max]);

  return (
    <div className="relative group perspective-1000">
      <div className="flex justify-between items-center mb-1 px-1">
        <span className="text-[9px] font-mono text-[#444] uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />
          Sensor_{label}
        </span>
        <span className="text-[10px] font-mono text-[#22c55e] font-bold">
          {data[data.length - 1]?.toFixed(2) ?? "0.00"}
        </span>
      </div>
      
      <motion.div 
        initial={{ rotateX: 20, y: 10, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        className="relative bg-[#050505] border border-[#1f1f1f] rounded-lg overflow-hidden industrial-border h-[100px] cursor-crosshair group/graph"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        
        <svg
          viewBox={`0 0 100 ${height}`}
          className="absolute inset-0 w-full h-full p-2"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ghost Line (History) */}
          {data.length > 1 && (
            <motion.polyline
              points={historyPoints}
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.15"
            />
          )}

          {/* Area Fill */}
          <motion.polyline
            points={`0,${height} ${points} 100,${height}`}
            fill={`url(#grad-${label})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {/* Main Line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="scanline opacity-10" />
        </div>

        {/* HUD Crosshairs (Tracking current point) */}
        {data.length > 0 && (
          <g className="pointer-events-none">
            {/* Horizontal Line */}
            <motion.line
              x1="0" x2="100"
              y1={(height - (Math.min(data[data.length - 1], max) / max) * height)}
              y2={(height - (Math.min(data[data.length - 1], max) / max) * height)}
              stroke={color}
              strokeWidth="0.2"
              strokeOpacity="0.2"
              strokeDasharray="1 1"
            />
            {/* Vertical Line */}
            <motion.line
              x1="100" x2="100"
              y1="0" y2={height}
              stroke={color}
              strokeWidth="0.2"
              strokeOpacity="0.2"
              strokeDasharray="1 1"
            />
          </g>
        )}

        {/* Pulse Indicator */}
        {data.length > 0 && (
          <motion.div 
            className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_white] z-20"
            style={{ 
              right: "2px", 
              top: `${(height - (Math.min(data[data.length - 1], max) / max) * height) + 12}px`,
              transform: "translate(0, -50%)"
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Diagnostic Metadata Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none opacity-0 group-hover/graph:opacity-100 transition-opacity">
           <div className="text-[6px] font-mono text-[#22c55e] bg-black/50 px-1 border border-[#22c55e]/20">BUFFER_LOAD: 82%</div>
           <div className="text-[6px] font-mono text-[#22c55e] bg-black/50 px-1 border border-[#22c55e]/20">SIGNAL: NOMINAL</div>
        </div>
      </motion.div>

      {/* Technical Labels */}
      <div className="flex justify-between mt-1 px-1 opacity-30">
        <span className="text-[7px] font-mono text-white">0.00s</span>
        <span className="text-[7px] font-mono text-white tracking-[0.3em]">REALTIME_CAPTURE</span>
        <span className="text-[7px] font-mono text-white">0.30s</span>
      </div>
    </div>
  );
}
