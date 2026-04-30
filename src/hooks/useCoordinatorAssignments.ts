import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoordinatorAssignment {
  id: string;
  user_id: string;
  batch_id: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  batch_name?: string;
  batch_discipline?: string;
  batch_branch?: string;
  batch_section?: string;
}

export function useCoordinatorAssignments() {
  return useQuery({
    queryKey: ['coordinator-assignments-all'],
    queryFn: async (): Promise<CoordinatorAssignment[]> => {
      // Fetch all assignments
      const { data: assignments, error } = await supabase
        .from('coordinator_assignments')
        .select('id, user_id, batch_id, created_at');

      if (error) throw error;
      if (!assignments || assignments.length === 0) return [];

      // Get unique user IDs and batch IDs
      const userIds = [...new Set(assignments.map(a => a.user_id))];
      const batchIds = [...new Set(assignments.map(a => a.batch_id))];

      // Fetch profiles and batches
      const [profilesRes, batchesRes] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name').in('id', userIds),
        supabase.from('batches').select('id, name, discipline, branch, section').in('id', batchIds),
      ]);

      const profileMap = new Map(
        (profilesRes.data ?? []).map(p => [p.id, p])
      );
      const batchMap = new Map(
        (batchesRes.data ?? []).map(b => [b.id, b])
      );

      return assignments.map(a => {
        const profile = profileMap.get(a.user_id);
        const batch = batchMap.get(a.batch_id);
        return {
          ...a,
          user_email: profile?.email,
          user_name: profile?.full_name ?? undefined,
          batch_name: batch?.name,
          batch_discipline: batch?.discipline,
          batch_branch: batch?.branch,
          batch_section: batch?.section,
        };
      });
    },
  });
}

export function useCreateCoordinatorAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, batchId }: { userId: string; batchId: string }) => {
      const { error } = await supabase
        .from('coordinator_assignments')
        .insert({ user_id: userId, batch_id: batchId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-assignments-all'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-assignments'] });
      toast({ title: 'Coordinator assigned to batch' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Assignment failed', description: error.message });
    },
  });
}

export function useDeleteCoordinatorAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coordinator_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-assignments-all'] });
      queryClient.invalidateQueries({ queryKey: ['coordinator-assignments'] });
      toast({ title: 'Assignment removed' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Failed to remove', description: error.message });
    },
  });
}
