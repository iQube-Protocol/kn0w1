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
import { UberAdmin } from "@/pages/admin/UberAdmin";
import UpdatePropagation from "@/pages/admin/UpdatePropagation";
import { Analytics } from "@/pages/admin/Analytics";
import { Settings as AdminSettings } from "@/pages/admin/Settings";
import { Preview } from "@/pages/Preview";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MainApp from "./pages/MainApp";
import Purchases from "./pages/Purchases";
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
            <Route path="/app/:siteName?" element={<MainApp />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/gotv" element={<MainApp />} />
            <Route path="/l2e" element={<MainApp />} />
            <Route path="/preview/:siteSlug" element={<Preview />} />
            
            {/* Setup Route (outside admin layout) */}
            <Route path="/admin/setup" element={<Setup />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              <Route path="uber" element={<UberAdmin />} />
              <Route path="updates" element={<UpdatePropagation />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="content/new" element={<ContentEditor />} />
              <Route path="content/:id" element={<ContentEditor />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<AdminSettings />} />
              
              {/* Site-specific admin routes */}
              <Route path=":siteId/overview" element={<Overview />} />
              <Route path=":siteId/content" element={<ContentManagement />} />
              <Route path=":siteId/content/new" element={<ContentEditor />} />
              <Route path=":siteId/content/:id" element={<ContentEditor />} />
              <Route path=":siteId/users" element={<UserManagement />} />
              <Route path=":siteId/analytics" element={<Analytics />} />
              <Route path=":siteId/settings" element={<AdminSettings />} />
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
