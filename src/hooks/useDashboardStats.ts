import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardStats } from '@/types';
import { useCoordinatorScope } from './useCoordinatorScope';

export const useDashboardStats = () => {
  const { assignedBatchIds, isScoped } = useCoordinatorScope();

  return useQuery({
    queryKey: ['dashboard-stats', isScoped ? assignedBatchIds : 'all'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch all counts in parallel
      const [
        roomsResult,
        facultyResult,
        staffResult,
        assetsResult,
        schedulesResult,
        alertsResult,
      ] = await Promise.all([
        supabase.from('rooms').select('id, status'),
        supabase.from('faculty').select('id, status'),
        supabase.from('support_staff').select('id, status'),
        supabase.from('assets').select('id, status'),
        isScoped && assignedBatchIds.length > 0
          ? supabase.from('schedules').select('id').in('batch_id', assignedBatchIds)
          : supabase.from('schedules').select('id'),
        supabase.from('alerts').select('id, resolved').eq('resolved', false),
      ]);

      const rooms = roomsResult.data ?? [];
      const faculty = facultyResult.data ?? [];
      const staff = staffResult.data ?? [];
      const assets = assetsResult.data ?? [];
      const schedules = schedulesResult.data ?? [];
      const alerts = alertsResult.data ?? [];

      return {
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        totalFaculty: faculty.length,
        activeFaculty: faculty.filter(f => f.status === 'available').length,
        totalStaff: staff.length,
        assignedStaff: staff.filter(s => s.status === 'assigned').length,
        totalAssets: assets.length,
        workingAssets: assets.filter(a => a.status === 'working').length,
        scheduledClasses: schedules.length,
        conflicts: alerts.filter(a => !a.resolved).length,
      };
    },
  });
};

export const useRoomUtilization = () => {
  return useQuery({
    queryKey: ['room-utilization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('status');

      if (error) throw error;

      const rooms = data ?? [];
      const occupied = rooms.filter(r => r.status === 'occupied').length;
      const available = rooms.filter(r => r.status === 'available').length;
      const maintenance = rooms.filter(r => r.status === 'maintenance').length;

      return [
        { name: 'In Use', value: occupied, color: 'hsl(199 89% 48%)' },
        { name: 'Available', value: available, color: 'hsl(142 71% 45%)' },
        { name: 'Maintenance', value: maintenance, color: 'hsl(215 20% 55%)' },
      ];
    },
  });
};

export const useStaffUtilization = () => {
  return useQuery({
    queryKey: ['staff-utilization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_staff')
        .select('status');

      if (error) throw error;

      const staff = data ?? [];
      const assigned = staff.filter(s => s.status === 'assigned').length;
      const available = staff.filter(s => s.status === 'available').length;
      const onLeave = staff.filter(s => s.status === 'on_leave').length;

      return [
        { name: 'Assigned', value: assigned, color: 'hsl(199 89% 48%)' },
        { name: 'Available', value: available, color: 'hsl(142 71% 45%)' },
        { name: 'On Leave', value: onLeave, color: 'hsl(215 20% 55%)' },
      ];
    },
  });
};
