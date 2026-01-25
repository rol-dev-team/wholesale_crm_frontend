// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/route/ProtectedRoute";
import { GuestRoute } from "@/components/route/GuestRoute";

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
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Guest-only route: Login */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            {/* Protected routes: All pages requiring login */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* Main app pages */}
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

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

// --- Dashboard Router based on role ---
function DashboardRouter() {
  const { currentUser } = useAuth();

  switch (currentUser?.role?.toLowerCase()) {
    case "kam":
      return <KAMDashboard />;
    case "supervisor":
      return <SupervisorDashboard />;
    case "management":
    case "boss": // backend may send boss
    case "super_admin":
      return <AdminDashboard />;
    default:
      return <KAMDashboard />;
  }
}

// --- Placeholder page for incomplete routes ---
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-container p-8">
      <h1 className="page-title text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">This page is coming soon.</p>
    </div>
  );
}
