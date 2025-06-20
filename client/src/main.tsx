import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Landing from "@/pages/landing";
import "./index.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Landing />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
