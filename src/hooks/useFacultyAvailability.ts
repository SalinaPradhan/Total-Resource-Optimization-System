import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FacultyAvailability, FacultyAvailabilityInput } from '@/types/facultyAvailability';

interface DbFacultyAvailability {
  id: string;
  faculty_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  preference_type: string;
  created_at: string;
  updated_at: string;
}

const transformAvailability = (row: DbFacultyAvailability): FacultyAvailability => ({
  id: row.id,
  facultyId: row.faculty_id,
  dayOfWeek: row.day_of_week as FacultyAvailability['dayOfWeek'],
  startTime: row.start_time,
  endTime: row.end_time,
  preferenceType: row.preference_type as FacultyAvailability['preferenceType'],
});

export const useFacultyAvailability = (facultyId?: string) => {
  return useQuery({
    queryKey: ['faculty-availability', facultyId],
    queryFn: async () => {
      let query = supabase
        .from('faculty_availability')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (facultyId) {
        query = query.eq('faculty_id', facultyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as DbFacultyAvailability[]).map(transformAvailability);
    },
    enabled: facultyId !== undefined,
  });
};

export const useAllFacultyAvailability = () => {
  return useQuery({
    queryKey: ['faculty-availability', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty_availability')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return (data as DbFacultyAvailability[]).map(transformAvailability);
    },
  });
};

export const useCreateFacultyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FacultyAvailabilityInput) => {
      const { data, error } = await supabase
        .from('faculty_availability')
        .insert({
          faculty_id: input.facultyId,
          day_of_week: input.dayOfWeek,
          start_time: input.startTime,
          end_time: input.endTime,
          preference_type: input.preferenceType,
        })
        .select()
        .single();

      if (error) throw error;
      return transformAvailability(data as DbFacultyAvailability);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', variables.facultyId] });
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', 'all'] });
    },
  });
};

export const useUpdateFacultyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<FacultyAvailabilityInput> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (input.dayOfWeek) updateData.day_of_week = input.dayOfWeek;
      if (input.startTime) updateData.start_time = input.startTime;
      if (input.endTime) updateData.end_time = input.endTime;
      if (input.preferenceType) updateData.preference_type = input.preferenceType;

      const { data, error } = await supabase
        .from('faculty_availability')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformAvailability(data as DbFacultyAvailability);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', data.facultyId] });
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', 'all'] });
    },
  });
};

export const useDeleteFacultyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, facultyId }: { id: string; facultyId: string }) => {
      const { error } = await supabase
        .from('faculty_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, facultyId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', variables.facultyId] });
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', 'all'] });
    },
  });
};

export const useBulkSaveFacultyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facultyId, slots }: { facultyId: string; slots: Omit<FacultyAvailabilityInput, 'facultyId'>[] }) => {
      // Delete all existing availability for this faculty
      const { error: deleteError } = await supabase
        .from('faculty_availability')
        .delete()
        .eq('faculty_id', facultyId);

      if (deleteError) throw deleteError;

      // Insert new slots if any
      if (slots.length > 0) {
        const insertData = slots.map(slot => ({
          faculty_id: facultyId,
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
          preference_type: slot.preferenceType,
        }));

        const { error: insertError } = await supabase
          .from('faculty_availability')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      return { facultyId, count: slots.length };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', variables.facultyId] });
      queryClient.invalidateQueries({ queryKey: ['faculty-availability', 'all'] });
    },
  });
};
