interface BannerProps {
  type: "orange" | "yellow" | "blue" | "red";
  message: string;
  action?: { label: string; onClick: () => void };
  copyText?: string;
}

const COLORS = {
  orange: {
    bg: "bg-orange-950/40",
    border: "border-orange-500/30",
    text: "text-orange-300",
    dot: "bg-orange-400",
  },
  yellow: {
    bg: "bg-yellow-950/40",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    dot: "bg-yellow-400",
  },
  blue: {
    bg: "bg-blue-950/40",
    border: "border-blue-500/30",
    text: "text-blue-300",
    dot: "bg-blue-400",
  },
  red: {
    bg: "bg-red-950/40",
    border: "border-red-500/30",
    text: "text-red-300",
    dot: "bg-red-400",
  },
};

export function WarningBanner({ type, message, action, copyText }: BannerProps) {
  const c = COLORS[type];
  const handleCopy = () => {
    if (copyText) navigator.clipboard.writeText(copyText);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${c.bg} ${c.border}`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
      <span className={`text-sm flex-1 ${c.text}`}>{message}</span>
      {copyText && (
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded border border-current opacity-70 hover:opacity-100 transition-opacity font-mono"
          style={{ color: c.text.replace("text-", "") }}
        >
          Copy
        </button>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs px-2 py-1 rounded border border-current opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: c.text.replace("text-", "") }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
