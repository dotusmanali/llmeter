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
      className={`text-[10px] uppercase tracking-[0.15em] px-4 py-2 transition-all relative whitespace-nowrap group ${
        active
          ? "text-green font-bold"
          : "text-[#444] hover:text-white"
      }`}
    >
      {label}
      {active && (
        <>
          <div className="absolute top-0 left-0 w-1 h-1 bg-green" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-green" />
          <div className="absolute inset-0 border border-green/20" />
        </>
      )}
      <div className="absolute bottom-0 left-0 h-[1px] bg-green w-0 group-hover:w-full transition-all" />
    </Link>
  );
}

export function Nav() {
  return (
    <nav className="border-b border-[#1f1f1f] bg-[#0a0a0a] sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="font-mono font-black text-white text-xs tracking-[0.2em] uppercase italic">
            LLMeter<span className="text-green not-italic">.diagnostic</span>
          </span>
        </div>
        <div className="h-6 w-[1px] bg-[#1f1f1f] mr-4" />
        <div className="flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} label={l.label} />
          ))}
        </div>
      </div>
    </nav>
  );
}
