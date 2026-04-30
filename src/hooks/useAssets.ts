import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformAsset } from '@/lib/transformers';
import type { Asset } from '@/types';

export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(transformAsset);
    },
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformAsset(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Omit<Asset, 'id'>) => {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          name: asset.name,
          code: asset.name.replace(/\s+/g, '-').toUpperCase(),
          type: asset.type,
          location: asset.location || null,
          status: asset.status,
          assigned_to: null,
        })
        .select()
        .single();

      if (error) throw error;
      return transformAsset(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...asset }: Partial<Asset> & { id: string }) => {
      const { data, error } = await supabase
        .from('assets')
        .update({
          name: asset.name,
          type: asset.type,
          location: asset.location || null,
          status: asset.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformAsset(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};
