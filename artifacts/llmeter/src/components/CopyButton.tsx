import { useState } from "react";
import { copyToClipboard } from "../lib/export";

interface Props {
  text: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export function CopyButton({ text, label = "Copy", className = "", iconOnly = false }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handle}
      title={copied ? "Copied!" : label}
      className={`inline-flex items-center gap-1.5 transition-colors ${className}`}
    >
      {iconOnly ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={copied ? "text-[#22c55e]" : ""}
        >
          {copied ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>
          )}
        </svg>
      ) : (
        <span className={copied ? "text-[#22c55e]" : ""}>{copied ? "Copied!" : label}</span>
      )}
    </button>
  );
}
