import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Timetable from "./pages/Timetable";
import Rooms from "./pages/Rooms";
import Faculty from "./pages/Faculty";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Staff from "./pages/Staff";
import Assets from "./pages/Assets";
import Courses from "./pages/Courses";
import Batches from "./pages/Batches";
import Scheduler from "./pages/Scheduler";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout><Index /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/timetable" element={
              <ProtectedRoute>
                <MainLayout><Timetable /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <MainLayout><Rooms /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout><Faculty /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout><Staff /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/assets" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <MainLayout><Assets /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <MainLayout><Courses /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/batches" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout><Batches /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/scheduler" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout><Scheduler /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute>
                <MainLayout><Alerts /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/my-dashboard" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <MainLayout><FacultyDashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MainLayout><StudentDashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout><Settings /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
