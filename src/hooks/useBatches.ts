import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformBatch } from '@/lib/transformers';
import { validateAndInsert } from '@/lib/validateAndInsert';
import type { Batch } from '@/types';
import type { Tables } from '@/integrations/supabase/types';
import { useCoordinatorScope } from './useCoordinatorScope';

export const useBatches = () => {
  const { assignedBatchIds, isScoped } = useCoordinatorScope();

  return useQuery({
    queryKey: ['batches', isScoped ? assignedBatchIds : 'all'],
    queryFn: async () => {
      let query = supabase.from('batches').select('*').order('name');

      // Scope to assigned batches for coordinators
      if (isScoped && assignedBatchIds.length > 0) {
        query = query.in('id', assignedBatchIds);
      } else if (isScoped && assignedBatchIds.length === 0) {
        return []; // Coordinator with no assignments sees nothing
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(transformBatch);
    },
  });
};

export const useBatch = (id: string) => {
  return useQuery({
    queryKey: ['batches', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformBatch(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batch: Omit<Batch, 'id'>) => {
      const dbPayload = {
        name: batch.name,
        stream: batch.branch,
        discipline: batch.discipline,
        branch: batch.branch,
        sub_branch: batch.subBranch || null,
        section: batch.section,
        semester: batch.semester,
        size: batch.size,
        year: batch.year,
        class_start_time: batch.classStartTime || null,
        class_end_time: batch.classEndTime || null,
      };
      const result = await validateAndInsert<Tables<'batches'>>('batches', 'create', dbPayload);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformBatch(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-assignments'] });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...batch }: Partial<Batch> & { id: string }) => {
      const dbPayload: Record<string, any> = {};
      if (batch.name !== undefined) dbPayload.name = batch.name;
      if (batch.discipline !== undefined) dbPayload.discipline = batch.discipline;
      if (batch.branch !== undefined) { dbPayload.branch = batch.branch; dbPayload.stream = batch.branch; }
      if (batch.subBranch !== undefined) dbPayload.sub_branch = batch.subBranch || null;
      if (batch.section !== undefined) dbPayload.section = batch.section;
      if (batch.semester !== undefined) dbPayload.semester = batch.semester;
      if (batch.size !== undefined) dbPayload.size = batch.size;
      if (batch.year !== undefined) dbPayload.year = batch.year;
      if (batch.classStartTime !== undefined) dbPayload.class_start_time = batch.classStartTime || null;
      if (batch.classEndTime !== undefined) dbPayload.class_end_time = batch.classEndTime || null;
      const result = await validateAndInsert<Tables<'batches'>>('batches', 'update', dbPayload, id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformBatch(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
};
