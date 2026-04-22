import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Nav } from "@/components/Nav";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import Dashboard from "@/pages/Dashboard";
import Benchmark from "@/pages/Benchmark";
import Device from "@/pages/Device";
import Models from "@/pages/Models";
import Planner from "@/pages/Planner";
import Ollama from "@/pages/Ollama";
import Compare from "@/pages/Compare";
import History from "@/pages/History";
import Share from "@/pages/Share";

function ParallaxBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.02, 0.04, 0.02],
          scale: [1, 1.1, 1],
          rotate: [0, 1, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 parallax-grid opacity-[0.02]"
      />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="relative z-10">
      <Nav />
      <main className="container mx-auto px-4 py-8 relative z-20">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/benchmark" component={Benchmark} />
          <Route path="/device" component={Device} />
          <Route path="/models" component={Models} />
          <Route path="/planner" component={Planner} />
          <Route path="/ollama" component={Ollama} />
          <Route path="/history" component={History} />
          <Route path="/share" component={Share} />
          <Route path="/compare" component={Compare} />
          <Route>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <h1 className="text-4xl font-mono text-red-risk tracking-tighter">404_PAGE_NOT_FOUND</h1>
              <p className="text-white/40 font-mono text-sm uppercase">Navigation node unavailable</p>
              <a href="/llmeter/" className="text-[#22c55e] font-mono text-xs underline decoration-dotted underline-offset-4">Return_to_HQ</a>
            </div>
          </Route>
        </Switch>
      </main>
      
      <Toaster 
        theme="dark" 
        position="bottom-right"
        toastOptions={{
          className: "bg-[#0a0a0a] border border-[#1f1f1f] text-white font-mono text-xs",
        }}
      />
    </div>
  );
}

function App() {
  const [crtEnabled, setCrtEnabled] = useState(true);

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
      <ParallaxBackground />
      
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
