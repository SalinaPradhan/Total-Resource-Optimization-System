import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformCourse } from '@/lib/transformers';
import { validateAndInsert } from '@/lib/validateAndInsert';
import { createDepartmentMatcher } from '@/lib/departmentScope';
import type { Course } from '@/types';
import type { Tables } from '@/integrations/supabase/types';
import { useCoordinatorScope } from './useCoordinatorScope';

export const useCourses = () => {
  const { assignedDepartments, isScoped, isLoading: isScopeLoading } = useCoordinatorScope();

  return useQuery({
    queryKey: ['courses', isScoped ? assignedDepartments : 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('name');

      if (error) throw error;

      if (!isScoped) {
        return data.map(transformCourse);
      }

      if (assignedDepartments.length === 0) {
        return [];
      }

      const canAccessDepartment = createDepartmentMatcher(assignedDepartments);

      return data
        .filter((course) => canAccessDepartment(course.department))
        .map(transformCourse);
    },
    enabled: !isScoped || !isScopeLoading,
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformCourse(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (course: Omit<Course, 'id'>) => {
      const result = await validateAndInsert<Tables<'courses'>>('courses', 'create', course);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformCourse(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...course }: Partial<Course> & { id: string }) => {
      const result = await validateAndInsert<Tables<'courses'>>('courses', 'update', course, id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformCourse(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
