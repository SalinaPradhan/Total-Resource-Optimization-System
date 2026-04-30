import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CoordinatorScope {
  assignedBatchIds: string[];
  assignedDepartments: string[];
  isScoped: boolean;
  isLoading: boolean;
}

export function useCoordinatorScope(): CoordinatorScope {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const isCoordinator = isAdmin && !isSuperAdmin;

  const { data, isLoading } = useQuery({
    queryKey: ['coordinator-assignments', user?.id],
    queryFn: async () => {
      if (!user) return { batchIds: [], departments: [] };

      // Fetch assigned batch IDs
      const { data: assignments, error } = await supabase
        .from('coordinator_assignments')
        .select('batch_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching coordinator assignments:', error);
        return { batchIds: [], departments: [] };
      }

      const batchIds = assignments.map(a => a.batch_id);

      if (batchIds.length === 0) return { batchIds: [], departments: [] };

      // Fetch department scope (discipline + branch + stream) from assigned batches
      const { data: batches, error: batchError } = await supabase
        .from('batches')
        .select('discipline, branch, stream')
        .in('id', batchIds);

      if (batchError) {
        console.error('Error fetching batch departments:', batchError);
        return { batchIds, departments: [] };
      }

      const departments = [
        ...new Set(
          batches
            .flatMap((b) => [b.discipline, b.branch, b.stream])
            .map((value) => value?.trim().toLowerCase())
            .filter((value): value is string => Boolean(value))
        ),
      ];

      return { batchIds, departments };
    },
    enabled: isCoordinator && !!user,
  });

  return {
    assignedBatchIds: data?.batchIds ?? [],
    assignedDepartments: data?.departments ?? [],
    isScoped: isCoordinator,
    isLoading: isCoordinator ? isLoading : false,
  };
}
