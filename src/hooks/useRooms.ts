import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformRoom } from '@/lib/transformers';
import { validateAndInsert } from '@/lib/validateAndInsert';
import type { Room } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(transformRoom);
    },
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? transformRoom(data) : null;
    },
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: Omit<Room, 'id'>) => {
      const result = await validateAndInsert<Tables<'rooms'>>('rooms', 'create', room);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformRoom(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...room }: Partial<Room> & { id: string }) => {
      const result = await validateAndInsert<Tables<'rooms'>>('rooms', 'update', room, id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return transformRoom(result.data!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
