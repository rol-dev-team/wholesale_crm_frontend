import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import KAMPage from "./pages/KAMPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ClientsPage from "./pages/ClientsPage";
import SalesPage from "./pages/SalesPage";
import SettingsPage from "./pages/SettingsPage";
import KAMDashboard from "./pages/dashboards/KAMDashboard";
import SupervisorDashboard from "./pages/dashboards/SupervisorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import NotFound from "./pages/NotFound";
import TargetsPage from "./pages/TargetsPage";
import KAMPerformancePage from "./pages/KAMPerformancePage";
import Login from "./pages/Login";
import "react-datepicker/dist/react-datepicker.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/kam" element={<KAMPage />} />           
              <Route path="/kam-performance" element={<KAMPerformancePage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/achievements" element={<SalesPage />} />
              <Route path="/sales" element={<Navigate to="/achievements" replace />} />
              <Route path="/targets" element={<TargetsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<PlaceholderPage title="Help" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

function DashboardRouter() {
  const { currentUser } = useAuth();
  
  switch (currentUser?.role) {
    case 'kam':
      return <KAMDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'boss':
    case 'super_admin':
      return <AdminDashboard />;
    default:
      return <KAMDashboard />;
  }
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>
      <p className="text-muted-foreground">This page is coming soon.</p>
    </div>
  );
}

export default App;
