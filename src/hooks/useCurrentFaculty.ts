import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { transformFaculty } from '@/lib/transformers';
import { transformSchedule, DbScheduleWithRelations } from '@/lib/transformers';

export const useCurrentFaculty = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-faculty', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // First try to find faculty by user_id
      let { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If not found by user_id, try by email
      if (!data) {
        const { data: byEmail, error: emailError } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (emailError) throw emailError;
        data = byEmail;
      }

      return data ? transformFaculty(data) : null;
    },
    enabled: !!user,
  });
};

export const useCurrentFacultySchedules = (facultyId?: string) => {
  return useQuery({
    queryKey: ['faculty-schedules', facultyId],
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
        .eq('faculty_id', facultyId)
        .order('day')
        .order('start_time');

      if (error) throw error;
      return (data as unknown as DbScheduleWithRelations[]).map(transformSchedule);
    },
    enabled: !!facultyId,
  });
};
