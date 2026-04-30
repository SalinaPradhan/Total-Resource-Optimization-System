import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ScheduleSlot } from "@/types";

export function useBatchSchedules(batchId: string | null) {
  return useQuery({
    queryKey: ['student-schedules', batchId],
    queryFn: async (): Promise<ScheduleSlot[]> => {
      if (!batchId) return [];

      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          day,
          start_time,
          end_time,
          type,
          academic_year,
          semester,
          course:courses(id, name, code),
          faculty:faculty(id, name),
          batch:batches(id, name, code),
          room:rooms(id, name, code)
        `)
        .eq('batch_id', batchId)
        .order('day')
        .order('start_time');

      if (error) throw error;

      return (data || []).map((schedule: any) => ({
        id: schedule.id,
        day: schedule.day,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        type: schedule.type,
        courseId: schedule.course?.id || '',
        courseName: schedule.course?.name || 'Unknown Course',
        teacherId: schedule.faculty?.id || '',
        teacherName: schedule.faculty?.name || 'Unknown Faculty',
        batchId: schedule.batch?.id || '',
        batchName: schedule.batch?.name || 'Unknown Batch',
        roomId: schedule.room?.id || '',
        roomName: schedule.room?.name || 'Unknown Room',
      }));
    },
    enabled: !!batchId,
  });
}
