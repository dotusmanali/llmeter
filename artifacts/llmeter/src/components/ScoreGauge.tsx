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

export function ScoreGauge({ score, tier, size = 180 }: Props) {
  const radius = (size / 2) - 16;
  const circumference = 2 * Math.PI * radius;
  const fraction = score / 100;
  const dashoffset = circumference * (1 - fraction);
  const color = tierColor(tier);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth={10}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold leading-none"
          style={{ fontSize: size * 0.25, color }}
        >
          {score}
        </span>
        <span className="text-xs font-medium mt-1" style={{ color: "#64748b" }}>
          {tier}
        </span>
      </div>
    </div>
  );
}
