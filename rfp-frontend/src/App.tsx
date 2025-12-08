import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CreateRFP from "./pages/CreateRFP";
import RFPDetail from "./pages/RFPDetail";
import Vendors from "./pages/Vendors";
import SendRFP from "./pages/SendRFP";
import Proposals from "./pages/Proposals";
import ProposalDetail from "./pages/ProposalDetail";
import Comparison from "./pages/Comparison";
import Decision from "./pages/Decision";
import SelectVendors from "./pages/SelectVendors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-rfp" element={<CreateRFP />} />
            <Route path="/rfp/:id" element={<RFPDetail />} />
            <Route path="/rfp/:id/select-vendors" element={<SelectVendors />} />
            <Route path="/rfp/:id/send" element={<SendRFP />} />
            <Route path="/rfp/:id/proposals" element={<Proposals />} />
            <Route path="/rfp/:id/proposal/:proposalId" element={<ProposalDetail />} />
            <Route path="/rfp/:id/compare" element={<Comparison />} />
            <Route path="/rfp/:id/decision" element={<Decision />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;