import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SwapRequest {
  id: string;
  facultyId: string;
  facultyName?: string;
  scheduleId: string;
  courseName?: string;
  currentDay: string;
  currentStartTime: string;
  currentEndTime: string;
  requestedDay: string;
  requestedStartTime: string;
  requestedEndTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface CreateSwapRequestInput {
  facultyId: string;
  scheduleId: string;
  currentDay: string;
  currentStartTime: string;
  currentEndTime: string;
  requestedDay: string;
  requestedStartTime: string;
  requestedEndTime: string;
  reason: string;
}

const transformSwapRequest = (row: any): SwapRequest => ({
  id: row.id,
  facultyId: row.faculty_id,
  facultyName: row.faculty?.name || 'Unknown',
  scheduleId: row.schedule_id,
  courseName: row.schedules?.courses?.name || 'Unknown',
  currentDay: row.current_day,
  currentStartTime: row.current_start_time,
  currentEndTime: row.current_end_time,
  requestedDay: row.requested_day,
  requestedStartTime: row.requested_start_time,
  requestedEndTime: row.requested_end_time,
  reason: row.reason,
  status: row.status,
  adminNotes: row.admin_notes,
  reviewedAt: row.reviewed_at,
  createdAt: row.created_at,
});

export const useSwapRequests = () => {
  return useQuery({
    queryKey: ['swap-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          faculty:faculty_id (name),
          schedules:schedule_id (
            courses:course_id (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformSwapRequest);
    },
  });
};

export const useFacultySwapRequests = (facultyId?: string) => {
  return useQuery({
    queryKey: ['swap-requests', 'faculty', facultyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          faculty:faculty_id (name),
          schedules:schedule_id (
            courses:course_id (name)
          )
        `)
        .eq('faculty_id', facultyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformSwapRequest);
    },
    enabled: !!facultyId,
  });
};

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSwapRequestInput) => {
      const { error } = await supabase.from('swap_requests').insert({
        faculty_id: input.facultyId,
        schedule_id: input.scheduleId,
        current_day: input.currentDay,
        current_start_time: input.currentStartTime,
        current_end_time: input.currentEndTime,
        requested_day: input.requestedDay,
        requested_start_time: input.requestedStartTime,
        requested_end_time: input.requestedEndTime,
        reason: input.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
};

export const useReviewSwapRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: 'approved' | 'rejected'; adminNotes?: string }) => {
      const { error } = await supabase
        .from('swap_requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
};

export const useDeleteSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('swap_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
    },
  });
};
