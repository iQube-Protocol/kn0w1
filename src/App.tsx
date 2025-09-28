import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Setup } from "@/pages/admin/Setup";
import { Overview } from "@/pages/admin/Overview";
import { ContentManagement } from "@/pages/admin/ContentManagement";
import { ContentEditor } from "@/pages/admin/ContentEditor";
import { UserManagement } from "@/pages/admin/UserManagement";
import { Analytics } from "@/pages/admin/Analytics";
import { Settings as AdminSettings } from "@/pages/admin/Settings";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MainApp from "./pages/MainApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<MainApp />} />
            <Route path="/gotv" element={<MainApp />} />
            <Route path="/l2e" element={<MainApp />} />
            
            {/* Setup Route (outside admin layout) */}
            <Route path="/admin/setup" element={<Setup />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="content/new" element={<ContentEditor />} />
              <Route path="content/:id" element={<ContentEditor />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
