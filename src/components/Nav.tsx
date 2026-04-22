import { Link, useRoute } from "wouter";

const LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/benchmark", label: "Benchmark" },
  { to: "/device", label: "Device" },
  { to: "/models", label: "Models" },
  { to: "/planner", label: "Planner" },
  { to: "/ollama", label: "Ollama" },
  { to: "/compare", label: "Compare" },
  { to: "/history", label: "History" },
];

function NavLink({ to, label }: { to: string; label: string }) {
  const [active] = useRoute(to === "/" ? "/" : `${to}*`);
  return (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
        active
          ? "bg-[#1f1f1f] text-white font-medium"
          : "text-[#64748b] hover:text-white hover:bg-[#161616]"
      }`}
    >
      {label}
    </Link>
  );
}

export function Nav() {
  return (
    <nav className="border-b border-[#1f1f1f] bg-[#0a0a0a] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-12 overflow-x-auto scrollbar-none">
        <span className="font-mono font-bold text-white mr-4 text-sm tracking-tight flex-shrink-0">
          LLMeter
        </span>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} label={l.label} />
        ))}
      </div>
    </nav>
  );
}
