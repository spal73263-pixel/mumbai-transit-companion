import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LiveStatus from "./pages/LiveStatus";
import Tickets from "./pages/Tickets";
import RoutesPage from "./pages/Routes";
import AdminDashboard from "./pages/AdminDashboard";
import ScanQR from "./pages/ScanQR";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/live" element={<LiveStatus />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
