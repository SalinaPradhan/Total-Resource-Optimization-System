import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformAlert } from '@/lib/transformers';
import type { Alert } from '@/types';

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(transformAlert);
    },
  });
};

export const useUnresolvedAlerts = () => {
  return useQuery({
    queryKey: ['alerts', 'unresolved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(transformAlert);
    },
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<Alert, 'id' | 'timestamp'>) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          type: alert.type,
          title: alert.title,
          message: alert.message,
          resolved: alert.resolved,
        })
        .select()
        .single();

      if (error) throw error;
      return transformAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};
