import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformFaculty } from '@/lib/transformers';
import { validateAndInsert } from '@/lib/validateAndInsert';
import { createDepartmentMatcher } from '@/lib/departmentScope';
import type { Faculty } from '@/types';
import type { Tables } from '@/integrations/supabase/types';
import { useCoordinatorScope } from './useCoordinatorScope';

export const useFaculty = () => {
  const { assignedDepartments, isScoped, isLoading: isScopeLoading } = useCoordinatorScope();

  return useQuery({
    queryKey: ['faculty', isScoped ? assignedDepartments : 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faculty').select('*').order('name');

      if (error) throw error;

      if (!isScoped) {
        return data.map(transformFaculty);
      }

      if (assignedDepartments.length === 0) {
        return [];
      }

      const canAccessDepartment = createDepartmentMatcher(assignedDepartments);

      return data
        .filter((member) => canAccessDepartment(member.department))
        .map(transformFaculty);
    },
    enabled: !isScoped || !isScopeLoading,
  });
};

export const useFacultyMember = (id: string) => {
  return useQuery({
    queryKey: ['faculty', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformFaculty(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faculty: Omit<Faculty, 'id'>) => {
      const result = await validateAndInsert<Tables<'faculty'>>('faculty', 'create', faculty);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformFaculty(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...faculty }: Partial<Faculty> & { id: string }) => {
      const result = await validateAndInsert<Tables<'faculty'>>('faculty', 'update', faculty, id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformFaculty(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
  });
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faculty')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
  });
};
