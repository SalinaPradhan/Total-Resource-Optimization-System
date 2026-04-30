import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformSchedule, DbScheduleWithRelations } from '@/lib/transformers';
import { useCoordinatorScope } from './useCoordinatorScope';

export const useSchedules = () => {
  const { assignedBatchIds, isScoped } = useCoordinatorScope();

  return useQuery({
    queryKey: ['schedules', isScoped ? assignedBatchIds : 'all'],
    queryFn: async () => {
      let query = supabase
        .from('schedules')
        .select(`
          id,
          day,
          start_time,
          end_time,
          type,
          courses:course_id (id, name),
          faculty:faculty_id (id, name),
          batches:batch_id (id, name),
          rooms:room_id (id, name),
          support_staff:assigned_staff_id (id, name),
          schedule_warnings (warning, resolved)
        `)
        .order('day')
        .order('start_time');

      // Scope to assigned batches for coordinators
      if (isScoped && assignedBatchIds.length > 0) {
        query = query.in('batch_id', assignedBatchIds);
      } else if (isScoped && assignedBatchIds.length === 0) {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as DbScheduleWithRelations[]).map(transformSchedule);
    },
  });
};

export const useSchedulesByDay = (day: string) => {
  return useQuery({
    queryKey: ['schedules', 'day', day],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          day,
          start_time,
          end_time,
          type,
          courses:course_id (id, name),
          faculty:faculty_id (id, name),
          batches:batch_id (id, name),
          rooms:room_id (id, name),
          support_staff:assigned_staff_id (id, name),
          schedule_warnings (warning, resolved)
        `)
        .eq('day', day)
        .order('start_time');

      if (error) throw error;
      return (data as unknown as DbScheduleWithRelations[]).map(transformSchedule);
    },
    enabled: !!day,
  });
};

export const useTodaySchedule = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const { assignedBatchIds, isScoped } = useCoordinatorScope();

  return useQuery({
    queryKey: ['schedules', 'today', isScoped ? assignedBatchIds : 'all'],
    queryFn: async () => {
      let query = supabase
        .from('schedules')
        .select(`
          id,
          day,
          start_time,
          end_time,
          type,
          courses:course_id (id, name),
          faculty:faculty_id (id, name),
          batches:batch_id (id, name),
          rooms:room_id (id, name),
          support_staff:assigned_staff_id (id, name),
          schedule_warnings (warning, resolved)
        `)
        .eq('day', today)
        .order('start_time');

      if (isScoped && assignedBatchIds.length > 0) {
        query = query.in('batch_id', assignedBatchIds);
      } else if (isScoped && assignedBatchIds.length === 0) {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as DbScheduleWithRelations[]).map(transformSchedule);
    },
  });
};

interface CreateScheduleInput {
  courseId: string;
  facultyId: string;
  batchId: string;
  roomId: string;
  day: string;
  startTime: string;
  endTime: string;
  type: 'lecture' | 'lab' | 'tutorial';
  assignedStaffId?: string;
  academicYear: string;
  semester: number;
}

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedule: CreateScheduleInput) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          course_id: schedule.courseId,
          faculty_id: schedule.facultyId,
          batch_id: schedule.batchId,
          room_id: schedule.roomId,
          day: schedule.day,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          type: schedule.type,
          assigned_staff_id: schedule.assignedStaffId && schedule.assignedStaffId.trim() !== '' 
            ? schedule.assignedStaffId 
            : null,
          academic_year: schedule.academicYear,
          semester: schedule.semester,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};
