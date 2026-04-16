import type { Fit } from "../lib/models";

interface Props {
  fit: Fit;
}

const FIT_STYLE: Record<Fit, { label: string; className: string }> = {
  likely: {
    label: "Likely",
    className: "bg-green-950/50 text-green-400 border border-green-800/50",
  },
  maybe: {
    label: "Maybe",
    className: "bg-yellow-950/50 text-yellow-400 border border-yellow-800/50",
  },
  no: {
    label: "No",
    className: "bg-red-950/50 text-red-400 border border-red-800/50",
  },
};

export function FitBadge({ fit }: Props) {
  const s = FIT_STYLE[fit];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${s.className}`}>
      {s.label}
    </span>
  );
}
