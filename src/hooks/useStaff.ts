import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformStaff } from '@/lib/transformers';
import { validateAndInsert } from '@/lib/validateAndInsert';
import type { SupportStaff } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_staff')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(transformStaff);
    },
  });
};

export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_staff')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformStaff(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: Omit<SupportStaff, 'id'>) => {
      const result = await validateAndInsert<Tables<'support_staff'>>('staff', 'create', staff);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformStaff(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...staff }: Partial<SupportStaff> & { id: string }) => {
      const result = await validateAndInsert<Tables<'support_staff'>>('staff', 'update', staff, id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformStaff(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('support_staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};
