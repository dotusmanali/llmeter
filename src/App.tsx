import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Nav } from "@/components/Nav";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Benchmark from "@/pages/Benchmark";
import Device from "@/pages/Device";
import Models from "@/pages/Models";
import Planner from "@/pages/Planner";
import Ollama from "@/pages/Ollama";
import Compare from "@/pages/Compare";
import History from "@/pages/History";
import Share from "@/pages/Share";

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[#64748b]">Page not found.</p>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="relative z-10">
      <Nav />
      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="container mx-auto px-4 py-6"
        >
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/benchmark" component={Benchmark} />
            <Route path="/device" component={Device} />
            <Route path="/models" component={Models} />
            <Route path="/planner" component={Planner} />
            <Route path="/ollama" component={Ollama} />
            <Route path="/compare" component={Compare} />
            <Route path="/history" component={History} />
            <Route path="/share" component={Share} />
            <Route component={NotFound} />
          </Switch>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [crtEnabled, setCrtEnabled] = useState(true);

  // Allow toggling CRT with a hidden shortcut (Ctrl+Shift+L for Legacy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        setCrtEnabled(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-[#22c55e] selection:text-black relative overflow-hidden ${crtEnabled ? 'terminal-screen' : ''}`}>
      {/* Global Industrial Grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      
      {crtEnabled && (
        <>
          <div className="terminal-crt-lines animate-flicker" />
          <div className="terminal-vignette" />
        </>
      )}
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </div>
  );
}

export default App;
