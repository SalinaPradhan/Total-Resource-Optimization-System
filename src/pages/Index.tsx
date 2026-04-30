import { DoorOpen, Users, UserCog, Package, AlertTriangle, Calendar, GraduationCap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ResourceUtilization } from "@/components/dashboard/ResourceUtilization";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodaySchedulePreview } from "@/components/dashboard/TodaySchedulePreview";
import { SwapRequestsPanel } from "@/components/dashboard/SwapRequestsPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useRoomUtilization, useStaffUtilization } from "@/hooks/useDashboardStats";
import { useUnresolvedAlerts } from "@/hooks/useAlerts";
import { useTodaySchedule } from "@/hooks/useSchedules";
import { useSwapRequests, useReviewSwapRequest } from "@/hooks/useSwapRequests";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Index() {
  const { isAdminOrAbove, isSuperAdmin, isAdmin, isFaculty, isStudent, user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alerts, isLoading: alertsLoading } = useUnresolvedAlerts();
  const { data: todaySchedule, isLoading: scheduleLoading } = useTodaySchedule();
  const { data: roomUtilization, isLoading: roomUtilLoading } = useRoomUtilization();
  const { data: staffUtilization, isLoading: staffUtilLoading } = useStaffUtilization();
  const { data: swapRequests, isLoading: swapLoading } = useSwapRequests();
  const reviewSwapRequest = useReviewSwapRequest();
  const [reviewingId, setReviewingId] = useState<string | undefined>();

  const handleApprove = async (id: string, notes?: string) => {
    setReviewingId(id);
    try {
      await reviewSwapRequest.mutateAsync({ id, status: 'approved', adminNotes: notes });
      toast({ title: "Swap request approved" });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
    setReviewingId(undefined);
  };

  const handleReject = async (id: string, notes?: string) => {
    setReviewingId(id);
    try {
      await reviewSwapRequest.mutateAsync({ id, status: 'rejected', adminNotes: notes });
      toast({ title: "Swap request rejected" });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
    setReviewingId(undefined);
  };

  const isLoading = statsLoading || alertsLoading || scheduleLoading;

  // Get role-specific subtitle
  const getSubtitle = () => {
    if (isSuperAdmin) return "Super Admin Dashboard - Global System Access";
    if (isAdmin) return "Coordinator Dashboard - Assigned Batches";
    if (isFaculty) return "Faculty Dashboard - View Your Schedule & Resources";
    return "Student Dashboard - View Your Class Schedule";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header 
          title={`Welcome, ${user?.user_metadata?.full_name || 'User'}`}
          subtitle={getSubtitle()}
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = stats ?? {
    totalRooms: 0,
    availableRooms: 0,
    totalFaculty: 0,
    activeFaculty: 0,
    totalStaff: 0,
    assignedStaff: 0,
    totalAssets: 0,
    workingAssets: 0,
    scheduledClasses: 0,
    conflicts: 0,
  };

  const alertsData = alerts ?? [];
  const scheduleData = todaySchedule ?? [];
  const roomUtilData = roomUtilization ?? [];
  const staffUtilData = staffUtilization ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title={`Welcome, ${user?.user_metadata?.full_name || 'User'}`}
        subtitle={getSubtitle()}
      />
      
      <div className="p-6">
        {/* Stats Grid - Different for each role */}
        <div className={`grid gap-4 mb-6 ${isAdminOrAbove ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {isAdminOrAbove && (
            <>
              <StatCard
                title="Total Rooms"
                value={dashboardStats.totalRooms}
                subtitle={`${dashboardStats.availableRooms} available`}
                icon={DoorOpen}
                variant="primary"
                delay={0}
              />
              <StatCard
                title="Faculty Members"
                value={dashboardStats.totalFaculty}
                subtitle={`${dashboardStats.activeFaculty} active`}
                icon={Users}
                delay={50}
              />
              <StatCard
                title="Support Staff"
                value={dashboardStats.totalStaff}
                subtitle={`${dashboardStats.assignedStaff} assigned`}
                icon={UserCog}
                delay={100}
              />
              <StatCard
                title="Assets"
                value={dashboardStats.totalAssets}
                subtitle={`${dashboardStats.workingAssets} working`}
                icon={Package}
                delay={150}
              />
              <StatCard
                title="Scheduled Classes"
                value={dashboardStats.scheduledClasses}
                icon={Calendar}
                variant="accent"
                delay={200}
              />
              <StatCard
                title="Active Conflicts"
                value={dashboardStats.conflicts}
                icon={AlertTriangle}
                variant="warning"
                delay={250}
              />
            </>
          )}

          {isFaculty && (
            <>
              <StatCard
                title="Your Classes Today"
                value={scheduleData.length}
                subtitle={scheduleData[0] ? `Next: ${scheduleData[0].courseName}` : 'No classes'}
                icon={Calendar}
                variant="primary"
                delay={0}
              />
              <StatCard
                title="Weekly Hours"
                value="15/18"
                subtitle="3 hours remaining"
                icon={Users}
                delay={50}
              />
              <StatCard
                title="Assigned Rooms"
                value={4}
                icon={DoorOpen}
                delay={100}
              />
              <StatCard
                title="Courses"
                value={2}
                subtitle="Data Structures, Algorithms"
                icon={Package}
                delay={150}
              />
            </>
          )}

          {isStudent && (
            <>
              <StatCard
                title="Classes Today"
                value={scheduleData.length}
                subtitle={scheduleData[0] ? `Next: ${scheduleData[0].courseName}` : 'No classes'}
                icon={Calendar}
                variant="primary"
                delay={0}
              />
              <StatCard
                title="Your Batch"
                value="CS-3A"
                subtitle="55 students"
                icon={GraduationCap}
                delay={50}
              />
              <StatCard
                title="Courses This Semester"
                value={6}
                icon={Package}
                delay={100}
              />
              <StatCard
                title="Upcoming Exams"
                value={2}
                subtitle="This week"
                icon={AlertTriangle}
                variant="warning"
                delay={150}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <TodaySchedulePreview slots={scheduleData} />
            
            {isAdminOrAbove && !roomUtilLoading && !staffUtilLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResourceUtilization 
                  data={roomUtilData} 
                  title="Room Utilization" 
                />
                <ResourceUtilization 
                  data={staffUtilData} 
                  title="Staff Allocation" 
                />
              </div>
            )}
          </div>

          {/* Right Column - Alerts & Actions */}
          <div className="space-y-6">
            {isAdminOrAbove && <QuickActions />}
            {isAdminOrAbove && !swapLoading && (swapRequests || []).length > 0 && (
              <SwapRequestsPanel
                requests={swapRequests || []}
                isAdmin
                onApprove={handleApprove}
                onReject={handleReject}
                reviewingId={reviewingId}
              />
            )}
            <AlertsPanel alerts={alertsData} />
          </div>
        </div>
      </div>
    </div>
  );
}
