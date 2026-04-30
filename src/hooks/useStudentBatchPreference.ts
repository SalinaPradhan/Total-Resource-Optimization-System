import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useStudentBatchPreference() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['student-batch-preference', user?.id],
    queryFn: async (): Promise<string | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('batch_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching batch preference:', error);
        return null;
      }

      return data?.batch_id || null;
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: async (batchId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ batch_id: batchId })
        .eq('id', user.id);

      if (error) throw error;
      return batchId;
    },
    onSuccess: (batchId) => {
      queryClient.setQueryData(['student-batch-preference', user?.id], batchId);
      toast.success('Batch preference saved');
    },
    onError: (error) => {
      console.error('Error saving batch preference:', error);
      toast.error('Failed to save batch preference');
    },
  });

  return {
    savedBatchId: query.data,
    isLoading: query.isLoading,
    saveBatchPreference: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
