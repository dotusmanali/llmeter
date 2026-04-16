import { Switch, Route, Router as WouterRouter } from "wouter";
import { Nav } from "@/components/Nav";
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
  return (
    <>
      <Nav />
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
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </div>
  );
}

export default App;
