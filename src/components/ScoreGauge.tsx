import { motion } from "framer-motion";
import type { Tier } from "../lib/scoring";

interface Props {
  score: number;
  tier: Tier;
  size?: number;
}

function tierColor(tier: Tier): string {
  switch (tier) {
    case "Powerhouse": return "#22c55e";
    case "High": return "#22c55e";
    case "Medium": return "#eab308";
    case "Low": return "#f97316";
    case "Minimal": return "#ef4444";
  }
}

function tierGlowClass(tier: Tier): string {
  switch (tier) {
    case "Powerhouse":
    case "High": return "glow-green";
    case "Medium": return "glow-yellow";
    default: return "glow-red";
  }
}

export function ScoreGauge({ score, tier, size = 180 }: Props) {
  const radius = (size / 2) - 20;
  const circumference = 2 * Math.PI * radius;
  const fraction = score / 100;
  const dashoffset = circumference * (1 - fraction);
  const color = tierColor(tier);
  const glowClass = tierGlowClass(tier);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center overflow-hidden terminal-screen" style={{ width: size, height: size }}>
      {/* Background Grid Texture */}
      <div className="absolute inset-0 bg-grid opacity-10 rounded-full" />
      
      {/* Decorative Outer Ticks */}
      <svg width={size} height={size} className="absolute inset-0 opacity-20 pointer-events-none rotate-[10deg]">
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1={cx + (radius + 14) * Math.cos((i * 15 * Math.PI) / 180)}
            y1={cy + (radius + 14) * Math.sin((i * 15 * Math.PI) / 180)}
            x2={cx + (radius + 10) * Math.cos((i * 15 * Math.PI) / 180)}
            y2={cy + (radius + 10) * Math.sin((i * 15 * Math.PI) / 180)}
            stroke={color}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Expansion Pulse Ring */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.2], opacity: [0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-full h-full rounded-full border border-[#22c55e44]"
      />

      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className={glowClass}>
        {/* Depth Arc (Dimmest) */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth={14}
        />
        {/* Track Detail */}
        <circle
          cx={cx}
          cy={cy}
          r={radius - 7}
          fill="none"
          stroke="#000"
          strokeWidth={1}
          strokeOpacity={0.5}
        />
        {/* Main Progress Arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="butt"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          strokeDasharray={circumference}
          className="drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[8px] font-mono text-[#444] mb-1 tracking-widest uppercase opacity-50">Score_Output</div>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-mono font-bold leading-none tracking-tighter animate-chromatic"
          style={{ fontSize: size * 0.3, color }}
        >
          {score}
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-bold mt-1 tracking-[0.2em] uppercase" 
          style={{ color: "#64748b" }}
        >
          {tier}
        </motion.span>
      </div>

      {/* Decorative Technical Label */}
      <div className="absolute bottom-2 font-mono text-[6px] text-[#222] tracking-[0.5em] uppercase pointer-events-none">
        LLM_READINESS_SYSTEM_V2
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        <div className="scanline opacity-20" />
      </div>
    </div>
  );
}
